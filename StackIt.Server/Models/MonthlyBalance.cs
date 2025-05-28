namespace StackIt.Server.Models
{
    public class MonthlyBalance
    {
        public int Id { get; set; }
        public decimal Balance { get; set; }
        public DateOnly Month { get; set; }
    }
}
