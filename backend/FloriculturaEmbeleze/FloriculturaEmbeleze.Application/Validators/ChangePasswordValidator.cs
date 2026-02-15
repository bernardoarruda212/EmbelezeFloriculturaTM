using FluentValidation;
using FloriculturaEmbeleze.Application.DTOs.Auth;

namespace FloriculturaEmbeleze.Application.Validators;

public class ChangePasswordValidator : AbstractValidator<ChangePasswordDto>
{
    public ChangePasswordValidator()
    {
        RuleFor(x => x.CurrentPassword)
            .NotEmpty().WithMessage("A senha atual é obrigatória.");

        RuleFor(x => x.NewPassword)
            .NotEmpty().WithMessage("A nova senha é obrigatória.")
            .MinimumLength(6).WithMessage("A nova senha deve ter no mínimo 6 caracteres.");
    }
}
