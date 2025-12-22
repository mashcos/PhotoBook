using MashcosLibNet.ViewModels;
using PhotoBookApi.Models;

namespace PhotoBookApi.Summaries
{
    public class LocationSummary : MultitenantEntitySummary<Location>
    {
        public string? LocationName { get; set; }

        public LocationSummary() : base() { }
        public LocationSummary(Location entity) : base(entity) { }

        public override void Read(Location entity)
        {
            base.Read(entity);
            LocationName = entity.LocationName;
        }
    }
}
