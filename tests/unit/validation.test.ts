import { describe, it, expect } from "vitest";
import { validateData, loginSchema, signupSchema, friendRequestSchema } from "@/lib/validation";
import { APIError } from "@/lib/api-response";

describe("Validation System", () => {
  describe("validateData", () => {
    it("should validate correct data", () => {
      const data = { email: "test@example.com", password: "password123" };
      expect(() => validateData(loginSchema, data)).not.toThrow();
    });

    it("should throw APIError for invalid data", () => {
      const data = { email: "invalid", password: "" };
      expect(() => validateData(loginSchema, data)).toThrow(APIError);
    });
  });

  describe("loginSchema", () => {
    it("should validate correct login data", () => {
      const data = {
        email: "user@example.com",
        password: "mypassword",
      };
      expect(() => validateData(loginSchema, data)).not.toThrow();
    });

    it("should reject invalid email", () => {
      const data = {
        email: "not-an-email",
        password: "password",
      };
      expect(() => validateData(loginSchema, data)).toThrow();
    });

    it("should reject empty password", () => {
      const data = {
        email: "user@example.com",
        password: "",
      };
      expect(() => validateData(loginSchema, data)).toThrow();
    });
  });

  describe("signupSchema", () => {
    it("should validate correct signup data", () => {
      const data = {
        email: "user@example.com",
        password: "SecurePass123",
        username: "johndoe",
        name: "John Doe",
      };
      expect(() => validateData(signupSchema, data)).not.toThrow();
    });

    it("should reject weak password", () => {
      const data = {
        email: "user@example.com",
        password: "weak",
        username: "johndoe",
        name: "John Doe",
      };
      expect(() => validateData(signupSchema, data)).toThrow();
    });

    it("should reject short username", () => {
      const data = {
        email: "user@example.com",
        password: "SecurePass123",
        username: "ab",
        name: "John Doe",
      };
      expect(() => validateData(signupSchema, data)).toThrow();
    });

    it("should reject username with special characters", () => {
      const data = {
        email: "user@example.com",
        password: "SecurePass123",
        username: "user@123",
        name: "John Doe",
      };
      expect(() => validateData(signupSchema, data)).toThrow();
    });

    it("should accept optional leetcode username", () => {
      const data = {
        email: "user@example.com",
        password: "SecurePass123",
        username: "johndoe",
        name: "John Doe",
        leetcodeUsername: "leetcoder123",
      };
      expect(() => validateData(signupSchema, data)).not.toThrow();
    });
  });

  describe("friendRequestSchema", () => {
    it("should validate correct friend request data", () => {
      const data = { userId: 123 };
      expect(() => validateData(friendRequestSchema, data)).not.toThrow();
    });

    it("should reject negative user ID", () => {
      const data = { userId: -1 };
      expect(() => validateData(friendRequestSchema, data)).toThrow();
    });

    it("should reject zero user ID", () => {
      const data = { userId: 0 };
      expect(() => validateData(friendRequestSchema, data)).toThrow();
    });

    it("should reject non-integer user ID", () => {
      const data = { userId: 1.5 };
      expect(() => validateData(friendRequestSchema, data)).toThrow();
    });
  });
});
