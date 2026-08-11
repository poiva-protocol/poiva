package com.poiva.sdk.model;

import java.time.Instant;
import java.util.UUID;

/** A unit of executable work within a mission. See protocol/docs/06-activity.md. */
public record Activity(
        UUID id,
        UUID missionId,
        String title,
        String state,
        Instant createdAt
) {
}
