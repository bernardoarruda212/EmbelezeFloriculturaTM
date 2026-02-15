using FloriculturaEmbeleze.Application.DTOs.Common;
using FloriculturaEmbeleze.Application.DTOs.Marketing;
using FloriculturaEmbeleze.Application.Services.Interfaces;
using FloriculturaEmbeleze.Domain.Entities;
using FloriculturaEmbeleze.Domain.Enums;
using FloriculturaEmbeleze.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FloriculturaEmbeleze.Infrastructure.Services;

public class CouponService : ICouponService
{
    private readonly AppDbContext _context;

    public CouponService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PaginatedResultDto<CouponListDto>> GetCouponsAsync(string? search, bool? isActive, int page = 1, int pageSize = 20)
    {
        var query = _context.Coupons
            .Include(c => c.Campaign)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchLower = search.ToLower();
            query = query.Where(c => c.Code.ToLower().Contains(searchLower) || (c.Description != null && c.Description.ToLower().Contains(searchLower)));
        }

        if (isActive.HasValue)
            query = query.Where(c => c.IsActive == isActive.Value);

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(c => c.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(c => new CouponListDto
            {
                Id = c.Id,
                Code = c.Code,
                Description = c.Description,
                DiscountType = c.DiscountType,
                DiscountValue = c.DiscountValue,
                MinOrderAmount = c.MinOrderAmount,
                MaxUses = c.MaxUses,
                CurrentUses = c.CurrentUses,
                ExpiresAt = c.ExpiresAt,
                IsActive = c.IsActive,
                CampaignName = c.Campaign != null ? c.Campaign.Name : null,
                CreatedAt = c.CreatedAt
            })
            .ToListAsync();

        return new PaginatedResultDto<CouponListDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<CouponListDto?> GetCouponByIdAsync(Guid id)
    {
        var coupon = await _context.Coupons
            .Include(c => c.Campaign)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (coupon == null) return null;

        return new CouponListDto
        {
            Id = coupon.Id,
            Code = coupon.Code,
            Description = coupon.Description,
            DiscountType = coupon.DiscountType,
            DiscountValue = coupon.DiscountValue,
            MinOrderAmount = coupon.MinOrderAmount,
            MaxUses = coupon.MaxUses,
            CurrentUses = coupon.CurrentUses,
            ExpiresAt = coupon.ExpiresAt,
            IsActive = coupon.IsActive,
            CampaignName = coupon.Campaign?.Name,
            CreatedAt = coupon.CreatedAt
        };
    }

    public async Task<CouponListDto> CreateCouponAsync(CouponCreateDto dto)
    {
        var code = dto.Code.Trim().ToUpper();

        var exists = await _context.Coupons.AnyAsync(c => c.Code == code);
        if (exists)
            throw new InvalidOperationException("Já existe um cupom com este código.");

        var coupon = new Coupon
        {
            Code = code,
            Description = dto.Description,
            DiscountType = dto.DiscountType,
            DiscountValue = dto.DiscountValue,
            MinOrderAmount = dto.MinOrderAmount,
            MaxUses = dto.MaxUses,
            ExpiresAt = dto.ExpiresAt,
            IsActive = dto.IsActive,
            CampaignId = dto.CampaignId,
            CurrentUses = 0,
            CreatedAt = DateTime.UtcNow
        };

        _context.Coupons.Add(coupon);
        await _context.SaveChangesAsync();

        return (await GetCouponByIdAsync(coupon.Id))!;
    }

    public async Task<CouponListDto> UpdateCouponAsync(Guid id, CouponCreateDto dto)
    {
        var coupon = await _context.Coupons.FindAsync(id)
            ?? throw new KeyNotFoundException("Cupom não encontrado.");

        var code = dto.Code.Trim().ToUpper();

        var exists = await _context.Coupons.AnyAsync(c => c.Code == code && c.Id != id);
        if (exists)
            throw new InvalidOperationException("Já existe um cupom com este código.");

        coupon.Code = code;
        coupon.Description = dto.Description;
        coupon.DiscountType = dto.DiscountType;
        coupon.DiscountValue = dto.DiscountValue;
        coupon.MinOrderAmount = dto.MinOrderAmount;
        coupon.MaxUses = dto.MaxUses;
        coupon.ExpiresAt = dto.ExpiresAt;
        coupon.IsActive = dto.IsActive;
        coupon.CampaignId = dto.CampaignId;
        coupon.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return (await GetCouponByIdAsync(id))!;
    }

    public async Task DeleteCouponAsync(Guid id)
    {
        var coupon = await _context.Coupons.FindAsync(id)
            ?? throw new KeyNotFoundException("Cupom não encontrado.");

        _context.Coupons.Remove(coupon);
        await _context.SaveChangesAsync();
    }

    public async Task<CouponValidationResultDto> ValidateCouponAsync(CouponValidationDto dto)
    {
        var code = dto.Code.Trim().ToUpper();

        var coupon = await _context.Coupons.FirstOrDefaultAsync(c => c.Code == code);

        if (coupon == null)
        {
            return new CouponValidationResultDto
            {
                IsValid = false,
                ErrorMessage = "Cupom não encontrado."
            };
        }

        if (!coupon.IsActive)
        {
            return new CouponValidationResultDto
            {
                IsValid = false,
                ErrorMessage = "Este cupom está inativo."
            };
        }

        if (coupon.ExpiresAt.HasValue && coupon.ExpiresAt.Value < DateTime.UtcNow)
        {
            return new CouponValidationResultDto
            {
                IsValid = false,
                ErrorMessage = "Este cupom expirou."
            };
        }

        if (coupon.MaxUses.HasValue && coupon.CurrentUses >= coupon.MaxUses.Value)
        {
            return new CouponValidationResultDto
            {
                IsValid = false,
                ErrorMessage = "Este cupom atingiu o limite máximo de utilizações."
            };
        }

        if (coupon.MinOrderAmount.HasValue && dto.OrderTotal < coupon.MinOrderAmount.Value)
        {
            return new CouponValidationResultDto
            {
                IsValid = false,
                ErrorMessage = $"O valor mínimo do pedido para este cupom é R$ {coupon.MinOrderAmount.Value:F2}."
            };
        }

        decimal discountAmount;
        if (coupon.DiscountType == DiscountType.Percentage)
        {
            discountAmount = dto.OrderTotal * coupon.DiscountValue / 100;
        }
        else
        {
            discountAmount = Math.Min(coupon.DiscountValue, dto.OrderTotal);
        }

        return new CouponValidationResultDto
        {
            IsValid = true,
            CouponId = coupon.Id,
            DiscountType = coupon.DiscountType,
            DiscountValue = coupon.DiscountValue,
            DiscountAmount = Math.Round(discountAmount, 2)
        };
    }

    public async Task RecordCouponUsageAsync(Guid couponId, Guid orderId, decimal discountAmount)
    {
        var coupon = await _context.Coupons.FindAsync(couponId)
            ?? throw new KeyNotFoundException("Cupom não encontrado.");

        var usage = new CouponUsage
        {
            CouponId = couponId,
            OrderId = orderId,
            DiscountAmount = discountAmount,
            CreatedAt = DateTime.UtcNow
        };

        _context.CouponUsages.Add(usage);

        coupon.CurrentUses++;
        coupon.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
    }
}
