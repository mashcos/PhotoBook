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
    public class LocationController : MultitenantEntityListController<LocationService, PhotoBookContext, Location, LocationSummary, LocationViewModel, LocationRequest>
    {
        public LocationController(PhotoBookContext context, LocationService service, ICurrentUserService userService) : base(context, service, userService)
        {
        }
    }
}
