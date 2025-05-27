using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EduSync.API.Models
{
    public class Result
    {
        [Key]
        public Guid ResultId { get; set; }

        [Required]
        public Guid AssessmentId { get; set; }

        [ForeignKey("AssessmentId")]
        public Assessment? Assessment { get; set; }

        [Required]
        public Guid UserId { get; set; }

        [ForeignKey("UserId")]
        public User? User { get; set; }

        [Required]
        public int Score { get; set; }

        [Required]
        public DateTime AttemptDate { get; set; } = DateTime.UtcNow;

        public string? Answers { get; set; }  // Stored as JSON

        public TimeSpan? TimeTaken { get; set; }

        [Required]
        public bool IsCompleted { get; set; } = false;
    }
} 