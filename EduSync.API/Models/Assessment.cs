using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EduSync.API.Models
{
    public class Assessment
    {
        [Key]
        public Guid AssessmentId { get; set; }

        [Required]
        public Guid CourseId { get; set; }

        [ForeignKey("CourseId")]
        public Course? Course { get; set; }

        [Required]
        [StringLength(200)]
        public required string Title { get; set; }

        public List<Question> Questions { get; set; } = new();


        [Required]
        public int MaxScore { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        [Required]
        public bool IsActive { get; set; } = true;

        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public int? TimeLimit { get; set; }  // In minutes
    }
} 