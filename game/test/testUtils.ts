export const waitForPromiseResolution = (): Promise<void> => new Promise((resolve) => setImmediate(resolve));
