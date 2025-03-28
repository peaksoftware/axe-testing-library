import { JSDOMAxeTester } from "../../jsdom";
import { toBeAccessible } from "../../vitest";
import { expect, describe, it } from "vitest";

expect.extend({ toBeAccessible });

describe("JSDOMAxeTester integration tests for vitest", () => {
  async function assertViolations(input: HTMLElement | string) {
    const tester = new JSDOMAxeTester();
    const result = await tester.test(input);

    expect(result.passed).toBe(false);
    expect(result.violations.length).toBeGreaterThan(0);

    const violationIds = result.violations.map((v) => v.id);
    expect(violationIds).toContain("image-alt");
    expect(violationIds).toContain("button-name");
    expect(violationIds).toContain("region");
  }

  describe("with element", () => {
    it("should detect accessibility violations in html", async () => {
      document.body.innerHTML = `
        <div>
          <h1>Hello World</h1>
          <img src="example.jpg"> <!-- Missing alt text -->
          <button></button> <!-- Empty button -->
        </div>
      `;

      await assertViolations(document.body);
    });

    it("should pass for accessible html", async () => {
      document.body.innerHTML = `
        <main>
          <h1>Hello World</h1>
          <img src="example.jpg" alt="Example image">
          <button aria-label="Click me">Click</button>
        </main>
      `;

      await expect(document.body).toBeAccessible();
    });

    it("should handle custom rules", async () => {
      document.body.innerHTML = `
        <div>
          <h1>Title</h1>
          <p>Some content</p>
          <table>
            <tr><td>Data</td></tr>
          </table>
        </div>
      `;

      await expect(document.body).not.toBeAccessible();
      await expect(document.body).toBeAccessible({
        rules: { region: { enabled: false } },
      });
    });
  });

  describe("with html string", () => {
    it("should detect accessibility violations in html", async () => {
      const htmlString = `
        <div>
          <h1>Hello World</h1>
          <img src="example.jpg"> <!-- Missing alt text -->
          <button></button> <!-- Empty button -->
        </div>
      `;

      await assertViolations(htmlString);
    });

    it("should pass for accessible html", async () => {
      const htmlString = `
        <main>
          <h1>Hello World</h1>
          <img src="example.jpg" alt="Example image">
          <button aria-label="Click me">Click</button>
        </main>
      `;

      await expect(htmlString).toBeAccessible();
    });

    it("should handle custom rules", async () => {
      const htmlString = `
        <div>
          <h1>Title</h1>
          <p>Some content</p>
          <table>
            <tr><td>Data</td></tr>
          </table>
        </div>
      `;

      await expect(htmlString).not.toBeAccessible();
      await expect(htmlString).toBeAccessible({
        rules: { region: { enabled: false } },
      });
    });
  });
});
