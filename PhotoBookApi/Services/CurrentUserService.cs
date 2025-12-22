using MashcosLibNet.Services;

namespace PhotoBookApi.Services
{
    public class CurrentUserService : HttpHeaderCurrentUserService
    {
        public CurrentUserService(IHttpContextAccessor httpContextAccessor) : base(httpContextAccessor)
        {
        }
    }
}
