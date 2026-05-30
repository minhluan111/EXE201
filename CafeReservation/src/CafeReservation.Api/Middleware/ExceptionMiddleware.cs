using CafeReservation.Domain.Exceptions;
using System.Net;
using System.Text.Json;

namespace CafeReservation.Api.Middleware;

public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;

    public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var (statusCode, title, errors) = exception switch
        {
            Domain.Exceptions.ValidationException ve =>
                (HttpStatusCode.UnprocessableEntity, "Validation failed", ve.Errors as object),

            NotFoundException nfe =>
                (HttpStatusCode.NotFound, nfe.Message, (object?)null),

            ConflictException ce =>
                (HttpStatusCode.Conflict, ce.Message, (object?)null),

            UnauthorizedException ue =>
                (HttpStatusCode.Unauthorized, ue.Message, (object?)null),

            DomainException de =>
                (HttpStatusCode.BadRequest, de.Message, (object?)null),

            _ =>
                (HttpStatusCode.InternalServerError, "An unexpected error occurred.", (object?)null)
        };

        if (statusCode == HttpStatusCode.InternalServerError)
            _logger.LogError(exception, "Unhandled exception");
        else
            _logger.LogWarning(exception, "Handled domain exception: {Message}", exception.Message);

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)statusCode;

        var response = new
        {
            status = (int)statusCode,
            title,
            errors
        };

        var json = JsonSerializer.Serialize(response, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
        await context.Response.WriteAsync(json);
    }
}
