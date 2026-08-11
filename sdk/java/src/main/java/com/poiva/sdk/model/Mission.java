package com.poiva.sdk.model;

import java.time.Instant;
import java.util.UUID;

/**
 * A goal-oriented unit of work with its own budget, resources, and activities.
 * See protocol/docs/05-mission.md.
 *
 * {@code state} and {@code priority} are plain strings rather than Java enums: a server may add a
 * new value (see protocol/schema/common.schema.json for the values known at SDK release time)
 * before this SDK is updated, and rejecting an unrecognized-but-valid value on deserialization
 * would be worse than passing it through as-is.
 */
public record Mission(
        UUID id,
        String title,
        String description,
        String state,
        String priority,
        UUID sponsorId,
        String sponsorName,
        Instant createdAt,
        Instant updatedAt
) {
}
