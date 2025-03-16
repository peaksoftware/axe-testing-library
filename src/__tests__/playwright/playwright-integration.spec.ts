import {
  test,
  expect as baseExpect,
  chromium,
  type Page,
  type Browser,
} from "@playwright/test";
import { PlaywrightAxeTester, toBeAccessible } from "../../playwright";

const expect = baseExpect.extend({ toBeAccessible });

let browser: Browser;
let page: Page;

test.beforeAll(async () => {
  browser = await chromium.launch();
});

test.afterAll(async () => {
  await browser.close();
});

test.beforeEach(async () => {
  page = await browser.newPage();
});

test.afterEach(async () => {
  await page.close();
});

test("should detect accessibility violations in html with test()", async () => {
  await page.setContent(`
      <html lang="en">
        <body>
          <div>
            <h1>Hello World</h1>
            <img src="example.jpg"> <!-- Missing alt text -->
            <button></button> <!-- Empty button -->
          </div>
        </body>
      </html>
    `);

  const tester = new PlaywrightAxeTester();
  const result = await tester.test(page);

  expect(result.passed).toBe(false);
  expect(result.violations.length).toBeGreaterThan(0);

  const violationIds = result.violations.map((v) => v.id);
  expect(violationIds).toContain("image-alt");
  expect(violationIds).toContain("button-name");
  expect(violationIds).toContain("region");
});

test("should pass for accessible html", async () => {
  await page.setContent(`
      <html lang="en">
        <title>Hello World</title>
        <body>
          <main>
            <h1>Hello World</h1>
            <img src="example.jpg" alt="Example image">
            <button aria-label="Click me">Click</button>
          </main>
        </body>
      </html>
    `);

  await expect(page).toBeAccessible();
});

test("should handle custom rules", async () => {
  await page.setContent(`
      <html lang="en">
        <title>Hello World</title>
        <body>
          <div>
            <h1>Title</h1>
            <p>Some content</p>
            <table>
              <tr><td>Data</td></tr>
            </table>
          </div>
        </body>
      </html>
    `);

  await expect(page).not.toBeAccessible();
  await expect(page).toBeAccessible({
    rules: {
      "landmark-one-main": { enabled: false },
      region: { enabled: false },
    },
  });
});

test("handles iframes correctly", async () => {
  await page.setContent(`
      <html lang="en">
        <body>
          <iframe srcdoc="<input type='text'>" title="Input frame"></iframe>
        </body>
      </html>
    `);
});
