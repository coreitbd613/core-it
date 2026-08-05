import {
  balanceBdt,
  computeInvoiceTotals,
  deriveStatus,
  discountAmountBdt,
  grandTotalBdt,
  paidBdt,
  subtotalBdt,
} from './invoice-calculations';

const lineItems = [{ unitPriceBdt: 5000 }, { unitPriceBdt: 10000 }];

// Baseline shared by most tests — PERCENT discount, 0%, no tax.
const base = {
  lineItems,
  taxPercent: 0,
  discountType: 'PERCENT' as const,
  discountPercent: 0,
  discountFlatBdt: 0,
};

describe('subtotalBdt', () => {
  it('sums unitPriceBdt across line items (quantity is not a multiplier)', () => {
    expect(subtotalBdt({ lineItems })).toBe(15000);
  });

  it('handles Decimal-like values with toNumber()', () => {
    const decimalLike = { toNumber: () => 5000 };
    expect(subtotalBdt({ lineItems: [{ unitPriceBdt: decimalLike }] })).toBe(
      5000,
    );
  });
});

describe('discountAmountBdt', () => {
  it('computes a percentage discount off the subtotal', () => {
    expect(
      discountAmountBdt({
        ...base,
        discountType: 'PERCENT',
        discountPercent: 10,
      }),
    ).toBe(1500);
  });

  it('uses the flat amount directly when discountType is FLAT', () => {
    expect(
      discountAmountBdt({
        ...base,
        discountType: 'FLAT',
        discountFlatBdt: 2000,
      }),
    ).toBe(2000);
  });

  it('clamps a flat discount larger than the subtotal', () => {
    expect(
      discountAmountBdt({
        ...base,
        discountType: 'FLAT',
        discountFlatBdt: 99999,
      }),
    ).toBe(15000);
  });
});

describe('grandTotalBdt', () => {
  it('applies a percentage discount to the subtotal, then tax on the discounted amount', () => {
    // subtotal 15000, 10% discount -> 13500, 5% tax -> 14175
    const total = grandTotalBdt({
      ...base,
      taxPercent: 5,
      discountType: 'PERCENT',
      discountPercent: 10,
    });
    expect(total).toBe(14175);
  });

  it('applies a flat discount to the subtotal, then tax on the discounted amount', () => {
    // subtotal 15000, flat -2000 -> 13000, 5% tax -> 13650
    const total = grandTotalBdt({
      ...base,
      taxPercent: 5,
      discountType: 'FLAT',
      discountFlatBdt: 2000,
    });
    expect(total).toBe(13650);
  });

  it('returns the raw subtotal when there is no discount or tax', () => {
    expect(grandTotalBdt(base)).toBe(15000);
  });
});

describe('paidBdt / balanceBdt', () => {
  it('sums payments and subtracts from the grand total', () => {
    const input = {
      ...base,
      payments: [{ amountBdt: 5000 }, { amountBdt: 2000 }],
      status: 'SENT' as const,
      dueAt: new Date(Date.now() + 86_400_000),
    };
    expect(paidBdt(input)).toBe(7000);
    expect(balanceBdt(input)).toBe(8000);
  });
});

describe('deriveStatus', () => {
  const future = new Date(Date.now() + 86_400_000);
  const past = new Date(Date.now() - 86_400_000);

  it('passes DRAFT through untouched', () => {
    expect(
      deriveStatus({ ...base, payments: [], status: 'DRAFT', dueAt: future }),
    ).toBe('DRAFT');
  });

  it('passes CANCELLED through untouched even with payments', () => {
    expect(
      deriveStatus({
        ...base,
        payments: [{ amountBdt: 20000 }],
        status: 'CANCELLED',
        dueAt: future,
      }),
    ).toBe('CANCELLED');
  });

  it('returns PAID when the balance is fully covered', () => {
    expect(
      deriveStatus({
        ...base,
        payments: [{ amountBdt: 20000 }],
        status: 'SENT',
        dueAt: future,
      }),
    ).toBe('PAID');
  });

  it('returns PARTIALLY_PAID when some but not all is paid', () => {
    expect(
      deriveStatus({
        ...base,
        payments: [{ amountBdt: 5000 }],
        status: 'SENT',
        dueAt: future,
      }),
    ).toBe('PARTIALLY_PAID');
  });

  it('returns OVERDUE when unpaid and past the due date', () => {
    expect(
      deriveStatus({ ...base, payments: [], status: 'SENT', dueAt: past }),
    ).toBe('OVERDUE');
  });

  it('returns the stored status (SENT) when unpaid but not yet due', () => {
    expect(
      deriveStatus({ ...base, payments: [], status: 'SENT', dueAt: future }),
    ).toBe('SENT');
  });
});

describe('computeInvoiceTotals', () => {
  it('bundles all derived values together', () => {
    const result = computeInvoiceTotals({
      ...base,
      taxPercent: 5,
      discountType: 'PERCENT',
      discountPercent: 10,
      payments: [{ amountBdt: 9000 }],
      status: 'SENT',
      dueAt: new Date(Date.now() + 86_400_000),
    });
    expect(result).toEqual({
      subtotalBdt: 15000,
      discountAmountBdt: 1500,
      grandTotalBdt: 14175,
      paidBdt: 9000,
      balanceBdt: 5175,
      status: 'PARTIALLY_PAID',
    });
  });
});
