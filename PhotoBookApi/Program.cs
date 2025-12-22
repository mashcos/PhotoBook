
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

            builder.Services.AddDbContext<PhotoBookApi.Data.PhotoBookContext>();
            builder.Services.AddScoped<MashcosLibNet.Services.ICurrentUserService, PhotoBookApi.Services.CurrentUserService>();
            builder.Services.AddScoped<PhotoBookApi.Services.CategoryService>();
            builder.Services.AddScoped<PhotoBookApi.Services.LocationService>();
            builder.Services.AddScoped<PhotoBookApi.Services.PersonService>();
            builder.Services.AddScoped<PhotoBookApi.Services.PhotoService>();

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
