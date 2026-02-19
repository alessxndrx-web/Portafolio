import { expect, type Page } from "@playwright/test";

export async function setEnglish(page: Page) {
  const currentLanguage = await page.evaluate(() => localStorage.getItem("language"));
  if (currentLanguage !== "en") {
    const englishToggle = page.getByTestId("lang-en").first();
    if (await englishToggle.isVisible()) {
      await englishToggle.click();
      await expect
        .poll(async () => page.evaluate(() => localStorage.getItem("language")))
        .toBe("en");
    }
  }
}

export async function loginAsDemo(page: Page) {
  await page.goto("/login");
  await setEnglish(page);

  await page.getByTestId("login-email").fill("demo@site.com");
  await page.getByTestId("login-password").fill("demo1234");
  await page.getByTestId("login-submit").click();

  await expect(page).toHaveURL(/\/projects$/);
}
