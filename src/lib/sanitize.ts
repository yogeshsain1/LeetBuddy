/**
 * Input sanitization utilities
 * Prevent XSS and injection attacks
 */

/**
 * Sanitize HTML input to prevent XSS
 */
export function sanitizeHTML(input: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",
  };

  return input.replace(/[&<>"'/]/g, (char) => map[char] || char);
}

/**
 * Sanitize username (alphanumeric and underscore only)
 */
export function sanitizeUsername(username: string): string {
  return username.replace(/[^a-zA-Z0-9_]/g, "");
}

/**
 * Sanitize email
 */
export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

/**
 * Remove potentially dangerous characters from SQL-like inputs
 * Note: Always use parameterized queries with Drizzle ORM
 */
export function sanitizeSearchQuery(query: string): string {
  // Remove SQL injection attempts
  const dangerous = [
    ";",
    "--",
    "xp_",
    "sp_",
    "DROP",
    "SELECT",
    "INSERT",
    "UPDATE",
    "DELETE",
    "CREATE",
    "ALTER",
    "EXEC",
  ];

  let sanitized = query;
  dangerous.forEach((term) => {
    // Escape special regex characters
    const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escapedTerm, "gi");
    sanitized = sanitized.replace(regex, "");
  });

  return sanitized.trim();
}

/**
 * Validate and sanitize URLs
 */
export function sanitizeURL(url: string): string | null {
  try {
    const parsed = new URL(url);

    // Only allow http and https protocols
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return null;
    }

    return parsed.toString();
  } catch {
    return null;
  }
}

/**
 * Sanitize file names
 */
export function sanitizeFileName(fileName: string): string {
  // Remove path traversal attempts
  const sanitized = fileName.replace(/\.\.\//g, "").replace(/\\/g, "/");

  // Remove or replace special characters
  return sanitized.replace(/[^a-zA-Z0-9._-]/g, "_");
}

/**
 * Strip HTML tags from content
 */
export function stripHTML(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

/**
 * Validate and sanitize JSON input
 */
export function sanitizeJSON(input: string): object | null {
  try {
    const parsed = JSON.parse(input);

    // Prevent prototype pollution
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      ("__proto__" in parsed || "constructor" in parsed || "prototype" in parsed)
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}
