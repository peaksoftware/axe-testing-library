import type { Locator, Page } from "playwright";
import { AxeTester, AxeTesterConfig } from ".";
import axe from "axe-core";

export class PlaywrightAxeTester extends AxeTester<Page | Locator | string> {
  constructor(config: AxeTesterConfig = {}) {
    super(config);
  }

  private static async pageToHtml(page: Page): Promise<string> {
    return page.content();
  }

  private static async locatorToHtml(locator: Locator): Promise<string> {
    return locator.innerHTML();
  }

  private static isPage(input: Page | Locator): input is Page {
    return "goto" in input && typeof input.goto === "function";
  }

  private static isLocator(input: Page | Locator): input is Locator {
    return (
      "click" in input &&
      typeof input.click === "function" &&
      !this.isPage(input)
    );
  }

  async test(input: Page | Locator | string, runOptions?: axe.RunOptions) {
    if (typeof input === "string") {
      return super.runAxe(input, runOptions);
    }

    let html;
    if (PlaywrightAxeTester.isLocator(input)) {
      html = await PlaywrightAxeTester.locatorToHtml(input);
    } else if (PlaywrightAxeTester.isPage(input)) {
      html = await PlaywrightAxeTester.pageToHtml(input);
    } else {
      throw new Error("input is not a page, locator, or string");
    }

    return super.runAxe(html, runOptions);
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
