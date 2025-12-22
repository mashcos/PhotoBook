using MashcosLibNet.Models;

namespace PhotoBookApi.Models
{
    public class Category : MultitenantMashcosEntity
    {
        public string? CategoryName { get; set; }
        public string? Description { get; set; }
        public string? Color { get; set; }
        public string? Icon { get; set; }
    }
}
