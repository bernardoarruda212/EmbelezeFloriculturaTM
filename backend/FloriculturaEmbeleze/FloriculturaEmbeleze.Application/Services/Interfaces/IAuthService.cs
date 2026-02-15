using FloriculturaEmbeleze.Application.DTOs.Auth;

namespace FloriculturaEmbeleze.Application.Services.Interfaces;

public interface IAuthService
{
    Task<LoginResponseDto> LoginAsync(LoginRequestDto dto);
    Task<LoginResponseDto> RefreshTokenAsync(RefreshTokenRequestDto dto);
    Task RevokeTokenAsync(string refreshToken);
    Task RevokeRefreshTokenAsync(Guid userId);
    Task ChangePasswordAsync(Guid userId, ChangePasswordDto dto);
    Task<UserInfoDto> UpdateProfileAsync(Guid userId, UpdateProfileDto dto);
    Task<UserInfoDto> GetUserInfoAsync(Guid userId);
    Task ForgotPasswordAsync(string email);
    Task ResetPasswordAsync(string token, string newPassword);
}
