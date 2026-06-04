import { expect, test } from "@playwright/test";

test("dashboard loads", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: "Resume Intelligence" })).toBeVisible();
  await expect(page.getByText("RAG Chat")).toBeVisible();
});
