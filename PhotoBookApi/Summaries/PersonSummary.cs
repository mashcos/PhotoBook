using MashcosLibNet.ViewModels;
using PhotoBookApi.Models;

namespace PhotoBookApi.Summaries
{
    public class PersonSummary : MultitenantEntitySummary<Person>
    {
        public string? PersonName { get; set; }

        public PersonSummary() : base() { }
        public PersonSummary(Person entity) : base(entity) { }

        public override void Read(Person entity)
        {
            base.Read(entity);
            PersonName = entity.PersonName;
        }
    }
}
