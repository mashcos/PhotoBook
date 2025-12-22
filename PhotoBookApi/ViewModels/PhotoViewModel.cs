using MashcosLibNet.ViewModels;
using PhotoBookApi.Models;
using PhotoBookApi.Summaries;

namespace PhotoBookApi.ViewModels
{
    public class PhotoViewModel : MultitenantEntityViewModel<Photo>
    {
        public string? Filename { get; set; }
        public string? Title { get; set; }
        public string? Description { get; set; }
        public Guid? LocationId { get; set; }
        public DateTime? TakenOn { get; set; }
        
        public LocationSummary? Location { get; set; }
        public List<PersonSummary> Persons { get; set; } = new();
        public List<CategorySummary> Categories { get; set; } = new();

        public PhotoViewModel() : base() { }
        public PhotoViewModel(Photo entity) : base(entity) { }

        public override void Read(Photo entity)
        {
            base.Read(entity);
            Filename = entity.Filename;
            Title = entity.Title;
            Description = entity.Description;
            LocationId = entity.LocationId;
            TakenOn = entity.TakenOn;

            if (entity.Location != null)
            {
                Location = new LocationSummary(entity.Location);
            }

            Persons = entity.Persons.Select(p => new PersonSummary(p)).ToList();
            Categories = entity.Categories.Select(c => new CategorySummary(c)).ToList();
        }

        public override void Write(Photo entity)
        {
            base.Write(entity);
            entity.Filename = Filename;
            entity.Title = Title;
            entity.Description = Description;
            entity.LocationId = LocationId;
            entity.TakenOn = TakenOn;
        }
    }
}
