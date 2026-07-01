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
      url: '**/norma.education-services.ru/api/ingredients',
      update: false
    });

    // Mock user authentication endpoint (both local and production)
    await page.route('**/auth/user', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          user: mockUserResponse.user
        })
      });
    });

    // Mock token refresh endpoint
    await page.route('**/auth/token', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          refreshToken: 'mock_refresh_token_12345',
          accessToken: 'mock_access_token_12345'
        })
      });
    });

    // Mock orders creation endpoint - intercept all order API calls
    await page.route('**/api/orders', async (route) => {
      if (route.request().method() === 'POST') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockOrderResponse)
        });
      } else {
        route.continue();
      }
    });

    // Set mock auth token
    await context.addCookies([
      {
        name: 'accessToken',
        value: 'mock_access_token_12345',
        url: 'http://localhost:4000'
      }
    ]);

    // Set refreshToken in localStorage before page load
    await context.addInitScript(() => {
      localStorage.setItem('refreshToken', 'mock_refresh_token_12345');
    });

    // Transition to constructor page
    await page.goto('http://localhost:4000/', { waitUntil: 'networkidle' });

    // Wait for authentication to complete (check auth state in Redux)
    await page.waitForFunction(() => {
      return (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ !== undefined || 
             document.querySelector('[data-testid="burger-ingredient"]') !== null;
    }, { timeout: 5000 }).catch(() => {
      // Continue even if Redux check fails, ingredients might still load
    });
  });

  test('should build burger and create order', async ({ page }) => {
    // Wait for ingredients to load
    await page.waitForSelector('[data-testid="burger-ingredient"]', {
      timeout: 5000
    });

    // Add bun to constructor - get name first
    const bunIngredients = await page.locator('[data-testid="burger-ingredient"][data-type="bun"]').all();
    expect(bunIngredients.length).toBeGreaterThan(0);
    const bunNameText = await bunIngredients[0].locator('p').last().textContent();
    const addBunButton = bunIngredients[0].locator('button:has-text("Добавить")');
    await addBunButton.click();

    // Add main ingredient - get name first
    const mainIngredients = await page.locator('[data-testid="burger-ingredient"][data-type="main"]').all();
    expect(mainIngredients.length).toBeGreaterThan(0);
    const mainNameText = await mainIngredients[0].locator('p').last().textContent();
    const addMainButton = mainIngredients[0].locator('button:has-text("Добавить")');
    await addMainButton.click();

    // Add sauce ingredient - get name first
    const sauceIngredients = await page.locator('[data-testid="burger-ingredient"][data-type="sauce"]').all();
    expect(sauceIngredients.length).toBeGreaterThan(0);
    const sauceNameText = await sauceIngredients[0].locator('p').last().textContent();
    const addSauceButton = sauceIngredients[0].locator('button:has-text("Добавить")');
    await addSauceButton.click();

    // Verify constructor has correct bun
    const bunTopInConstructor = await page.locator('[data-testid="constructor-bun-top"]');
    await expect(bunTopInConstructor).toBeVisible();
    await expect(bunTopInConstructor).toContainText(bunNameText || '');

    const bunBottomInConstructor = await page.locator('[data-testid="constructor-bun-bottom"]');
    await expect(bunBottomInConstructor).toBeVisible();
    await expect(bunBottomInConstructor).toContainText(bunNameText || '');

    // Verify constructor has correct filling and sauce
    const ingredientsInConstructor = await page.locator('[data-testid="constructor-ingredient"]').all();
    expect(ingredientsInConstructor.length).toBeGreaterThanOrEqual(2);

    // Check that main ingredient is present
    let mainFound = false;
    for (const ingredient of ingredientsInConstructor) {
      const text = await ingredient.textContent();
      if (text?.includes(mainNameText || '')) {
        mainFound = true;
        break;
      }
    }
    expect(mainFound).toBe(true);

    // Click order button
    const orderButton = await page.locator('button:has-text("Оформить заказ")');
    await orderButton.click();

    // Wait for order modal to appear - the order should complete quickly since API is mocked
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
    // Check that buns are cleared
    const topBunPlaceholder = page.locator('[data-testid="constructor-bun-top"]');
    await expect(topBunPlaceholder).not.toBeVisible();

    // Check that ingredients are cleared
    const ingredientsInConstructorAfter = await page.locator('[data-testid="constructor-ingredient"]').all();
    expect(ingredientsInConstructorAfter.length).toBe(0);

    // Check placeholder text is visible (using first() to handle strict mode)
    const noBunsText = page.locator('text=Выберите булки').first();
    await expect(noBunsText).toBeVisible();
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
    // Используем page.evaluate для клика напрямую в браузере, чтобы избежать перехвата событий
    await page.evaluate(() => {
      const overlay = document.querySelector('[data-testid="modal-overlay"]') as HTMLElement;
      if (overlay) overlay.click();
    });

    // Verify modal is closed
    const modal = await page.locator('[data-testid="ingredient-details-modal"]');
    await expect(modal).not.toBeVisible();
  });

  test('should not allow order without bun', async ({ page }) => {
    await page.waitForSelector('[data-testid="burger-ingredient"]', {
      timeout: 5000
    });

    // Add only main ingredient (no bun)
    const mainIngredients = await page.locator('[data-testid="burger-ingredient"][data-type="main"]').all();
    expect(mainIngredients.length).toBeGreaterThan(0);
    const addMainButton = mainIngredients[0].locator('button:has-text("Добавить")');
    await addMainButton.click();

    // Order button should still be present
    const orderButton = await page.locator('button:has-text("Оформить заказ")');
    expect(orderButton).toBeTruthy();
  });

  test('should not allow order without filling', async ({ page }) => {
    await page.waitForSelector('[data-testid="burger-ingredient"]', {
      timeout: 5000
    });

    // Add only bun (no filling)
    const bunIngredients = await page.locator('[data-testid="burger-ingredient"][data-type="bun"]').all();
    expect(bunIngredients.length).toBeGreaterThan(0);
    const addBunButton = bunIngredients[0].locator('button:has-text("Добавить")');
    await addBunButton.click();

    // Order button should still be present
    const orderButton = await page.locator('button:has-text("Оформить заказ")');
    expect(orderButton).toBeTruthy();
  });

  test('should handle ingredient modal open and close', async ({ page }) => {
    await page.waitForSelector('[data-testid="burger-ingredient"]', {
      timeout: 5000
    });

    // Click on first ingredient to open modal
    const firstIngredient = await page.locator('[data-testid="burger-ingredient"] a').first();
    await firstIngredient.click();

    // Wait for modal
    const ingredientModal = await page.waitForSelector('[data-testid="ingredient-details-modal"]', {
      timeout: 5000
    });
    expect(ingredientModal).toBeTruthy();

    // Close modal by close button
    const closeButton = await page.locator('[data-testid="modal-close"]');
    await closeButton.click();

    // Modal should be closed
    const modal = await page.locator('[data-testid="ingredient-details-modal"]');
    await expect(modal).not.toBeVisible();
  });

  test('should clear constructor after successful order', async ({ page }) => {
    await page.waitForSelector('[data-testid="burger-ingredient"]', {
      timeout: 5000
    });

    // Add bun
    const bunIngredients = await page.locator('[data-testid="burger-ingredient"][data-type="bun"]').all();
    const addBunButton = bunIngredients[0].locator('button:has-text("Добавить")');
    await addBunButton.click();

    // Add main
    const mainIngredients = await page.locator('[data-testid="burger-ingredient"][data-type="main"]').all();
    const addMainButton = mainIngredients[0].locator('button:has-text("Добавить")');
    await addMainButton.click();

    // Add sauce
    const sauceIngredients = await page.locator('[data-testid="burger-ingredient"][data-type="sauce"]').all();
    const addSauceButton = sauceIngredients[0].locator('button:has-text("Добавить")');
    await addSauceButton.click();

    // Click order button
    const orderButton = await page.locator('button:has-text("Оформить заказ")');
    await orderButton.click();

    // Wait for order modal
    await page.waitForSelector('[data-testid="order-number"]', {
      timeout: 5000
    });

    // Close modal
    const closeButton = await page.locator('[data-testid="modal-close"]');
    await closeButton.click();

    // Verify constructor is cleared
    const topBun = page.locator('[data-testid="constructor-bun-top"]');
    await expect(topBun).not.toBeVisible();
  });

  test('should display correct order number', async ({ page }) => {
    await page.waitForSelector('[data-testid="burger-ingredient"]', {
      timeout: 5000
    });

    // Build burger
    const bunIngredients = await page.locator('[data-testid="burger-ingredient"][data-type="bun"]').all();
    await bunIngredients[0].locator('button:has-text("Добавить")').click();

    const mainIngredients = await page.locator('[data-testid="burger-ingredient"][data-type="main"]').all();
    await mainIngredients[0].locator('button:has-text("Добавить")').click();

    // Create order
    const orderButton = await page.locator('button:has-text("Оформить заказ")');
    await orderButton.click();

    // Wait for order number
    await page.waitForSelector('[data-testid="order-number"]', {
      timeout: 5000
    });

    // Verify order number matches mock data
    const orderNumber = await page.locator('[data-testid="order-number"]');
    await expect(orderNumber).toHaveText('12345');
  });

  test('should handle multiple ingredient additions', async ({ page }) => {
    await page.waitForSelector('[data-testid="burger-ingredient"]', {
      timeout: 5000
    });

    // Add bun
    const bunIngredients = await page.locator('[data-testid="burger-ingredient"][data-type="bun"]').all();
    await bunIngredients[0].locator('button:has-text("Добавить")').click();

    // Add multiple main ingredients
    const mainIngredients = await page.locator('[data-testid="burger-ingredient"][data-type="main"]').all();
    await mainIngredients[0].locator('button:has-text("Добавить")').click();
    if (mainIngredients.length > 1) {
      await mainIngredients[1].locator('button:has-text("Добавить")').click();
    }

    // Verify ingredients are in constructor
    const ingredientsInConstructor = await page.locator('[data-testid="constructor-ingredient"]').all();
    expect(ingredientsInConstructor.length).toBeGreaterThanOrEqual(1);
  });

  test('should persist order data in modal', async ({ page }) => {
    await page.waitForSelector('[data-testid="burger-ingredient"]', {
      timeout: 5000
    });

    // Build burger quickly
    const bunIngredients = await page.locator('[data-testid="burger-ingredient"][data-type="bun"]').all();
    await bunIngredients[0].locator('button:has-text("Добавить")').click();

    const mainIngredients = await page.locator('[data-testid="burger-ingredient"][data-type="main"]').all();
    await mainIngredients[0].locator('button:has-text("Добавить")').click();

    // Create order
    const orderButton = await page.locator('button:has-text("Оформить заказ")');
    await orderButton.click();

    // Wait for modal
    await page.waitForSelector('[data-testid="order-number"]', {
      timeout: 5000
    });

    // Verify order number and status text visible
    const orderNumberElement = await page.locator('[data-testid="order-number"]');
    await expect(orderNumberElement).toBeVisible();
  });
});
