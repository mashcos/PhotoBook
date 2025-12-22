using MashcosLibNet.Services;
using Microsoft.EntityFrameworkCore;
using PhotoBookApi.Data;
using PhotoBookApi.Models;
using PhotoBookApi.Requests;
using PhotoBookApi.Summaries;
using PhotoBookApi.ViewModels;

namespace PhotoBookApi.Services
{
    public class PersonService : MultitenantEntityListService<PhotoBookContext, Person, PersonSummary, PersonViewModel, PersonRequest>
    {
        public override DbSet<Person> DatabaseSet => _context.Persons;

        public PersonService(PhotoBookContext context, ICurrentUserService currentUserService) : base(context, currentUserService)
        {
        }

        public override async Task<IEnumerable<PersonSummary>> GetAll(PersonRequest request)
        {
            var query = DatabaseSet.AsQueryable();

            if (!string.IsNullOrWhiteSpace(request.SearchText))
            {
                var search = request.SearchText.ToLower();
                query = query.Where(x => (x.PersonName != null && x.PersonName.ToLower().Contains(search)) ||
                                         (x.Description != null && x.Description.ToLower().Contains(search)));
            }

            return await query.Select(x => new PersonSummary(x)).ToListAsync();
        }
    }
}
