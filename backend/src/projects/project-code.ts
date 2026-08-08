import type { Prisma } from '../../generated/prisma/client';
import { randomToken } from '../common/random-code';

/**
 * Claims a non-sequential project code for the current calendar year.
 * Deliberately not incrementing — a sequential suffix would let a client
 * looking at their project code infer how many projects we've run this
 * year. Retries on the rare collision; must run inside the same
 * $transaction as the project.create() that consumes it.
 */
export async function nextProjectCode(
  tx: Prisma.TransactionClient,
): Promise<string> {
  const year = new Date().getFullYear();
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = `PRJ-${year}-${randomToken()}`;
    const existing = await tx.project.findUnique({
      where: { projectCode: code },
    });
    if (!existing) return code;
  }
  throw new Error('Could not generate a unique project code.');
}
