# axe-testing-library

Extensions for automated [aXe](https://github.com/dequelabs/axe-core) accessibility testing for popular test tooling.

## Features

- Test matchers for Jest, Vitest, and Playwright
- One-line setup
- Customizable with full access to aXe's [run options](https://www.deque.com/axe/core-documentation/api-documentation/#options-parameter) if needed
- TypeScript types included

Support for more testing tools like Cypress, Puppeteer, Jasmine, and Mocha are planned to be added!

## Installation

```bash
npm install axe-testing-library
```

This library assumes you have already installed the dependencies required by the test framework you are using. For Jest and Vite, you must be using JSDOM as the test environment. This is on by default with Jest, but [Vitest requires a configuration change](https://vitest.dev/config/#environment).

## Usage

This library provides an entrypoint for each supported testing framework. Import the one you need.

### Jest

```tsx
import { toBeAccessible } from "axe-testing-library/jest";

expect.extend({ toBeAccessible });

test("should be accessible", async () => {
  const htmlString = `
    <main>
      <h1>Hello World</h1>
      <img src="example.jpg" alt="Example image">
      <button>Click</button>
    </main>
  `;

  await expect(htmlString).toBeAccessible();
});

// Usage with React Testing Library
import { render } from "@testing-library/react";

test("should work with react", async () => {
  const { container } = render(<MyComponent />);
  await expect(container).toBeAccessible();
});
```

### Vitest

```typescript
import { toBeAccessible } from "axe-testing-library/vitest";
import { it, expect } from "vitest";

expect.extend({ toBeAccessible });

it("should be accessible", async () => {
  const htmlString = `
    <main>
      <h1>Hello World</h1>
      <img src="example.jpg" alt="Example image">
      <button>Click</button>
    </main>
  `;
  await expect(htmlString).toBeAccessible();
});
```

### Playwright

```javascript
import { toBeAccessible } from "axe-testing-library/playwright";
import { test, expect as baseExpect } from "@playwright/test";

const expect = baseExpect.extend({ toBeAccessible });

test("should be accessible", async ({ page }) => {
  await expect(page).toBeAccessible();
});
```

## Configuration

Pass [axe run options](https://www.deque.com/axe/core-documentation/api-documentation/#options-parameter) to customize checks:

```typescript
// Turn off the region rule
await expect(document.body).toBeAccessible({
  rules: { region: { enabled: false } },
});
```

You can see the full list of rules [here](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md).

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for how to report issues or submit changes.

## License

MIT © [Peak Software](https://github.com/peaksoftware)
