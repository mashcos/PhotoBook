using MashcosLibNet.Services;
using Microsoft.EntityFrameworkCore;
using PhotoBookApi.Data;
using PhotoBookApi.Models;
using PhotoBookApi.Requests;
using PhotoBookApi.Summaries;
using PhotoBookApi.ViewModels;

namespace PhotoBookApi.Services
{
    public class PhotoService : MultitenantEntityListService<PhotoBookContext, Photo, PhotoSummary, PhotoViewModel, PhotoRequest>
    {
        public override DbSet<Photo> DatabaseSet => _context.Photos;

        public PhotoService(PhotoBookContext context, ICurrentUserService currentUserService) : base(context, currentUserService)
        {
        }

        public override async Task<IEnumerable<PhotoSummary>> GetAll(PhotoRequest request)
        {
            var query = DatabaseSet.AsQueryable();

            if (!string.IsNullOrWhiteSpace(request.SearchText))
            {
                var search = request.SearchText.ToLower();
                query = query.Where(x => (x.Title != null && x.Title.ToLower().Contains(search)) ||
                                         (x.Description != null && x.Description.ToLower().Contains(search)));
            }

            if (request.LocationId.HasValue)
            {
                query = query.Where(x => x.LocationId == request.LocationId);
            }

            if (request.CategoryId.HasValue)
            {
                query = query.Where(x => x.Categories.Any(c => c.Id == request.CategoryId));
            }

            if (request.PersonId.HasValue)
            {
                query = query.Where(x => x.Persons.Any(p => p.Id == request.PersonId));
            }

            if (request.DateFrom.HasValue)
            {
                query = query.Where(x => x.Date >= request.DateFrom.Value);
            }

            if (request.DateTo.HasValue)
            {
                query = query.Where(x => x.Date <= request.DateTo.Value);
            }

            query = query.OrderByDescending(x => x.Date);

            return await query.Select(x => new PhotoSummary(x)).ToListAsync();
        }
    }
}
