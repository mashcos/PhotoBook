
using MashcosLibNet.Services;
using Microsoft.AspNetCore.Http.Json;
using PhotoBookApi.Data;
using PhotoBookApi.ImportExport;
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

            builder.Services.AddControllers();

            var app = builder.Build();

            // this seeding is only for the template to bootstrap the DB and users.
            // in production you will likely want a different approach.
            if (args.Contains("/seed"))
            {
                LocalDataService.EnsureSeedData(app);
                return;
            }

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.MapOpenApi();
            }

            app.UseRouting();

            app.UseHttpsRedirection();

            app.UseAuthorization();


            app.MapControllers();

            app.Run();
        }
    }
}
