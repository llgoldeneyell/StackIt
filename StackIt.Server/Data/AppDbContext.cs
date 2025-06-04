using Microsoft.EntityFrameworkCore;
using StackIt.Server.Models;

namespace StackIt.Server.Data
{
    public class AppDbContext : DbContext
    {
        public DbSet<User> Users { get; set; }
        public DbSet<Goal> Goals { get; set; }
        public DbSet<MonthlyBalance> MonthlyBalances { get; set; }

        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
    }
}
