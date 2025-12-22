using MashcosLibNet.ViewModels;
using PhotoBookApi.Models;

namespace PhotoBookApi.Summaries
{
    public class PhotoSummary : MultitenantEntitySummary<Photo>
    {
        public string? Source { get; set; }
        public string? Title { get; set; }
        public DateTime? TakenOn { get; set; }

        public PhotoSummary() : base() { }
        public PhotoSummary(Photo entity) : base(entity) { }

        public override void Read(Photo entity)
        {
            base.Read(entity);
            Source = entity.Filename;
            Title = entity.Title;
            TakenOn = entity.TakenOn;
        }
    }
}
