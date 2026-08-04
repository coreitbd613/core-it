import type { Prisma } from '../../generated/prisma/client';

/**
 * Atomically claims the next invoice number for the current calendar year via
 * an upsert on InvoiceSequence. Must be called inside the same $transaction
 * as the invoice.create() that consumes it, so a failed create rolls the
 * increment back too and no numbers are burned.
 */
export async function nextInvoiceNumber(
  tx: Prisma.TransactionClient,
): Promise<string> {
  const year = new Date().getFullYear();
  const sequence = await tx.invoiceSequence.upsert({
    where: { year },
    create: { year, lastNumber: 1 },
    update: { lastNumber: { increment: 1 } },
  });
  return `INV-${year}-${String(sequence.lastNumber).padStart(3, '0')}`;
}
