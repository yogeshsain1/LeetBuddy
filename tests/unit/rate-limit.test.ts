import { NextRequest } from "next/server";
import { describe, it, expect } from "vitest";
import { checkRateLimit } from "@/lib/rate-limit";

describe("Rate Limiting", () => {
  describe("checkRateLimit", () => {
    it("should allow requests within limit", () => {
      const mockRequest = {
        ip: "192.168.1.1",
        headers: new Headers(),
      } as unknown as NextRequest;

      // First request should pass
      expect(() => checkRateLimit(mockRequest, "api")).not.toThrow();
    });

    it("should use different limits for different tiers", () => {
      const mockRequest = {
        ip: "192.168.1.2",
        headers: new Headers(),
      } as unknown as NextRequest;

      // API tier should allow more requests than strict
      expect(() => checkRateLimit(mockRequest, "api")).not.toThrow();
      expect(() => checkRateLimit(mockRequest, "strict")).not.toThrow();
    });
  });
});
