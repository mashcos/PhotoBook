using MashcosLibNet.ViewModels;
using PhotoBookApi.Models;

namespace PhotoBookApi.Summaries
{
    public class PhotoSummary : MultitenantEntitySummary<Photo>
    {
        public string? Filename { get; set; }
        public string? Title { get; set; }
        public DateTime? TakenOn { get; set; }
        public Guid? LocationId { get; set; }

        public PhotoSummary() : base() { }
        public PhotoSummary(Photo entity) : base(entity) { }

        public override void Read(Photo entity)
        {
            base.Read(entity);
            Filename = entity.Filename;
            Title = entity.Title;
            TakenOn = entity.TakenOn;
            LocationId = entity.LocationId;
        }
    }
}
