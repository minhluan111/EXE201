using CafeReservation.Application.DTOs;
using CafeReservation.Application.Interfaces;
using Microsoft.Extensions.Logging;
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
    private readonly ICurrentTenantService _tenantService;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        IUserRepository userRepository,
        IJwtTokenService jwtTokenService,
        IPasswordHasher passwordHasher,
        IUnitOfWork unitOfWork,
        IEmailService emailService,
        IAppSettings appSettings,
        ICurrentTenantService tenantService,
        ILogger<AuthService> logger)
    {
        _userRepository = userRepository;
        _jwtTokenService = jwtTokenService;
        _passwordHasher = passwordHasher;
        _unitOfWork = unitOfWork;
        _emailService = emailService;
        _appSettings = appSettings;
        _tenantService = tenantService;
        _logger = logger;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken ct = default)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        if (await _userRepository.ExistsByEmailAsync(normalizedEmail, ct))
            throw new ConflictException($"Email '{request.Email}' đã được đăng ký. Vui lòng sử dụng email khác.");

        var user = new User
        {
            Id = Guid.NewGuid(),
            FullName = request.FullName.Trim(),
            Email = request.Email.Trim().ToLowerInvariant(),
            Phone = request.Phone.Trim(),
            PasswordHash = _passwordHasher.Hash(request.Password),
            Role = UserRole.User,
            CreatedAt = DateTime.UtcNow,
            TenantId = _tenantService.TenantId
        };

        await _userRepository.AddAsync(user, ct);
        await _unitOfWork.SaveChangesAsync(ct);

        return BuildAuthResponse(user);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken ct = default)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var users = await _userRepository.GetListByEmailAsync(email, ct);
        
        if (!users.Any())
            throw new UnauthorizedException("Email hoặc mật khẩu không chính xác.");

        var currentTenantId = _tenantService.TenantId;

        // Ưu tiên tìm user thuộc tenant hiện tại, nếu không có thì tìm SuperAdmin
        var user = users.FirstOrDefault(u => u.TenantId == currentTenantId) 
                ?? users.FirstOrDefault(u => u.Role == UserRole.SuperAdmin);

        if (user == null)
        {
            _logger.LogWarning("Cross-tenant login attempt detected. Email: {Email}, Expected Tenant: {Expected}", 
                request.Email, currentTenantId);
            
            throw new UnauthorizedException("Email hoặc mật khẩu không chính xác.");
        }

        if (!_passwordHasher.Verify(request.Password, user.PasswordHash))
            throw new UnauthorizedException("Email hoặc mật khẩu không chính xác.");

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
        var email = request.Email.Trim().ToLowerInvariant();
        var users = await _userRepository.GetListByEmailAsync(email, ct);
        
        var currentTenantId = _tenantService.TenantId;
        var user = users.FirstOrDefault(u => u.TenantId == currentTenantId) 
                ?? users.FirstOrDefault(u => u.Role == UserRole.SuperAdmin);

        if (user is null) return;

        // Generate a secure one-time token, expires in 10 minutes
        var token = Convert.ToHexString(System.Security.Cryptography.RandomNumberGenerator.GetBytes(32));
        user.PasswordResetToken = token;
        user.PasswordResetTokenExpiry = DateTime.UtcNow.AddMinutes(10);

        await _userRepository.UpdateAsync(user, ct);
        await _unitOfWork.SaveChangesAsync(ct);

        var tenantDomain = _tenantService.TenantDomain;
        // Nếu là localhost thì dùng http, nếu là domain thật thì dùng https
        var scheme = tenantDomain.Contains("localhost") ? "http://" : "https://";
        var resetLink = $"{scheme}{tenantDomain}/reset-password?token={token}";

        await _emailService.SendPasswordResetAsync(user.Email, user.FullName, resetLink, ct);
    }

    public async Task ResetPasswordAsync(ResetPasswordRequest request, CancellationToken ct = default)
    {
        if (request.NewPassword != request.ConfirmPassword)
            throw new DomainException("Mật khẩu xác nhận không khớp.");

        if (string.IsNullOrWhiteSpace(request.Token))
            throw new DomainException("Token không hợp lệ hoặc đã hết hạn.");

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
