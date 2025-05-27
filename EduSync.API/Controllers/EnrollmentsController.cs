// using System;
// using System.Linq;
// using System.Threading.Tasks;
// using EduSync.API.Data;
// using EduSync.API.Models;
// using Microsoft.AspNetCore.Authorization;
// using Microsoft.AspNetCore.Mvc;
// using Microsoft.EntityFrameworkCore;
// using System.Security.Claims;

// namespace EduSync.API.Controllers
// {
//     [Route("api/[controller]")]
//     [ApiController]
//     [Authorize(Roles = "student")]
//     public class EnrollmentsController : ControllerBase
//     {
//         private readonly ApplicationDbContext _context;

//         public EnrollmentsController(ApplicationDbContext context)
//         {
//             _context = context;
//         }

//         // POST: api/enrollments
//         [HttpPost]
//         public async Task<IActionResult> Enroll([FromBody] Guid courseId)
//         {
//             var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
//             if (!Guid.TryParse(userIdString, out var userId))
//                 return Unauthorized("Invalid user.");

//             var course = await _context.Courses.FirstOrDefaultAsync(c => c.CourseId == courseId);
//             if (course == null) return NotFound("Course not found.");

//             var alreadyEnrolled = await _context.Enrollments
//                 .AnyAsync(e => e.UserId == userId && e.CourseId == courseId);

//             if (alreadyEnrolled)
//                 return BadRequest("Already enrolled in this course.");

//             var enrollment = new Enrollment
//             {
//                 EnrollmentId = Guid.NewGuid(),
//                 CourseId = courseId,
//                 UserId = userId,
//                 EnrolledOn = DateTime.UtcNow
//             };

//             _context.Enrollments.Add(enrollment);
//             await _context.SaveChangesAsync();

//             return Ok(enrollment);
//         }

//         // GET: api/enrollments/my
//         [HttpGet("my")]
//         public async Task<IActionResult> GetMyEnrolledCourses()
//         {
//             var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
//             if (!Guid.TryParse(userIdString, out var userId))
//                 return Unauthorized("Invalid user.");

//             var enrolledCourses = await _context.Enrollments
//                 .Where(e => e.UserId == userId)
//                 .Include(e => e.Course)
//                 .Select(e => e.Course)
//                 .ToListAsync();

//             return Ok(enrolledCourses);
//         }

//         // GET: api/enrollments/by-instructor
//         [HttpGet("by-instructor")]
//         [Authorize(Roles = "instructor")]
//         public async Task<IActionResult> GetStudentsByInstructor()
//         {
//             var instructorId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

//             var enrollments = await _context.Enrollments
//                 .Include(e => e.User)
//                 .Include(e => e.Course)
//                 .Where(e => e.Course.InstructorId == instructorId)
//                 .Select(e => new
//                 {
//                     StudentName = e.User.Name,
//                     StudentEmail = e.User.Email,
//                     CourseTitle = e.Course.Title,
//                     CourseId = e.CourseId,
//                     e.UserId
//                 })
//                 .ToListAsync();

//             return Ok(enrollments);
//         }

//         // GET: api/enrollments/analytics/{courseId}
//         [HttpGet("analytics/{courseId}")]
//         [Authorize(Roles = "instructor")]
//         public async Task<IActionResult> GetStudentAnalyticsForCourse(Guid courseId)
//         {
//             var instructorId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
//             var course = await _context.Courses.FindAsync(courseId);

//             if (course == null || course.InstructorId != instructorId)
//                 return Forbid();

//             var data = await _context.Results
//                 .Where(r => r.Assessment.CourseId == courseId)
//                 .Include(r => r.User)
//                 .Include(r => r.Assessment)
//                 .GroupBy(r => new { r.UserId, r.AssessmentId })
//                 .Select(g => new
//                 {
//                     StudentId = g.Key.UserId,
//                     AssessmentId = g.Key.AssessmentId,
//                     AssessmentTitle = g.First().Assessment.Title,
//                     Attempts = g.OrderBy(r => r.AttemptDate).Select(r => new
//                     {
//                         r.Score,
//                         r.AttemptDate,
//                         r.TimeTaken
//                     }),
//                     Student = g.First().User.Name
//                 })
//                 .ToListAsync();

//             return Ok(data);
//         }


//     }
// }


using System;
using System.Linq;
using System.Threading.Tasks;
using EduSync.API.Data;
using EduSync.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace EduSync.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class EnrollmentsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public EnrollmentsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // POST: api/enrollments
        [HttpPost]
        [Authorize(Roles = "student")]
        public async Task<IActionResult> Enroll([FromBody] Guid courseId)
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!Guid.TryParse(userIdString, out var userId))
                return Unauthorized("Invalid user.");

            var course = await _context.Courses.FirstOrDefaultAsync(c => c.CourseId == courseId);
            if (course == null) return NotFound("Course not found.");

            var alreadyEnrolled = await _context.Enrollments
                .AnyAsync(e => e.UserId == userId && e.CourseId == courseId);

            if (alreadyEnrolled)
                return BadRequest("Already enrolled in this course.");

            var enrollment = new Enrollment
            {
                EnrollmentId = Guid.NewGuid(),
                CourseId = courseId,
                UserId = userId,
                EnrolledOn = DateTime.UtcNow
            };

            _context.Enrollments.Add(enrollment);
            await _context.SaveChangesAsync();

            return Ok(enrollment);
        }

        // GET: api/enrollments/my
        [HttpGet("my")]
        [Authorize(Roles = "student")]
        public async Task<IActionResult> GetMyEnrolledCourses()
        {
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!Guid.TryParse(userIdString, out var userId))
                return Unauthorized("Invalid user.");

            var enrolledCourses = await _context.Enrollments
                .Where(e => e.UserId == userId)
                .Include(e => e.Course)
                .Select(e => e.Course)
                .ToListAsync();

            return Ok(enrolledCourses);
        }

        // GET: api/enrollments/by-instructor
        [HttpGet("by-instructor")]
        [Authorize(Roles = "instructor")]
        public async Task<IActionResult> GetStudentsByInstructor()
        {
            var instructorIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!Guid.TryParse(instructorIdString, out var instructorId))
                return Unauthorized();

            var enrollments = await _context.Enrollments
                .Include(e => e.User)
                .Include(e => e.Course)
                .Where(e => e.Course.InstructorId == instructorId)
                .Select(e => new
                {
                    e.UserId,
                    StudentName = e.User.Name,
                    StudentEmail = e.User.Email,
                    CourseTitle = e.Course.Title,
                    CourseId = e.CourseId
                })
                .ToListAsync();

            return Ok(enrollments);
        }

        // GET: api/enrollments/analytics/{courseId}
        [HttpGet("analytics/{courseId}")]
        [Authorize(Roles = "instructor")]
        public async Task<IActionResult> GetStudentAnalyticsForCourse(Guid courseId)
        {
            var instructorIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!Guid.TryParse(instructorIdString, out var instructorId))
                return Unauthorized();

            var course = await _context.Courses.FirstOrDefaultAsync(c => c.CourseId == courseId && c.InstructorId == instructorId);
            if (course == null)
                return Forbid();

            var analytics = await _context.Results
                .Include(r => r.User)
                .Include(r => r.Assessment)
                .Where(r => r.Assessment.CourseId == courseId)
                .GroupBy(r => new { r.UserId, r.AssessmentId })
                .Select(g => new
                {
                    Student = g.First().User.Name,
                    StudentId = g.Key.UserId,
                    AssessmentId = g.Key.AssessmentId,
                    AssessmentTitle = g.First().Assessment.Title,
                    Attempts = g.OrderBy(a => a.AttemptDate).Select(a => new
                    {
                        a.Score,
                        a.AttemptDate,
                        a.TimeTaken
                    }).ToList()
                })
                .ToListAsync();

            return Ok(analytics);
        }
    }
}
