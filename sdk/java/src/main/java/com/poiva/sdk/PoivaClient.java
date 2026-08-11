package com.poiva.sdk;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JavaType;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.poiva.sdk.model.Activity;
import com.poiva.sdk.model.AuthResponse;
import com.poiva.sdk.model.CurrentAccountResponse;
import com.poiva.sdk.model.Deliverable;
import com.poiva.sdk.model.Evidence;
import com.poiva.sdk.model.Mission;
import com.poiva.sdk.model.OrganizationResponse;
import com.poiva.sdk.model.Settlement;
import com.poiva.sdk.model.ShareResponse;
import com.poiva.sdk.model.Verification;
import com.poiva.sdk.model.VerificationTimeline;

import java.io.IOException;
import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Client for a Poiva-conformant server, implementing every endpoint in protocol/openapi.yaml.
 *
 * <p>Workspace resources (missions, activities, deliverables, evidence, verifications,
 * settlements) intentionally expose only list, create, and a single state/outcome transition —
 * there is no get-by-id or delete. See protocol/openapi.yaml for why.
 *
 * <p>Authenticate with either a session bearer token (from {@link #login}/{@link #signup}) or an
 * organization API key of the form {@code pk_live_<keyId>.<secret>}.
 */
public final class PoivaClient {

    private final String baseUrl;
    private final String accessToken;
    private final String apiKey;
    private final HttpClient httpClient;
    private final ObjectMapper mapper;

    public final Missions missions = new Missions();
    public final Activities activities = new Activities();
    public final Deliverables deliverables = new Deliverables();
    public final EvidenceApi evidence = new EvidenceApi();
    public final Verifications verifications = new Verifications();
    public final Settlements settlements = new Settlements();
    public final Share share = new Share();

    public PoivaClient(String baseUrl) {
        this(baseUrl, null, null);
    }

    private PoivaClient(String baseUrl, String accessToken, String apiKey) {
        if (baseUrl == null || baseUrl.isBlank()) {
            throw new IllegalArgumentException("PoivaClient requires a baseUrl");
        }
        this.baseUrl = baseUrl.replaceAll("/+$", "");
        this.accessToken = accessToken;
        this.apiKey = apiKey;
        this.httpClient = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(30)).build();
        this.mapper = new ObjectMapper()
                .registerModule(new JavaTimeModule())
                .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
    }

    /** A client authenticated with a session bearer token, as returned by {@link #login}. */
    public static PoivaClient withAccessToken(String baseUrl, String accessToken) {
        return new PoivaClient(baseUrl, accessToken, null);
    }

    /** A client authenticated with an organization API key ({@code pk_live_<keyId>.<secret>}). */
    public static PoivaClient withApiKey(String baseUrl, String apiKey) {
        return new PoivaClient(baseUrl, null, apiKey);
    }

    // -- Auth ---------------------------------------------------------------------------------

    /** Creates an organization and its first user. Does not authenticate this client instance —
     * use {@link #withAccessToken} with the returned token to act as that user. */
    public AuthResponse signup(String organizationName, String email, String password, String displayName)
            throws IOException, InterruptedException {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("organizationName", organizationName);
        body.put("email", email);
        body.put("password", password);
        if (displayName != null) {
            body.put("displayName", displayName);
        }
        return requestFor("POST", "/api/cloud/signup", body, true, AuthResponse.class);
    }

    /** Authenticates with email/password. Does not authenticate this client instance. */
    public AuthResponse login(String email, String password) throws IOException, InterruptedException {
        return requestFor("POST", "/api/cloud/login", Map.of("email", email, "password", password),
                true, AuthResponse.class);
    }

    public void logout() throws IOException, InterruptedException {
        rawRequest("POST", "/api/cloud/logout", null, false);
    }

    public CurrentAccountResponse me() throws IOException, InterruptedException {
        return requestFor("GET", "/api/cloud/me", null, false, CurrentAccountResponse.class);
    }

    public OrganizationResponse organization() throws IOException, InterruptedException {
        return requestFor("GET", "/api/cloud/organization", null, false, OrganizationResponse.class);
    }

    public void changePassword(String newPassword, String currentPassword) throws IOException, InterruptedException {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("newPassword", newPassword);
        body.put("currentPassword", currentPassword);
        rawRequest("PATCH", "/api/cloud/me/password", body, false);
    }

    public void deleteAccount() throws IOException, InterruptedException {
        rawRequest("DELETE", "/api/cloud/me", null, false);
    }

    /** Fetches the verification timeline behind a public share token. Never sends credentials. */
    public VerificationTimeline publicVerify(String token) throws IOException, InterruptedException {
        return requestFor("GET", "/api/public/verify/" + encode(token), null, true, VerificationTimeline.class);
    }

    // -- Resource namespaces --------------------------------------------------------------------

    public final class Missions {
        public List<Mission> list() throws IOException, InterruptedException {
            return requestForList("GET", "/api/cloud/workspace/missions", null, Mission.class);
        }

        public Mission create(String title, String description, String priority) throws IOException, InterruptedException {
            Map<String, Object> body = new LinkedHashMap<>();
            body.put("title", title);
            body.put("description", description);
            if (priority != null) {
                body.put("priority", priority);
            }
            return requestFor("POST", "/api/cloud/workspace/missions", body, false, Mission.class);
        }

        public Mission updateState(UUID id, String state) throws IOException, InterruptedException {
            return requestFor("PATCH", "/api/cloud/workspace/missions/" + id + "/state",
                    Map.of("state", state), false, Mission.class);
        }
    }

    public final class Activities {
        public List<Activity> list(UUID missionId) throws IOException, InterruptedException {
            return requestForList("GET", "/api/cloud/workspace/missions/" + missionId + "/activities",
                    null, Activity.class);
        }

        public Activity create(UUID missionId, String title, String description) throws IOException, InterruptedException {
            Map<String, Object> body = new LinkedHashMap<>();
            body.put("title", title);
            if (description != null) {
                body.put("description", description);
            }
            return requestFor("POST", "/api/cloud/workspace/missions/" + missionId + "/activities",
                    body, false, Activity.class);
        }

        public Activity updateState(UUID id, String state) throws IOException, InterruptedException {
            return requestFor("PATCH", "/api/cloud/workspace/activities/" + id + "/state",
                    Map.of("state", state), false, Activity.class);
        }
    }

    public final class Deliverables {
        public List<Deliverable> list(UUID missionId) throws IOException, InterruptedException {
            return requestForList("GET", "/api/cloud/workspace/missions/" + missionId + "/deliverables",
                    null, Deliverable.class);
        }

        public Deliverable create(UUID missionId, String title, String artifactType, UUID activityId)
                throws IOException, InterruptedException {
            Map<String, Object> body = new LinkedHashMap<>();
            body.put("title", title);
            body.put("artifactType", artifactType);
            if (activityId != null) {
                body.put("activityId", activityId.toString());
            }
            return requestFor("POST", "/api/cloud/workspace/missions/" + missionId + "/deliverables",
                    body, false, Deliverable.class);
        }

        public Deliverable updateState(UUID id, String state) throws IOException, InterruptedException {
            return requestFor("PATCH", "/api/cloud/workspace/deliverables/" + id + "/state",
                    Map.of("state", state), false, Deliverable.class);
        }
    }

    public final class EvidenceApi {
        public List<Evidence> list(UUID deliverableId) throws IOException, InterruptedException {
            return requestForList("GET", "/api/cloud/workspace/deliverables/" + deliverableId + "/evidence",
                    null, Evidence.class);
        }

        public Evidence create(UUID deliverableId, String type, String locator) throws IOException, InterruptedException {
            return requestFor("POST", "/api/cloud/workspace/deliverables/" + deliverableId + "/evidence",
                    Map.of("type", type, "locator", locator), false, Evidence.class);
        }
    }

    public final class Verifications {
        public List<Verification> list(UUID deliverableId) throws IOException, InterruptedException {
            return requestForList("GET", "/api/cloud/workspace/deliverables/" + deliverableId + "/verifications",
                    null, Verification.class);
        }

        public Verification create(UUID deliverableId, String mode, String policyCode) throws IOException, InterruptedException {
            Map<String, Object> body = new LinkedHashMap<>();
            body.put("mode", mode);
            if (policyCode != null) {
                body.put("policyCode", policyCode);
            }
            return requestFor("POST", "/api/cloud/workspace/deliverables/" + deliverableId + "/verifications",
                    body, false, Verification.class);
        }

        public Verification updateOutcome(UUID id, String outcome) throws IOException, InterruptedException {
            return requestFor("PATCH", "/api/cloud/workspace/verifications/" + id + "/outcome",
                    Map.of("outcome", outcome), false, Verification.class);
        }
    }

    public final class Settlements {
        public List<Settlement> list(UUID missionId) throws IOException, InterruptedException {
            return requestForList("GET", "/api/cloud/workspace/missions/" + missionId + "/settlements",
                    null, Settlement.class);
        }

        public Settlement create(UUID missionId, String type, BigDecimal amount, String currency)
                throws IOException, InterruptedException {
            Map<String, Object> body = new LinkedHashMap<>();
            body.put("type", type);
            if (amount != null) {
                body.put("amount", amount);
            }
            if (currency != null) {
                body.put("currency", currency);
            }
            return requestFor("POST", "/api/cloud/workspace/missions/" + missionId + "/settlements",
                    body, false, Settlement.class);
        }

        public Settlement updateState(UUID id, String state) throws IOException, InterruptedException {
            return requestFor("PATCH", "/api/cloud/workspace/settlements/" + id + "/state",
                    Map.of("state", state), false, Settlement.class);
        }
    }

    public final class Share {
        public ShareResponse create(UUID missionId) throws IOException, InterruptedException {
            return requestFor("POST", "/api/cloud/workspace/missions/" + missionId + "/share",
                    null, false, ShareResponse.class);
        }

        public ShareResponse current(UUID missionId) throws IOException, InterruptedException {
            return requestFor("GET", "/api/cloud/workspace/missions/" + missionId + "/share",
                    null, false, ShareResponse.class);
        }

        public void revoke(UUID missionId) throws IOException, InterruptedException {
            rawRequest("DELETE", "/api/cloud/workspace/missions/" + missionId + "/share", null, false);
        }
    }

    // -- Transport --------------------------------------------------------------------------

    private <T> T requestFor(String method, String path, Object body, boolean anonymous, Class<T> type)
            throws IOException, InterruptedException {
        String raw = rawRequest(method, path, body, anonymous);
        if (raw == null || raw.isEmpty()) {
            return null;
        }
        try {
            return mapper.readValue(raw, type);
        } catch (IOException e) {
            throw new IOException("Failed to parse Poiva API response as " + type.getSimpleName(), e);
        }
    }

    private <T> List<T> requestForList(String method, String path, Object body, Class<T> elementType)
            throws IOException, InterruptedException {
        String raw = rawRequest(method, path, body, false);
        JavaType listType = mapper.getTypeFactory().constructCollectionType(List.class, elementType);
        return mapper.readValue(raw, listType);
    }

    private String rawRequest(String method, String path, Object body, boolean anonymous)
            throws IOException, InterruptedException {
        HttpRequest.Builder builder = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + path))
                .header("Accept", "application/json")
                .timeout(Duration.ofSeconds(30));

        if (!anonymous) {
            if (accessToken != null) {
                builder.header("Authorization", "Bearer " + accessToken);
            } else if (apiKey != null) {
                builder.header("X-API-Key", apiKey);
            }
        }

        if (body != null) {
            String json = mapper.writeValueAsString(body);
            builder.header("Content-Type", "application/json")
                    .method(method, HttpRequest.BodyPublishers.ofString(json, StandardCharsets.UTF_8));
        } else {
            builder.method(method, HttpRequest.BodyPublishers.noBody());
        }

        HttpResponse<String> response = httpClient.send(builder.build(), HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() >= 300) {
            throw new PoivaApiException(response.statusCode(), response.body());
        }
        return response.body();
    }

    private static String encode(String value) {
        return java.net.URLEncoder.encode(value, StandardCharsets.UTF_8).replace("+", "%20");
    }
}
