import type {
  Activity,
  ActivityCreateInput,
  ActivityState,
  AuthResponse,
  CurrentAccountResponse,
  Deliverable,
  DeliverableCreateInput,
  DeliverableState,
  Evidence,
  EvidenceCreateInput,
  Mission,
  MissionCreateInput,
  MissionState,
  OrganizationResponse,
  Settlement,
  SettlementCreateInput,
  SettlementState,
  ShareResponse,
  Verification,
  VerificationCreateInput,
  VerificationOutcome,
  VerificationTimeline,
} from "./types.js";

export interface PoivaClientOptions {
  /** Base URL of a Poiva-conformant server, e.g. "https://getpoiva.com". */
  baseUrl: string;
  /** Session bearer token, as returned by login()/signup(). Mutually exclusive with apiKey. */
  accessToken?: string;
  /** Organization API key of the form "pk_live_<keyId>.<secret>". Mutually exclusive with accessToken. */
  apiKey?: string;
  /** Override the fetch implementation (mainly for testing). Defaults to the global fetch. */
  fetchImpl?: typeof fetch;
}

/** Thrown for any non-2xx response. `body` is the raw response text, parsed as JSON when possible. */
export class PoivaApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, statusText: string, body: unknown) {
    super(`Poiva API request failed: ${status} ${statusText}`);
    this.name = "PoivaApiError";
    this.status = status;
    this.body = body;
  }
}

/**
 * HTTP client for the Poiva protocol API described in protocol/openapi.yaml.
 *
 * Workspace resources (missions, activities, deliverables, evidence, verifications,
 * settlements) intentionally expose only list, create, and a single state/outcome transition —
 * there is no get-by-id or delete. See protocol/openapi.yaml for why.
 */
export class PoivaClient {
  private readonly baseUrl: string;
  private readonly accessToken?: string;
  private readonly apiKey?: string;
  private readonly fetchImpl: typeof fetch;

  constructor(options: PoivaClientOptions) {
    if (!options.baseUrl) {
      throw new Error("PoivaClient requires a baseUrl");
    }
    this.baseUrl = options.baseUrl.replace(/\/+$/, "");
    this.accessToken = options.accessToken;
    this.apiKey = options.apiKey;
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  /** Create an organization and its first user; does not authenticate this client instance. */
  async signup(input: {
    organizationName: string;
    email: string;
    password: string;
    displayName?: string;
  }): Promise<AuthResponse> {
    return this.request<AuthResponse>("POST", "/api/cloud/signup", input, { anonymous: true });
  }

  /** Authenticate with email/password; does not authenticate this client instance. */
  async login(email: string, password: string): Promise<AuthResponse> {
    return this.request<AuthResponse>(
      "POST",
      "/api/cloud/login",
      { email, password },
      { anonymous: true },
    );
  }

  async logout(): Promise<void> {
    await this.request<void>("POST", "/api/cloud/logout");
  }

  async me(): Promise<CurrentAccountResponse> {
    return this.request<CurrentAccountResponse>("GET", "/api/cloud/me");
  }

  async organization(): Promise<OrganizationResponse> {
    return this.request<OrganizationResponse>("GET", "/api/cloud/organization");
  }

  async changePassword(newPassword: string, currentPassword?: string): Promise<void> {
    await this.request<void>("PATCH", "/api/cloud/me/password", { newPassword, currentPassword });
  }

  async deleteAccount(): Promise<void> {
    await this.request<void>("DELETE", "/api/cloud/me");
  }

  readonly missions = {
    list: (): Promise<Mission[]> => this.request("GET", "/api/cloud/workspace/missions"),
    create: (input: MissionCreateInput): Promise<Mission> =>
      this.request("POST", "/api/cloud/workspace/missions", input),
    updateState: (id: string, state: MissionState): Promise<Mission> =>
      this.request("PATCH", `/api/cloud/workspace/missions/${id}/state`, { state }),
  };

  readonly activities = {
    list: (missionId: string): Promise<Activity[]> =>
      this.request("GET", `/api/cloud/workspace/missions/${missionId}/activities`),
    create: (missionId: string, input: ActivityCreateInput): Promise<Activity> =>
      this.request("POST", `/api/cloud/workspace/missions/${missionId}/activities`, input),
    updateState: (id: string, state: ActivityState): Promise<Activity> =>
      this.request("PATCH", `/api/cloud/workspace/activities/${id}/state`, { state }),
  };

  readonly deliverables = {
    list: (missionId: string): Promise<Deliverable[]> =>
      this.request("GET", `/api/cloud/workspace/missions/${missionId}/deliverables`),
    create: (missionId: string, input: DeliverableCreateInput): Promise<Deliverable> =>
      this.request("POST", `/api/cloud/workspace/missions/${missionId}/deliverables`, input),
    updateState: (id: string, state: DeliverableState): Promise<Deliverable> =>
      this.request("PATCH", `/api/cloud/workspace/deliverables/${id}/state`, { state }),
  };

  readonly evidence = {
    list: (deliverableId: string): Promise<Evidence[]> =>
      this.request("GET", `/api/cloud/workspace/deliverables/${deliverableId}/evidence`),
    create: (deliverableId: string, input: EvidenceCreateInput): Promise<Evidence> =>
      this.request("POST", `/api/cloud/workspace/deliverables/${deliverableId}/evidence`, input),
  };

  readonly verifications = {
    list: (deliverableId: string): Promise<Verification[]> =>
      this.request("GET", `/api/cloud/workspace/deliverables/${deliverableId}/verifications`),
    create: (deliverableId: string, input: VerificationCreateInput): Promise<Verification> =>
      this.request(
        "POST",
        `/api/cloud/workspace/deliverables/${deliverableId}/verifications`,
        input,
      ),
    updateOutcome: (id: string, outcome: VerificationOutcome): Promise<Verification> =>
      this.request("PATCH", `/api/cloud/workspace/verifications/${id}/outcome`, { outcome }),
  };

  readonly settlements = {
    list: (missionId: string): Promise<Settlement[]> =>
      this.request("GET", `/api/cloud/workspace/missions/${missionId}/settlements`),
    create: (missionId: string, input: SettlementCreateInput): Promise<Settlement> =>
      this.request("POST", `/api/cloud/workspace/missions/${missionId}/settlements`, input),
    updateState: (id: string, state: SettlementState): Promise<Settlement> =>
      this.request("PATCH", `/api/cloud/workspace/settlements/${id}/state`, { state }),
  };

  readonly share = {
    create: (missionId: string): Promise<ShareResponse> =>
      this.request("POST", `/api/cloud/workspace/missions/${missionId}/share`),
    current: (missionId: string): Promise<ShareResponse> =>
      this.request("GET", `/api/cloud/workspace/missions/${missionId}/share`),
    revoke: (missionId: string): Promise<void> =>
      this.request("DELETE", `/api/cloud/workspace/missions/${missionId}/share`),
  };

  /** Fetch the verification timeline behind a public share token. Never requires credentials. */
  async publicVerify(token: string): Promise<VerificationTimeline> {
    return this.request<VerificationTimeline>(
      "GET",
      `/api/public/verify/${encodeURIComponent(token)}`,
      undefined,
      { anonymous: true },
    );
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    options?: { anonymous?: boolean },
  ): Promise<T> {
    const headers: Record<string, string> = { Accept: "application/json" };
    if (!options?.anonymous) {
      if (this.accessToken) {
        headers.Authorization = `Bearer ${this.accessToken}`;
      } else if (this.apiKey) {
        headers["X-API-Key"] = this.apiKey;
      }
    }
    if (body !== undefined) {
      headers["Content-Type"] = "application/json";
    }

    const response = await this.fetchImpl(`${this.baseUrl}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    const text = await response.text();
    const parsed = text ? safeJsonParse(text) : undefined;

    if (!response.ok) {
      throw new PoivaApiError(response.status, response.statusText, parsed ?? text);
    }

    return parsed as T;
  }
}

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
