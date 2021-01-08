using System.Collections.Generic;
using IdentityServer4.EntityFramework.Options;
using Microsoft.AspNetCore.ApiAuthorization.IdentityServer;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using TDC.Models;

namespace TDC
{
    public class TodoContext : IdentityDbContext<User> // ApiAuthorizationDbContext<IdentityUser>
    {
        // public TodoContext()
        // {
        //     
        // }
        
        public TodoContext(DbContextOptions<TodoContext> options)
            : base(options)
        {
            
        }

        // public TodoContext(DbContextOptions<TodoContext> options,
        //     IOptions<OperationalStoreOptions> operationalStoreOptions)
        //     : base(options, operationalStoreOptions)
        // {
        //     
        // }
        
        public DbSet<Todo> Todos { get; set; }

        public DbSet<Day> Days { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);
            builder.Entity<Day>()
                .HasKey(d => new {d.Date, d.UserId});
        }
    }
}