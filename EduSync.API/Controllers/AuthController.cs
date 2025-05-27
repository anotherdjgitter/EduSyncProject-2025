using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using EduSync.API.Models;
using EduSync.API.Data;
using Microsoft.EntityFrameworkCore;
using BCrypt.Net;

namespace EduSync.API.Controllers
{
    
    [Route("api/[controller]")]
    [ApiController]
    
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(ApplicationDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("login")]
        public async Task<ActionResult<dynamic>> Login([FromBody] LoginModel model)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == model.Email);

            if (user == null || !BCrypt.Net.BCrypt.Verify(model.Password, user.PasswordHash))
                return Unauthorized(new { message = "Invalid credentials" });

            var token = GenerateJwtToken(user);

            user.LastLogin = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return new
            {
                token,
                user = new
                {
                    user.UserId,
                    user.Name,
                    user.Email,
                    user.Role
                }
            };
        }

        [HttpPost("register")]
public async Task<ActionResult<dynamic>> Register([FromBody] RegisterModel model)
{
    if (await _context.Users.AnyAsync(u => u.Email == model.Email))
        return BadRequest(new { message = "Email already registered" });

    var user = new User
    {
        Name = model.Name,
        Email = model.Email,
        Role = model.Role,
        PasswordHash = BCrypt.Net.BCrypt.HashPassword(model.Password)
    };

    _context.Users.Add(user);
    await _context.SaveChangesAsync();

    // Generate token just like in Login
    var token = GenerateJwtToken(user);

    return new
    {
        token,
        user = new
        {
            user.UserId,
            user.Name,
            user.Email,
            user.Role
        }
    };
}


        private string GenerateJwtToken(User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var keyString = _configuration["Jwt:Key"];
            var issuer = _configuration["Jwt:Issuer"];
            if (string.IsNullOrEmpty(keyString))
                throw new InvalidOperationException("JWT key is not configured.");
            var key = Encoding.ASCII.GetBytes(keyString);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim(ClaimTypes.Role, user.Role)
                }),
                Expires = DateTime.UtcNow.AddDays(7),
                Issuer = issuer,
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }

    public class LoginModel
    {
        public required string Email { get; set; }
        public required string Password { get; set; }
    }

    public class RegisterModel
    {
        public required string Name { get; set; }
        public required string Email { get; set; }
        public required string Password { get; set; }
        public required string Role { get; set; }
    }
} 