import { Config } from "jest";

export default {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["./jest.setup.ts"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  testMatch: ["**/__tests__/jest/**/*.(test|spec).[jt]s?(x)"],
  coveragePathIgnorePatterns: ["/node_modules/", "/dist/"],
} satisfies Config;
