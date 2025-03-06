import * as axe from "axe-core";

/**
 * Enhanced configuration options for accessibility testing
 */
export interface AxeTestConfig extends axe.RunOptions {
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
}

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
  private config: AxeTestConfig;

  constructor(config: AxeTestConfig = {}) {
    this.config = {
      severityLevels: {
        critical: 10,
        serious: 5,
        moderate: 3,
        minor: 1,
      },
      failFast: false,
      ...config,
    };
  }

  /**
   * Run accessibility checks on a DOM element
   * @param element - HTML element to test
   * @param customRules - Optional custom Axe rules
   */
  async test(element: HTMLElement, customRules?: axe.RuleObject) {
    const results = await axe.run(element, {
      ...this.config,
      rules: customRules ?? this.config.rules,
    });

    return this.processResults(results);
  }

  /**
   * Process Axe results and generate enhanced report
   */
  private processResults(results: axe.AxeResults) {
    const violations = results.violations;

    const violationsByImpact = violations.reduce<Record<string, axe.Result[]>>(
      (acc, violation) => {
        const impact = violation.impact || "unknown";
        acc[impact] = [...(acc[impact] || []), violation];
        return acc;
      },
      {}
    );

    const severityScore = this.calculateSeverityScore(violations);

    const result = {
      passed: violations.length === 0,
      violations,
      violationsByImpact,
      violationMessages: violations.map(
        (v) => `${v.impact?.toUpperCase()}: ${v.description} (${v.helpUrl})`
      ),
      severityScore,
    };

    if (this.config.customReporter) {
      this.config.customReporter(result);
    }

    if (this.config.failFast && violations.length > 0) {
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
        this.config.severityLevels?.[violation.impact || "minor"] || 1;
      return score + impactMultiplier;
    }, 0);
  }
}

/**
 * Jest matcher for accessibility testing
 */
export async function toBeAccessible(
  received: HTMLElement,
  options?: AxeTestConfig
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
      toBeAccessible(options?: AxeTestConfig): Promise<R>;
    }
  }
}

export default AxeTester;
