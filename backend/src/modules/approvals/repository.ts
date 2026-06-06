import prisma from '../../config/database';
import { ApprovalAction, QuotationStatus } from '@prisma/client';
import { ACTIVITY_ACTIONS, ENTITY_TYPES } from '../../config/constants';

export const createApproval = async (
  quotationId: string,
  approverId: string,
  action: ApprovalAction,
  comments: string | undefined,
  ip: string
) => {
  return prisma.$transaction(async (tx) => {
    // Insert the approval record (append-only)
    const approval = await tx.approval.create({
      data: { quotationId, approverId, action, comments },
      include: { approver: { select: { id: true, firstName: true, lastName: true } } },
    });

    // Drive the quotation state machine based on the action
    let newStatus: QuotationStatus | null = null;
    let activityAction: string = ACTIVITY_ACTIONS.APPROVAL_CREATED;

    if (action === ApprovalAction.APPROVE) {
      newStatus = QuotationStatus.SELECTED;
      activityAction = ACTIVITY_ACTIONS.QUOTATION_SELECTED;
    } else if (action === ApprovalAction.REJECT) {
      newStatus = QuotationStatus.REJECTED;
      activityAction = ACTIVITY_ACTIONS.QUOTATION_REJECTED;
    }
    // REQUEST_REVISION leaves quotation in SUBMITTED — vendor must resubmit

    if (newStatus) {
      await tx.quotation.update({
        where: { id: quotationId },
        data: { status: newStatus },
      });
    }

    await tx.activityLog.create({
      data: {
        userId: approverId,
        action: activityAction,
        entityType: ENTITY_TYPES.QUOTATION,
        entityId: quotationId,
        metadata: { action, comments, newStatus },
        ipAddress: ip,
      },
    });

    return approval;
  });
};

export const findApprovalsByQuotation = async (quotationId: string) => {
  return prisma.approval.findMany({
    where: { quotationId },
    include: { approver: { select: { id: true, firstName: true, lastName: true, email: true } } },
    orderBy: { createdAt: 'asc' },
  });
};
