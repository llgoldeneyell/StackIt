using System.Globalization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.VisualBasic;
using StackIt.Server.Helpers;
using StackIt.Server.Models;

namespace StackIt.Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class SavingGoalsController : ControllerBase
    {
        private readonly JsonManager<Goal> jsonManager;

        public SavingGoalsController()
        {
            var dataFile = Path.Combine(Directory.GetCurrentDirectory(), "Data", "SavingGoals.json");
            jsonManager = new JsonManager<Goal>(dataFile);
        }

        [HttpGet]
        public async Task<ActionResult<List<Goal>>> Get()
        {
            var goals = await jsonManager.LoadAsync();
            return Ok(goals);
        }

        [HttpPost]
        public async Task<ActionResult> Post([FromBody] Goal newGoal)
        {
            var goals = await jsonManager.LoadAsync();

            int nextId = goals.Any() ? goals.Max(i => i.Id) + 1 : 1;
            newGoal.Id = nextId;

            goals.Add(newGoal);

            // Ordina per data
            goals = goals.OrderBy(m => m.DueMonth).ToList();
            await jsonManager.SaveAsync(goals);

            return CreatedAtAction(nameof(Get), new { id = newGoal.Id }, newGoal);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            var goals = await jsonManager.LoadAsync();

            var item = goals.FirstOrDefault(i => i.Id == id);
            if (item == null) return NotFound();

            goals.Remove(item);
            await jsonManager.SaveAsync(goals);

            return Ok(item);
        }
    }
}
