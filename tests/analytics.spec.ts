import { expect, test } from "@playwright/test";

test("every public entry point has one analytics bootstrap and an accessible privacy control", async ({ page }) => {
  for (const path of ["/", "/universe/", "/wonderland.html", "/privacy.html",
    "/universe/field-tools/prep-3.0-alpha.html",
    "/universe/field-tools/perp-1.3-alpha.html"]) {
    await page.goto(path);
    await expect(page.locator('script[data-site-analytics="v1"]')).toHaveCount(1);
  }

  await page.goto("/");
  await expect(page.getByRole("link", { name: "Privacy & analytics" })).toBeVisible();
  await page.goto("/universe/#/sky");
  await expect(page.getByRole("link", { name: "Privacy & analytics" })).toBeVisible();
});

test("visitors can turn off analytics and opt into return recognition separately", async ({ page }) => {
  await page.goto("/privacy.html");
  await expect(page.getByRole("status")).toContainText("Anonymous analytics are on");
  await page.getByRole("button", { name: "Stop analytics on this browser" }).click();
  await expect(page.getByRole("status")).toContainText("Analytics are off");
  await page.getByRole("button", { name: "Allow anonymous analytics" }).click();
  await expect(page.getByRole("status")).toContainText("Anonymous analytics are on");
  await page.getByRole("button", { name: "Recognize this browser on return" }).click();
  await expect(page.getByRole("status")).toContainText("Return recognition enabled");
});
