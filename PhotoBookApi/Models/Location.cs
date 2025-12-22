using MashcosLibNet.Models;

namespace PhotoBookApi.Models
{
    public class Location : MultitenantMashcosEntity
    {
        public string? LocationName { get; set; }
        public string? Description { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public bool Reusable { get; set; }
    }
}