module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["./jest.setup.js"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  testMatch: ["**/__tests__/**/*.(test|spec).[jt]s?(x)"],
  coveragePathIgnorePatterns: ["/node_modules/", "/dist/"],
};
