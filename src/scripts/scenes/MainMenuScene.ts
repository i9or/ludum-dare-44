import "phaser";
import { ILifecycle } from "./Lifecycle";

export class MainMenuScene extends Phaser.Scene implements ILifecycle {
  constructor() {
    super({
      key: "MainMenuScene"
    });
  }

  public preload(): void {
    throw new Error("Method not implemented.");
  }
  public create(): void {
    throw new Error("Method not implemented.");
  }

  public update(time: number, delta: number): void {
    throw new Error("Method not implemented.");
  }
}
