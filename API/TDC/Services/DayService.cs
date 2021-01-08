using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TDC.Models;

namespace TDC.Services
{
    public class DayService : IDayService
    {
        private readonly TodoContext context;

        public DayService(TodoContext context)
        {
            this.context = context;
        }

        public async Task<IEnumerable<Day>> GetDays(string userId, DateTime from, DateTime to)
        {
            return await this.context.Days
                .Where(d => d.UserId == userId)
                .Where(d => d.Date >= from && d.Date <= to)
                .Include(d => d.Todos)
                .OrderBy(d => d.Date)
                .ToListAsync();
        }

        public async Task<int> CreateTodo(string userId, DateTime date, Todo todo)
        {
            var day = await this.context.Days.FindAsync(date, userId);
            // var day = await this.context.Days.SingleOrDefaultAsync(d => d.UserId == userId && d.Date == date);

            if (day is null)
            {
                day = new Day { Date = date, UserId = userId };
                await this.context.Days.AddAsync(day);
            }

            todo.Id = 0;
            day.Todos.Add(todo);
            if (await context.SaveChangesAsync() <= 0)
            {
                throw new ArgumentException();
            }
            
            return todo.Id;
        }

        public async Task UpdateTodo(string userId, DateTime date, Todo todo)
        {
            var day = await this.context.Days.FindAsync(date, userId);
            if (day is null)
            {
                throw new ArgumentException();
            }

            var oldTodo = await this.context.Entry(day)
                .Collection(d => d.Todos)
                .Query()
                .Where(t => t.Id == todo.Id)
                .SingleOrDefaultAsync();
            if (oldTodo is null)
            {
                throw new ArgumentException();
            }

            oldTodo.Content = todo.Content;
            oldTodo.Completed = todo.Completed;

            if (await this.context.SaveChangesAsync() <= 0)
            {
                throw new ArgumentException();
            }
        }

        public async Task DeleteTodo(string userId, DateTime date, int todoId)
        {
            var day = await this.context.Days.FindAsync(date, userId);
            if (day is null)
            {
                throw new ArgumentException();
            }

            var todo = await this.context.Entry(day)
                .Collection(d => d.Todos)
                .Query()
                .Where(t => t.Id == todoId)
                .SingleOrDefaultAsync();
            if (todo is null)
            {
                throw new ArgumentException();
            }

            this.context.Todos.Remove(todo);
            if (await this.context.SaveChangesAsync() <= 0)
            {
                throw new ArgumentException();
            }
            // TODO: Periodically delete days with no todos.
        }

        public async Task MoveTodo(string userId, DateTime from, DateTime to, int todoId)
        {
            if (from == to)
            {
                return;
            }

            var fromDay = await context.Days.FindAsync(from, userId);
            var toDay = await context.Days.FindAsync(to, userId);
            var todo = await context.Todos.FindAsync(todoId);

            if (fromDay is null || todo is null)
            {
                throw new ArgumentException();
            }

            if (toDay is null)
            {
                toDay = new Day { Date = to, UserId = userId };
                await this.context.Days.AddAsync(toDay);
            }

            fromDay.Todos.Remove(todo);
            toDay.Todos.Add(todo);
            await this.context.SaveChangesAsync();
        }
    }
}