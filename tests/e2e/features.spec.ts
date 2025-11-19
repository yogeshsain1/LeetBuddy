import { test, expect } from "@playwright/test";

test.describe("Friends System", () => {
  test("should redirect to login when accessing friends page without auth", async ({ page }) => {
    await page.goto("/friends");
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("Messages System", () => {
  test("should redirect to login when accessing messages without auth", async ({ page }) => {
    await page.goto("/messages");
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("Groups System", () => {
  test("should redirect to login when accessing groups without auth", async ({ page }) => {
    await page.goto("/groups");
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("Leaderboard", () => {
  test("should redirect to login when accessing leaderboard without auth", async ({ page }) => {
    await page.goto("/leaderboard");
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("Activity Feed", () => {
  test("should redirect to login when accessing activity without auth", async ({ page }) => {
    await page.goto("/activity");
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("Community", () => {
  test("should redirect to login when accessing community without auth", async ({ page }) => {
    await page.goto("/community");
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("Settings", () => {
  test("should redirect to login when accessing settings without auth", async ({ page }) => {
    await page.goto("/settings");
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("Notifications", () => {
  test("should redirect to login when accessing notifications without auth", async ({ page }) => {
    await page.goto("/notifications");
    await expect(page).toHaveURL(/\/login/);
  });
});
