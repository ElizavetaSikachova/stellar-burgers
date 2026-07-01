import { test, expect } from '@playwright/test';

test.describe('Order Creation Flow', () => {
  // Mock data for user
  const mockUserResponse = {
    success: true,
    user: {
      email: 'test@example.com',
      name: 'Test User'
    }
  };

  // Mock data for order creation
  const mockOrderResponse = {
    success: true,
    order: {
      _id: '643d69a5c3f7b9001cce0600',
      status: 'done',
      name: 'Test Burger',
      number: 12345,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      ingredients: [
        '643d69a5c3f7b9001cce0550',
        '643d69a5c3f7b9001cce0552',
        '643d69a5c3f7b9001cce0550'
      ],
      price: 3429
    },
    name: 'Test Burger'
  };

  test.beforeEach(async ({ page, context }) => {
    // Set up HAR recording for ingredients
    await context.routeFromHAR('./tests/fixtures/ingredients.har', {
      url: '**/api/ingredients',
      update: false
    });

    // Mock user auth - intercept /auth/user requests
    await page.route('**/auth/user', (route) => {
      route.abort('blockedbyclient');
    });

    // Set mock auth token
    await context.addCookies([
      {
        name: 'accessToken',
        value: 'mock_access_token_12345',
        url: 'http://localhost:3000'
      }
    ]);

    localStorage.setItem('refreshToken', 'mock_refresh_token_12345');

    // Transition to constructor page
    await page.goto('/');
  });

  test('should build burger and create order', async ({ page }) => {
    // Mock the order creation endpoint
    await page.route('**/api/orders', (route) => {
      if (route.request().method() === 'POST') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockOrderResponse)
        });
      }
    });

    // Wait for ingredients to load
    await page.waitForSelector('[data-testid="burger-ingredient"]', {
      timeout: 5000
    });

    // Add bun to constructor
    const bunIngredients = await page.locator('[data-testid="burger-ingredient"][data-type="bun"]').all();
    expect(bunIngredients.length).toBeGreaterThan(0);
    const addBunButton = bunIngredients[0].locator('button:has-text("Добавить")');
    await addBunButton.click();

    // Add main ingredient
    const mainIngredients = await page.locator('[data-testid="burger-ingredient"][data-type="main"]').all();
    expect(mainIngredients.length).toBeGreaterThan(0);
    const addMainButton = mainIngredients[0].locator('button:has-text("Добавить")');
    await addMainButton.click();

    // Add sauce ingredient
    const sauceIngredients = await page.locator('[data-testid="burger-ingredient"][data-type="sauce"]').all();
    expect(sauceIngredients.length).toBeGreaterThan(0);
    const addSauceButton = sauceIngredients[0].locator('button:has-text("Добавить")');
    await addSauceButton.click();

    // Verify constructor has all parts
    const bunInConstructor = await page.locator('[data-testid="constructor-bun"]');
    await expect(bunInConstructor).toBeVisible();

    const ingredientsInConstructor = await page.locator('[data-testid="constructor-ingredient"]').all();
    expect(ingredientsInConstructor.length).toBeGreaterThan(0);

    // Click order button
    const orderButton = await page.locator('button:has-text("Оформить заказ")');
    await orderButton.click();

    // Wait for order number to appear
    await page.waitForSelector('[data-testid="order-number"]', {
      timeout: 5000
    });

    // Verify order number is displayed
    const orderNumber = await page.locator('[data-testid="order-number"]');
    await expect(orderNumber).toHaveText('12345');

    // Close modal
    const closeButton = await page.locator('[data-testid="modal-close"]');
    await closeButton.click();

    // Verify modal is closed - check that order number is no longer visible
    await expect(orderNumber).not.toBeVisible();

    // Verify constructor is cleared after successful order
    const emptyConstructor = await page.locator('text=Выберите булки');
    await expect(emptyConstructor).toBeVisible();
  });

  test('should handle modal overlay click for closing', async ({ page }) => {
    // Wait for ingredients to load
    await page.waitForSelector('[data-testid="burger-ingredient"]', {
      timeout: 5000
    });

    // Open ingredient details
    const firstIngredient = await page.locator('[data-testid="burger-ingredient"] a').first();
    await firstIngredient.click();

    // Wait for modal
    await page.waitForSelector('[data-testid="ingredient-details-modal"]', {
      timeout: 5000
    });

    // Click on overlay to close
    const overlay = await page.locator('[data-testid="modal-overlay"]');
    await overlay.click();

    // Verify modal is closed
    const modal = await page.locator('[data-testid="ingredient-details-modal"]');
    await expect(modal).not.toBeVisible();
  });
});
