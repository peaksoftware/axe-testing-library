import axe from "axe-core";
import { JSDOM } from "jsdom";
import { AxeTester, type AxeTesterConfig } from ".";

export class JestAxeTester extends AxeTester<HTMLElement | string> {
  constructor(config: AxeTesterConfig = {}) {
    super(config);
  }

  async test(input: HTMLElement | string, runOptions?: axe.RunOptions) {
    const results = await axe.run(
      this.getElement(input),
      runOptions ? { ...this.axeRunOptions, ...runOptions } : this.axeRunOptions
    );
    return super.processResults(results);
  }

  /**
   * Returns an Element for the given input
   *
   * @param {HTMLElement|string} input - an HTML element or HTML string
   * @returns {Element}
   */
  private getElement(input: HTMLElement | string): Element {
    let element;

    if (input instanceof HTMLElement) {
      // If it's already an HTMLElement, use it directly
      element = input;
    } else if (typeof input === "string") {
      // Verify the input string is valid html
      // TODO: JSDOM is very lenient and will make bad html valid instead of throwing. should we even check?
      try {
        new JSDOM(`<!DOCTYPE html><body>${input}</body></html>`);
      } catch (error) {
        const msg = error instanceof Error ? error.message : "";
        throw new Error(`Failed to parse HTML string: ${msg}`);
      }

      // It's valid, replace the current body's inner html
      document.body.innerHTML = input;
      element = document.body;
    } else {
      throw new Error("Input must be an HTMLElement or a valid HTML string");
    }

    return element;
  }
}

/**
 * Jest matcher for accessibility testing
 */
export async function toBeAccessible(
  received: HTMLElement | string,
  options?: AxeTesterConfig
) {
  const tester = new JestAxeTester(options);
  const result = await tester.test(received);

  return {
    pass: result.passed,
    message: () => result.violationMessages.join("\n"),
  };
}

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeAccessible(options?: AxeTesterConfig): Promise<R>;
    }
  }
}
