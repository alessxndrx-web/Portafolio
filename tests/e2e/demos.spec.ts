import { expect, test } from "@playwright/test";
import { loginAsDemo, setEnglish } from "./helpers";

test("dashboard allows adding a user", async ({ page }) => {
  await loginAsDemo(page);

  await page.evaluate(() => localStorage.setItem("ui_dashboard_active_tab", JSON.stringify("users")));
  await page.goto("/demos/dashboard");
  await setEnglish(page);
  await page.waitForTimeout(700);

  await page.getByTestId("dashboard-add-user").click({ force: true });

  const userName = `QA User ${Date.now()}`;

  await page.getByTestId("dashboard-user-name").fill(userName);
  await page.getByTestId("dashboard-user-email").fill("qa@example.com");
  await page.getByTestId("dashboard-user-role").fill("editor");
  await page.getByTestId("dashboard-user-save").click({ force: true });

  await expect(page.getByText(userName)).toBeVisible();
});

test("pos checkout flow shows success state", async ({ page }) => {
  await loginAsDemo(page);

  await page.goto("/demos/pos");
  await setEnglish(page);
  await page.waitForTimeout(700);

  await page.getByTestId("pos-add-1").click();
  await page.getByTestId("pos-open-cart").click();

  await expect(page.getByRole("dialog", { name: /current order/i })).toBeVisible();
  await expect(page.getByTestId("pos-checkout-button")).toBeVisible();
  await page.getByTestId("pos-checkout-button").click();

  await expect(page.getByTestId("pos-success-modal")).toBeVisible();
});

test("editable admin can publish and public page updates", async ({ page }) => {
  await loginAsDemo(page);

  await page.goto("/demos/editable-site/admin");
  await setEnglish(page);
  await page.waitForTimeout(700);

  const publishedTitle = `Premium Launch ${Date.now()}`;
  await page.getByTestId("editable-hero-title-input").fill(publishedTitle);
  await page.getByTestId("editable-publish").click({ force: true });

  await page.goto("/demos/editable-site");
  await expect(page.getByTestId("editable-public-hero-title")).toContainText(publishedTitle);
});
