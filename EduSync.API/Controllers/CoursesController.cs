using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using EduSync.API.Data;
using EduSync.API.Models;

namespace EduSync.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CoursesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CoursesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/courses
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Course>>> GetCourses()
        {
            return await _context.Courses
                .Include(c => c.Instructor)
                //.Where(c => c.IsActive)
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();
        }

        // GET: api/courses/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Course>> GetCourse(Guid id)
        {
            var course = await _context.Courses
                .Include(c => c.Instructor)
                .FirstOrDefaultAsync(c => c.CourseId == id);

            if (course == null)
                return NotFound();

            return course;
        }

        // POST: api/courses
        [HttpPost]
        [Authorize(Roles = "instructor")]
        public async Task<ActionResult<Course>> CreateCourse([FromBody]Course course)
        {
            // Get userId from claims and check for null
            var userIdString = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (!Guid.TryParse(userIdString, out var userId))
                return Unauthorized("Invalid or missing user ID claim.");
            if (course.InstructorId != userId)
             {
                return Forbid("InstructorId does not match the logged-in user.");
             }
            course.CreatedAt = DateTime.UtcNow;

            _context.Courses.Add(course);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCourse), new { id = course.CourseId }, course);
        }

        // PUT: api/courses/{id}
        [HttpPut("{id}")]
        [Authorize(Roles = "instructor")]
        public async Task<IActionResult> UpdateCourse(Guid id, Course course)
        {
            if (id != course.CourseId)
                return BadRequest();

            var existingCourse = await _context.Courses.FindAsync(id);
            if (existingCourse == null)
                return NotFound();

            // ✅ Only allow editing if the logged-in instructor owns the course
            var userIdString = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (!Guid.TryParse(userIdString, out var userId))
                return Unauthorized("Invalid or missing user ID claim.");

            if (existingCourse.InstructorId != userId)
                return Forbid("You are not authorized to edit this course.");

            // Allow any instructor to update
            existingCourse.Title = course.Title;
            existingCourse.Description = course.Description;
            existingCourse.MediaUrl = course.MediaUrl;
            existingCourse.UpdatedAt = DateTime.UtcNow;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CourseExists(id))
                    return NotFound();
                throw;
            }

            return NoContent();
        }

        // DELETE: api/courses/{id}
        [HttpDelete("{id}")]
        [Authorize(Roles = "instructor")]
        public async Task<IActionResult> DeleteCourse(Guid id)
        {
            var course = await _context.Courses.FindAsync(id);
            if (course == null)
                return NotFound();

            // Allow any instructor to delete
            _context.Courses.Remove(course);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool CourseExists(Guid id)
        {
            return _context.Courses.Any(e => e.CourseId == id);
        }
    }
} 