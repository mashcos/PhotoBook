using MashcosLibNet.Controllers;
using MashcosLibNet.Services;
using PhotoBookApi.Data;
using PhotoBookApi.Models;
using PhotoBookApi.Requests;
using PhotoBookApi.Services;
using PhotoBookApi.Summaries;
using PhotoBookApi.ViewModels;

namespace PhotoBookApi.Controllers
{
    public class CategoryController : MultitenantEntityListController<CategoryService, PhotoBookContext, Category, CategorySummary, CategoryViewModel, CategoryRequest>
    {
        public CategoryController(PhotoBookContext context, CategoryService service, ICurrentUserService userService) : base(context, service, userService)
        {
        }
    }
}
