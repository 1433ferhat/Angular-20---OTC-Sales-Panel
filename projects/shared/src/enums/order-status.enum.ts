// projects/shared/src/enums/order-status.enum.ts
export enum OrderStatus {
  Pending = 1,
  Processing = 2,
  Shipped = 3,
  Delivered = 4,
  Completed = 5,
  Cancelled = 6,
}

// OrderStatus utility functions
export const OrderStatusLabels: Record<OrderStatus, string> = {
  [OrderStatus.Pending]: 'Beklemede',
  [OrderStatus.Processing]: 'Hazırlanıyor',
  [OrderStatus.Shipped]: 'Kargoda',
  [OrderStatus.Delivered]: 'Teslim Edildi',
  [OrderStatus.Completed]: 'Tamamlandı',
  [OrderStatus.Cancelled]: 'İptal Edildi',
};

export function getOrderStatusLabel(status: OrderStatus): string {
  return OrderStatusLabels[status] || 'Bilinmeyen';
}