import { test } from "node:test";
import assert from "node:assert/strict";
import { PoivaClient, PoivaApiError } from "../dist/index.js";

function fakeFetch(responses) {
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push({ url, init });
    const match = responses.shift();
    if (!match) {
      throw new Error(`Unexpected fetch call: ${url}`);
    }
    return {
      ok: match.status < 300,
      status: match.status,
      statusText: match.statusText ?? "",
      text: async () => (match.body === undefined ? "" : JSON.stringify(match.body)),
    };
  };
  return { fetchImpl, calls };
}

test("missions.create sends bearer auth and JSON body", async () => {
  const mission = {
    id: "m1",
    title: "Ship it",
    description: "Ship the thing",
    state: "DRAFT",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  };
  const { fetchImpl, calls } = fakeFetch([{ status: 200, body: mission }]);
  const client = new PoivaClient({
    baseUrl: "https://api.example.com",
    accessToken: "token-123",
    fetchImpl,
  });

  const result = await client.missions.create({ title: "Ship it", description: "Ship the thing" });

  assert.deepEqual(result, mission);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, "https://api.example.com/api/cloud/workspace/missions");
  assert.equal(calls[0].init.method, "POST");
  assert.equal(calls[0].init.headers.Authorization, "Bearer token-123");
  assert.equal(
    calls[0].init.body,
    JSON.stringify({ title: "Ship it", description: "Ship the thing" }),
  );
});

test("activities.updateState uses an API key header when configured", async () => {
  const activity = { id: "a1", missionId: "m1", title: "Do work", state: "READY", createdAt: "x" };
  const { fetchImpl, calls } = fakeFetch([{ status: 200, body: activity }]);
  const client = new PoivaClient({
    baseUrl: "https://api.example.com",
    apiKey: "pk_live_abc.secret",
    fetchImpl,
  });

  await client.activities.updateState("a1", "READY");

  assert.equal(calls[0].url, "https://api.example.com/api/cloud/workspace/activities/a1/state");
  assert.equal(calls[0].init.method, "PATCH");
  assert.equal(calls[0].init.headers["X-API-Key"], "pk_live_abc.secret");
  assert.equal(calls[0].init.headers.Authorization, undefined);
});

test("publicVerify sends no credentials even when the client has one configured", async () => {
  const timeline = { organizationName: "Acme", fingerprint: "abc", timeline: [] };
  const { fetchImpl, calls } = fakeFetch([{ status: 200, body: timeline }]);
  const client = new PoivaClient({
    baseUrl: "https://api.example.com",
    accessToken: "token-123",
    fetchImpl,
  });

  const result = await client.publicVerify("share-token");

  assert.deepEqual(result, timeline);
  assert.equal(calls[0].url, "https://api.example.com/api/public/verify/share-token");
  assert.equal(calls[0].init.headers.Authorization, undefined);
});

test("non-2xx responses throw PoivaApiError with the parsed body", async () => {
  const { fetchImpl } = fakeFetch([
    { status: 401, statusText: "Unauthorized", body: { message: "Invalid or expired access token" } },
  ]);
  const client = new PoivaClient({ baseUrl: "https://api.example.com", accessToken: "bad", fetchImpl });

  await assert.rejects(
    () => client.missions.list(),
    (err) => {
      assert.ok(err instanceof PoivaApiError);
      assert.equal(err.status, 401);
      assert.deepEqual(err.body, { message: "Invalid or expired access token" });
      return true;
    },
  );
});
