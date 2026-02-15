using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FloriculturaEmbeleze.Application.DTOs.Auth;
using FloriculturaEmbeleze.Application.Services.Interfaces;

namespace FloriculturaEmbeleze.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    private Guid GetUserId() =>
        Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);

    [HttpPost("login")]
    public async Task<ActionResult<LoginResponseDto>> Login([FromBody] LoginRequestDto dto)
    {
        var result = await _authService.LoginAsync(dto);
        return Ok(result);
    }

    [HttpPost("refresh")]
    public async Task<ActionResult<LoginResponseDto>> RefreshToken([FromBody] RefreshTokenRequestDto dto)
    {
        var result = await _authService.RefreshTokenAsync(dto);
        return Ok(result);
    }

    [HttpPost("revoke")]
    [Authorize]
    public async Task<IActionResult> RevokeToken()
    {
        await _authService.RevokeRefreshTokenAsync(GetUserId());
        return NoContent();
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<UserInfoDto>> GetCurrentUser()
    {
        var result = await _authService.GetUserInfoAsync(GetUserId());
        return Ok(result);
    }

    [HttpPut("change-password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
    {
        await _authService.ChangePasswordAsync(GetUserId(), dto);
        return NoContent();
    }

    [HttpPut("profile")]
    [Authorize]
    public async Task<ActionResult<UserInfoDto>> UpdateProfile([FromBody] UpdateProfileDto dto)
    {
        var result = await _authService.UpdateProfileAsync(GetUserId(), dto);
        return Ok(result);
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequestDto dto)
    {
        await _authService.ForgotPasswordAsync(dto.Email);
        return Ok(new { message = "Se o e-mail existir em nossa base, enviaremos instruções de recuperação." });
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequestDto dto)
    {
        await _authService.ResetPasswordAsync(dto.Token, dto.NewPassword);
        return Ok(new { message = "Senha redefinida com sucesso." });
    }
}
