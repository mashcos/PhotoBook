using System.Text.Json.Serialization;

namespace PhotoBookApi.ImportExport;

public class LocationImportModel
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("lat")]
    public double Lat { get; set; }

    [JsonPropertyName("lng")]
    public double Lng { get; set; }

    [JsonPropertyName("isReuseLocation")]
    public bool IsReuseLocation { get; set; }
}
