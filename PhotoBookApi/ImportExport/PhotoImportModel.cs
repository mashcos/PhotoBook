using System.Text.Json.Serialization;

namespace PhotoBookApi.ImportExport;

public class PhotoImportModel
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("src")]
    public string Src { get; set; } = string.Empty;

    [JsonPropertyName("title")]
    public string Title { get; set; } = string.Empty;

    [JsonPropertyName("description")]
    public string Description { get; set; } = string.Empty;

    [JsonPropertyName("date")]
    public string Date { get; set; } = string.Empty;

    [JsonPropertyName("locationId")]
    public string? LocationId { get; set; }

    [JsonPropertyName("categoryIds")]
    public List<string> CategoryIds { get; set; } = new();

    [JsonPropertyName("isPrivacyProtected")]
    public bool IsPrivacyProtected { get; set; }

    [JsonPropertyName("isReuseLocation")]
    public bool IsReuseLocation { get; set; }
}
