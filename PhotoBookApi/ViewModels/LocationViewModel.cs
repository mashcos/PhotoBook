using MashcosLibNet.ViewModels;
using PhotoBookApi.Models;

namespace PhotoBookApi.ViewModels
{
    public class LocationViewModel : MultitenantEntityViewModel<Location>
    {
        public string? LocationName { get; set; }
        public string? Description { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public bool Reusable { get; set; }

        public LocationViewModel() : base() { }
        public LocationViewModel(Location entity) : base(entity) { }

        public override void Read(Location entity)
        {
            base.Read(entity);
            LocationName = entity.LocationName;
            Description = entity.Description;
            Latitude = entity.Latitude;
            Longitude = entity.Longitude;
            Reusable = entity.Reusable;
        }

        public override void Write(Location entity)
        {
            base.Write(entity);
            entity.LocationName = LocationName;
            entity.Description = Description;
            entity.Latitude = Latitude;
            entity.Longitude = Longitude;
            entity.Reusable = Reusable;
        }
    }
}
