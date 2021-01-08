using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using TDC.Models;
using TDC.Services;

namespace TDC.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/[controller]")]
    public class DayController : ControllerBase
    {
        private readonly ILogger<DayController> logger;
        private readonly IDayService service;

        public DayController(IDayService service, ILogger<DayController> logger)
        {
            this.service = service;
            this.logger = logger;
        }

        [HttpGet("{from}/{to}")]
        public async Task<IEnumerable<object>> GetDays(string from, string to)
        {
            var startDay = DateTime.Parse(from);
            var endDay = DateTime.Parse(to);
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            this.logger.LogDebug($"startDay: {startDay}, endDay: {endDay}.");

            return (await this.service.GetDays(userId, startDay, endDay)).Select(d => new
            {
                Date = d.Date.ToString("MM-dd-yyyy"),
                d.Todos,
            });
        }

        [HttpPost("{date}/todo")]
        public async Task<ActionResult<int>> CreateTodo(string date, Todo todo)
        {
            var parsedDate = DateTime.Parse(date);
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            try
            {
                var id = await this.service.CreateTodo(userId, parsedDate, todo);
                this.logger.LogDebug($"Create new todo #{id} for {date} day.");
                return id;
            }
            catch (ArgumentException)
            {
                return this.BadRequest();
            }
        }

        [HttpDelete("{date}/todo/{todoId}")]
        public async Task<IActionResult> DeleteTodo(string date, int todoId)
        {
            var parsedDate = DateTime.Parse(date);
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            try
            {
                await this.service.DeleteTodo(userId, parsedDate, todoId);
                this.logger.LogDebug($"Todo #{todoId} was deleted.");
                return this.NoContent();
            }
            catch (ArgumentException)
            {
                return this.NotFound();
            }
        }

        [HttpPut("{date}/todo/{todoId}")]
        public async Task<IActionResult> UpdateTodo(string date, int todoId, Todo todo)
        {
            var parsedDate = DateTime.Parse(date);
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (todoId != todo.Id)
            {
                return this.BadRequest();
            }
            
            try
            {
                await this.service.UpdateTodo(userId, parsedDate, todo);
                this.logger.LogDebug($"Todo #{todo.Id} was updated.");
                return this.NoContent();
            }
            catch (ArgumentException)
            {
                return this.NotFound();
            }
        }

        [HttpPost("{from}/{to}/{todoId}")]
        public async Task<IActionResult> MoveTodo(string from, string to, int todoId)
        {
            var fromDate = DateTime.Parse(from);
            var toDate = DateTime.Parse(to);
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            try
            {
                await this.service.MoveTodo(userId, fromDate, toDate, todoId);
                return this.NoContent();
            }
            catch (ArgumentException ex)
            {
                Console.WriteLine(ex.Message);
                return this.BadRequest();
            }

        }
    }
}