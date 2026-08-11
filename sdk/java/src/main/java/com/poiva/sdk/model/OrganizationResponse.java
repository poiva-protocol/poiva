package com.poiva.sdk.model;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record OrganizationResponse(
        UUID id,
        String name,
        String slug,
        String status,
        Instant createdAt,
        int memberCount,
        List<MemberResponse> members
) {
}
