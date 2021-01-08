using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace TDC.Models
{
    public class Day
    {
        public DateTime Date { get; set; }

        public List<Todo> Todos { get; set; } = new List<Todo>();
        
        public string UserId { get; set; }
        public User User { get; set; }
    }
}