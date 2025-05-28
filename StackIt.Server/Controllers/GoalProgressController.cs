using Microsoft.AspNetCore.Mvc;
using StackIt.Server.Helpers;
using StackIt.Server.Models;

namespace StackIt.Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class GoalProgressController : Controller
    {
        private readonly JsonManager<MonthlyBalance> jsonManagerBalances;
        private readonly JsonManager<Goal> jsonManagerGoals;
        public GoalProgressController()
        {
            var dataFile = Path.Combine(Directory.GetCurrentDirectory(), "Data", "MonthlyBalances.json");
            jsonManagerBalances = new JsonManager<MonthlyBalance>(dataFile);
            dataFile = Path.Combine(Directory.GetCurrentDirectory(), "Data", "SavingGoals.json");
            jsonManagerGoals = new JsonManager<Goal>(dataFile);
        }

        [HttpGet]
        public async Task<ActionResult<List<Goal>>> Get()
        {
            var monthlyBalances = await jsonManagerBalances.LoadAsync();
            var goals = await jsonManagerGoals.LoadAsync();

            MonthlyBalance actualMonthlyBalance = monthlyBalances.Last();

            goals = goals.Where(g => g.DueMonth >= actualMonthlyBalance.Month).ToList();

            foreach (var goal in goals)
            {
                var difference = actualMonthlyBalance.Balance - goal.Amount;
                goal.Remaining = Math.Abs(difference);

                if (difference < 0)
                {
                    goal.Progression = 100 - (Math.Abs(difference) * 100) / goal.Amount;
                    actualMonthlyBalance.Balance = 0;
                    break;
                }
                else
                {
                    goal.Progression = 100;
                    actualMonthlyBalance.Balance = difference;
                }
            }

            return Ok(goals);
        }
    }
}
