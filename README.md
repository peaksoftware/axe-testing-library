# aXe Testing Library

## Installation

```bash
npm install axe-testing-library
```

## Supported Test Runners

- Jest
- Playwright
- Puppeteer
- Mocha
- Jasmine
- And more!

## Usage

```ts
import { toBeAccessible } from "axe-testing-library";

// Extend Jest matchers
expect.extend({ toBeAccessible });

describe("Accessibility Tests", () => {
  it("should have no accessibility violations", async () => {
    const component = render(<MyComponent />);

    await expect(component.container).toBeAccessible({
      severityLevels: {
        critical: 15,
        serious: 8,
      },
      failFast: true,
    });
  });
});
```

## Configuration

## License

MIT
