import "phaser";
import { ILifecycle } from "./Lifecycle";

import backgroundA from "../../assets/images/bg_forest_a.png";
import backgroundB from "../../assets/images/bg_forest_b.png";
import backgroundC from "../../assets/images/bg_forest_c.png";

import world1 from "../../assets/tiles/world2.json";
import spritesheet from "../../assets/images/spritesheet.png";

import hero from "../../assets/images/hero.png";

import mainThemeMp3 from "../../assets/music/345838__shadydave__abstract-ambient-loop.mp3";

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

    this.load.tilemapTiledJSON("world1", world1);

    this.load.image("backgroundA", backgroundA);
    this.load.image("backgroundB", backgroundB);
    this.load.image("backgroundC", backgroundC);
    this.load.spritesheet("spritesheet", spritesheet, {
      frameWidth: 128,
      frameHeight: 128
    });

    this.load.image("hero", hero);

    this.load.audio("mainTheme", mainThemeMp3);
  }

  public create(): void {
    // tslint:disable-next-line: no-console
    console.info("LoadingScene: CREATE");
  }

  public update(time: number, delta: number): void {
    // tslint:disable-next-line: no-console
    console.log("LoadingScene: UPDATE");
  }
}
