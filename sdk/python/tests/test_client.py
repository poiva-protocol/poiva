import io
import json
import unittest
import urllib.error
from unittest.mock import patch

from poiva import ApiError, PoivaClient


class FakeResponse:
    def __init__(self, body):
        self._raw = json.dumps(body).encode("utf-8") if body is not None else b""

    def read(self):
        return self._raw

    def __enter__(self):
        return self

    def __exit__(self, *exc):
        return False


class PoivaClientTest(unittest.TestCase):
    def test_missions_create_sends_bearer_auth_and_json_body(self):
        mission = {
            "id": "m1",
            "title": "Ship it",
            "description": "Ship the thing",
            "state": "DRAFT",
            "createdAt": "2026-01-01T00:00:00Z",
            "updatedAt": "2026-01-01T00:00:00Z",
        }
        with patch("poiva.client.urllib.request.urlopen", return_value=FakeResponse(mission)) as urlopen:
            client = PoivaClient("https://api.example.com", access_token="token-123")
            result = client.missions.create(title="Ship it", description="Ship the thing")

        self.assertEqual(result.id, "m1")
        self.assertEqual(result.state, "DRAFT")
        request = urlopen.call_args.args[0]
        self.assertEqual(request.full_url, "https://api.example.com/api/cloud/workspace/missions")
        self.assertEqual(request.get_method(), "POST")
        self.assertEqual(request.get_header("Authorization"), "Bearer token-123")
        self.assertEqual(
            json.loads(request.data),
            {"title": "Ship it", "description": "Ship the thing"},
        )

    def test_activities_update_state_uses_api_key_header(self):
        activity = {"id": "a1", "missionId": "m1", "title": "Do work", "state": "READY", "createdAt": "x"}
        with patch("poiva.client.urllib.request.urlopen", return_value=FakeResponse(activity)) as urlopen:
            client = PoivaClient("https://api.example.com", api_key="pk_live_abc.secret")
            client.activities.update_state("a1", "READY")

        request = urlopen.call_args.args[0]
        self.assertEqual(
            request.full_url, "https://api.example.com/api/cloud/workspace/activities/a1/state"
        )
        self.assertEqual(request.get_method(), "PATCH")
        self.assertEqual(request.get_header("X-api-key"), "pk_live_abc.secret")
        self.assertIsNone(request.get_header("Authorization"))

    def test_public_verify_sends_no_credentials(self):
        timeline = {
            "organizationName": "Acme",
            "resourceType": "mission",
            "resourceId": "m1",
            "title": "Ship it",
            "summary": "",
            "status": "COMPLETED",
            "createdAt": "x",
            "updatedAt": "x",
            "fingerprint": "abc",
            "timeline": [],
        }
        with patch("poiva.client.urllib.request.urlopen", return_value=FakeResponse(timeline)) as urlopen:
            client = PoivaClient("https://api.example.com", access_token="token-123")
            result = client.public_verify("share-token")

        self.assertEqual(result.fingerprint, "abc")
        request = urlopen.call_args.args[0]
        self.assertEqual(request.full_url, "https://api.example.com/api/public/verify/share-token")
        self.assertIsNone(request.get_header("Authorization"))

    def test_non_2xx_raises_api_error_with_parsed_body(self):
        body = json.dumps({"message": "Invalid or expired access token"}).encode("utf-8")
        error = urllib.error.HTTPError(
            url="https://api.example.com/api/cloud/workspace/missions",
            code=401,
            msg="Unauthorized",
            hdrs=None,
            fp=io.BytesIO(body),
        )
        with patch("poiva.client.urllib.request.urlopen", side_effect=error):
            client = PoivaClient("https://api.example.com", access_token="bad")
            with self.assertRaises(ApiError) as ctx:
                client.missions.list()

        self.assertEqual(ctx.exception.status, 401)
        self.assertEqual(ctx.exception.body, {"message": "Invalid or expired access token"})


if __name__ == "__main__":
    unittest.main()
