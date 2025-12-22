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
    }
}
