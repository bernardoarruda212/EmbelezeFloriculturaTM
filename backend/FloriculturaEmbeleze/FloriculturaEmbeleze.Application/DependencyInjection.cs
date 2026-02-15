using System.Reflection;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace FloriculturaEmbeleze.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        var assembly = Assembly.GetExecutingAssembly();

        // Register AutoMapper profiles
        services.AddAutoMapper(assembly);

        // Register FluentValidation validators
        services.AddValidatorsFromAssembly(assembly);

        return services;
    }
}
