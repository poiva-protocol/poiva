package com.poiva.sdk.model;

import java.time.Instant;
import java.util.UUID;

/** A check of a deliverable against its evidence, producing an outcome. */
public record Verification(
        UUID id,
        UUID deliverableId,
        String mode,
        String outcome,
        String policyCode,
        Instant createdAt
) {
}
