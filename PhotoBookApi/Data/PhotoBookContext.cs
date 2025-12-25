using MashcosLibNet.Data;
using MashcosLibNet.Services;
using Microsoft.EntityFrameworkCore;
using PhotoBookApi.Models;
using System.Security.Claims;

namespace PhotoBookApi.Data
{
    public class PhotoBookContext : MashcosDbContext
    {
        public override string DatabaseName => "PhotoBook";
        public override bool UseLazyLoadingProxies => true;
        public DbSet<Category> Categories { get; set; }
        public DbSet<Location> Locations { get; set; }
        public DbSet<Person> Persons { get; set; }
        public DbSet<Photo> Photos { get; set; }
        public DbSet<Photobook> Photobooks { get; set; }

        public PhotoBookContext(DbContextOptions<PhotoBookContext> options, ICurrentUserService currentUserService) : base(currentUserService)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Photobook>().HasKey(x => x.Id);

            modelBuilder.Entity<Category>().HasKey(x => x.Id);
            modelBuilder.Entity<Category>().HasIndex(x => x.TenantId);
            modelBuilder.Entity<Location>().HasKey(x => x.Id);
            modelBuilder.Entity<Location>().HasIndex(x => x.TenantId);
            modelBuilder.Entity<Person>().HasKey(x => x.Id);
            modelBuilder.Entity<Person>().HasIndex(x => x.TenantId);
            modelBuilder.Entity<Photo>().HasKey(x => x.Id);
            modelBuilder.Entity<Photo>().HasIndex(x => x.TenantId);

            modelBuilder.Entity<Photo>().HasIndex(p => p.TakenOn);
            modelBuilder.Entity<Photo>()
                .HasOne(x => x.Location)
                .WithMany();
            modelBuilder.Entity<Photo>()
                .HasMany(x => x.Persons)
                .WithMany();
            modelBuilder.Entity<Photo>()
                .HasMany(x => x.Categories)
                .WithMany();

            modelBuilder.Entity<Photobook>().HasIndex(p => p.OwnerId).IsUnique();
        }

        protected override Guid? TenantIdForUserId(Guid? userId, ICurrentUserService currentUserService)
        {
            if (userId == null) { return null; }

            var photobook = Photobooks
                .Where(b => b.OwnerId == userId)
                .FirstOrDefault();
            if (photobook != null)
            {
                return photobook.Id;
            }
            else
            {
                var name = currentUserService.GetClaim(ClaimTypes.Name) ?? "Unknown Person";
                photobook = new Photobook()
                {
                    Id = Guid.NewGuid(),
                    OwnerId = userId.Value,
                    Title = "PhotoBook by " + name
                };
                Photobooks.Add(photobook);
                SaveChanges();
                return photobook.Id;
            }
        }
    }
}
