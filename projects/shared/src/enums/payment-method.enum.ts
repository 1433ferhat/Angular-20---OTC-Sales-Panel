// projects/shared/src/enums/payment-method.enum.ts
export enum PaymentMethod {
  Cash = 1,
  CreditCard = 2,
  BankTransfer = 3,
  EWallet = 4,
}

// PaymentMethod utility functions
export const PaymentMethodLabels: Record<PaymentMethod, string> = {
  [PaymentMethod.Cash]: 'Nakit',
  [PaymentMethod.CreditCard]: 'Kredi Kartı',
  [PaymentMethod.BankTransfer]: 'Havale',
  [PaymentMethod.EWallet]: 'Çek',
};

export function getPaymentMethodLabel(method: PaymentMethod): string {
  return PaymentMethodLabels[method] || 'Diğer';
}