export function buildWhatsAppUrl(phone: string, message: string): string {
  const cleaned = phone.replace(/\D/g, '')
  return `https://api.whatsapp.com/send?phone=${cleaned}&text=${encodeURIComponent(message)}`
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
  let message = `*Floricultura Embeleze*\n\n`
  message += `*Novo Pedido #${order.orderNumber}*\n\n`
  message += `Cliente: ${order.customerName}\n`
  message += `Telefone: ${order.customerPhone}\n`

  if (order.deliveryAddress) {
    message += `Endere\u00e7o: ${order.deliveryAddress}\n`
  }

  message += `\n*Itens do Pedido:*\n`
  for (const item of order.items) {
    const variation = item.variationName ? ` (${item.variationName})` : ''
    message += `- ${item.productName}${variation} x${item.quantity} - R$ ${item.unitPrice.toFixed(2)}\n`
  }

  message += `\n*Total: R$ ${order.totalAmount.toFixed(2)}*\n`

  if (order.deliveryNotes) {
    message += `\nObserva\u00e7\u00f5es: ${order.deliveryNotes}\n`
  }

  return message
}

export function buildProductMessage(productName: string, price: number, variation?: string): string {
  let message = `*Floricultura Embeleze*\n\n`
  message += `Ol\u00e1! Tenho interesse em:\n`
  message += `*${productName}*\n`
  if (variation) {
    message += `Tamanho/Varia\u00e7\u00e3o: ${variation}\n`
  }
  message += `Valor: R$ ${price.toFixed(2)}\n\n`
  message += `Poderia me dar mais informa\u00e7\u00f5es?`
  return message
}
