using MashcosLibNet.Models;

namespace PhotoBookApi.Models
{
    public class Photo : MultitenantMashcosEntity<Photobook>
    {
        public string? Filename { get; set; }
        public string? Title { get; set; }
        public string? Description { get; set; }
        public DateTime? TakenOn { get; set; }
        public Guid? LocationId { get; set; }
        public virtual Location? Location { get; set; }
        public virtual ISet<Person> Persons { get; set; } = new HashSet<Person>();
        public virtual ISet<Category> Categories { get; set; } = new HashSet<Category>();
    }
}
