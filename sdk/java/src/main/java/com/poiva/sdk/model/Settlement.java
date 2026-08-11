package com.poiva.sdk.model;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/** Compensation or accounting entry closing out a mission's completed work. */
public record Settlement(
        UUID id,
        UUID missionId,
        String type,
        String state,
        BigDecimal amount,
        String currency,
        Instant createdAt
) {
}
