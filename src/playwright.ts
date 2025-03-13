import type { Page } from "playwright";
import { AxeTester, AxeTesterConfig } from ".";
import axe from "axe-core";

export class PlaywrightAxeTester extends AxeTester<Page> {
  constructor(config: AxeTesterConfig = {}) {
    super(config);
  }

  async test(page: Page, runOptions?: axe.RunOptions) {
    const options = runOptions
      ? { ...this.axeRunOptions, ...runOptions }
      : this.axeRunOptions;

    // This loads axe into the page
    await page.evaluate(axe.source);

    const results = await page.evaluate(
      (options) => (window as any).axe.run(document, options),
      options
    );

    return super.processResults(results);
  }
}

export async function testPageAccessibility(
  page: Page,
  options?: AxeTesterConfig
) {
  const tester = new PlaywrightAxeTester();
  return tester.test(page, options);
}

export async function toBeAccessible(page: Page, options?: AxeTesterConfig) {
  const tester = new PlaywrightAxeTester(options);
  const result = await tester.test(page);

  return {
    pass: result.passed,
    message: () => result.violationMessages.join("\n"),
  };
}
