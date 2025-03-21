import { AxeTesterConfig } from ".";
import { JSDOMAxeTester } from "./jsdom";

/**
 * Vitest matcher for accessibility testing
 */
export async function toBeAccessible(
  received: HTMLElement | string,
  options?: AxeTesterConfig
) {
  const tester = new JSDOMAxeTester(options);
  const result = await tester.test(received);

  return {
    pass: result.passed,
    message: () => result.violationMessages.join("\n"),
  };
}
