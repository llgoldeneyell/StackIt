using Microsoft.AspNetCore.Mvc;
using StackIt.Server.Helpers;
using StackIt.Server.Models;

namespace StackIt.Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class MonthlyBalancesController : ControllerBase
    {
        private readonly JsonManager<MonthlyBalance> jsonManager;

        public MonthlyBalancesController()
        {
            var dataFile = Path.Combine(Directory.GetCurrentDirectory(), "Data", "MonthlyBalances.json");
            jsonManager = new JsonManager<MonthlyBalance>(dataFile);
        }

        [HttpGet]
        public async Task<ActionResult<List<MonthlyBalance>>> Get()
        {
            var monthlyBalances = await jsonManager.LoadAsync();
            return Ok(monthlyBalances);
        }

        [HttpPost]
        public async Task<ActionResult> Post([FromBody] MonthlyBalance newBalance)
        {
            var monthlyBalance = await jsonManager.LoadAsync();

            int nextId = monthlyBalance.Any() ? monthlyBalance.Max(i => i.Id) + 1 : 1;
            newBalance.Id = nextId;

            monthlyBalance.RemoveAll(x => x.Month == newBalance.Month);

            monthlyBalance.Add(newBalance);

            // Ordina per data
            monthlyBalance = monthlyBalance.OrderBy(m => m.Month).ToList();
            await jsonManager.SaveAsync(monthlyBalance);

            return CreatedAtAction(nameof(Get), new { id = newBalance.Id }, newBalance);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            var monthlyBalance = await jsonManager.LoadAsync();

            var item = monthlyBalance.FirstOrDefault(i => i.Id == id);
            if (item == null) return NotFound();

            monthlyBalance.Remove(item);
            await jsonManager.SaveAsync(monthlyBalance);

            return Ok(item);
        }
    }
}
