using MashcosLibNet.ViewModels;
using PhotoBookApi.Models;

namespace PhotoBookApi.Summaries
{
    public class CategorySummary : MultitenantEntitySummary<Category>
    {
        public string? CategoryName { get; set; }
        public string? Color { get; set; }
        public string? Icon { get; set; }

        public CategorySummary() : base() { }
        public CategorySummary(Category entity) : base(entity) { }

        public override void Read(Category entity)
        {
            base.Read(entity);
            CategoryName = entity.CategoryName;
            Color = entity.Color;
            Icon = entity.Icon;
        }
    }
}
