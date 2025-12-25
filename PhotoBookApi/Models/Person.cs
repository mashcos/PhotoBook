using MashcosLibNet.Models;

namespace PhotoBookApi.Models
{
    public class Person : MultitenantMashcosEntity<Photobook>
    {
        public string? PersonName { get; set; }
        public string? Description { get; set; }
    }
}