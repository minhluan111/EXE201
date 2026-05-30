# ─── Build Stage ────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project files first for layer caching
COPY src/CafeReservation.Domain/CafeReservation.Domain.csproj           src/CafeReservation.Domain/
COPY src/CafeReservation.Application/CafeReservation.Application.csproj src/CafeReservation.Application/
COPY src/CafeReservation.Infrastructure/CafeReservation.Infrastructure.csproj src/CafeReservation.Infrastructure/
COPY src/CafeReservation.Api/CafeReservation.Api.csproj                 src/CafeReservation.Api/

# Restore
RUN dotnet restore src/CafeReservation.Api/CafeReservation.Api.csproj

# Copy the rest of the source
COPY . .

# Publish release
RUN dotnet publish src/CafeReservation.Api/CafeReservation.Api.csproj \
    -c Release \
    -o /app/publish \
    --no-restore

# ─── Runtime Stage ──────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# Create logs directory
RUN mkdir -p /app/logs

COPY --from=build /app/publish .

EXPOSE 8080

ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

ENTRYPOINT ["dotnet", "CafeReservation.Api.dll"]
