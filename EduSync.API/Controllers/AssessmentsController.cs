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
    public class AssessmentsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AssessmentsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/assessments
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Assessment>>> GetAssessments()
        {
            return await _context.Assessments.Include(a => a.Course).ToListAsync();
        }

        // GET: api/assessments/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Assessment>> GetAssessment(Guid id)
        {
            var assessment = await _context.Assessments.Include(a => a.Course).FirstOrDefaultAsync(a => a.AssessmentId == id);
            if (assessment == null) return NotFound();
            return assessment;
        }

        [HttpGet("student/enrolled")]
        [Authorize(Roles = "student")]
        public async Task<IActionResult> GetAssessmentsForEnrolledCourses()
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);

            var enrolledCourseIds = await _context.Enrollments
                .Where(e => e.UserId == userId)
                .Select(e => e.CourseId)
                .ToListAsync();

            var assessments = await _context.Assessments
                .Include(a => a.Course)
                .Where(a => a.IsActive && enrolledCourseIds.Contains(a.CourseId))
                .ToListAsync();

            return Ok(assessments);
        }


        // POST: api/assessments
        [HttpPost]
        [Authorize(Roles = "instructor")]
        public async Task<ActionResult<Assessment>> CreateAssessment(Assessment assessment)
        {
            assessment.CreatedAt = DateTime.UtcNow;
            _context.Assessments.Add(assessment);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetAssessment), new { id = assessment.AssessmentId }, assessment);
        }

        // PUT: api/assessments/{id}
        [HttpPut("{id}")]
        [Authorize(Roles = "instructor")]
        public async Task<IActionResult> UpdateAssessment(Guid id, Assessment assessment)
        {
            if (id != assessment.AssessmentId) return BadRequest();
            var existing = await _context.Assessments.FindAsync(id);
            if (existing == null) return NotFound();
            existing.Title = assessment.Title;
            existing.Questions = assessment.Questions;
            existing.MaxScore = assessment.MaxScore;
            existing.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/assessments/{id}
        // [HttpDelete("{id}")]
        // [Authorize(Roles = "instructor")]
        // public async Task<IActionResult> DeleteAssessment(Guid id)
        // {
        //     var assessment = await _context.Assessments.FindAsync(id);
        //     if (assessment == null) return NotFound();
        //     _context.Assessments.Remove(assessment);
        //     await _context.SaveChangesAsync();
        //     return NoContent();
        // }

        [HttpDelete("{id}")]
        [Authorize(Roles = "instructor")]
        public async Task<IActionResult> DeleteAssessment(Guid id)
        {
            var assessment = await _context.Assessments
                .Include(a => a.Questions)
                .Include(a => a.Course)
                .FirstOrDefaultAsync(a => a.AssessmentId == id);

            if (assessment == null)
                return NotFound();

            // Check if results exist for this assessment
            bool hasResults = await _context.Results.AnyAsync(r => r.AssessmentId == id);
            if (hasResults)
                return BadRequest("Cannot delete this assessment because students have already attempted it.");

            // Safe to delete
            _context.Assessments.Remove(assessment);
            await _context.SaveChangesAsync();

            return NoContent();
        }

    }
} 