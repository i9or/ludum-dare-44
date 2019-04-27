import "phaser";
import { ILifecycle } from "./Lifecycle";
import background from "../../assets/images/background.png";

export class LoadingScene extends Phaser.Scene implements ILifecycle {
  constructor() {
    super({
      key: "LoadingScene"
    });
  }

  public preload(): void {
    const progress = this.add.graphics();

    this.load.on("progress", (value: number) => {
      progress.clear();
      progress.fillStyle(0xbada55, 1);
      progress.fillRect(
        0,
        (this.sys.game.config.height as number) / 2,
        (this.sys.game.config.width as number) * value,
        60
      );
    });

    this.load.on("complete", () => {
      progress.destroy();
      this.scene.start("GameScene");
    });

    this.load.image("background", background);
  }

  public create(): void {
    console.log('LoadingScene: CREATE');
  }

  public update(time: number, delta: number): void {
    console.log('LoadingScene: UPDATE');
  }
}
