export {};

declare global {
  interface Array<T> {
    removeInPlace(predicate: (element: T) => boolean): void;
  }
}
