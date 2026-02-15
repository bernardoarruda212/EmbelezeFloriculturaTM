using FluentValidation;
using FloriculturaEmbeleze.Application.DTOs.Orders;

namespace FloriculturaEmbeleze.Application.Validators;

public class OrderCreateValidator : AbstractValidator<OrderCreateDto>
{
    public OrderCreateValidator()
    {
        RuleFor(x => x.CustomerName)
            .NotEmpty().WithMessage("O nome do cliente é obrigatório.")
            .MaximumLength(200).WithMessage("O nome do cliente deve ter no máximo 200 caracteres.");

        RuleFor(x => x.CustomerPhone)
            .NotEmpty().WithMessage("O telefone do cliente é obrigatório.")
            .Matches(@"^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$")
            .WithMessage("O telefone deve estar no formato brasileiro válido (ex: (11) 99999-9999).");

        RuleFor(x => x.CustomerEmail)
            .EmailAddress().WithMessage("O e-mail informado não é válido.")
            .When(x => !string.IsNullOrWhiteSpace(x.CustomerEmail));

        RuleFor(x => x.Items)
            .NotEmpty().WithMessage("O pedido deve conter pelo menos um item.");

        RuleForEach(x => x.Items).ChildRules(item =>
        {
            item.RuleFor(i => i.ProductId)
                .NotEmpty().WithMessage("O produto é obrigatório.");

            item.RuleFor(i => i.Quantity)
                .GreaterThan(0).WithMessage("A quantidade deve ser maior que zero.");
        });
    }
}
