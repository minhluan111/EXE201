using CafeReservation.Application.DTOs;
using CafeReservation.Application.Interfaces;
using CafeReservation.Domain.Entities;
using CafeReservation.Domain.Exceptions;
using Mapster;

namespace CafeReservation.Application.Services;

public class SeatingAreaService : ISeatingAreaService
{
    private readonly ISeatingAreaRepository _repo;
    private readonly IUnitOfWork _unitOfWork;

    public SeatingAreaService(ISeatingAreaRepository repo, IUnitOfWork unitOfWork)
    {
        _repo = repo;
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<SeatingAreaResponse>> GetAllActiveAsync(CancellationToken ct = default)
    {
        var areas = await _repo.GetActiveAsync(ct);
        return areas.Select(Map).ToList();
    }

    public async Task<IReadOnlyList<SeatingAreaResponse>> GetAllAsync(CancellationToken ct = default)
    {
        var areas = await _repo.GetAllAsync(ct);
        return areas.Select(Map).ToList();
    }

    public async Task<SeatingAreaResponse> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var area = await _repo.GetByIdAsync(id, ct)
            ?? throw new NotFoundException(nameof(SeatingArea), id);
        return Map(area);
    }

    public async Task<SeatingAreaResponse> CreateAsync(CreateSeatingAreaRequest request, CancellationToken ct = default)
    {
        var area = new SeatingArea
        {
            Id = Guid.NewGuid(),
            TableType = request.TableType.Trim(),
            Area = request.Area.Trim(),
            TotalTables = request.TotalTables,
            ReservableTables = request.ReservableTables,
            PreviewImage = request.PreviewImage,
            Description = request.Description,
            IsActive = true
        };

        await _repo.AddAsync(area, ct);
        await _unitOfWork.SaveChangesAsync(ct);
        return Map(area);
    }

    public async Task<SeatingAreaResponse> UpdateAsync(Guid id, UpdateSeatingAreaRequest request, CancellationToken ct = default)
    {
        var area = await _repo.GetByIdAsync(id, ct)
            ?? throw new NotFoundException(nameof(SeatingArea), id);

        area.TableType = request.TableType.Trim();
        area.Area = request.Area.Trim();
        area.TotalTables = request.TotalTables;
        area.ReservableTables = request.ReservableTables;
        area.PreviewImage = request.PreviewImage;
        area.Description = request.Description;
        area.IsActive = request.IsActive;

        await _repo.UpdateAsync(area, ct);
        await _unitOfWork.SaveChangesAsync(ct);
        return Map(area);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var area = await _repo.GetByIdAsync(id, ct)
            ?? throw new NotFoundException(nameof(SeatingArea), id);

        // Soft-delete: deactivate instead of removing
        area.IsActive = false;
        await _repo.UpdateAsync(area, ct);
        await _unitOfWork.SaveChangesAsync(ct);
    }

    private static SeatingAreaResponse Map(SeatingArea a) => new()
    {
        Id = a.Id,
        TableType = a.TableType,
        Area = a.Area,
        TotalTables = a.TotalTables,
        ReservableTables = a.ReservableTables,
        PreviewImage = a.PreviewImage,
        Description = a.Description,
        IsActive = a.IsActive
    };
}
