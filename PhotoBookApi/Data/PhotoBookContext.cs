using MashcosLibNet.Data;
using MashcosLibNet.Services;
using Microsoft.EntityFrameworkCore;
using PhotoBookApi.Models;

namespace PhotoBookApi.Data
{
    public class PhotoBookContext : MashcosDbContext
    {
        public DbSet<Category> Categories { get; set; }
        public DbSet<Location> Locations { get; set; }
        public DbSet<Person> Persons { get; set; }
        public DbSet<Photo> Photos { get; set; }

        protected override string DatabaseName => "PhotoBook";

        public PhotoBookContext(ICurrentUserService? currentUserService = null) : base(currentUserService)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<Category>().HasKey(x => x.Id);
            modelBuilder.Entity<Location>().HasKey(x => x.Id);
            modelBuilder.Entity<Person>().HasKey(x => x.Id);
            modelBuilder.Entity<Photo>().HasKey(x => x.Id);
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
        }
    }
}
