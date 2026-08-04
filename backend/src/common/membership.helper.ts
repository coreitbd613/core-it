import { ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  MembershipRole,
  MembershipStatus,
} from '../../generated/prisma/client';

/** Org ids the user is an ACTIVE member of — used to scope client-facing list routes. */
export async function getActiveOrganizationIds(
  prisma: PrismaService,
  userId: string,
): Promise<string[]> {
  const memberships = await prisma.membership.findMany({
    where: { userId, status: MembershipStatus.ACTIVE },
    select: { organizationId: true },
  });
  return memberships.map((membership) => membership.organizationId);
}

/** Throws if the user isn't an ACTIVE member of the given org — used to scope client-facing detail routes. */
export async function assertOrgMembership(
  prisma: PrismaService,
  userId: string,
  organizationId: string,
): Promise<void> {
  const membership = await prisma.membership.findUnique({
    where: { userId_organizationId: { userId, organizationId } },
  });
  if (!membership || membership.status !== MembershipStatus.ACTIVE) {
    throw new ForbiddenException(
      'You do not have access to this organization.',
    );
  }
}

const MANAGE_ROLES: MembershipRole[] = [
  MembershipRole.OWNER,
  MembershipRole.ADMIN,
];

/**
 * Throws unless the user has an ACTIVE membership in the org with a
 * management role (OWNER/ADMIN). Mirrors the frontend's canManageCompany
 * mock check (mock-role-context.tsx).
 */
export async function assertCanManageOrg(
  prisma: PrismaService,
  userId: string,
  organizationId: string,
): Promise<void> {
  const membership = await prisma.membership.findUnique({
    where: { userId_organizationId: { userId, organizationId } },
  });
  if (
    !membership ||
    membership.status !== MembershipStatus.ACTIVE ||
    !MANAGE_ROLES.includes(membership.role)
  ) {
    throw new ForbiddenException(
      'Only organization owners or admins can edit the company profile.',
    );
  }
}
