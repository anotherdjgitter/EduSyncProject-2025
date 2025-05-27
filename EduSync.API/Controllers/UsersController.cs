using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using EduSync.API.Data;
using EduSync.API.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Security.Claims;

namespace EduSync.API.Controllers
{
[Route("api/[controller]")]
[ApiController]
// [Authorize(Roles = "Instructor")] // Removed controller-level restriction
public class UsersController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public UsersController(ApplicationDbContext context)
    {
        _context = context;
    }

        [HttpGet("me")]
        [Authorize]
        public async Task<ActionResult<object>> GetCurrentUser()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null)
                return Unauthorized();

            var user = await _context.Users.FindAsync(Guid.Parse(userId));
            if (user == null)
                return NotFound();

            return new
            {
                user.UserId,
                user.Name,
                user.Email,
                user.Role
            };
}


        // GET: api/users
        [HttpGet]
        [Authorize(Roles = "Instructor")] // Restrict to Instructors
        public async Task<ActionResult<IEnumerable<User>>> GetUsers()
        {
            return await _context.Users.ToListAsync();
        }

        // GET: api/users/{id}
        [HttpGet("{id}")]
        [Authorize(Roles = "Instructor")] // Restrict to Instructors
        public async Task<ActionResult<User>> GetUser(Guid id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return NotFound();
            return user;
        }

        // POST: api/users
        [HttpPost]
        [Authorize(Roles = "Instructor")] // Restrict to Instructors
        public async Task<ActionResult<User>> CreateUser(User user)
        {
            user.UserId = Guid.NewGuid();
            user.CreatedAt = DateTime.UtcNow;
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetUser), new { id = user.UserId }, user);
        }

        // PUT: api/users/{id}
        [HttpPut("{id}")]
        [Authorize(Roles = "Instructor")] // Restrict to Instructors
        public async Task<IActionResult> UpdateUser(Guid id, User user)
        {
            if (id != user.UserId)
                return BadRequest();
            var existingUser = await _context.Users.FindAsync(id);
            if (existingUser == null)
                return NotFound();
            existingUser.Name = user.Name;
            existingUser.Email = user.Email;
            existingUser.Role = user.Role;
            existingUser.PasswordHash = user.PasswordHash;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/users/{id}
        [HttpDelete("{id}")]
        [Authorize(Roles = "Instructor")] // Restrict to Instructors
        public async Task<IActionResult> DeleteUser(Guid id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return NotFound();
            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
} 