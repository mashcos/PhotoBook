using MashcosLibNet.ViewModels;
using PhotoBookApi.Models;

namespace PhotoBookApi.ViewModels
{
    public class CategoryViewModel : MultitenantEntityViewModel<Category>
    {
        public string? CategoryName { get; set; }
        public string? Description { get; set; }
        public string? Color { get; set; }
        public string? Icon { get; set; }

        public CategoryViewModel() : base() { }
        public CategoryViewModel(Category entity) : base(entity) { }

        public override void Read(Category entity)
        {
            base.Read(entity);
            CategoryName = entity.CategoryName;
            Description = entity.Description;
            Color = entity.Color;
            Icon = entity.Icon;
        }

        public override void Write(Category entity)
        {
            base.Write(entity);
            entity.CategoryName = CategoryName;
            entity.Description = Description;
            entity.Color = Color;
            entity.Icon = Icon;
        }
    }
}
