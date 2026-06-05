import { expect, test } from "@playwright/test";

test("dashboard loads", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: "Am i a good match?" })).toBeVisible();
  await expect(page.getByText("Use demo account")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Paste a job description and analyze fit" })).toBeVisible();
});
