import type { Activity, ActivityCreateInput, ActivityState, AuthResponse, CurrentAccountResponse, Deliverable, DeliverableCreateInput, DeliverableState, Evidence, EvidenceCreateInput, Mission, MissionCreateInput, MissionState, OrganizationResponse, Settlement, SettlementCreateInput, SettlementState, ShareResponse, Verification, VerificationCreateInput, VerificationOutcome, VerificationTimeline } from "./types.js";
export interface PoivaClientOptions {
    /** Base URL of a Poiva-conformant server, e.g. "https://api.getpoiva.com". */
    baseUrl: string;
    /** Session bearer token, as returned by login()/signup(). Mutually exclusive with apiKey. */
    accessToken?: string;
    /** Organization API key of the form "pk_live_<keyId>.<secret>". Mutually exclusive with accessToken. */
    apiKey?: string;
    /** Override the fetch implementation (mainly for testing). Defaults to the global fetch. */
    fetchImpl?: typeof fetch;
}
/** Thrown for any non-2xx response. `body` is the raw response text, parsed as JSON when possible. */
export declare class PoivaApiError extends Error {
    readonly status: number;
    readonly body: unknown;
    constructor(status: number, statusText: string, body: unknown);
}
/**
 * HTTP client for the Poiva protocol API described in protocol/openapi.yaml.
 *
 * Workspace resources (missions, activities, deliverables, evidence, verifications,
 * settlements) intentionally expose only list, create, and a single state/outcome transition —
 * there is no get-by-id or delete. See protocol/openapi.yaml for why.
 */
export declare class PoivaClient {
    private readonly baseUrl;
    private readonly accessToken?;
    private readonly apiKey?;
    private readonly fetchImpl;
    constructor(options: PoivaClientOptions);
    /** Create an organization and its first user; does not authenticate this client instance. */
    signup(input: {
        organizationName: string;
        email: string;
        password: string;
        displayName?: string;
    }): Promise<AuthResponse>;
    /** Authenticate with email/password; does not authenticate this client instance. */
    login(email: string, password: string): Promise<AuthResponse>;
    logout(): Promise<void>;
    me(): Promise<CurrentAccountResponse>;
    organization(): Promise<OrganizationResponse>;
    changePassword(newPassword: string, currentPassword?: string): Promise<void>;
    deleteAccount(): Promise<void>;
    readonly missions: {
        list: () => Promise<Mission[]>;
        create: (input: MissionCreateInput) => Promise<Mission>;
        updateState: (id: string, state: MissionState) => Promise<Mission>;
    };
    readonly activities: {
        list: (missionId: string) => Promise<Activity[]>;
        create: (missionId: string, input: ActivityCreateInput) => Promise<Activity>;
        updateState: (id: string, state: ActivityState) => Promise<Activity>;
    };
    readonly deliverables: {
        list: (missionId: string) => Promise<Deliverable[]>;
        create: (missionId: string, input: DeliverableCreateInput) => Promise<Deliverable>;
        updateState: (id: string, state: DeliverableState) => Promise<Deliverable>;
    };
    readonly evidence: {
        list: (deliverableId: string) => Promise<Evidence[]>;
        create: (deliverableId: string, input: EvidenceCreateInput) => Promise<Evidence>;
    };
    readonly verifications: {
        list: (deliverableId: string) => Promise<Verification[]>;
        create: (deliverableId: string, input: VerificationCreateInput) => Promise<Verification>;
        updateOutcome: (id: string, outcome: VerificationOutcome) => Promise<Verification>;
    };
    readonly settlements: {
        list: (missionId: string) => Promise<Settlement[]>;
        create: (missionId: string, input: SettlementCreateInput) => Promise<Settlement>;
        updateState: (id: string, state: SettlementState) => Promise<Settlement>;
    };
    readonly share: {
        create: (missionId: string) => Promise<ShareResponse>;
        current: (missionId: string) => Promise<ShareResponse>;
        revoke: (missionId: string) => Promise<void>;
    };
    /** Fetch the verification timeline behind a public share token. Never requires credentials. */
    publicVerify(token: string): Promise<VerificationTimeline>;
    private request;
}
