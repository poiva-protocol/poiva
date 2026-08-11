package com.poiva.sdk;

/** Thrown for any non-2xx response. {@code body} is the raw response body (usually JSON). */
public class PoivaApiException extends RuntimeException {

    private final int status;
    private final String body;

    public PoivaApiException(int status, String body) {
        super("Poiva API request failed: " + status);
        this.status = status;
        this.body = body;
    }

    public int status() {
        return status;
    }

    public String body() {
        return body;
    }
}
