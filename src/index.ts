import axe from "axe-core";

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

type AxeTesterConfig = Config & axe.RunOptions;

/**
 * Structured result of accessibility testing
 */
export interface AxeTestResult {
  passed: boolean;
  violations: axe.Result[];
  violationsByImpact: Record<string, axe.Result[]>;
  violationMessages: string[];
  severityScore: number;
}

/**
 * Accessibility Testing Class
 */
export class AxeTester {
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
   * Run accessibility checks on a DOM element
   * @param element - HTML element to test
   * @param customRules - Optional custom Axe rules
   */
  async test(element: HTMLElement, customRules?: axe.RuleObject) {
    const results = await axe.run(
      element,
      customRules
        ? { ...this.axeRunOptions, rules: customRules }
        : this.axeRunOptions
    );
    return this.processResults(results);
  }

  /**
   * Process Axe results and generate enhanced report
   */
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

  /**
   * Calculate a severity score based on violations
   */
  private calculateSeverityScore(violations: axe.Result[]) {
    return violations.reduce((score, violation) => {
      const impactMultiplier =
        this.axeTesterConfig.severityLevels?.[violation.impact || "minor"] || 1;
      return score + impactMultiplier;
    }, 0);
  }
}

/**
 * Jest matcher for accessibility testing
 */
export async function toBeAccessible(
  received: HTMLElement,
  options?: AxeTesterConfig
) {
  const tester = new AxeTester(options);
  const result = await tester.test(received);

  return {
    pass: result.passed,
    message: () => result.violationMessages.join("\n"),
  };
}

// Extend Jest's expect with custom matcher
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeAccessible(options?: AxeTesterConfig): Promise<R>;
    }
  }
}

export default AxeTester;
