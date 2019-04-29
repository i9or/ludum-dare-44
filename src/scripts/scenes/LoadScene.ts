import "phaser";
import { ILifecycle } from "./Lifecycle";

import alphaPixel from "../../assets/images/pixel.png";

import backgroundZero from "../../assets/images/bg_0.png";
import backgroundClouds from "../../assets/images/bg_clouds.png";
import backgroundA from "../../assets/images/bg_forest_back.png";
import backgroundB from "../../assets/images/bg_forest_front.png";

import world1 from "../../assets/tiles/world2.json";
import spritesheet from "../../assets/images/spritesheet.png";

import hero from "../../assets/images/hero.png";
import coin from "../../assets/images/coin.png";

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

    this.load.image("alphaPixel", alphaPixel);

    this.load.image("backgroundZero", backgroundZero);
    this.load.image("backgroundClouds", backgroundClouds);
    this.load.image("forestA", backgroundA);
    this.load.image("forestB", backgroundB);
    this.load.spritesheet("spritesheet", spritesheet, {
      frameWidth: 128,
      frameHeight: 128
    });

    this.load.image("hero", hero);

    this.load.image("coin", coin);

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
