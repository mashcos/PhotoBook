using MashcosLibNet.Controllers;
using MashcosLibNet.Services;
using Microsoft.AspNetCore.Mvc;
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

        [HttpGet("{id}/image")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status304NotModified)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult> GetImage(Guid id)
        {
            return File(await _service.GetImage(id));
        }
    }
}
