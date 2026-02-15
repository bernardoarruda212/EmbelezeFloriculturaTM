using System.Text.Json;
using AutoMapper;
using FloriculturaEmbeleze.Application.DTOs.Auth;
using FloriculturaEmbeleze.Application.DTOs.Categories;
using FloriculturaEmbeleze.Application.DTOs.Contact;
using FloriculturaEmbeleze.Application.DTOs.Faqs;
using FloriculturaEmbeleze.Application.DTOs.HomePage;
using FloriculturaEmbeleze.Application.DTOs.Orders;
using FloriculturaEmbeleze.Application.DTOs.Products;
using FloriculturaEmbeleze.Application.DTOs.StoreSettings;
using FloriculturaEmbeleze.Domain.Entities;

namespace FloriculturaEmbeleze.Application.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // ── User ──
        CreateMap<User, UserInfoDto>();

        // ── Product -> ProductListDto ──
        CreateMap<Product, ProductListDto>()
            .ForMember(dest => dest.MainImageUrl,
                opt => opt.MapFrom(src =>
                    src.Images.Where(i => i.IsMain).Select(i => i.ImageUrl).FirstOrDefault()))
            .ForMember(dest => dest.CategoryNames,
                opt => opt.MapFrom(src =>
                    src.ProductCategories.Select(pc => pc.Category.Name).ToList()));

        // ── Product -> ProductDetailDto ──
        CreateMap<Product, ProductDetailDto>()
            .ForMember(dest => dest.MainImageUrl,
                opt => opt.MapFrom(src =>
                    src.Images.Where(i => i.IsMain).Select(i => i.ImageUrl).FirstOrDefault()))
            .ForMember(dest => dest.CategoryNames,
                opt => opt.MapFrom(src =>
                    src.ProductCategories.Select(pc => pc.Category.Name).ToList()))
            .ForMember(dest => dest.Categories,
                opt => opt.MapFrom(src =>
                    src.ProductCategories.Select(pc => pc.Category).ToList()));

        // ── ProductImage -> ProductImageDto ──
        CreateMap<ProductImage, ProductImageDto>();

        // ── ProductVariation -> ProductVariationDto ──
        CreateMap<ProductVariation, ProductVariationDto>();

        // ── Category -> CategoryRefDto ──
        CreateMap<Category, CategoryRefDto>();

        // ── Category -> CategoryDto ──
        CreateMap<Category, CategoryDto>()
            .ForMember(dest => dest.ProductCount,
                opt => opt.MapFrom(src => src.ProductCategories.Count));

        // ── CategoryCreateDto -> Category ──
        CreateMap<CategoryCreateDto, Category>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.Slug, opt => opt.Ignore())
            .ForMember(dest => dest.ImageUrl, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.ProductCategories, opt => opt.Ignore());

        // ── Order -> OrderListDto ──
        CreateMap<Order, OrderListDto>();

        // ── Order -> OrderDetailDto ──
        CreateMap<Order, OrderDetailDto>();

        // ── OrderItem -> OrderItemDto ──
        CreateMap<OrderItem, OrderItemDto>();

        // ── StoreSetting -> StoreSettingsDto ──
        CreateMap<StoreSetting, StoreSettingsDto>()
            .ForMember(dest => dest.BusinessHours,
                opt => opt.MapFrom(src =>
                    string.IsNullOrEmpty(src.BusinessHoursJson)
                        ? new List<BusinessHoursItemDto>()
                        : JsonSerializer.Deserialize<List<BusinessHoursItemDto>>(
                            src.BusinessHoursJson,
                            new JsonSerializerOptions { PropertyNameCaseInsensitive = true })
                          ?? new List<BusinessHoursItemDto>()));

        // ── StoreSettingsDto -> StoreSetting ──
        CreateMap<StoreSettingsDto, StoreSetting>()
            .ForMember(dest => dest.BusinessHoursJson,
                opt => opt.MapFrom(src =>
                    JsonSerializer.Serialize(src.BusinessHours,
                        new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase })))
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore());

        // ── HomePageSection -> HomePageSectionDto ──
        CreateMap<HomePageSection, HomePageSectionDto>();

        // ── HomePageSectionDto -> HomePageSection ──
        CreateMap<HomePageSectionDto, HomePageSection>()
            .ForMember(dest => dest.Banners, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore());

        // ── Banner -> BannerDto ──
        CreateMap<Banner, BannerDto>();

        // ── BannerCreateDto -> Banner ──
        CreateMap<BannerCreateDto, Banner>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.HomePageSectionId, opt => opt.Ignore())
            .ForMember(dest => dest.DisplayOrder, opt => opt.Ignore())
            .ForMember(dest => dest.IsActive, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.Section, opt => opt.Ignore());

        // ── BannerDto -> Banner ──
        CreateMap<BannerDto, Banner>()
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.Section, opt => opt.Ignore());

        // ── ContactMessage -> ContactMessageDto ──
        CreateMap<ContactMessage, ContactMessageDto>();

        // ── ContactMessageCreateDto -> ContactMessage ──
        CreateMap<ContactMessageCreateDto, ContactMessage>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.IsRead, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore());

        // ── Faq -> FaqDto ──
        CreateMap<Faq, FaqDto>();

        // ── FaqCreateDto -> Faq ──
        CreateMap<FaqCreateDto, Faq>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.DisplayOrder, opt => opt.Ignore())
            .ForMember(dest => dest.IsActive, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore());

        // ── FaqDto -> Faq ──
        CreateMap<FaqDto, Faq>()
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore());
    }
}
