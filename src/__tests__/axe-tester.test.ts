// src/__tests__/axe-tester.test.ts
import axe from "axe-core";
import { AxeTester, toBeAccessible } from "../index";

// Mock axe-core
jest.mock("axe-core", () => ({
  run: jest.fn(),
}));

// Extend Jest's matchers
expect.extend({ toBeAccessible });

describe("AxeTester", () => {
  let element: HTMLElement;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create a simple div for testing
    element = document.createElement("div");
  });

  describe("test()", () => {
    it("should call axe.run with the element and config", async () => {
      // Setup
      const tester = new AxeTester({ reporter: "v2" });
      const mockResults: Partial<axe.AxeResults> = {
        violations: [],
        passes: [],
        incomplete: [],
        inapplicable: [],
      };

      (axe.run as jest.Mock).mockResolvedValue(mockResults);

      // Execute
      await tester.test(element);

      // Assert
      expect(axe.run).toHaveBeenCalledWith(
        element,
        expect.objectContaining({ reporter: "v2" })
      );
    });

    it("should process and return violation results correctly", async () => {
      // Setup
      const tester = new AxeTester();
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

      // Execute
      const result = await tester.test(element);

      // Assert
      expect(result.passed).toBe(false);
      expect(result.violations).toHaveLength(1);
      expect(result.violationsByImpact).toHaveProperty("serious");
      expect(result.violationMessages[0]).toMatch(/SERIOUS: Test violation/);
      expect(result.severityScore).toBe(5); // Based on default severity levels
    });

    it("should call customReporter when provided", async () => {
      // Setup
      const customReporter = jest.fn();
      const tester = new AxeTester({ customReporter });

      const mockResults: Partial<axe.AxeResults> = {
        violations: [],
        passes: [],
        incomplete: [],
        inapplicable: [],
      };

      (axe.run as jest.Mock).mockResolvedValue(mockResults);

      // Execute
      await tester.test(element);

      // Assert
      expect(customReporter).toHaveBeenCalledWith(
        expect.objectContaining({
          passed: true,
          violations: [],
        })
      );
    });

    it("should throw when failFast is true and violations exist", async () => {
      // Setup
      const tester = new AxeTester({ failFast: true });

      const mockViolation: Partial<axe.Result> = {
        id: "test-violation",
        impact: "critical",
        description: "Critical violation",
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

      // Execute & Assert
      await expect(tester.test(element)).rejects.toThrow(
        "Accessibility violations detected"
      );
    });
  });

  describe("toBeAccessible matcher", () => {
    it("should pass when no violations exist", async () => {
      // Setup
      const mockResults: Partial<axe.AxeResults> = {
        violations: [],
        passes: [],
        incomplete: [],
        inapplicable: [],
      };

      (axe.run as jest.Mock).mockResolvedValue(mockResults);

      // Execute & Assert
      await expect(element).toBeAccessible();
    });

    it("should fail when violations exist", async () => {
      // Setup
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

      // Execute
      let error;
      try {
        await expect(element).toBeAccessible();
      } catch (e) {
        error = e;
      }

      // Assert
      expect(error).toBeDefined();
      expect((error as Error).message).toMatch(/MODERATE: Test violation/);
    });

    it("should pass custom options to AxeTester", async () => {
      // Setup
      const mockResults: Partial<axe.AxeResults> = {
        violations: [],
        passes: [],
        incomplete: [],
        inapplicable: [],
      };

      (axe.run as jest.Mock).mockResolvedValue(mockResults);

      // Execute
      await expect(element).toBeAccessible({
        rules: { "color-contrast": { enabled: false } },
      });

      // Assert
      expect(axe.run).toHaveBeenCalledWith(
        element,
        expect.objectContaining({
          rules: { "color-contrast": { enabled: false } },
        })
      );
    });
  });
});
