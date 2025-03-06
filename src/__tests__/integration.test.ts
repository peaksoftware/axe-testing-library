// src/__tests__/integration.test.ts
import axe from "axe-core";
import { AxeTester, toBeAccessible } from "../index";
import { JSDOM } from "jsdom";

// Extend Jest's matchers
expect.extend({ toBeAccessible });

describe("AxeTester Integration Tests", () => {
  beforeEach(() => {
    // Setup a minimal JSDOM environment
    let dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Test Page</title>
        </head>
        <body>
          <div id="root"></div>
        </body>
      </html>
    `);

    // Mock global window and document for axe-core
    global.window = dom.window as unknown as Window & typeof globalThis;
    global.document = dom.window.document;
  });

  // afterEach(() => {
  //   // Clean up
  //   delete (global as any).window;
  //   delete (global as any).document;
  // });

  it("should properly detect accessibility violations in actual HTML", async () => {
    // Create a div with accessibility issues (image without alt text)
    const container = document.getElementById("root")!;
    container.innerHTML = `
      <div>
        <h1>Hello World</h1>
        <img src="example.jpg"> <!-- Missing alt text -->
        <button></button> <!-- Empty button -->
      </div>
    `;

    // Create a tester instance
    const tester = new AxeTester();

    // Test the container
    const result = await tester.test(container);

    // Assert
    expect(result.passed).toBe(false);
    expect(result.violations.length).toBeGreaterThan(0);

    // Check for specific violation types
    const violationIds = result.violations.map((v) => v.id);
    expect(violationIds).toContain("image-alt");
  });

  it("should pass for accessible HTML", async () => {
    // Create accessible HTML
    const container = document.getElementById("root")!;
    container.innerHTML = `
      <div>
        <h1>Hello World</h1>
        <img src="example.jpg" alt="Example image">
        <button aria-label="Click me">Click</button>
      </div>
    `;

    // Test with the matcher
    await expect(container).toBeAccessible();
  });

  it("should handle custom rules", async () => {
    // Create HTML with specific structure
    const container = document.getElementById("root")!;
    container.innerHTML = `
      <div>
        <h1>Title</h1>
        <p>Some content</p>
        <table>
          <tr><td>Data</td></tr>
        </table>
      </div>
    `;

    // Test with custom rules (disable certain checks)
    const tester = new AxeTester({
      rules: {
        "table-fake-caption": { enabled: false },
      },
    });

    const result = await tester.test(container);

    // Check if our rule was applied
    expect(
      axe
        .getRules()
        .some((r: any) => r.id === "table-fake-caption" && !r.enabled)
    ).toBe(true);
  });
});
