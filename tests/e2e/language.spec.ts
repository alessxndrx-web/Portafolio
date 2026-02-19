import { expect, test } from "@playwright/test";

test("language toggle works across routes", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("link", { name: "Inicio" })).toBeVisible();

  await page.getByTestId("lang-en").click();
  await expect(page.getByRole("link", { name: "Home" })).toBeVisible();

  await page.goto("/projects");
  await expect(page.getByRole("heading", { name: "Projects" })).toBeVisible();

  await page.getByTestId("lang-es").click();
  await expect(page.getByRole("heading", { name: "Proyectos" })).toBeVisible();
});
