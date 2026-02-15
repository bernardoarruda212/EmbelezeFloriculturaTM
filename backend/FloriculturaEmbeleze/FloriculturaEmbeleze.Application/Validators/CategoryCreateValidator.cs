using FluentValidation;
using FloriculturaEmbeleze.Application.DTOs.Categories;

namespace FloriculturaEmbeleze.Application.Validators;

public class CategoryCreateValidator : AbstractValidator<CategoryCreateDto>
{
    public CategoryCreateValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("O nome da categoria é obrigatório.")
            .MaximumLength(100).WithMessage("O nome da categoria deve ter no máximo 100 caracteres.");

        RuleFor(x => x.DisplayOrder)
            .GreaterThanOrEqualTo(0).WithMessage("A ordem de exibição não pode ser negativa.");
    }
}
