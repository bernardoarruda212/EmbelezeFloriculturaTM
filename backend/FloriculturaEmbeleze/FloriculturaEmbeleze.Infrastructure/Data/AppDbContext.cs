using FloriculturaEmbeleze.Domain.Entities;
using FloriculturaEmbeleze.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace FloriculturaEmbeleze.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductImage> ProductImages => Set<ProductImage>();
    public DbSet<ProductVariation> ProductVariations => Set<ProductVariation>();
    public DbSet<ProductCategory> ProductCategories => Set<ProductCategory>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<StoreSetting> StoreSettings => Set<StoreSetting>();
    public DbSet<HomePageSection> HomePageSections => Set<HomePageSection>();
    public DbSet<Banner> Banners => Set<Banner>();
    public DbSet<ContactMessage> ContactMessages => Set<ContactMessage>();
    public DbSet<Faq> Faqs => Set<Faq>();
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<StockMovement> StockMovements => Set<StockMovement>();
    public DbSet<Supplier> Suppliers => Set<Supplier>();
    public DbSet<ProductSupplier> ProductSuppliers => Set<ProductSupplier>();
    public DbSet<ExpenseCategory> ExpenseCategories => Set<ExpenseCategory>();
    public DbSet<Expense> Expenses => Set<Expense>();
    public DbSet<Campaign> Campaigns => Set<Campaign>();
    public DbSet<Coupon> Coupons => Set<Coupon>();
    public DbSet<CouponUsage> CouponUsages => Set<CouponUsage>();
    public DbSet<ProductPromotion> ProductPromotions => Set<ProductPromotion>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }

    public static async Task SeedAsync(AppDbContext dbContext)
    {
        await SeedAdminUserAsync(dbContext);
        await SeedCategoriesAsync(dbContext);
        await SeedStoreSettingsAsync(dbContext);
        await SeedHomePageSectionsAsync(dbContext);
        await SeedFaqsAsync(dbContext);
        await SeedExpenseCategoriesAsync(dbContext);
        await dbContext.SaveChangesAsync();
    }

    private static async Task SeedAdminUserAsync(AppDbContext dbContext)
    {
        if (await dbContext.Users.AnyAsync())
            return;

        var adminUser = new User
        {
            Id = Guid.Parse("a1b2c3d4-e5f6-7890-abcd-ef1234567890"),
            Email = "admin@embeleze.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
            FullName = "Administrador",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await dbContext.Users.AddAsync(adminUser);
    }

    private static async Task SeedCategoriesAsync(AppDbContext dbContext)
    {
        if (await dbContext.Categories.AnyAsync())
            return;

        var categories = new List<Category>
        {
            new()
            {
                Id = Guid.Parse("b1a2c3d4-0001-4000-8000-000000000001"),
                Name = "Orqu\u00eddeas",
                Slug = "orquideas",
                Description = "Lindas orqu\u00eddeas para decorar seu ambiente",
                IconClass = "fas fa-spa",
                DisplayOrder = 0,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new()
            {
                Id = Guid.Parse("b1a2c3d4-0001-4000-8000-000000000002"),
                Name = "Suculentas",
                Slug = "suculentas",
                Description = "Suculentas variadas e resistentes",
                IconClass = "fas fa-seedling",
                DisplayOrder = 1,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new()
            {
                Id = Guid.Parse("b1a2c3d4-0001-4000-8000-000000000003"),
                Name = "Vasos",
                Slug = "vasos",
                Description = "Vasos decorativos para suas plantas",
                IconClass = "fas fa-wine-bottle",
                DisplayOrder = 2,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new()
            {
                Id = Guid.Parse("b1a2c3d4-0001-4000-8000-000000000004"),
                Name = "Mudas",
                Slug = "mudas",
                Description = "Mudas saud\u00e1veis prontas para plantio",
                IconClass = "fas fa-leaf",
                DisplayOrder = 3,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new()
            {
                Id = Guid.Parse("b1a2c3d4-0001-4000-8000-000000000005"),
                Name = "Plantas",
                Slug = "plantas",
                Description = "Plantas para casa e jardim",
                IconClass = "fas fa-tree",
                DisplayOrder = 4,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new()
            {
                Id = Guid.Parse("b1a2c3d4-0001-4000-8000-000000000006"),
                Name = "Flores de Corte",
                Slug = "flores-de-corte",
                Description = "Flores frescas cortadas para arranjos",
                IconClass = "fas fa-cut",
                DisplayOrder = 5,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new()
            {
                Id = Guid.Parse("b1a2c3d4-0001-4000-8000-000000000007"),
                Name = "Bonsais",
                Slug = "bonsais",
                Description = "Bonsais para cultivo e decora\u00e7\u00e3o",
                IconClass = "fas fa-tree",
                DisplayOrder = 6,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new()
            {
                Id = Guid.Parse("b1a2c3d4-0001-4000-8000-000000000008"),
                Name = "Brom\u00e9lias",
                Slug = "bromelias",
                Description = "Brom\u00e9lias coloridas e ex\u00f3ticas",
                IconClass = "fas fa-fan",
                DisplayOrder = 7,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new()
            {
                Id = Guid.Parse("b1a2c3d4-0001-4000-8000-000000000009"),
                Name = "Cactos",
                Slug = "cactos",
                Description = "Cactos de diversas esp\u00e9cies",
                IconClass = "fas fa-sun",
                DisplayOrder = 8,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new()
            {
                Id = Guid.Parse("b1a2c3d4-0001-4000-8000-000000000010"),
                Name = "Arranjos e Presentes",
                Slug = "arranjos-presentes",
                Description = "Arranjos florais e presentes especiais",
                IconClass = "fas fa-gift",
                DisplayOrder = 9,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            }
        };

        await dbContext.Categories.AddRangeAsync(categories);
    }

    private static async Task SeedStoreSettingsAsync(AppDbContext dbContext)
    {
        if (await dbContext.StoreSettings.AnyAsync())
            return;

        var storeSetting = new StoreSetting
        {
            Id = Guid.Parse("c1a2c3d4-0001-4000-8000-000000000001"),
            BusinessName = "Embeleze Flores e Plantas",
            WhatsAppNumber = "5555999162729",
            PhoneNumber = "(55) 99916-2729",
            Email = "kleinnagel@yahoo.com.br",
            Address = "Rua Planalto",
            City = "Tr\u00eas de Maio",
            State = "RS",
            ZipCode = "98910-000",
            InstagramUrl = "https://www.instagram.com/floriculturaembeleze/",
            BusinessHoursJson = "[{\"day\":\"Segunda a Sexta\",\"hours\":\"8h00 - 19h00\"},{\"day\":\"S\u00e1bados\",\"hours\":\"Fechado\"},{\"day\":\"Domingos\",\"hours\":\"8h00 - 12h00\"}]",
            AboutContent = "<p>A <strong>Embeleze Flores e Plantas</strong> \u00e9 uma floricultura localizada em Tr\u00eas de Maio - RS, dedicada a levar beleza e vida atrav\u00e9s de flores, plantas e arranjos especiais.</p>" +
                           "<p>Com anos de experi\u00eancia no mercado, oferecemos produtos de alta qualidade, desde orqu\u00eddeas e suculentas at\u00e9 arranjos personalizados para todas as ocasi\u00f5es.</p>" +
                           "<p>Nossa miss\u00e3o \u00e9 transformar momentos em mem\u00f3rias inesquec\u00edveis atrav\u00e9s da beleza das flores. Trabalhamos com carinho e dedica\u00e7\u00e3o para oferecer o melhor atendimento aos nossos clientes.</p>"
        };

        await dbContext.StoreSettings.AddAsync(storeSetting);
    }

    private static async Task SeedHomePageSectionsAsync(AppDbContext dbContext)
    {
        if (await dbContext.HomePageSections.AnyAsync())
            return;

        var sections = new List<HomePageSection>
        {
            new()
            {
                Id = Guid.Parse("d1a2c3d4-0001-4000-8000-000000000001"),
                SectionType = HomePageSectionType.Hero,
                Title = "Embeleze Flores e Plantas",
                Subtitle = "Transformando momentos em mem\u00f3rias com a beleza das flores",
                ContentJson = "{\"buttonText\":\"Ver Produtos\",\"buttonLink\":\"/produtos\"}",
                DisplayOrder = 0,
                IsVisible = true
            },
            new()
            {
                Id = Guid.Parse("d1a2c3d4-0001-4000-8000-000000000002"),
                SectionType = HomePageSectionType.Diferenciais,
                Title = "Por que escolher a Embeleze?",
                Subtitle = "Qualidade e carinho em cada detalhe",
                ContentJson = "[{\"icon\":\"fas fa-truck\",\"title\":\"Entrega R\u00e1pida\",\"description\":\"Entregamos em Tr\u00eas de Maio e regi\u00e3o\"},{\"icon\":\"fas fa-heart\",\"title\":\"Feito com Amor\",\"description\":\"Cada arranjo \u00e9 preparado com carinho\"},{\"icon\":\"fas fa-star\",\"title\":\"Qualidade Premium\",\"description\":\"Flores e plantas sempre frescas\"},{\"icon\":\"fas fa-headset\",\"title\":\"Atendimento Personalizado\",\"description\":\"Atendemos pelo WhatsApp\"}]",
                DisplayOrder = 1,
                IsVisible = true
            },
            new()
            {
                Id = Guid.Parse("d1a2c3d4-0001-4000-8000-000000000003"),
                SectionType = HomePageSectionType.FeaturedProducts,
                Title = "Produtos em Destaque",
                Subtitle = "Confira nossos produtos mais procurados",
                DisplayOrder = 2,
                IsVisible = true
            },
            new()
            {
                Id = Guid.Parse("d1a2c3d4-0001-4000-8000-000000000004"),
                SectionType = HomePageSectionType.Banners,
                Title = "Promo\u00e7\u00f5es",
                DisplayOrder = 3,
                IsVisible = false
            },
            new()
            {
                Id = Guid.Parse("d1a2c3d4-0001-4000-8000-000000000005"),
                SectionType = HomePageSectionType.Promotions,
                Title = "Ofertas Especiais",
                Subtitle = "Aproveite nossas promo\u00e7\u00f5es",
                DisplayOrder = 4,
                IsVisible = false
            },
            new()
            {
                Id = Guid.Parse("d1a2c3d4-0001-4000-8000-000000000006"),
                SectionType = HomePageSectionType.Instagram,
                Title = "Siga-nos no Instagram",
                Subtitle = "@floriculturaembeleze",
                ContentJson = "{\"profileUrl\":\"https://www.instagram.com/floriculturaembeleze/\"}",
                DisplayOrder = 5,
                IsVisible = true
            },
            new()
            {
                Id = Guid.Parse("d1a2c3d4-0001-4000-8000-000000000007"),
                SectionType = HomePageSectionType.ContactInfo,
                Title = "Entre em Contato",
                Subtitle = "Estamos prontos para atender voc\u00ea",
                DisplayOrder = 6,
                IsVisible = true
            },
            new()
            {
                Id = Guid.Parse("d1a2c3d4-0001-4000-8000-000000000008"),
                SectionType = HomePageSectionType.CTA,
                Title = "Fa\u00e7a seu pedido agora!",
                Subtitle = "Entre em contato pelo WhatsApp e pe\u00e7a j\u00e1 o seu arranjo personalizado",
                ContentJson = "{\"buttonText\":\"Chamar no WhatsApp\",\"whatsappMessage\":\"Ol\u00e1! Gostaria de fazer um pedido.\"}",
                DisplayOrder = 7,
                IsVisible = true
            }
        };

        await dbContext.HomePageSections.AddRangeAsync(sections);
    }

    private static async Task SeedFaqsAsync(AppDbContext dbContext)
    {
        if (await dbContext.Faqs.AnyAsync())
            return;

        var faqs = new List<Faq>
        {
            new()
            {
                Id = Guid.Parse("e1a2c3d4-0001-4000-8000-000000000001"),
                Question = "Como funciona o servi\u00e7o de arranjos personalizados?",
                Answer = "Entre em contato conosco via WhatsApp informando a ocasi\u00e3o, suas prefer\u00eancias de flores e cores, e o or\u00e7amento desejado. Nossa equipe ir\u00e1 preparar um arranjo exclusivo para voc\u00ea!",
                DisplayOrder = 0,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new()
            {
                Id = Guid.Parse("e1a2c3d4-0001-4000-8000-000000000002"),
                Question = "Voc\u00eas realizam entregas?",
                Answer = "Sim! Realizamos entregas em Tr\u00eas de Maio e regi\u00e3o. Consulte-nos sobre disponibilidade e taxas de entrega para sua localidade.",
                DisplayOrder = 1,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new()
            {
                Id = Guid.Parse("e1a2c3d4-0001-4000-8000-000000000003"),
                Question = "Qual o prazo de entrega?",
                Answer = "Para produtos em estoque, o prazo \u00e9 de 24 a 48 horas. Para arranjos personalizados, o prazo pode variar de acordo com a complexidade do pedido. Consulte-nos para mais detalhes.",
                DisplayOrder = 2,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new()
            {
                Id = Guid.Parse("e1a2c3d4-0001-4000-8000-000000000004"),
                Question = "Quais formas de pagamento?",
                Answer = "Aceitamos cart\u00e3o de cr\u00e9dito, d\u00e9bito, PIX e dinheiro. Para pedidos online, o pagamento pode ser realizado via PIX ou combina\u00e7\u00e3o no momento da entrega.",
                DisplayOrder = 3,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            }
        };

        await dbContext.Faqs.AddRangeAsync(faqs);
    }

    private static async Task SeedExpenseCategoriesAsync(AppDbContext dbContext)
    {
        if (await dbContext.ExpenseCategories.AnyAsync())
            return;

        var categories = new List<ExpenseCategory>
        {
            new() { Id = Guid.Parse("f1a2c3d4-0001-4000-8000-000000000001"), Name = "Aluguel", ColorHex = "#EF4444", IconClass = "fas fa-home", DisplayOrder = 0, CreatedAt = DateTime.UtcNow },
            new() { Id = Guid.Parse("f1a2c3d4-0001-4000-8000-000000000002"), Name = "Fornecedores", ColorHex = "#F59E0B", IconClass = "fas fa-truck", DisplayOrder = 1, CreatedAt = DateTime.UtcNow },
            new() { Id = Guid.Parse("f1a2c3d4-0001-4000-8000-000000000003"), Name = "Funcionários", ColorHex = "#3B82F6", IconClass = "fas fa-users", DisplayOrder = 2, CreatedAt = DateTime.UtcNow },
            new() { Id = Guid.Parse("f1a2c3d4-0001-4000-8000-000000000004"), Name = "Energia/Água", ColorHex = "#10B981", IconClass = "fas fa-bolt", DisplayOrder = 3, CreatedAt = DateTime.UtcNow },
            new() { Id = Guid.Parse("f1a2c3d4-0001-4000-8000-000000000005"), Name = "Marketing", ColorHex = "#8B5CF6", IconClass = "fas fa-bullhorn", DisplayOrder = 4, CreatedAt = DateTime.UtcNow },
            new() { Id = Guid.Parse("f1a2c3d4-0001-4000-8000-000000000006"), Name = "Manutenção", ColorHex = "#F97316", IconClass = "fas fa-wrench", DisplayOrder = 5, CreatedAt = DateTime.UtcNow },
            new() { Id = Guid.Parse("f1a2c3d4-0001-4000-8000-000000000007"), Name = "Outros", ColorHex = "#6B7280", IconClass = "fas fa-ellipsis-h", DisplayOrder = 6, CreatedAt = DateTime.UtcNow },
        };

        await dbContext.ExpenseCategories.AddRangeAsync(categories);
    }
}
