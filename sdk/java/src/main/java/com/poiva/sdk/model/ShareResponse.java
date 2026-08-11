package com.poiva.sdk.model;

import java.time.Instant;

public record ShareResponse(
        String token,
        String url,
        String resourceType,
        String resourceId,
        Instant createdAt,
        boolean revoked
) {
}
