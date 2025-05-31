using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EduSync.API.Controllers;
using EduSync.API.Data;
using EduSync.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NUnit.Framework;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;



namespace EduSync.Tests
{
    public class UnitTest1
    {
        private ApplicationDbContext _context = null!;
        private CoursesController _controller = null!;

        [SetUp]
        public void Setup()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString()) // use new DB each time
                .Options;

            _context = new ApplicationDbContext(options);
            _controller = new CoursesController(_context);
        }

        [TearDown]
        public void Cleanup()
        {
            _context.Dispose();
        }

        [Test]
        public async Task CreateCourse_ValidCourse_ReturnsCreatedCourse()
        {
            var instructorId = Guid.NewGuid();
            var course = new Course
            {
                Title = "Test Course",
                Description = "Test Description",
                InstructorId = instructorId
            };

            var httpContext = new ControllerContext();
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext()
            };
            _controller.ControllerContext.HttpContext.User = TestClaimsPrincipal.CreateUserWithRole(instructorId, "instructor");

            var result = await _controller.CreateCourse(course);
            Assert.That(result.Result, Is.InstanceOf<CreatedAtActionResult>());
        }

        [Test]
        public async Task GetCourses_ReturnsAllCourses()
        {
            // Arrange
            var course = new Course
            {
                CourseId = Guid.NewGuid(),
                Title = "Test Course",
                Description = "Test Description",
                InstructorId = Guid.NewGuid(),
                CreatedAt = DateTime.UtcNow
            };
            _context.Courses.Add(course);
            await _context.SaveChangesAsync();

            var controller = new CoursesController(_context);

            // Act
            var result = await controller.GetCourses();

            // Assert
            Assert.That(result.Value, Is.Not.Null);
            Assert.That(result.Value!.Count, Is.EqualTo(1));
        }


        [Test]
        public async Task GetCourse_NonExistingId_ReturnsNotFound()
        {
            var result = await _controller.GetCourse(Guid.NewGuid());
            Assert.That(result.Result, Is.InstanceOf<NotFoundResult>());
        }

        [Test]
        public async Task GetCourse_ExistingId_ReturnsCourse()
        {
            // Arrange
            var courseId = Guid.NewGuid();
            var course = new Course
            {
                CourseId = courseId,
                Title = "Sample Course",
                Description = "Sample Desc",
                InstructorId = Guid.NewGuid(),
                CreatedAt = DateTime.UtcNow
            };
            _context.Courses.Add(course);
            await _context.SaveChangesAsync();

            var controller = new CoursesController(_context);

            // Act
            var result = await controller.GetCourse(courseId);

            // Assert
            Assert.That(result.Value, Is.Not.Null);
            Assert.That(result.Value!.Title, Is.EqualTo("Sample Course"));
        }


        [Test]
        public async Task DeleteCourse_RemovesCourse()
        {
            var course = new Course
            {
                CourseId = Guid.NewGuid(),
                Title = "ToDelete",
                Description = "Delete me",
                InstructorId = Guid.NewGuid()
            };
            _context.Courses.Add(course);
            await _context.SaveChangesAsync();

            var result = await _controller.DeleteCourse(course.CourseId);
            Assert.That(result, Is.InstanceOf<NoContentResult>());
            Assert.That(_context.Courses.Count(), Is.EqualTo(0));
        }

        [Test]
        public async Task UpdateCourse_NonExisting_ReturnsNotFound()
        {
            var fakeCourse = new Course
            {
                CourseId = Guid.NewGuid(),
                Title = "X",
                Description = "Y",
                InstructorId = Guid.NewGuid()
            };

            var result = await _controller.UpdateCourse(fakeCourse.CourseId, fakeCourse);
            Assert.That(result, Is.InstanceOf<NotFoundResult>());
        }

        [Test]
        public async Task CourseExists_ReturnsTrue()
        {
            var course = new Course
            {
                CourseId = Guid.NewGuid(),
                Title = "Exists",
                Description = "Yes",
                InstructorId = Guid.NewGuid()
            };
            _context.Courses.Add(course);
            await _context.SaveChangesAsync();

            var exists = _controller.GetType().GetMethod("CourseExists", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance)!
                .Invoke(_controller, new object[] { course.CourseId });

            Assert.That(exists, Is.True);
        }

        [Test]
        public async Task CourseExists_ReturnsFalse()
        {
            var exists = _controller.GetType().GetMethod("CourseExists", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance)!
                .Invoke(_controller, new object[] { Guid.NewGuid() });

            Assert.That(exists, Is.False);
        }
    }

    public static class TestClaimsPrincipal
    {
        public static ClaimsPrincipal CreateUserWithRole(Guid userId, string role)
        {
            var identity = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
                new Claim(ClaimTypes.Role, role)
            }, "mock");

            return new ClaimsPrincipal(identity);
        }
    }
}
