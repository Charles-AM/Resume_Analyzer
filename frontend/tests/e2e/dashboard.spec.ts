import { expect, test } from "@playwright/test";

test("dashboard loads", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: "Build your role report" })).toBeVisible();
  await expect(page.getByText("Explore with demo account")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Your target role" })).toBeVisible();
});
