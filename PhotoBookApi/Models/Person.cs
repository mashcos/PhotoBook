using MashcosLibNet.Models;

namespace PhotoBookApi.Models
{
    public class Person : MultitenantMashcosEntity
    {
        public string? PersonName { get; set; }
        public string? Description { get; set; }
    }
}