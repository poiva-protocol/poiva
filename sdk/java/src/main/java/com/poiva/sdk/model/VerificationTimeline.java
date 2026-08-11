package com.poiva.sdk.model;

import java.time.Instant;
import java.util.List;

/**
 * The verification timeline behind a public share link/token, as returned by
 * GET /api/public/verify/{token}. Recompute {@code fingerprint} independently to confirm the
 * returned timeline matches the source record.
 */
public record VerificationTimeline(
        String organizationName,
        String resourceType,
        String resourceId,
        String title,
        String summary,
        String status,
        Instant createdAt,
        Instant updatedAt,
        List<VerificationStep> timeline,
        String fingerprint,
        Instant verifiedAt,
        String shareUrl
) {
}
