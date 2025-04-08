import axe from "axe-core";
import chalk from "chalk";

type Config = {
  /**
   * Custom severity levels for violations
   */
  severityLevels?: Record<NonNullable<axe.ImpactValue>, number>;

  /**
   * Whether to throw on first violation
   */
  failFast?: boolean;

  /**
   * Custom reporter function
   */
  customReporter?: (results: AxeTestResult) => void;

  /**
   * Custom violation message function
   */
  formatMessage?: (violation: axe.Result) => string;
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
  protected axeRunOptions: axe.RunOptions;
  protected axeTesterConfig: Config;

  constructor({
    severityLevels = {
      critical: 10,
      serious: 5,
      moderate: 3,
      minor: 1,
    },
    failFast = false,
    customReporter,
    formatMessage,
    ...runOptions
  }: AxeTesterConfig = {}) {
    this.axeTesterConfig = {
      severityLevels,
      failFast,
      customReporter,
      formatMessage,
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

  protected processResults(results: axe.AxeResults) {
    const result = {
      ...results,
      passed: results.violations.length === 0,
      violationsByImpact: results.violations.reduce<
        Record<string, axe.Result[]>
      >((acc, violation) => {
        const impact = violation.impact ?? "unknown";
        acc[impact] = [...(acc[impact] || []), violation];
        return acc;
      }, {}),
      violationMessages: results.violations.map(
        this.axeTesterConfig.formatMessage
          ? this.axeTesterConfig.formatMessage
          : (v) => {
              const impactColor = {
                critical: chalk.red,
                serious: chalk.magenta,
                moderate: chalk.yellow,
                minor: chalk.blue,
                unknown: chalk.cyan,
              }[v.impact ?? "unknown"];

              return impactColor(
                `${impactColor.bold(v.impact?.toUpperCase())}: ${
                  v.description
                }. \nSee ${impactColor.underline(v.helpUrl)} (Rule ID: ${v.id})`
              );
            }
      ),
      severityScore: results.violations.reduce((score, violation) => {
        const impact =
          this.axeTesterConfig.severityLevels?.[violation.impact || "minor"] ||
          1;
        return score + impact;
      }, 0),
    };

    if (this.axeTesterConfig.customReporter) {
      this.axeTesterConfig.customReporter(result);
    }

    if (this.axeTesterConfig.failFast && results.violations.length > 0) {
      throw new Error("Accessibility violations detected");
    }

    return result;
  }
}
