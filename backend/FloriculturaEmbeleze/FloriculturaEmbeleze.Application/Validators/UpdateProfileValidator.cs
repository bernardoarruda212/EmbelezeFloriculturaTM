using FluentValidation;
using FloriculturaEmbeleze.Application.DTOs.Auth;

namespace FloriculturaEmbeleze.Application.Validators;

public class UpdateProfileValidator : AbstractValidator<UpdateProfileDto>
{
    public UpdateProfileValidator()
    {
        RuleFor(x => x.FullName)
            .NotEmpty().WithMessage("O nome completo é obrigatório.")
            .MaximumLength(200).WithMessage("O nome completo deve ter no máximo 200 caracteres.");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("O e-mail é obrigatório.")
            .EmailAddress().WithMessage("O e-mail informado não é válido.");
    }
}
