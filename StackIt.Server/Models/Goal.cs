using StackIt.Server.Models;

namespace StackIt.Server.Models
{
    public class Goal
    {
        public int Id { get; set; }
        public string? Label { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public DateOnly DueMonth { get; set; }
        public decimal Progression { get; set; }
        public decimal Remaining { get; set; }
    }
}