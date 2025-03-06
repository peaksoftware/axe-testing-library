import axe from "axe-core";
import { AxeTester, toBeAccessible } from "../index";

// Extend Jest's matchers
expect.extend({ toBeAccessible });

describe("AxeTester Integration Tests", () => {
  it("should properly detect accessibility violations in actual HTML", async () => {
    // Insert a div with accessibility issues (image without alt text)
    document.body.innerHTML = `
      <div>
        <h1>Hello World</h1>
        <img src="example.jpg"> <!-- Missing alt text -->
        <button></button> <!-- Empty button -->
      </div>
    `;

    // Create a tester instance
    const tester = new AxeTester();

    // Test the container
    const result = await tester.test(document.body);

    // Assert
    expect(result.passed).toBe(false);
    expect(result.violations.length).toBeGreaterThan(0);

    // Check for specific violation types
    const violationIds = result.violations.map((v) => v.id);
    expect(violationIds).toContain("image-alt");
  });

  it("should pass for accessible HTML", async () => {
    // Create accessible HTML
    document.body.innerHTML = `
      <main>
        <h1>Hello World</h1>
        <img src="example.jpg" alt="Example image">
        <button aria-label="Click me">Click</button>
      </main>
    `;

    // Test with the matcher
    await expect(document.body).toBeAccessible();
  });

  it("should handle custom rules", async () => {
    // Create HTML with specific structure
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

    // result.violations.forEach((v) => console.log(v));
  });
});
