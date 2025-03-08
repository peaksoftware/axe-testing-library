import axe from "axe-core";
import { JSDOM } from "jsdom";
import { type Page } from "playwright-core";

type Config = {
  /**
   * Custom severity levels for violations
   */
  severityLevels?: {
    critical?: number;
    serious?: number;
    moderate?: number;
    minor?: number;
  };

  /**
   * Whether to throw on first violation
   */
  failFast?: boolean;

  /**
   * Custom reporter function
   */
  customReporter?: (results: AxeTestResult) => void;
};

export type AxeTesterConfig = Config & axe.RunOptions;

/**
 * Structured result of accessibility testing
 */
export interface AxeTestResult extends axe.AxeResults {
  passed: boolean;
  violations: axe.Result[];
  violationsByImpact: Record<string, axe.Result[]>;
  violationMessages: string[];
  severityScore: number;
}

/**
 * Accessibility Testing Class
 */
export class AxeTester<TInput> {
  private axeRunOptions: axe.RunOptions;
  private axeTesterConfig: Config;

  constructor({
    severityLevels = {
      critical: 10,
      serious: 5,
      moderate: 3,
      minor: 1,
    },
    failFast = false,
    customReporter,
    ...runOptions
  }: AxeTesterConfig = {}) {
    this.axeTesterConfig = {
      severityLevels,
      failFast,
      customReporter,
    };
    this.axeRunOptions = runOptions;
  }

  /**
   * Tests an HTML element or HTML string for accessibility issues
   *
   * @param {TInput} input - The HTML element or HTML string to test
   * @param {axe.RunOptions} runOptions - Optional custom run options for one-off testing
   * @returns {Promise<AxeTestResult>} - Results from axe testing
   */
  async test(
    input: TInput,
    runOptions?: axe.RunOptions
  ): Promise<AxeTestResult> {
    throw new Error("the test() method must be implemented");
  }

  /**
   * Tests an HTML element or HTML string for accessibility issues
   *
   * @param {HTMLElement|string} input - The HTML element or HTML string to test
   * @param {axe.RunOptions} runOptions - Optional custom run options for one-off testing
   * @returns {Promise<AxeTestResult>} - Results from axe testing
   */
  protected async runAxe(
    input: HTMLElement | string,
    runOptions?: axe.RunOptions
  ): Promise<AxeTestResult> {
    const results = await axe.run(
      this.getElement(input),
      runOptions ? { ...this.axeRunOptions, ...runOptions } : this.axeRunOptions
    );
    return this.processResults(results);
  }

  /**
   * Returns an Element for the given input
   *
   * @param {HTMLElement|string} input - an HTML element or HTML string
   * @returns {Element}
   */
  private getElement(input: HTMLElement | string): Element {
    let element;

    if (typeof input === "string") {
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
    } else if (input instanceof HTMLElement) {
      // If it's already an HTMLElement, use it directly
      element = input;
    } else {
      throw new Error("Input must be an HTMLElement or a valid HTML string");
    }

    return element;
  }

  private processResults(results: axe.AxeResults) {
    const result = {
      ...results,
      passed: results.violations.length === 0,
      violationsByImpact: results.violations.reduce<
        Record<string, axe.Result[]>
      >((acc, violation) => {
        const impact = violation.impact || "unknown";
        acc[impact] = [...(acc[impact] || []), violation];
        return acc;
      }, {}),
      violationMessages: results.violations.map(
        (v) => `${v.impact?.toUpperCase()}: ${v.description} (${v.helpUrl})`
      ),
      severityScore: this.calculateSeverityScore(results.violations),
    };

    if (this.axeTesterConfig.customReporter) {
      this.axeTesterConfig.customReporter(result);
    }

    if (this.axeTesterConfig.failFast && results.violations.length > 0) {
      throw new Error("Accessibility violations detected");
    }

    return result;
  }

  private calculateSeverityScore(violations: axe.Result[]) {
    return violations.reduce((score, violation) => {
      const impact =
        this.axeTesterConfig.severityLevels?.[violation.impact || "minor"] || 1;
      return score + impact;
    }, 0);
  }
}
