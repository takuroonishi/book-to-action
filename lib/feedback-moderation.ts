/**
 * Comment moderation layer.
 * Extend here for spam reports, NG-word checks, auto-approve, delete history.
 */

export const FEEDBACK_STATUSES = ["pending", "approved", "rejected"] as const;

export type FeedbackStatus = (typeof FEEDBACK_STATUSES)[number];

export const FEEDBACK_STATUS_LABELS: Record<FeedbackStatus, string> = {
  pending: "確認待ち",
  approved: "公開",
  rejected: "非公開",
};

export const DEFAULT_FEEDBACK_STATUS: FeedbackStatus = "pending";

export type ModerationCapabilities = {
  spamReport: boolean;
  ngWordFilter: boolean;
  autoApprove: boolean;
  deleteHistory: boolean;
};

/** Feature flags for future moderation features. */
export const MODERATION_CAPABILITIES: ModerationCapabilities = {
  spamReport: false,
  ngWordFilter: false,
  autoApprove: false,
  deleteHistory: false,
};

export function isFeedbackStatus(value: string): value is FeedbackStatus {
  return FEEDBACK_STATUSES.includes(value as FeedbackStatus);
}

export function getStatusLabel(status: FeedbackStatus) {
  return FEEDBACK_STATUS_LABELS[status];
}
