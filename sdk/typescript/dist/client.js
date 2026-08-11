/** Thrown for any non-2xx response. `body` is the raw response text, parsed as JSON when possible. */
export class PoivaApiError extends Error {
    status;
    body;
    constructor(status, statusText, body) {
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
    baseUrl;
    accessToken;
    apiKey;
    fetchImpl;
    constructor(options) {
        if (!options.baseUrl) {
            throw new Error("PoivaClient requires a baseUrl");
        }
        this.baseUrl = options.baseUrl.replace(/\/+$/, "");
        this.accessToken = options.accessToken;
        this.apiKey = options.apiKey;
        this.fetchImpl = options.fetchImpl ?? fetch;
    }
    /** Create an organization and its first user; does not authenticate this client instance. */
    async signup(input) {
        return this.request("POST", "/api/cloud/signup", input, { anonymous: true });
    }
    /** Authenticate with email/password; does not authenticate this client instance. */
    async login(email, password) {
        return this.request("POST", "/api/cloud/login", { email, password }, { anonymous: true });
    }
    async logout() {
        await this.request("POST", "/api/cloud/logout");
    }
    async me() {
        return this.request("GET", "/api/cloud/me");
    }
    async organization() {
        return this.request("GET", "/api/cloud/organization");
    }
    async changePassword(newPassword, currentPassword) {
        await this.request("PATCH", "/api/cloud/me/password", { newPassword, currentPassword });
    }
    async deleteAccount() {
        await this.request("DELETE", "/api/cloud/me");
    }
    missions = {
        list: () => this.request("GET", "/api/cloud/workspace/missions"),
        create: (input) => this.request("POST", "/api/cloud/workspace/missions", input),
        updateState: (id, state) => this.request("PATCH", `/api/cloud/workspace/missions/${id}/state`, { state }),
    };
    activities = {
        list: (missionId) => this.request("GET", `/api/cloud/workspace/missions/${missionId}/activities`),
        create: (missionId, input) => this.request("POST", `/api/cloud/workspace/missions/${missionId}/activities`, input),
        updateState: (id, state) => this.request("PATCH", `/api/cloud/workspace/activities/${id}/state`, { state }),
    };
    deliverables = {
        list: (missionId) => this.request("GET", `/api/cloud/workspace/missions/${missionId}/deliverables`),
        create: (missionId, input) => this.request("POST", `/api/cloud/workspace/missions/${missionId}/deliverables`, input),
        updateState: (id, state) => this.request("PATCH", `/api/cloud/workspace/deliverables/${id}/state`, { state }),
    };
    evidence = {
        list: (deliverableId) => this.request("GET", `/api/cloud/workspace/deliverables/${deliverableId}/evidence`),
        create: (deliverableId, input) => this.request("POST", `/api/cloud/workspace/deliverables/${deliverableId}/evidence`, input),
    };
    verifications = {
        list: (deliverableId) => this.request("GET", `/api/cloud/workspace/deliverables/${deliverableId}/verifications`),
        create: (deliverableId, input) => this.request("POST", `/api/cloud/workspace/deliverables/${deliverableId}/verifications`, input),
        updateOutcome: (id, outcome) => this.request("PATCH", `/api/cloud/workspace/verifications/${id}/outcome`, { outcome }),
    };
    settlements = {
        list: (missionId) => this.request("GET", `/api/cloud/workspace/missions/${missionId}/settlements`),
        create: (missionId, input) => this.request("POST", `/api/cloud/workspace/missions/${missionId}/settlements`, input),
        updateState: (id, state) => this.request("PATCH", `/api/cloud/workspace/settlements/${id}/state`, { state }),
    };
    share = {
        create: (missionId) => this.request("POST", `/api/cloud/workspace/missions/${missionId}/share`),
        current: (missionId) => this.request("GET", `/api/cloud/workspace/missions/${missionId}/share`),
        revoke: (missionId) => this.request("DELETE", `/api/cloud/workspace/missions/${missionId}/share`),
    };
    /** Fetch the verification timeline behind a public share token. Never requires credentials. */
    async publicVerify(token) {
        return this.request("GET", `/api/public/verify/${encodeURIComponent(token)}`, undefined, { anonymous: true });
    }
    async request(method, path, body, options) {
        const headers = { Accept: "application/json" };
        if (!options?.anonymous) {
            if (this.accessToken) {
                headers.Authorization = `Bearer ${this.accessToken}`;
            }
            else if (this.apiKey) {
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
        return parsed;
    }
}
function safeJsonParse(text) {
    try {
        return JSON.parse(text);
    }
    catch {
        return text;
    }
}
