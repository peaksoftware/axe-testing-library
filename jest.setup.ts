import { TextEncoder, TextDecoder } from "util";

// See https://github.com/jsdom/jsdom/issues/2524
Object.assign(global, { TextDecoder, TextEncoder });

HTMLCanvasElement.prototype.getContext = jest.fn();
