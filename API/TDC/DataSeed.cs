using System;
using System.Linq;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using TDC.Models;

namespace TDC
{
    public class DataSeed
    {
        public static void Initialize(IServiceProvider serviceProvider)
        {
            var context = serviceProvider.GetRequiredService<TodoContext>() ?? throw new ArgumentNullException("context");
            var userManager = serviceProvider.GetRequiredService<UserManager<User>>() ?? throw new ArgumentNullException("userManager");

            context.Database.EnsureCreated();
            if (!context.Users.Any())
            {
                var adminUser = new User
                {
                    UserName = "Admin",
                    EmailConfirmed = true
                };
                
                userManager.CreateAsync(adminUser, "password_1234I").GetAwaiter().GetResult();
                context.SaveChanges();
                Console.WriteLine("Create user");
            }
        }
    }
}