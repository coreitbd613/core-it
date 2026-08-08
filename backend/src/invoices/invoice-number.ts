import type { Prisma } from '../../generated/prisma/client';
import { randomToken } from '../common/random-code';

/**
 * Claims a non-sequential invoice number for the current calendar year.
 * Deliberately not incrementing — a sequential suffix would let anyone
 * looking at an invoice infer how many invoices we've issued this year.
 * Retries on the rare collision; must run inside the same $transaction as
 * the invoice.create() that consumes it.
 */
export async function nextInvoiceNumber(
  tx: Prisma.TransactionClient,
): Promise<string> {
  const year = new Date().getFullYear();
  for (let attempt = 0; attempt < 5; attempt++) {
    const number = `INV-${year}-${randomToken()}`;
    const existing = await tx.invoice.findUnique({ where: { number } });
    if (!existing) return number;
  }
  throw new Error('Could not generate a unique invoice number.');
}
