import { describe, it, expect } from "vitest";
import {
  sanitizeHTML,
  sanitizeUsername,
  sanitizeEmail,
  sanitizeSearchQuery,
  sanitizeURL,
  sanitizeFileName,
  stripHTML,
} from "@/lib/sanitize";

describe("Input Sanitization", () => {
  describe("sanitizeHTML", () => {
    it("should escape HTML special characters", () => {
      const input = '<script>alert("XSS")</script>';
      const expected = "&lt;script&gt;alert(&quot;XSS&quot;)&lt;&#x2F;script&gt;";
      expect(sanitizeHTML(input)).toBe(expected);
    });

    it("should handle ampersands", () => {
      expect(sanitizeHTML("Tom & Jerry")).toBe("Tom &amp; Jerry");
    });

    it("should handle quotes", () => {
      expect(sanitizeHTML('He said "Hello"')).toContain("&quot;");
    });
  });

  describe("sanitizeUsername", () => {
    it("should keep only alphanumeric and underscore", () => {
      expect(sanitizeUsername("user_123")).toBe("user_123");
      expect(sanitizeUsername("user@123!")).toBe("user123");
      expect(sanitizeUsername("user name")).toBe("username");
    });

    it("should remove special characters", () => {
      expect(sanitizeUsername("user$#@!")).toBe("user");
    });
  });

  describe("sanitizeEmail", () => {
    it("should lowercase and trim email", () => {
      expect(sanitizeEmail("  USER@EXAMPLE.COM  ")).toBe("user@example.com");
    });

    it("should handle already lowercase emails", () => {
      expect(sanitizeEmail("user@example.com")).toBe("user@example.com");
    });
  });

  describe("sanitizeSearchQuery", () => {
    it("should remove SQL injection attempts", () => {
      const dangerous = "test; DROP TABLE users--";
      const result = sanitizeSearchQuery(dangerous);
      expect(result).not.toContain("DROP");
      expect(result).not.toContain(";");
      expect(result).not.toContain("--");
    });

    it("should remove SQL keywords", () => {
      const query = "SELECT * FROM users";
      const result = sanitizeSearchQuery(query);
      expect(result.toUpperCase()).not.toContain("SELECT");
      // Check that dangerous keywords have been removed
      expect(result.length).toBeLessThan(query.length);
    });

    it("should allow normal search terms", () => {
      const query = "javascript tutorial";
      expect(sanitizeSearchQuery(query)).toBe("javascript tutorial");
    });
  });

  describe("sanitizeURL", () => {
    it("should allow valid HTTP URLs", () => {
      const url = "http://example.com";
      expect(sanitizeURL(url)).toBe("http://example.com/");
    });

    it("should allow valid HTTPS URLs", () => {
      const url = "https://example.com";
      expect(sanitizeURL(url)).toBe("https://example.com/");
    });

    it("should reject javascript: URLs", () => {
      const url = "javascript:alert(1)";
      expect(sanitizeURL(url)).toBeNull();
    });

    it("should reject data: URLs", () => {
      const url = "data:text/html,<script>alert(1)</script>";
      expect(sanitizeURL(url)).toBeNull();
    });

    it("should reject invalid URLs", () => {
      expect(sanitizeURL("not a url")).toBeNull();
    });
  });

  describe("sanitizeFileName", () => {
    it("should remove path traversal attempts", () => {
      expect(sanitizeFileName("../../../etc/passwd")).not.toContain("../");
    });

    it("should replace special characters", () => {
      const fileName = "my file@#$%.txt";
      const result = sanitizeFileName(fileName);
      expect(result).toMatch(/^[a-zA-Z0-9._-]+$/);
    });

    it("should allow valid file names", () => {
      expect(sanitizeFileName("document.pdf")).toBe("document.pdf");
      expect(sanitizeFileName("my-file_v2.txt")).toBe("my-file_v2.txt");
    });
  });

  describe("stripHTML", () => {
    it("should remove all HTML tags", () => {
      const html = "<p>Hello <strong>World</strong></p>";
      expect(stripHTML(html)).toBe("Hello World");
    });

    it("should handle nested tags", () => {
      const html = "<div><span><a>Link</a></span></div>";
      expect(stripHTML(html)).toBe("Link");
    });

    it("should handle self-closing tags", () => {
      const html = "Text <br/> More text";
      expect(stripHTML(html)).toBe("Text  More text");
    });
  });
});
