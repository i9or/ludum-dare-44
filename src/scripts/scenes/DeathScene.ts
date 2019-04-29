import "phaser";
import { ILifecycle } from "./Lifecycle";

export class DeathScene extends Phaser.Scene implements ILifecycle {
  constructor() {
    super({
      key: "DeathScene"
    });
  }

  public preload(): void {}

  public create(): void {
    const deathText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      "YOU DIED",
      {
        fontSize: "120px Tahoma",
        fill: "#aa0000"
      }
    );

    deathText.setOriginFromFrame();
    deathText.setScrollFactor(0);

    this.cameras.main.fadeIn(2000);
    this.cameras.main.centerOn(0, 0);

    this.input.keyboard.on("keydown", (eventName, event) => {
      this.scene.start("GameScene");
    });
  }

  public update(time: number, delta: number): void {
    // throw new Error("Method not implemented.");
  }
}
