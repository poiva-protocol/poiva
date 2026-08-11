package com.poiva.sdk.model;

import java.util.UUID;

public record MemberResponse(UUID id, String email, String displayName, String role) {
}
