package com.poiva.sdk.model;

import java.time.Instant;
import java.util.UUID;

/** A concrete output produced by an activity, submitted for review. */
public record Deliverable(
        UUID id,
        UUID missionId,
        UUID activityId,
        String title,
        String artifactType,
        String state,
        Instant createdAt
) {
}
