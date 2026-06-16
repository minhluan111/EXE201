using CafeReservation.Application.DTOs;
using CafeReservation.Application.Interfaces;
using CafeReservation.Domain.Entities;
using CafeReservation.Domain.Enums;
using CafeReservation.Domain.Exceptions;
using Mapster;

namespace CafeReservation.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IEmailService _emailService;
    private readonly IAppSettings _appSettings;

    public AuthService(
        IUserRepository userRepository,
        IJwtTokenService jwtTokenService,
        IPasswordHasher passwordHasher,
        IUnitOfWork unitOfWork,
        IEmailService emailService,
        IAppSettings appSettings)
    {
        _userRepository = userRepository;
        _jwtTokenService = jwtTokenService;
        _passwordHasher = passwordHasher;
        _unitOfWork = unitOfWork;
        _emailService = emailService;
        _appSettings = appSettings;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken ct = default)
    {
        if (await _userRepository.ExistsByEmailAsync(request.Email, ct))
            throw new ConflictException($"Email '{request.Email}' is already registered.");

        var user = new User
        {
            Id = Guid.NewGuid(),
            FullName = request.FullName.Trim(),
            Email = request.Email.Trim().ToLowerInvariant(),
            Phone = request.Phone.Trim(),
            PasswordHash = _passwordHasher.Hash(request.Password),
            Role = UserRole.User,
            CreatedAt = DateTime.UtcNow
        };

        await _userRepository.AddAsync(user, ct);
        await _unitOfWork.SaveChangesAsync(ct);

        return BuildAuthResponse(user);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken ct = default)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email.Trim().ToLowerInvariant(), ct)
            ?? throw new UnauthorizedException("Invalid email or password.");

        if (!_passwordHasher.Verify(request.Password, user.PasswordHash))
            throw new UnauthorizedException("Invalid email or password.");

        return BuildAuthResponse(user);
    }

    private AuthResponse BuildAuthResponse(User user)
    {
        var (token, expiresAt) = _jwtTokenService.GenerateToken(user);

        return new AuthResponse
        {
            AccessToken = token,
            ExpiresAt = expiresAt,
            User = user.Adapt<UserDto>()
        };
    }

    public async Task<UserDto> GetMeAsync(Guid userId, CancellationToken ct = default)
    {
        var user = await _userRepository.GetByIdAsync(userId, ct)
            ?? throw new NotFoundException(nameof(User), userId);
        return user.Adapt<UserDto>();
    }

    public async Task ForgotPasswordAsync(ForgotPasswordRequest request, CancellationToken ct = default)
    {
        // Always return success to prevent email enumeration attack
        var user = await _userRepository.GetByEmailAsync(request.Email.Trim().ToLowerInvariant(), ct);
        if (user is null) return;

        // Generate a secure one-time token, expires in 10 minutes
        var token = Convert.ToHexString(System.Security.Cryptography.RandomNumberGenerator.GetBytes(32));
        user.PasswordResetToken = token;
        user.PasswordResetTokenExpiry = DateTime.UtcNow.AddMinutes(10);

        await _userRepository.UpdateAsync(user, ct);
        await _unitOfWork.SaveChangesAsync(ct);

        var frontendUrl = _appSettings.FrontendUrl;
        var resetLink = $"{frontendUrl}/reset-password?token={token}";

        _ = _emailService.SendPasswordResetAsync(user.Email, user.FullName, resetLink, ct);
    }

    public async Task ResetPasswordAsync(ResetPasswordRequest request, CancellationToken ct = default)
    {
        if (request.NewPassword != request.ConfirmPassword)
            throw new DomainException("Passwords do not match.");

        if (string.IsNullOrWhiteSpace(request.Token))
            throw new DomainException("Token is required.");

        var user = await _userRepository.GetByResetTokenAsync(request.Token.Trim(), ct)
            ?? throw new DomainException("Token không hợp lệ hoặc đã hết hạn.");

        if (user.PasswordResetTokenExpiry is null || user.PasswordResetTokenExpiry < DateTime.UtcNow)
            throw new DomainException("Token không hợp lệ hoặc đã hết hạn.");

        // Update password and clear token (one-time use)
        user.PasswordHash = _passwordHasher.Hash(request.NewPassword);
        user.PasswordResetToken = null;
        user.PasswordResetTokenExpiry = null;

        await _userRepository.UpdateAsync(user, ct);
        await _unitOfWork.SaveChangesAsync(ct);
    }
}
