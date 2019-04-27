export interface ILifecycle {
  preload(): void;
  create(): void;
  update(time: number, delta: number): void;
}
