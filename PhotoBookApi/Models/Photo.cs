using MashcosLibNet.Models;

namespace PhotoBookApi.Models
{
    public class Photo : MultitenantMashcosEntity
    {
        public string? Source { get; set; }
        public string? Title { get; set; }
        public string? Description { get; set; }
        public Guid? LocationId { get; set; }
        public Location? Location { get; set; }
        public DateTime? Date { get; set; }
        public ISet<Person> Persons { get; set; } = new HashSet<Person>();
        public ISet<Category> Categories { get; set; } = new HashSet<Category>();
    }
}
