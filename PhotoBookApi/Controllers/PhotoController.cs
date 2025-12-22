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
    public class PhotoController : MultitenantEntityListController<PhotoService, PhotoBookContext, Photo, PhotoSummary, PhotoViewModel, PhotoRequest>
    {
        public PhotoController(PhotoBookContext context, PhotoService service, ICurrentUserService userService) : base(context, service, userService)
        {
        }
    }
}
