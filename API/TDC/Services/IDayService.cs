using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TDC.Models;

namespace TDC.Services
{
    public interface IDayService
    {
        Task<IEnumerable<Day>> GetDays(string userId, DateTime from, DateTime to);
        
        Task<int> CreateTodo(string userId, DateTime date, Todo todo);
        
        Task UpdateTodo(string userId, DateTime date, Todo todo);
        
        Task DeleteTodo(string userId, DateTime date, int todoId);

        Task MoveTodo(string userId, DateTime from, DateTime to, int todoId);
    }
}