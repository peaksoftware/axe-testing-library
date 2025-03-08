import axe from "axe-core";
import { AxeTester, type AxeTesterConfig } from ".";

export class JestAxeTester extends AxeTester<HTMLElement | string> {
  constructor(config: AxeTesterConfig = {}) {
    super(config);
  }

  async test(input: HTMLElement | string, runOptions?: axe.RunOptions) {
    return super.runAxe(input, runOptions);
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
