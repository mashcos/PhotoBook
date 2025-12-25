using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using PhotoBookApi.Data;
using PhotoBookApi.Models;
using System.Text.Json;

namespace PhotoBookApi.ImportExport;

public class LocalDataService
{
    private readonly JsonSerializerOptions _options;

    public LocalDataService()
    {
        _options = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            WriteIndented = true
        };
    }

    public List<CategoryImportModel> ImportCategories(string filePath)
    {
        if (!File.Exists(filePath))
        {
            return new List<CategoryImportModel>();
        }

        using var stream = File.OpenRead(filePath);
        var result = JsonSerializer.Deserialize<List<CategoryImportModel>>(stream, _options);
        return result ?? new List<CategoryImportModel>();
    }

    public async Task ExportCategoriesAsync(string filePath, List<CategoryImportModel> categories)
    {
        using var stream = File.Create(filePath);
        await JsonSerializer.SerializeAsync(stream, categories, _options);
    }

    public List<LocationImportModel> ImportLocations(string filePath)
    {
        if (!File.Exists(filePath))
        {
            return new List<LocationImportModel>();
        }

        using var stream = File.OpenRead(filePath);
        var result = JsonSerializer.Deserialize<List<LocationImportModel>>(stream, _options);
        return result ?? new List<LocationImportModel>();
    }

    public async Task ExportLocationsAsync(string filePath, List<LocationImportModel> locations)
    {
        using var stream = File.Create(filePath);
        await JsonSerializer.SerializeAsync(stream, locations, _options);
    }

    public List<PhotoImportModel> ImportPhotos(string filePath)
    {
        if (!File.Exists(filePath))
        {
            return new List<PhotoImportModel>();
        }

        using var stream = File.OpenRead(filePath);
        var result = JsonSerializer.Deserialize<List<PhotoImportModel>>(stream, _options);
        return result ?? new List<PhotoImportModel>();
    }

    public async Task ExportPhotosAsync(string filePath, List<PhotoImportModel> photos)
    {
        using var stream = File.Create(filePath);
        await JsonSerializer.SerializeAsync(stream, photos, _options);
    }

    public void ImportAssets(string folderName, PhotoBookContext context)
    {
        var photobook = context.Photobooks.FirstOrDefault();

        var tenantId = photobook == null ? Guid.NewGuid() : photobook.Id;
        var userId = photobook == null ? Guid.NewGuid() : photobook.OwnerId;

        var importedCategories = ImportCategories(Path.Combine(folderName, "categories.json"));
        List<Category> categories = ImportCategoriesToDatabase(context, userId, tenantId, importedCategories);
        context.SaveChanges();

        var importedLocations = ImportLocations(Path.Combine(folderName, "locations.json"));
        List<Location> locations = ImportLocationsToDatabase(context, userId, tenantId, importedLocations);
        context.SaveChanges();

        var importedPhotos = ImportPhotos(Path.Combine(folderName, "photos.json"));
        List<Photo> photos = ImportPhotosToDatabase(context, userId, tenantId, importedPhotos, categories, locations);
        context.SaveChanges();
    }

    private static List<Category> ImportCategoriesToDatabase(
        PhotoBookContext context,
        Guid userId,
        Guid tenantId,
        List<CategoryImportModel> importedCategories)
    {
        List<Category> categories = new List<Category>();

        foreach (var c in importedCategories)
        {
            var now = DateTime.UtcNow;
            Category category = new Category()
            {
                TenantId = tenantId,
                Id = Guid.Parse(c.Id),
                CategoryName = c.Label,
                Description = c.Description,
                Color = c.Color,
                Icon = c.Icon,
                CreatedAt = now,
                CreatedBy = userId,
                UpdatedAt = now,
                UpdatedBy = userId,
                Disabled = false
            };
            context.Categories.Add(category);
            categories.Add(category);
        }
        return categories;
    }

    private static List<Location> ImportLocationsToDatabase(
        PhotoBookContext context,
        Guid userId,
        Guid tenantId,
        List<LocationImportModel> importedLocations)
    {
        List<Location> locations = new List<Location>();

        foreach (var l in importedLocations)
        {
            var now = DateTime.UtcNow;
            Location location = new Location()
            {
                TenantId = tenantId,
                Id = Guid.Parse(l.Id),
                LocationName = l.Name,
                Latitude = l.Lat,
                Longitude = l.Lng,
                Reusable = l.IsReuseLocation,
                CreatedAt = now,
                CreatedBy = userId,
                UpdatedAt = now,
                UpdatedBy = userId,
                Disabled = false
            };
            context.Locations.Add(location);
            locations.Add(location);
        }
        return locations;
    }

    private static List<Photo> ImportPhotosToDatabase(
        PhotoBookContext context,
        Guid userId,
        Guid tenantId,
        List<PhotoImportModel> importedPhotos,
        List<Category> categories,
        List<Location> locations)
    {
        List<Photo> photos = new List<Photo>();

        foreach (var p in importedPhotos)
        {
            Guid? locationId = p.LocationId == null ? null : Guid.Parse(p.LocationId);
            var now = DateTime.UtcNow;
            Photo photo = new Photo()
            {
                TenantId = tenantId,
                Id = Guid.Parse(p.Id),
                TakenOn = p.Date != null ? DateTime.Parse(p.Date).ToUniversalTime() : null,
                Title = p.Title,
                Description = p.Description,
                LocationId = locationId,
                Filename = p.Src.Replace("assets/local/", ""),
                CreatedAt = now,
                CreatedBy = userId,
                UpdatedAt = now,
                UpdatedBy = userId,
                Disabled = false
            };
            photo.Location = p.LocationId == null ? null : locations.Where(x => x.Id == locationId).FirstOrDefault();
            photo.Categories = p.CategoryIds
                .Select(Guid.Parse)
                .Select(id => categories.First(x => x.Id == id))
                .ToHashSet();

            context.Photos.Add(photo);
            photos.Add(photo);
        }
        return photos;
    }

    internal static void EnsureSeedData(WebApplication app)
    {
        using (var scope = app.Services.GetRequiredService<IServiceScopeFactory>().CreateScope())
        {
            var context = scope.ServiceProvider.GetRequiredService<PhotoBookContext>();

            if (context.Database.IsSqlite())
            {
                context.Database.EnsureCreated();
            }
            else
            {
                context.Database.Migrate();
            }

            var baseDirectory = Directory.GetParent(Directory.GetCurrentDirectory())!.FullName;
            var directory = Path.Combine(baseDirectory, "PhotoBookNg", "src", "assets", "local");
            new LocalDataService().ImportAssets(directory, context);
        }
    }
}