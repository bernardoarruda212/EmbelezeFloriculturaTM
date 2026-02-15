using FluentValidation;
using FloriculturaEmbeleze.Application.DTOs.Faqs;

namespace FloriculturaEmbeleze.Application.Validators;

public class FaqCreateValidator : AbstractValidator<FaqCreateDto>
{
    public FaqCreateValidator()
    {
        RuleFor(x => x.Question)
            .NotEmpty().WithMessage("A pergunta é obrigatória.")
            .MaximumLength(500).WithMessage("A pergunta deve ter no máximo 500 caracteres.");

        RuleFor(x => x.Answer)
            .NotEmpty().WithMessage("A resposta é obrigatória.")
            .MaximumLength(2000).WithMessage("A resposta deve ter no máximo 2000 caracteres.");
    }
}
