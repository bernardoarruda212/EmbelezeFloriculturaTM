using FluentValidation;
using FloriculturaEmbeleze.Application.DTOs.Contact;

namespace FloriculturaEmbeleze.Application.Validators;

public class ContactMessageCreateValidator : AbstractValidator<ContactMessageCreateDto>
{
    public ContactMessageCreateValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("O nome é obrigatório.")
            .MaximumLength(200).WithMessage("O nome deve ter no máximo 200 caracteres.");

        RuleFor(x => x.Message)
            .NotEmpty().WithMessage("A mensagem é obrigatória.")
            .MaximumLength(2000).WithMessage("A mensagem deve ter no máximo 2000 caracteres.");

        RuleFor(x => x.Email)
            .EmailAddress().WithMessage("O e-mail informado não é válido.")
            .When(x => !string.IsNullOrWhiteSpace(x.Email));

        RuleFor(x => x.Subject)
            .MaximumLength(200).WithMessage("O assunto deve ter no máximo 200 caracteres.")
            .When(x => !string.IsNullOrWhiteSpace(x.Subject));
    }
}
