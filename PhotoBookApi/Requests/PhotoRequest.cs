using MashcosLibNet.Requests;
using PhotoBookApi.Models;

namespace PhotoBookApi.Requests
{
    public class PhotoRequest : MultitenantEntityRequest<Photo>
    {
        public Guid? LocationId { get; set; }
        public Guid? CategoryId { get; set; }
        public Guid? PersonId { get; set; }
        public DateTime? TakenFromDate { get; set; }
        public DateTime? TakenToData { get; set; }
    }
}
