using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EduSync.API.Models
{
    public class Enrollment
    {
        [Key]
        public Guid EnrollmentId { get; set; }

        [Required]
        public Guid UserId { get; set; }

        [ForeignKey("UserId")]
        public User? User { get; set; }

        [Required]
        public Guid CourseId { get; set; }

        [ForeignKey("CourseId")]
        public Course? Course { get; set; }

        public DateTime EnrolledOn { get; set; } = DateTime.UtcNow;
    }
}
