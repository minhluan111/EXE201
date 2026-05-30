using CafeReservation.Application.DTOs;
using CafeReservation.Domain.Entities;
using Mapster;

namespace CafeReservation.Application.Mappings;

/// <summary>
/// Mapster type adapters for the Application layer.
/// Registered globally on startup.
/// </summary>
public static class MappingConfig
{
    public static void Configure()
    {
        TypeAdapterConfig<User, UserDto>.NewConfig()
            .Map(dest => dest.Role, src => src.Role.ToString());
    }
}
