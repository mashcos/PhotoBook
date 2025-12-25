
using MashcosLibNet.Services;
using Microsoft.AspNetCore.Http.Json;
using Microsoft.IdentityModel.Tokens;
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
            builder.Services.AddHttpContextAccessor();
            // Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
            builder.Services.AddOpenApi();

            builder.Services.Configure<JsonOptions>(o => o.SerializerOptions.NumberHandling = JsonNumberHandling.Strict);
            builder.Services.AddDbContext<PhotoBookContext>();
            builder.Services.AddScoped<ICurrentUserService, HttpHeaderCurrentUserService>();
            builder.Services.AddScoped<CategoryService>();
            builder.Services.AddScoped<LocationService>();
            builder.Services.AddScoped<PersonService>();
            builder.Services.AddScoped<PhotoService>();

            builder.Services.AddControllers();

            builder.Services.AddAuthentication("Bearer")
                .AddJwtBearer("Bearer", options =>
                {
                    // Die URL deines IdentityServers (MashcosIdentity)
                    options.Authority = "https://localhost:5001";

                    // Für Entwicklungsumgebungen oft nötig, wenn Zertifikate nicht perfekt sind
                    // options.RequireHttpsMetadata = false; 

                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateAudience = false // Oft false, wenn keine explizite API-Resource definiert ist
                    };
                });
            
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

            app.UseAuthentication();
            app.UseAuthorization();

            app.MapControllers();

            app.Run();
        }
    }
}
