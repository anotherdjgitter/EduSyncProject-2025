using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EduSync.API.Models
{
    public class Question
    {
        [Key]
        public Guid QuestionId { get; set; }

        [Required]
        public Guid AssessmentId { get; set; }

        [ForeignKey("AssessmentId")]
        public Assessment? Assessment { get; set; }

        [Required]
        public string Text { get; set; } = string.Empty;

        [Required]
        public string Type { get; set; } = "MCQ"; // "MCQ", "TrueFalse", "ShortAnswer"

        public string? OptionsJson { get; set; } // JSON array for MCQ options
        public string? CorrectAnswer { get; set; } // Expected correct answer

        public int Points { get; set; } = 1;
    }
}
