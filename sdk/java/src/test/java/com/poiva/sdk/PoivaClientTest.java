package com.poiva.sdk;

import com.poiva.sdk.model.Activity;
import com.poiva.sdk.model.Mission;
import com.poiva.sdk.model.VerificationTimeline;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.UUID;
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class PoivaClientTest {

    private HttpServer server;
    private String baseUrl;
    private final BlockingQueue<CapturedRequest> captured = new ArrayBlockingQueue<>(10);

    private record CapturedRequest(String method, String path, String body, String authorization, String apiKey) {
    }

    @BeforeEach
    void startServer() throws IOException {
        server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        baseUrl = "http://127.0.0.1:" + server.getAddress().getPort();
        server.setExecutor(null);
    }

    @AfterEach
    void stopServer() {
        server.stop(0);
    }

    private void respondWith(String path, int status, String jsonBody) {
        server.createContext(path, exchange -> {
            String requestBody = new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8);
            captured.add(new CapturedRequest(
                    exchange.getRequestMethod(),
                    exchange.getRequestURI().getPath(),
                    requestBody,
                    exchange.getRequestHeaders().getFirst("Authorization"),
                    exchange.getRequestHeaders().getFirst("X-API-Key")));
            byte[] payload = jsonBody.getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().add("Content-Type", "application/json");
            exchange.sendResponseHeaders(status, payload.length);
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(payload);
            }
        });
        server.start();
    }

    @Test
    void missionsCreateSendsBearerAuthAndJsonBody() throws Exception {
        respondWith("/api/cloud/workspace/missions", 200, """
                {"id":"11111111-1111-1111-1111-111111111111","title":"Ship it",
                 "description":"Ship the thing","state":"DRAFT","priority":null,
                 "sponsorId":null,"sponsorName":null,
                 "createdAt":"2026-01-01T00:00:00Z","updatedAt":"2026-01-01T00:00:00Z"}
                """);

        PoivaClient client = PoivaClient.withAccessToken(baseUrl, "token-123");
        Mission mission = client.missions.create("Ship it", "Ship the thing", null);

        assertEquals("Ship it", mission.title());
        assertEquals("DRAFT", mission.state());

        CapturedRequest request = captured.poll(2, TimeUnit.SECONDS);
        assertEquals("POST", request.method());
        assertEquals("Bearer token-123", request.authorization());
        assertTrue(request.body().contains("\"title\":\"Ship it\""));
    }

    @Test
    void activitiesUpdateStateUsesApiKeyHeader() throws Exception {
        UUID activityId = UUID.randomUUID();
        UUID missionId = UUID.randomUUID();
        respondWith("/api/cloud/workspace/activities/" + activityId + "/state", 200, """
                {"id":"%s","missionId":"%s","title":"Do work","state":"READY","createdAt":"2026-01-01T00:00:00Z"}
                """.formatted(activityId, missionId));

        PoivaClient client = PoivaClient.withApiKey(baseUrl, "pk_live_abc.secret");
        Activity activity = client.activities.updateState(activityId, "READY");

        assertEquals("READY", activity.state());
        CapturedRequest request = captured.poll(2, TimeUnit.SECONDS);
        assertEquals("PATCH", request.method());
        assertEquals("pk_live_abc.secret", request.apiKey());
        assertNull(request.authorization());
    }

    @Test
    void publicVerifySendsNoCredentials() throws Exception {
        respondWith("/api/public/verify/share-token", 200, """
                {"organizationName":"Acme","resourceType":"mission","resourceId":"m1",
                 "title":"Ship it","summary":"","status":"COMPLETED",
                 "createdAt":"2026-01-01T00:00:00Z","updatedAt":"2026-01-01T00:00:00Z",
                 "timeline":[],"fingerprint":"abc","verifiedAt":null,"shareUrl":null}
                """);

        PoivaClient client = PoivaClient.withAccessToken(baseUrl, "token-123");
        VerificationTimeline timeline = client.publicVerify("share-token");

        assertEquals("abc", timeline.fingerprint());
        CapturedRequest request = captured.poll(2, TimeUnit.SECONDS);
        assertNull(request.authorization());
    }

    @Test
    void non2xxThrowsPoivaApiExceptionWithBody() {
        respondWith("/api/cloud/workspace/missions", 401, """
                {"message":"Invalid or expired access token"}
                """);

        PoivaClient client = PoivaClient.withAccessToken(baseUrl, "bad-token");

        PoivaApiException exception = assertThrows(PoivaApiException.class, () -> client.missions.list());
        assertEquals(401, exception.status());
        assertTrue(exception.body().contains("Invalid or expired access token"));
    }
}
