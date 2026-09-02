export const PAYMENT_METHODS = [
  { value: "efectivo", label: "Efectivo" },
  { value: "visa_mastercard", label: "Visa / Mastercard" },
  { value: "amex", label: "American Express" },
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number]["value"];

export function isPaymentMethod(value: string): value is PaymentMethod {
  return PAYMENT_METHODS.some((m) => m.value === value);
}
