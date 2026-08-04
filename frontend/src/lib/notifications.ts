// Tolerant notification normaliser.
//
// The backend emits UPPERCASE type strings (NEW_COMPANY, DOCUMENT,
// REQUEST_APPROVED, RESUBMISSION_REQUESTED, DOCUMENT_APPROVED,
// DOCUMENT_REJECTED, LICENSE_ISSUED, INFO, ...) while the admin UI was keyed by
// a lowercase union. Any unmapped type used to produce `undefined` and crash
// `actionKeysByType[type].map(...)`.
//
// `normalizeNotification` therefore ALWAYS returns a complete object: an
// unknown type falls back to a neutral tone with an empty action list, so the
// renderer can never throw again.

export type NotificationTone =
  | "document"
  | "approved"
  | "rejected"
  | "stage"
  | "alert"
  | "info";

export type NotificationAction =
  | "preview"
  | "approve"
  | "reject"
  | "view"
  | "edit"
  | "notify"
  | "changeStage";

export interface NormalizedNotification {
  id: string;
  /** Canonical UPPERCASE backend type, e.g. "DOCUMENT_REJECTED". */
  type: string;
  /** Drives the icon and the colour of the row. */
  tone: NotificationTone;
  /** Never undefined — safe to `.map()` unconditionally. */
  actions: NotificationAction[];
  status: string;
  description: string;
  timestamp: string;
  read: boolean;
}

const TONE_BY_TYPE: Record<string, NotificationTone> = {
  DOCUMENT: "document",
  DOCUMENT_UPLOADED: "document",

  REQUEST_APPROVED: "approved",
  DOCUMENT_APPROVED: "approved",
  LICENSE_ISSUED: "approved",

  // A rejection must never render with the green success default.
  REQUEST_REJECTED: "rejected",
  DOCUMENT_REJECTED: "rejected",

  STAGE: "stage",
  STAGE_COMPLETED: "stage",
  STAGE_UNLOCKED: "stage",

  NEW_COMPANY: "alert",
  RESUBMISSION_REQUESTED: "alert",

  INFO: "info",
};

const ACTIONS_BY_TONE: Record<NotificationTone, NotificationAction[]> = {
  document: ["preview", "approve", "reject"],
  approved: ["view"],
  rejected: ["view"],
  stage: ["view", "changeStage"],
  alert: ["edit", "notify"],
  info: [],
};

const STATUS_BY_TONE: Record<NotificationTone, string> = {
  document: "Pending review",
  approved: "Approved",
  rejected: "Rejected",
  stage: "Stage update",
  alert: "Action required",
  info: "Update",
};

const DEFAULT_TONE: NotificationTone = "info";

export function toneForType(rawType: unknown): NotificationTone {
  const type = normalizeType(rawType);

  return TONE_BY_TYPE[type] || DEFAULT_TONE;
}

export function actionsForType(rawType: unknown): NotificationAction[] {
  return ACTIONS_BY_TONE[toneForType(rawType)] || [];
}

export function statusForType(rawType: unknown): string {
  return STATUS_BY_TONE[toneForType(rawType)] || STATUS_BY_TONE[DEFAULT_TONE];
}

function normalizeType(rawType: unknown): string {
  return typeof rawType === "string" ? rawType.trim().toUpperCase() : "";
}

// The backend uses five legacy message formats. Three of them are
// `translationKey|argument`; the rest are a bare key or raw prose. Everything
// after the first pipe is the human-facing argument.
function extractDescription(message: unknown): string {
  if (typeof message !== "string") {
    return "";
  }

  const pipe = message.indexOf("|");

  return pipe === -1 ? message : message.slice(pipe + 1);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeNotification(raw: any): NormalizedNotification {
  const source = raw && typeof raw === "object" ? raw : {};

  const type = normalizeType(source.type) || "INFO";
  const tone = TONE_BY_TYPE[type] || DEFAULT_TONE;

  return {
    id: String(source.id ?? ""),
    type,
    tone,
    actions: ACTIONS_BY_TONE[tone] || [],
    status: STATUS_BY_TONE[tone] || STATUS_BY_TONE[DEFAULT_TONE],
    description: extractDescription(source.message),
    timestamp: source.created_at || source.timestamp || "",
    read: source.is_read === 1 || source.is_read === true,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeNotifications(raw: any): NormalizedNotification[] {
  return Array.isArray(raw) ? raw.map(normalizeNotification) : [];
}
