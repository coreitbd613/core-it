import { DiscountType, InvoiceStatus } from '../../generated/prisma/client';

type DecimalLike = { toNumber?: () => number } | number | string;

function toNumber(value: DecimalLike): number {
  if (typeof value === 'object' && value !== null && 'toNumber' in value) {
    return value.toNumber!();
  }
  return Number(value);
}

export interface InvoiceTotalsInput {
  lineItems: { unitPriceBdt: DecimalLike }[];
  taxPercent: number;
  discountType: DiscountType;
  discountPercent: number;
  discountFlatBdt: DecimalLike;
  payments: { amountBdt: DecimalLike }[];
  status: InvoiceStatus;
  dueAt: Date | string;
}

/** Each line's unitPriceBdt IS its Amount — quantity is a display-only label, not a multiplier. */
export function subtotalBdt(
  input: Pick<InvoiceTotalsInput, 'lineItems'>,
): number {
  return input.lineItems.reduce(
    (sum, item) => sum + toNumber(item.unitPriceBdt),
    0,
  );
}

/** Clamped to the subtotal — a discount can never make the pre-tax amount negative. */
export function discountAmountBdt(
  input: Pick<
    InvoiceTotalsInput,
    'lineItems' | 'discountType' | 'discountPercent' | 'discountFlatBdt'
  >,
): number {
  const subtotal = subtotalBdt(input);
  const raw =
    input.discountType === 'FLAT'
      ? toNumber(input.discountFlatBdt)
      : subtotal * (input.discountPercent / 100);
  return Math.min(Math.max(raw, 0), subtotal);
}

/** Discount applies to the subtotal, tax applies after the discount. */
export function grandTotalBdt(
  input: Pick<
    InvoiceTotalsInput,
    | 'lineItems'
    | 'taxPercent'
    | 'discountType'
    | 'discountPercent'
    | 'discountFlatBdt'
  >,
): number {
  const subtotal = subtotalBdt(input);
  const afterDiscount = subtotal - discountAmountBdt(input);
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
    discountAmountBdt: discountAmountBdt(input),
    grandTotalBdt: grandTotalBdt(input),
    paidBdt: paidBdt(input),
    balanceBdt: balanceBdt(input),
    status: deriveStatus(input),
  };
}
