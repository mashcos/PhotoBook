using MashcosLibNet.ViewModels;
using PhotoBookApi.Models;

namespace PhotoBookApi.ViewModels
{
    public class PersonViewModel : MultitenantEntityViewModel<Person>
    {
        public string? PersonName { get; set; }
        public string? Description { get; set; }

        public PersonViewModel() : base() { }
        public PersonViewModel(Person entity) : base(entity) { }

        public override void Read(Person entity)
        {
            base.Read(entity);
            PersonName = entity.PersonName;
            Description = entity.Description;
        }

        public override void Write(Person entity)
        {
            base.Write(entity);
            entity.PersonName = PersonName;
            entity.Description = Description;
        }
    }
}
