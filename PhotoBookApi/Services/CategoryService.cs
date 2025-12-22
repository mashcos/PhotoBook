using MashcosLibNet.Services;
using Microsoft.EntityFrameworkCore;
using PhotoBookApi.Data;
using PhotoBookApi.Models;
using PhotoBookApi.Requests;
using PhotoBookApi.Summaries;
using PhotoBookApi.ViewModels;

namespace PhotoBookApi.Services
{
    public class CategoryService : MultitenantEntityListService<PhotoBookContext, Category, CategorySummary, CategoryViewModel, CategoryRequest>
    {
        public override DbSet<Category> DatabaseSet => _context.Categories;

        public CategoryService(PhotoBookContext context, ICurrentUserService currentUserService) : base(context, currentUserService)
        {
        }

        public override async Task<IEnumerable<CategorySummary>> GetAll(CategoryRequest request)
        {
            var query = DatabaseSet.AsQueryable();

            if (!string.IsNullOrWhiteSpace(request.SearchText))
            {
                var search = request.SearchText.ToLower();
                query = query.Where(x => (x.CategoryName != null && x.CategoryName.ToLower().Contains(search)) ||
                                         (x.Description != null && x.Description.ToLower().Contains(search)));
            }

            return await query.Select(x => new CategorySummary(x)).ToListAsync();
        }
    }
}
