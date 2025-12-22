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
    public class PersonController : MultitenantEntityListController<PersonService, PhotoBookContext, Person, PersonSummary, PersonViewModel, PersonRequest>
    {
        public PersonController(PhotoBookContext context, PersonService service, ICurrentUserService userService) : base(context, service, userService)
        {
        }
    }
}
