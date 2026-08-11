/**
 * Types mirroring protocol/schema/*.schema.json and protocol/openapi.yaml.
 * Keep these two files and the schemas in sync by hand — there is no codegen step yet.
 */

export type MissionState =
  | "DRAFT"
  | "KNOWLEDGE"
  | "PLANNING"
  | "ESTIMATION"
  | "PROVISIONING"
  | "EXECUTING"
  | "VERIFYING"
  | "APPROVAL"
  | "SETTLEMENT"
  | "COMPLETED"
  | "CANCELLED";

export type ActivityState =
  | "DRAFT"
  | "READY"
  | "ASSIGNED"
  | "EXECUTING"
  | "SUBMITTED"
  | "VERIFYING"
  | "APPROVED"
  | "COMPLETED"
  | "CANCELLED"
  | "REJECTED"
  | "ARCHIVED";

export type DeliverableState = "SUBMITTED" | "IN_REVIEW" | "ACCEPTED" | "REJECTED";

export type VerificationMode = "AUTOMATIC" | "MANUAL" | "HYBRID";

export type VerificationOutcome = "PENDING" | "PASSED" | "FAILED" | "INCONCLUSIVE";

export type SettlementState = "PENDING" | "CONFIRMED" | "CANCELLED";

export type SettlementType =
  | "INVOICE"
  | "PAYROLL"
  | "INTERNAL_ACCOUNTING"
  | "PURCHASE_ORDER"
  | "GRANT";

export type Priority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface Mission {
  id: string;
  title: string;
  description: string;
  state: MissionState;
  priority?: Priority | null;
  sponsorId?: string | null;
  sponsorName?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  missionId: string;
  title: string;
  state: ActivityState;
  createdAt: string;
}

export interface Deliverable {
  id: string;
  missionId: string;
  activityId?: string | null;
  title: string;
  artifactType: string;
  state: DeliverableState;
  createdAt: string;
}

export interface Evidence {
  id: string;
  deliverableId: string;
  type: string;
  locator: string;
  createdAt: string;
}

export interface Verification {
  id: string;
  deliverableId: string;
  mode: VerificationMode;
  outcome: VerificationOutcome;
  policyCode?: string | null;
  createdAt: string;
}

export interface Settlement {
  id: string;
  missionId: string;
  type: SettlementType;
  state: SettlementState;
  amount?: number | null;
  currency?: string | null;
  createdAt: string;
}

export interface MemberResponse {
  id: string;
  email: string;
  displayName: string;
  role: string;
}

export interface OrganizationResponse {
  id: string;
  name: string;
  slug: string;
  status: string;
  createdAt: string;
  memberCount: number;
  members: MemberResponse[];
}

export interface AuthResponse {
  organization: OrganizationResponse;
  user: MemberResponse;
  tokenType: string;
  accessToken: string;
  expiresAt: string;
}

export interface CurrentAccountResponse {
  organization: OrganizationResponse;
  user: MemberResponse;
  expiresAt: string;
}

export interface ShareResponse {
  token: string;
  url: string;
  resourceType: string;
  resourceId: string;
  createdAt: string;
  revoked: boolean;
}

export interface VerificationStep {
  resourceType: string;
  resourceId: string;
  action: string;
  title: string;
  status: string;
  summary: string;
  occurredAt: string;
  stepHash: string;
}

export interface VerificationTimeline {
  organizationName: string;
  resourceType: string;
  resourceId: string;
  title: string;
  summary: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  timeline: VerificationStep[];
  fingerprint: string;
  verifiedAt?: string | null;
  shareUrl?: string | null;
}

export interface MissionCreateInput {
  title: string;
  description: string;
  priority?: Priority;
}

export interface ActivityCreateInput {
  title: string;
  description?: string;
}

export interface DeliverableCreateInput {
  title: string;
  artifactType: string;
  activityId?: string;
}

export interface EvidenceCreateInput {
  type: string;
  locator: string;
}

export interface VerificationCreateInput {
  mode: VerificationMode;
  policyCode?: string;
}

export interface SettlementCreateInput {
  type: SettlementType;
  amount?: number;
  currency?: string;
}
