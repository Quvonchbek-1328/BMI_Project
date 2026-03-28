namespace RiskWatch.Api.DTOs.Common;

public class PaginatedResponse<T>
{
    public List<T> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
    public bool HasNext => Page < TotalPages;
    public bool HasPrevious => Page > 1;
}

public class PaginationQuery
{
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}
