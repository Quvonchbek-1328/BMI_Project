using RiskWatch.Api.Extensions;
using RiskWatch.Api.Middleware;
using RiskWatch.Api.Services.Implementations;
using RiskWatch.Api.Services.Interfaces;

var builder = WebApplication.CreateBuilder(args);

// Database
builder.Services.AddDatabase(builder.Configuration);

// Authentication & Authorization
builder.Services.AddJwtAuthentication(builder.Configuration);

// CORS
builder.Services.AddCorsPolicies(builder.Configuration);

// Repositories
builder.Services.AddRepositories();

// Services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IProjectService, ProjectService>();
builder.Services.AddScoped<ITaskService, TaskService>();
builder.Services.AddScoped<IRiskMetricService, RiskMetricService>();
builder.Services.AddScoped<IPredictionService, PredictionService>();
builder.Services.AddScoped<IAlertService, AlertService>();
builder.Services.AddScoped<IAdminService, AdminService>();

// HttpClient for AI Service
builder.Services.AddHttpClient("AiService", client =>
{
    client.BaseAddress = new Uri(builder.Configuration["AiService:BaseUrl"] ?? "http://localhost:8000");
    client.Timeout = TimeSpan.FromSeconds(30);
});

// Controllers + Validation
builder.Services.AddControllers();
builder.Services.AddValidators();

// Swagger
builder.Services.AddSwaggerDocumentation();

var app = builder.Build();

// Global exception handling
app.UseMiddleware<GlobalExceptionMiddleware>();

// Swagger (all environments for now)
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "RiskWatch AI API v1");
    c.RoutePrefix = "swagger";
});

// CORS
app.UseCors("AllowFrontend");

// Auth
app.UseAuthentication();
app.UseAuthorization();

// Controllers
app.MapControllers();

// Auto-migrate (dev or APPLY_MIGRATIONS=true for Docker)
if (app.Environment.IsDevelopment() ||
    Environment.GetEnvironmentVariable("APPLY_MIGRATIONS") == "true")
{
    await app.ApplyMigrationsAsync();
}

app.Run();

// Make Program accessible for integration tests
public partial class Program { }
