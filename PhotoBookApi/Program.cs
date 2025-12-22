
using MashcosLibNet.Services;
using Microsoft.AspNetCore.Http.Json;
using PhotoBookApi.Data;
using PhotoBookApi.Services;
using System.Text.Json.Serialization;

namespace PhotoBookApi
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.

            builder.Services.AddControllers();
            // Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
            builder.Services.AddOpenApi();

            builder.Services.Configure<JsonOptions>(o => o.SerializerOptions.NumberHandling = JsonNumberHandling.Strict);
            builder.Services.AddDbContext<PhotoBookContext>();
            builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();
            builder.Services.AddScoped<CategoryService>();
            builder.Services.AddScoped<LocationService>();
            builder.Services.AddScoped<PersonService>();
            builder.Services.AddScoped<PhotoService>();

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.MapOpenApi();
            }

            app.UseHttpsRedirection();

            app.UseAuthorization();


            app.MapControllers();

            app.Run();
        }
    }
}
