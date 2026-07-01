import { test, expect } from '@playwright/test';

test.describe('Burger Constructor Page', () => {
  test.beforeEach(async ({ page, context }) => {
    // Перехватываем запрос на ингредиенты и возвращаем моковые данные
    await context.routeFromHAR('./tests/fixtures/ingredients.har', {
      url: '**/api/ingredients',
      update: false
    });

    // Переходим на страницу конструктора
    await page.goto('/');
  });

  test('should load ingredients from API', async ({ page }) => {
    // Проверяем, что ингредиенты загружены и отображаются
    await page.waitForSelector('[data-testid="burger-ingredient"]', {
      timeout: 5000
    });

    const ingredients = await page.locator('[data-testid="burger-ingredient"]').all();
    expect(ingredients.length).toBeGreaterThan(0);
  });

  test('should add bun ingredient to constructor', async ({ page }) => {
    // Ждем загрузки ингредиентов
    await page.waitForSelector('[data-testid="burger-ingredient"]', {
      timeout: 5000
    });

    // Находим булку (первую с типом bun) и кликаем на кнопку добавления
    const bunIngredients = await page.locator('[data-testid="burger-ingredient"][data-type="bun"]').all();
    expect(bunIngredients.length).toBeGreaterThan(0);

    // Кликаем на первую булку (кнопка добавления находится внутри элемента)
    const addButton = bunIngredients[0].locator('button:has-text("Добавить")');
    await addButton.click();

    // Проверяем, что булка добавлена в конструктор
    await page.waitForSelector('[data-testid="constructor-bun"]', {
      timeout: 5000
    });

    const bunInConstructor = await page.locator('[data-testid="constructor-bun"]');
    await expect(bunInConstructor).toBeVisible();
  });

  test('should add filling ingredient to constructor', async ({ page }) => {
    // Ждем загрузки ингредиентов
    await page.waitForSelector('[data-testid="burger-ingredient"]', {
      timeout: 5000
    });

    // Находим начинку (main)
    const mainIngredients = await page.locator('[data-testid="burger-ingredient"][data-type="main"]').all();
    expect(mainIngredients.length).toBeGreaterThan(0);

    // Кликаем на кнопку добавления начинки
    const addButton = mainIngredients[0].locator('button:has-text("Добавить")');
    await addButton.click();

    // Проверяем, что начинка добавлена в список ингредиентов
    await page.waitForSelector('[data-testid="constructor-ingredient"]', {
      timeout: 5000
    });

    const ingredientsInConstructor = await page.locator('[data-testid="constructor-ingredient"]').all();
    expect(ingredientsInConstructor.length).toBeGreaterThan(0);
  });

  test('should add sauce ingredient to constructor', async ({ page }) => {
    // Ждем загрузки ингредиентов
    await page.waitForSelector('[data-testid="burger-ingredient"]', {
      timeout: 5000
    });

    // Находим соус (sauce)
    const sauceIngredients = await page.locator('[data-testid="burger-ingredient"][data-type="sauce"]').all();
    expect(sauceIngredients.length).toBeGreaterThan(0);

    // Кликаем на кнопку добавления соуса
    const addButton = sauceIngredients[0].locator('button:has-text("Добавить")');
    await addButton.click();

    // Проверяем, что соус добавлен
    await page.waitForSelector('[data-testid="constructor-ingredient"]', {
      timeout: 5000
    });

    const ingredientsInConstructor = await page.locator('[data-testid="constructor-ingredient"]').all();
    expect(ingredientsInConstructor.length).toBeGreaterThan(0);
  });

  test('should open ingredient details modal', async ({ page }) => {
    // Ждем загрузки ингредиентов
    await page.waitForSelector('[data-testid="burger-ingredient"]', {
      timeout: 5000
    });

    // Кликаем на ингредиент (на ссылку), чтобы открыть модальное окно
    const firstIngredient = await page.locator('[data-testid="burger-ingredient"] a').first();
    await firstIngredient.click();

    // Проверяем, что модальное окно открыто
    const modal = await page.locator('[data-testid="ingredient-details-modal"]');
    await expect(modal).toBeVisible();

    // Проверяем, что в модальном окне отображаются детали ингредиента
    const ingredientName = await page.locator('[data-testid="ingredient-name"]');
    await expect(ingredientName).toBeVisible();
  });

  test('should close modal by clicking close button', async ({ page }) => {
    // Ждем загрузки ингредиентов
    await page.waitForSelector('[data-testid="burger-ingredient"]', {
      timeout: 5000
    });

    // Открываем модальное окно
    const firstIngredient = await page.locator('[data-testid="burger-ingredient"] a').first();
    await firstIngredient.click();

    // Ждем открытия модали
    await page.waitForSelector('[data-testid="ingredient-details-modal"]', {
      timeout: 5000
    });

    // Закрываем модальное окно по клику на крестик
    const closeButton = await page.locator('[data-testid="modal-close"]');
    await closeButton.click();

    // Проверяем, что модальное окно закрыто
    const modal = await page.locator('[data-testid="ingredient-details-modal"]');
    await expect(modal).not.toBeVisible();
  });

  test('should close modal by clicking overlay', async ({ page }) => {
    // Ждем загрузки ингредиентов
    await page.waitForSelector('[data-testid="burger-ingredient"]', {
      timeout: 5000
    });

    // Открываем модальное окно
    const firstIngredient = await page.locator('[data-testid="burger-ingredient"] a').first();
    await firstIngredient.click();

    // Ждем открытия модали
    await page.waitForSelector('[data-testid="ingredient-details-modal"]', {
      timeout: 5000
    });

    // Закрываем модальное окно по клику на оверлей
    const overlay = await page.locator('[data-testid="modal-overlay"]');
    await overlay.click();

    // Проверяем, что модальное окно закрыто
    const modal = await page.locator('[data-testid="ingredient-details-modal"]');
    await expect(modal).not.toBeVisible();
  });
});
