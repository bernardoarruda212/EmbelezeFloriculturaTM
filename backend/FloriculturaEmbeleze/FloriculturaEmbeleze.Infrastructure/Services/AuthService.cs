using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using FloriculturaEmbeleze.Application.DTOs.Auth;
using FloriculturaEmbeleze.Application.Services.Interfaces;
using FloriculturaEmbeleze.Domain.Entities;
using FloriculturaEmbeleze.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace FloriculturaEmbeleze.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthService(AppDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    public async Task<LoginResponseDto> LoginAsync(LoginRequestDto dto)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == dto.Email);

        if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("Email ou senha inválidos.");

        if (!user.IsActive)
            throw new UnauthorizedAccessException("Usuário desativado.");

        var accessToken = GenerateJwtToken(user);
        var refreshToken = await CreateRefreshTokenAsync(user.Id);

        return new LoginResponseDto
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken.Token,
            User = MapToUserInfo(user)
        };
    }

    public async Task<LoginResponseDto> RefreshTokenAsync(RefreshTokenRequestDto dto)
    {
        var storedToken = await _context.RefreshTokens
            .Include(rt => rt.User)
            .FirstOrDefaultAsync(rt => rt.Token == dto.RefreshToken);

        if (storedToken == null)
            throw new UnauthorizedAccessException("Token de atualização inválido.");

        if (!storedToken.IsActive)
            throw new UnauthorizedAccessException("Token de atualização expirado ou revogado.");

        // Revoke old token
        storedToken.RevokedAt = DateTime.UtcNow;

        // Create new refresh token
        var newRefreshToken = await CreateRefreshTokenAsync(storedToken.UserId);
        storedToken.ReplacedByToken = newRefreshToken.Token;

        await _context.SaveChangesAsync();

        var accessToken = GenerateJwtToken(storedToken.User);

        return new LoginResponseDto
        {
            AccessToken = accessToken,
            RefreshToken = newRefreshToken.Token,
            User = MapToUserInfo(storedToken.User)
        };
    }

    public async Task RevokeTokenAsync(string refreshToken)
    {
        var storedToken = await _context.RefreshTokens
            .FirstOrDefaultAsync(rt => rt.Token == refreshToken);

        if (storedToken != null && storedToken.IsActive)
        {
            storedToken.RevokedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
    }

    public async Task RevokeRefreshTokenAsync(Guid userId)
    {
        var activeTokens = await _context.RefreshTokens
            .Where(rt => rt.UserId == userId && rt.RevokedAt == null)
            .ToListAsync();

        foreach (var token in activeTokens)
        {
            token.RevokedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
    }

    public async Task ChangePasswordAsync(Guid userId, ChangePasswordDto dto)
    {
        var user = await _context.Users.FindAsync(userId)
            ?? throw new KeyNotFoundException("Usuário não encontrado.");

        if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash))
            throw new UnauthorizedAccessException("Senha atual incorreta.");

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
    }

    public async Task<UserInfoDto> UpdateProfileAsync(Guid userId, UpdateProfileDto dto)
    {
        var user = await _context.Users.FindAsync(userId)
            ?? throw new KeyNotFoundException("Usuário não encontrado.");

        user.FullName = dto.FullName;
        user.Email = dto.Email;
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return MapToUserInfo(user);
    }

    public async Task<UserInfoDto> GetUserInfoAsync(Guid userId)
    {
        var user = await _context.Users.FindAsync(userId)
            ?? throw new KeyNotFoundException("Usuário não encontrado.");

        return MapToUserInfo(user);
    }

    public Task ForgotPasswordAsync(string email)
    {
        // Placeholder - email sending not implemented yet
        return Task.CompletedTask;
    }

    public Task ResetPasswordAsync(string token, string newPassword)
    {
        // Placeholder - password reset not implemented yet
        return Task.CompletedTask;
    }

    private string GenerateJwtToken(User user)
    {
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_configuration["JwtSettings:Key"]!));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.FullName)
        };

        var expirationMinutes = int.Parse(
            _configuration["JwtSettings:AccessTokenExpirationMinutes"] ?? "30");

        var token = new JwtSecurityToken(
            issuer: _configuration["JwtSettings:Issuer"],
            audience: _configuration["JwtSettings:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expirationMinutes),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private async Task<RefreshToken> CreateRefreshTokenAsync(Guid userId)
    {
        var refreshToken = new RefreshToken
        {
            UserId = userId,
            Token = Convert.ToBase64String(Guid.NewGuid().ToByteArray())
                + Convert.ToBase64String(Guid.NewGuid().ToByteArray()),
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            CreatedAt = DateTime.UtcNow
        };

        await _context.RefreshTokens.AddAsync(refreshToken);
        await _context.SaveChangesAsync();

        return refreshToken;
    }

    private static UserInfoDto MapToUserInfo(User user) => new()
    {
        Id = user.Id,
        Email = user.Email,
        FullName = user.FullName
    };
}
