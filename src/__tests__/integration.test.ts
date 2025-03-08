import { AxeTester, toBeAccessible } from "../index";

expect.extend({ toBeAccessible });

describe("AxeTester Integration Tests", () => {
  it("should properly detect accessibility violations in actual HTML", async () => {
    document.body.innerHTML = `
      <div>
        <h1>Hello World</h1>
        <img src="example.jpg"> <!-- Missing alt text -->
        <button></button> <!-- Empty button -->
      </div>
    `;

    const tester = new AxeTester();
    const result = await tester.test(document.body);

    expect(result.passed).toBe(false);
    expect(result.violations.length).toBeGreaterThan(0);

    const violationIds = result.violations.map((v) => v.id);
    expect(violationIds).toContain("image-alt");
    expect(violationIds).toContain("button-name");
    expect(violationIds).toContain("region");
  });

  it("should pass for accessible HTML", async () => {
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
