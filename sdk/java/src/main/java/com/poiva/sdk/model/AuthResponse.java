package com.poiva.sdk.model;

import java.time.Instant;

public record AuthResponse(
        OrganizationResponse organization,
        MemberResponse user,
        String tokenType,
        String accessToken,
        Instant expiresAt
) {
}
