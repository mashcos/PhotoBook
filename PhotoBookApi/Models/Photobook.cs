using MashcosLibNet.Models;

namespace PhotoBookApi.Models
{
    public class Photobook : AuditableMashcosEntity
    {
        public required string Title { get; set; }
        public required Guid OwnerId { get; set; }
    }
}
