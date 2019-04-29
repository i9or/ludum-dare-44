import "phaser";
import { ILifecycle } from "./Lifecycle";

import loadScreen from "../../assets/images/screen_1.png";

export class MainMenuScene extends Phaser.Scene implements ILifecycle {
  constructor() {
    super({
      key: "MainMenuScene"
    });
  }

  public preload(): void {
    this.load.image("loadScreen", loadScreen);
  }
  public create(): void {
    this.scene.start("LoadingScene");
  }

  public update(time: number, delta: number): void {
    // throw new Error("Method not implemented.");
  }
}
