# aXe Testing Library

## Installation

```bash
npm install axe-testing-library
```

## Supported Test Runners

- [x] Jest
- [x] Vitest
- [x] Playwright
- [ ] Puppeteer
- [ ] Mocha
- [ ] Jasmine

And more coming soon!

## Usage

```ts
import { toBeAccessible } from "axe-testing-library";

// Extend Jest matchers
expect.extend({ toBeAccessible });

describe("Accessibility Tests", () => {
  it("should have no accessibility violations", async () => {
    const component = render(<MyComponent />);
    await expect(component.container).toBeAccessible();
  });
});
```

## Configuration

## License

MIT
