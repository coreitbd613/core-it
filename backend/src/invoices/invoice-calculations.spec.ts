import {
  balanceBdt,
  computeInvoiceTotals,
  deriveStatus,
  grandTotalBdt,
  paidBdt,
  subtotalBdt,
} from './invoice-calculations';

const lineItems = [{ unitPriceBdt: 5000 }, { unitPriceBdt: 10000 }];

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

describe('grandTotalBdt', () => {
  it('applies discount to the subtotal, then tax on the discounted amount', () => {
    // subtotal 15000, 10% discount -> 13500, 5% tax -> 14175
    const total = grandTotalBdt({
      lineItems,
      taxPercent: 5,
      discountPercent: 10,
    });
    expect(total).toBe(14175);
  });

  it('returns the raw subtotal when there is no discount or tax', () => {
    expect(
      grandTotalBdt({ lineItems, taxPercent: 0, discountPercent: 0 }),
    ).toBe(15000);
  });
});

describe('paidBdt / balanceBdt', () => {
  it('sums payments and subtracts from the grand total', () => {
    const input = {
      lineItems,
      taxPercent: 0,
      discountPercent: 0,
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
      deriveStatus({
        lineItems,
        taxPercent: 0,
        discountPercent: 0,
        payments: [],
        status: 'DRAFT',
        dueAt: future,
      }),
    ).toBe('DRAFT');
  });

  it('passes CANCELLED through untouched even with payments', () => {
    expect(
      deriveStatus({
        lineItems,
        taxPercent: 0,
        discountPercent: 0,
        payments: [{ amountBdt: 20000 }],
        status: 'CANCELLED',
        dueAt: future,
      }),
    ).toBe('CANCELLED');
  });

  it('returns PAID when the balance is fully covered', () => {
    expect(
      deriveStatus({
        lineItems,
        taxPercent: 0,
        discountPercent: 0,
        payments: [{ amountBdt: 20000 }],
        status: 'SENT',
        dueAt: future,
      }),
    ).toBe('PAID');
  });

  it('returns PARTIALLY_PAID when some but not all is paid', () => {
    expect(
      deriveStatus({
        lineItems,
        taxPercent: 0,
        discountPercent: 0,
        payments: [{ amountBdt: 5000 }],
        status: 'SENT',
        dueAt: future,
      }),
    ).toBe('PARTIALLY_PAID');
  });

  it('returns OVERDUE when unpaid and past the due date', () => {
    expect(
      deriveStatus({
        lineItems,
        taxPercent: 0,
        discountPercent: 0,
        payments: [],
        status: 'SENT',
        dueAt: past,
      }),
    ).toBe('OVERDUE');
  });

  it('returns the stored status (SENT) when unpaid but not yet due', () => {
    expect(
      deriveStatus({
        lineItems,
        taxPercent: 0,
        discountPercent: 0,
        payments: [],
        status: 'SENT',
        dueAt: future,
      }),
    ).toBe('SENT');
  });
});

describe('computeInvoiceTotals', () => {
  it('bundles all derived values together', () => {
    const result = computeInvoiceTotals({
      lineItems,
      taxPercent: 5,
      discountPercent: 10,
      payments: [{ amountBdt: 9000 }],
      status: 'SENT',
      dueAt: new Date(Date.now() + 86_400_000),
    });
    expect(result).toEqual({
      subtotalBdt: 15000,
      grandTotalBdt: 14175,
      paidBdt: 9000,
      balanceBdt: 5175,
      status: 'PARTIALLY_PAID',
    });
  });
});
