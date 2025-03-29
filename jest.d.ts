import { AxeTesterConfig } from "./src/core";

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeAccessible(options?: AxeTesterConfig): Promise<R>;
    }
  }
}
