using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EduSync.API.Migrations
{
    /// <inheritdoc />
    public partial class AddEnrolledOnToEnrollment : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "EnrolledAt",
                table: "Enrollments",
                newName: "EnrolledOn");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "EnrolledOn",
                table: "Enrollments",
                newName: "EnrolledAt");
        }
    }
}
