using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using EduSync.API.Data;
using EduSync.API.Models;
using System.Security.Claims;

namespace EduSync.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ResultsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ResultsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/results
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Result>>> GetResults()
        {
            return await _context.Results.Include(r => r.Assessment).Include(r => r.User).ToListAsync();
        }

        // GET: api/results/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Result>> GetResult(Guid id)
        {
            var result = await _context.Results.Include(r => r.Assessment).Include(r => r.User).FirstOrDefaultAsync(r => r.ResultId == id);
            if (result == null) return NotFound();
            return result;
        }

        // GET: api/results/by-user/{userId}
        [HttpGet("by-user/{userId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetResultsByUser(Guid userId)
        {
            var results = await _context.Results
                .Where(r => r.UserId == userId)
                .Include(r => r.Assessment)
                .OrderByDescending(r => r.AttemptDate)
                .ToListAsync();

            // Group by AssessmentId to compare attempts
            var grouped = results
                .GroupBy(r => r.AssessmentId)
                .Select(g => new
                {
                    AssessmentId = g.Key,
                    AssessmentTitle = g.First().Assessment?.Title,
                    Attempts = g.Select(attempt => new {
                        attempt.ResultId,
                        attempt.Score,
                        attempt.AttemptDate,
                        Percentage = (attempt.Score * 100.0) / (attempt.Assessment?.MaxScore ?? 1)
                    }).OrderByDescending(a => a.AttemptDate),
                    BestScore = g.Max(r => r.Score)
                });

            return Ok(grouped);
        }


        // POST: api/results
        // [HttpPost]
        // public async Task<ActionResult<Result>> CreateResult(Result result)
        // {
        //     result.AttemptDate = DateTime.UtcNow;
        //     _context.Results.Add(result);
        //     await _context.SaveChangesAsync();
        //     return CreatedAtAction(nameof(GetResult), new { id = result.ResultId }, result);
        // }
        [HttpPost]
        public async Task<ActionResult<Result>> CreateResult(Result result)
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (!Guid.TryParse(userIdClaim, out var userId))
                return Unauthorized("Invalid user.");

            var assessment = await _context.Assessments
                .Include(a => a.Course)
                .FirstOrDefaultAsync(a => a.AssessmentId == result.AssessmentId);

            if (assessment == null)
                return NotFound("Assessment not found.");

            //Check if the student is enrolled in the course
            bool isEnrolled = await _context.Enrollments.AnyAsync(e =>
                e.CourseId == assessment.CourseId && e.UserId == userId);

            if (!isEnrolled)
                return Forbid("You are not enrolled in this course and cannot attempt this assessment.");

            // Valid attempt
            result.UserId = userId;
            result.AttemptDate = DateTime.UtcNow;

            _context.Results.Add(result);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetResult), new { id = result.ResultId }, result);
        }



        // PUT: api/results/{id}
        [HttpPut("{id}")]
        [Authorize(Roles = "Instructor")]
        public async Task<IActionResult> UpdateResult(Guid id, Result result)
        {
            if (id != result.ResultId)
                return BadRequest();
            var existingResult = await _context.Results.FindAsync(id);
            if (existingResult == null)
                return NotFound();
            existingResult.Score = result.Score;
            existingResult.AttemptDate = result.AttemptDate;
            existingResult.Answers = result.Answers;
            existingResult.TimeTaken = result.TimeTaken;
            existingResult.IsCompleted = result.IsCompleted;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/results/{id}
        [HttpDelete("{id}")]
        [Authorize(Roles = "Instructor")]
        public async Task<IActionResult> DeleteResult(Guid id)
        {
            var result = await _context.Results.FindAsync(id);
            if (result == null)
                return NotFound();
            _context.Results.Remove(result);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
} 