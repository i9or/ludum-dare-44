import "phaser";
import { ILifecycle } from "./Lifecycle";

import alphaPixel from "../../assets/images/pixel.png";

import backgroundZero from "../../assets/images/bg_0.png";
import backgroundClouds from "../../assets/images/bg_clouds.png";
import backgroundA from "../../assets/images/bg_forest_back.png";
import backgroundB from "../../assets/images/bg_forest_front.png";

import world1 from "../../assets/tiles/world2.json";
import tilesheet from "../../assets/images/tilesheet.png";

import hero from "../../assets/images/hero.png";
import heroSet from "../../assets/images/hero_set.png";

import coin from "../../assets/images/coin.png";
import spikes from "../../assets/images/spikes.png";
import flag from "../../assets/images/flag.png";

import mainThemeMusicMp3 from "../../assets/sounds/Music.mp3";
import mainThemeMusicOgg from "../../assets/sounds/Music.ogg";
import ambientThemeMusicMp3 from "../../assets/sounds/Ambient.mp3";
import ambientThemeMusicOgg from "../../assets/sounds/Ambient.ogg";

import jumpSoundMp3 from "../../assets/sounds/Jump_Funny_002.mp3";
import jumpSoundOgg from "../../assets/sounds/Jump_Funny_002.ogg";
import dropSoundAMp3 from "../../assets/sounds/Drop_001.mp3";
import dropSoundAOgg from "../../assets/sounds/Drop_001.ogg";
import dropSoundBMp3 from "../../assets/sounds/Drop_002.mp3";
import dropSoundBOgg from "../../assets/sounds/Drop_002.ogg";

import dropSoundCMp3 from "../../assets/sounds/Drop_easy.mp3";
import dropSoundCOgg from "../../assets/sounds/Drop_easy.ogg";

import coinSoundMp3 from "../../assets/sounds/Coin.mp3";
import coinSoundOgg from "../../assets/shots/Coin.ogg";

import deathScreen from "../../assets/images/screen_2.png";
import winScreen from "../../assets/images/screen_3.png";

import looseMp3 from "../../assets/sounds/loose2low.mp3";
import looseOgg from "../../assets/sounds/loose2low.ogg";

import winMp3 from "../../assets/sounds/Win.mp3";
import winOgg from "../../assets/sounds/Win.ogg";

import hpIcon from "../../assets/images/hp_icon.png";

export class LoadingScene extends Phaser.Scene implements ILifecycle {
  constructor() {
    super({
      key: "LoadingScene"
    });
  }

  public preload(): void {
    const loadScreen = this.add.image(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      "loadScreen"
    );

    const progress = this.add.graphics();

    this.load.on("progress", (value: number) => {
      progress.clear();
      progress.fillStyle(0xeac235, 1);
      progress.fillRect(
        40,
        (this.sys.game.config.height as number) / 2 + 224,
        (this.sys.game.config.width as number) * value - 80,
        10
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
    this.load.spritesheet("spritesheet", tilesheet, {
      frameWidth: 128,
      frameHeight: 128
    });

    this.load.spritesheet("heroSet", heroSet, {
      frameWidth: 128,
      frameHeight: 128
    });

    this.load.image("hero", hero);

    this.load.image("coin", coin);
    this.load.image("spikes", spikes);
    this.load.image("flag", flag);
    this.load.image("deathScreen", deathScreen);
    this.load.image("winScreen", winScreen);

    this.load.audio("mainThemeMusic", [mainThemeMusicMp3, mainThemeMusicOgg]);
    this.load.audio("ambientThemeMusic", [ambientThemeMusicMp3, ambientThemeMusicOgg]);

    this.load.audio("looseSound", [looseMp3, looseOgg]);
    this.load.audio("winSound", [winMp3, winOgg]);

    this.load.audio("jumpSound", [jumpSoundMp3, jumpSoundOgg]);
    this.load.audio("dropSoundA", [dropSoundAMp3, dropSoundAOgg]);
    this.load.audio("dropSoundB", [dropSoundBMp3, dropSoundAOgg]);
    this.load.audio("dropSoundC", [dropSoundCMp3, dropSoundCOgg]);
    this.load.audio("coinSound", [coinSoundMp3, coinSoundOgg]);

    this.load.image("hpIcon", hpIcon);
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
