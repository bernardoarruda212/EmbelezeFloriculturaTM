export function buildWhatsAppUrl(phone: string, message: string): string {
  const cleaned = phone.replace(/\D/g, '')
  const encoded = encodeURIComponent(message)
  return `https://wa.me/${cleaned}?text=${encoded}`
}

export function buildOrderMessage(order: {
  orderNumber: string
  customerName: string
  customerPhone: string
  deliveryAddress?: string
  deliveryNotes?: string
  items: { productName: string; variationName?: string; quantity: number; unitPrice: number }[]
  totalAmount: number
}): string {
  let message = `🌸 *Floricultura Embeleze* 🌸\n\n`
  message += `📋 *Novo Pedido #${order.orderNumber}*\n\n`
  message += `👤 Cliente: ${order.customerName}\n`
  message += `📱 Telefone: ${order.customerPhone}\n`

  if (order.deliveryAddress) {
    message += `📍 Endereço: ${order.deliveryAddress}\n`
  }

  message += `\n🛒 *Itens do Pedido:*\n`
  for (const item of order.items) {
    const variation = item.variationName ? ` (${item.variationName})` : ''
    message += `  • ${item.productName}${variation} x${item.quantity} - R$ ${item.unitPrice.toFixed(2)}\n`
  }

  message += `\n💰 *Total: R$ ${order.totalAmount.toFixed(2)}*\n`

  if (order.deliveryNotes) {
    message += `\n📝 Observações: ${order.deliveryNotes}\n`
  }

  return message
}

export function buildProductMessage(productName: string, price: number, variation?: string): string {
  let message = `🌸 *Floricultura Embeleze* 🌸\n\n`
  message += `Olá! Tenho interesse em:\n`
  message += `*${productName}*\n`
  if (variation) {
    message += `Tamanho/Variação: ${variation}\n`
  }
  message += `💲 Valor: R$ ${price.toFixed(2)}\n\n`
  message += `Poderia me dar mais informações?`
  return message
}
