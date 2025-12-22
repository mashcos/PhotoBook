using MashcosLibNet.Services;
using Microsoft.EntityFrameworkCore;
using PhotoBookApi.Data;
using PhotoBookApi.Models;
using PhotoBookApi.Requests;
using PhotoBookApi.Summaries;
using PhotoBookApi.ViewModels;

namespace PhotoBookApi.Services
{
    public class LocationService : MultitenantEntityListService<PhotoBookContext, Location, LocationSummary, LocationViewModel, LocationRequest>
    {
        public override DbSet<Location> DatabaseSet => _context.Locations;

        public LocationService(PhotoBookContext context, ICurrentUserService currentUserService) : base(context, currentUserService)
        {
        }

        public override async Task<IEnumerable<LocationSummary>> GetAll(LocationRequest request)
        {
            var query = DatabaseSet.AsQueryable();

            if (!string.IsNullOrWhiteSpace(request.SearchText))
            {
                var search = request.SearchText.ToLower();
                query = query.Where(x => (x.LocationName != null && x.LocationName.ToLower().Contains(search)) ||
                                         (x.Description != null && x.Description.ToLower().Contains(search)));
            }

            return await query.Select(x => new LocationSummary(x)).ToListAsync();
        }
    }
}
