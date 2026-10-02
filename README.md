# CloudWebTesting

Playwright smoke tests for https://www.automationexercise.com/.

```bash
npm install
npx playwright install chromium
npm run test:smoke
npm run report   # open the HTML report
```

Coverage: home + navigation, products listing and search, product detail,
empty cart, login (invalid credentials), contact form, footer subscription.
