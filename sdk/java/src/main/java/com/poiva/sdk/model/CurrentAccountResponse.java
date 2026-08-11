package com.poiva.sdk.model;

import java.time.Instant;

public record CurrentAccountResponse(
        OrganizationResponse organization,
        MemberResponse user,
        Instant expiresAt
) {
}
