import "vitest";
import { AxeTesterConfig } from "./src/core";

interface CustomMatchers<R = unknown> {
  toBeAccessible: (options?: AxeTesterConfig) => R;
}

declare module "vitest" {
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}
