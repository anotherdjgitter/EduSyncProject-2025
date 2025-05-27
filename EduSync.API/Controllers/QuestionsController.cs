using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EduSync.API.Data;
using EduSync.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EduSync.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class QuestionsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public QuestionsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // Get all questions for an assessment
        [HttpGet("assessment/{assessmentId}")]
        public async Task<ActionResult<IEnumerable<Question>>> GetByAssessment(Guid assessmentId)
        {
            var questions = await _context.Questions
                .Where(q => q.AssessmentId == assessmentId)
                .ToListAsync();

            return Ok(questions);
        }

        // Create a new question
        [HttpPost]
        [Authorize(Roles = "instructor")]
        public async Task<ActionResult<Question>> Create(Question question)
        {
            if (question == null || string.IsNullOrWhiteSpace(question.Text))
            {
                return BadRequest("Question text is required.");
            }

            _context.Questions.Add(question);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetByAssessment), new { assessmentId = question.AssessmentId }, question);
        }

        // Update a question
        [HttpPut("{id}")]
        [Authorize(Roles = "instructor")]
        public async Task<IActionResult> Update(Guid id, [FromBody] Question updated)
        {
            if (updated == null || string.IsNullOrWhiteSpace(updated.Text))
            {
                return BadRequest("Question text is required.");
            }

            var existing = await _context.Questions.FindAsync(id);
            if (existing == null)
            {
                return NotFound();
            }

            existing.Text = updated.Text;
            existing.Type = updated.Type;
            existing.OptionsJson = updated.OptionsJson;
            existing.CorrectAnswer = updated.CorrectAnswer;
            existing.Points = updated.Points;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // Delete a question
        [HttpDelete("{id}")]
        [Authorize(Roles = "instructor")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var question = await _context.Questions.FindAsync(id);
            if (question == null)
                return NotFound();

            _context.Questions.Remove(question);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
