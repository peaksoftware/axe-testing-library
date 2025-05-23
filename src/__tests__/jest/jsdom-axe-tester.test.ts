import axe from "axe-core";
import stripAnsi from "strip-ansi";
import { toBeAccessible } from "../../jest";
import { JSDOMAxeTester } from "../../jsdom";

jest.mock("axe-core", () => ({
  run: jest.fn(),
}));

expect.extend({ toBeAccessible });

describe("JSDOMAxeTester", () => {
  let element: HTMLElement;
  let htmlString: string;

  beforeEach(() => {
    jest.clearAllMocks();
    htmlString = "<div></div>";
    element = document.createElement("div");
  });

  describe("test()", () => {
    it("should call axe.run with the element and config", async () => {
      const tester = new JSDOMAxeTester({ reporter: "v2" });
      const mockResults: Partial<axe.AxeResults> = {
        violations: [],
        passes: [],
        incomplete: [],
        inapplicable: [],
      };

      (axe.run as jest.Mock).mockResolvedValue(mockResults);

      await tester.test(element);

      expect(axe.run).toHaveBeenCalledWith(
        element,
        expect.objectContaining({ reporter: "v2" })
      );
    });

    it("should call customReporter when provided", async () => {
      const customReporter = jest.fn();
      const tester = new JSDOMAxeTester({ customReporter });

      const mockResults: Partial<axe.AxeResults> = {
        violations: [],
        passes: [],
        incomplete: [],
        inapplicable: [],
      };

      (axe.run as jest.Mock).mockResolvedValue(mockResults);

      await tester.test(element);

      expect(customReporter).toHaveBeenCalledWith(
        expect.objectContaining({
          passed: true,
          violations: [],
        })
      );
    });

    async function shouldProcessAndReturnViolationResultsCorrectly(
      input: HTMLElement | string
    ) {
      const tester = new JSDOMAxeTester();
      const mockViolation: Partial<axe.Result> = {
        id: "test-violation",
        impact: "serious",
        description: "Test violation",
        helpUrl: "https://example.com/help",
        nodes: [],
      };

      const mockResults: Partial<axe.AxeResults> = {
        violations: [mockViolation as axe.Result],
        passes: [],
        incomplete: [],
        inapplicable: [],
      };

      (axe.run as jest.Mock).mockResolvedValue(mockResults);

      const result = await tester.test(input);

      expect(result.passed).toBe(false);
      expect(result.violations).toHaveLength(1);
      expect(result.violationsByImpact).toHaveProperty("serious");
      expect(stripAnsi(result.violationMessages[0])).toMatch(
        /SERIOUS: Test violation/
      );
      expect(result.severityScore).toBe(5); // Based on default severity levels
    }

    describe("with element", () => {
      it("should process and return violation results correctly", async () => {
        await shouldProcessAndReturnViolationResultsCorrectly(element);
      });
    });

    describe("with html string", () => {
      it("should process and return violation results correctly", async () => {
        await shouldProcessAndReturnViolationResultsCorrectly(htmlString);
      });
    });
  });

  describe("toBeAccessible matcher", () => {
    it("should pass custom options to JSDOMAxeTester", async () => {
      const mockResults: Partial<axe.AxeResults> = {
        violations: [],
        passes: [],
        incomplete: [],
        inapplicable: [],
      };

      (axe.run as jest.Mock).mockResolvedValue(mockResults);

      await expect(element).toBeAccessible({
        rules: { "color-contrast": { enabled: false } },
      });

      expect(axe.run).toHaveBeenCalledWith(
        element,
        expect.objectContaining({
          rules: { "color-contrast": { enabled: false } },
        })
      );
    });

    async function shouldPassWhenNoViolationsExist(
      input: HTMLElement | string
    ) {
      const mockResults: Partial<axe.AxeResults> = {
        violations: [],
        passes: [],
        incomplete: [],
        inapplicable: [],
      };

      (axe.run as jest.Mock).mockResolvedValue(mockResults);

      await expect(input).toBeAccessible();
    }

    async function shouldFailWhenViolationsExist(input: HTMLElement | string) {
      const mockViolation: Partial<axe.Result> = {
        id: "test-violation",
        impact: "moderate",
        description: "Test violation",
        helpUrl: "https://example.com/help",
        nodes: [],
      };

      const mockResults: Partial<axe.AxeResults> = {
        violations: [mockViolation as axe.Result],
        passes: [],
        incomplete: [],
        inapplicable: [],
      };

      (axe.run as jest.Mock).mockResolvedValue(mockResults);

      let error;
      try {
        await expect(input).toBeAccessible();
      } catch (e) {
        error = e;
      }

      expect(error).toBeDefined();
      expect(stripAnsi((error as Error).message)).toMatch(
        /MODERATE: Test violation/
      );
    }

    describe("with element", () => {
      it("should pass when no violations exist", async () => {
        await shouldPassWhenNoViolationsExist(element);
      });

      it("should fail when violations exist", async () => {
        await shouldFailWhenViolationsExist(element);
      });
    });

    describe("with html string", () => {
      it("should pass when no violations exist", async () => {
        await shouldPassWhenNoViolationsExist(htmlString);
      });

      it("should fail when violations exist", async () => {
        await shouldFailWhenViolationsExist(htmlString);
      });
    });
  });
});
