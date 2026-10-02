import { test, expect, Page } from '@playwright/test';

// Block third-party ads that slow down the site and can overlay the page.
test.beforeEach(async ({ page }) => {
  await page.route(/googlesyndication|doubleclick|adservice|googletagmanager/, (route) => route.abort());
});

async function dismissConsent(page: Page) {
  const consent = page.getByRole('button', { name: /consent/i });
  if (await consent.isVisible().catch(() => false)) await consent.click();
}

test.describe('@smoke Automation Exercise', () => {
  test('home page loads with main navigation', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
    await dismissConsent(page);

    await expect(page).toHaveTitle(/Automation Exercise/);
    await expect(page.locator('img[alt="Website for automation practice"]')).toBeVisible();

    const nav = page.locator('.shop-menu');
    for (const link of ['Home', 'Products', 'Cart', 'Signup / Login', 'Test Cases', 'Contact us']) {
      await expect(nav.getByRole('link', { name: link })).toBeVisible();
    }
  });

  test('products page lists products and search works', async ({ page }) => {
    await page.goto('/products');
    await dismissConsent(page);

    await expect(page.getByRole('heading', { name: 'All Products' })).toBeVisible();
    await expect(page.locator('.features_items .product-image-wrapper').first()).toBeVisible();

    await page.locator('#search_product').fill('Top');
    await page.locator('#submit_search').click();

    await expect(page.getByRole('heading', { name: 'Searched Products' })).toBeVisible();
    const names = page.locator('.features_items .productinfo p');
    await expect(names.first()).toBeVisible();
    for (const name of await names.allTextContents()) {
      expect(name.toLowerCase()).toContain('top');
    }
  });

  test('product detail page shows product information', async ({ page }) => {
    await page.goto('/product_details/1');
    await dismissConsent(page);

    const info = page.locator('.product-information');
    await expect(info.locator('h2')).toHaveText('Blue Top');
    await expect(info).toContainText('Category');
    await expect(info).toContainText('Rs.');
    await expect(info.getByRole('button', { name: /add to cart/i })).toBeVisible();
  });

  test('empty cart is shown for a new visitor', async ({ page }) => {
    await page.goto('/view_cart');
    await dismissConsent(page);

    await expect(page.locator('#empty_cart')).toContainText('Cart is empty!');
  });

  test('login page shows forms and rejects invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await dismissConsent(page);

    await expect(page.getByRole('heading', { name: 'Login to your account' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'New User Signup!' })).toBeVisible();

    await page.locator('[data-qa="login-email"]').fill(`smoke_${Date.now()}@example.com`);
    await page.locator('[data-qa="login-password"]').fill('wrong-password');
    await page.locator('[data-qa="login-button"]').click();

    await expect(page.getByText('Your email or password is incorrect!')).toBeVisible();
  });

  test('contact us page loads the form', async ({ page }) => {
    await page.goto('/contact_us');
    await dismissConsent(page);

    await expect(page.getByRole('heading', { name: 'Get In Touch' })).toBeVisible();
    await expect(page.locator('[data-qa="name"]')).toBeVisible();
    await expect(page.locator('[data-qa="email"]')).toBeVisible();
    await expect(page.locator('[data-qa="message"]')).toBeVisible();
  });

  test('footer subscription succeeds', async ({ page }) => {
    await page.goto('/');
    await dismissConsent(page);

    await page.locator('#susbscribe_email').fill(`smoke_${Date.now()}@example.com`);
    await page.locator('#subscribe').click();

    await expect(page.locator('#success-subscribe')).toContainText('You have been successfully subscribed!');
  });
});
