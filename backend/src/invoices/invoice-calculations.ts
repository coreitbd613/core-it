import { InvoiceStatus } from '../../generated/prisma/client';

type DecimalLike = { toNumber?: () => number } | number | string;

function toNumber(value: DecimalLike): number {
  if (typeof value === 'object' && value !== null && 'toNumber' in value) {
    return value.toNumber!();
  }
  return Number(value);
}

export interface InvoiceTotalsInput {
  lineItems: { quantity: number; unitPriceBdt: DecimalLike }[];
  taxPercent: number;
  discountPercent: number;
  payments: { amountBdt: DecimalLike }[];
  status: InvoiceStatus;
  dueAt: Date | string;
}

export function subtotalBdt(
  input: Pick<InvoiceTotalsInput, 'lineItems'>,
): number {
  return input.lineItems.reduce(
    (sum, item) => sum + item.quantity * toNumber(item.unitPriceBdt),
    0,
  );
}

/** Discount applies to the subtotal, tax applies after the discount. */
export function grandTotalBdt(
  input: Pick<
    InvoiceTotalsInput,
    'lineItems' | 'taxPercent' | 'discountPercent'
  >,
): number {
  const subtotal = subtotalBdt(input);
  const afterDiscount = subtotal - subtotal * (input.discountPercent / 100);
  return afterDiscount + afterDiscount * (input.taxPercent / 100);
}

export function paidBdt(input: Pick<InvoiceTotalsInput, 'payments'>): number {
  return input.payments.reduce(
    (sum, payment) => sum + toNumber(payment.amountBdt),
    0,
  );
}

export function balanceBdt(input: InvoiceTotalsInput): number {
  return grandTotalBdt(input) - paidBdt(input);
}

/**
 * Recomputes the display status from payments/due date, matching the frontend
 * mock's deriveInvoiceStatus. DRAFT/CANCELLED are stored, authoritative states
 * that pass through untouched; everything else is derived live and never
 * written back to Invoice.status.
 */
export function deriveStatus(input: InvoiceTotalsInput): InvoiceStatus {
  if (input.status === 'CANCELLED') return 'CANCELLED';
  if (input.status === 'DRAFT') return 'DRAFT';
  const balance = balanceBdt(input);
  if (balance <= 0) return 'PAID';
  if (paidBdt(input) > 0) return 'PARTIALLY_PAID';
  if (new Date(input.dueAt) < new Date()) return 'OVERDUE';
  return input.status;
}

export function computeInvoiceTotals(input: InvoiceTotalsInput) {
  return {
    subtotalBdt: subtotalBdt(input),
    grandTotalBdt: grandTotalBdt(input),
    paidBdt: paidBdt(input),
    balanceBdt: balanceBdt(input),
    status: deriveStatus(input),
  };
}
