using FluentValidation;
using FloriculturaEmbeleze.Application.DTOs.Products;

namespace FloriculturaEmbeleze.Application.Validators;

public class ProductUpdateValidator : AbstractValidator<ProductUpdateDto>
{
    public ProductUpdateValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("O nome do produto é obrigatório.")
            .MaximumLength(200).WithMessage("O nome do produto deve ter no máximo 200 caracteres.");

        RuleFor(x => x.BasePrice)
            .GreaterThan(0).WithMessage("O preço base deve ser maior que zero.");

        RuleFor(x => x.CategoryIds)
            .NotEmpty().WithMessage("Pelo menos uma categoria deve ser selecionada.");

        RuleFor(x => x.StockQuantity)
            .GreaterThanOrEqualTo(0).WithMessage("A quantidade em estoque não pode ser negativa.");

        RuleForEach(x => x.Variations).ChildRules(variation =>
        {
            variation.RuleFor(v => v.Name)
                .NotEmpty().WithMessage("O nome da variação é obrigatório.");

            variation.RuleFor(v => v.Price)
                .GreaterThan(0).WithMessage("O preço da variação deve ser maior que zero.");

            variation.RuleFor(v => v.StockQuantity)
                .GreaterThanOrEqualTo(0).WithMessage("A quantidade em estoque da variação não pode ser negativa.");
        });
    }
}
