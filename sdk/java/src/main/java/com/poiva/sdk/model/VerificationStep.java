package com.poiva.sdk.model;

import java.time.Instant;

public record VerificationStep(
        String resourceType,
        String resourceId,
        String action,
        String title,
        String status,
        String summary,
        Instant occurredAt,
        String stepHash
) {
}
