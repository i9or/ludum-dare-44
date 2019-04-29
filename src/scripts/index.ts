import "phaser";
import { LoadingScene } from "./scenes/LoadScene";
import { MainMenuScene } from "./scenes/MainMenuScene";
import { GameScene } from "./scenes/GameScene";
import { DeathScene } from "./scenes/DeathScene";
import { WinScene } from "./scenes/WinScene";

const config: GameConfig = {
  width: 1280,
  height: 720,
  type: Phaser.AUTO,
  parent: "content",
  physics: {
    default: "matter",
    matter: {
      gravity: { y: 1 },
      enableSleep: false,
      debug: true
    }
  },
  scene: [
    LoadingScene,
    MainMenuScene,
    GameScene,
    DeathScene,
    WinScene
  ]
};

export class Game extends Phaser.Game {
  constructor(configuration: GameConfig) {
    super(configuration);
  }
}

window.addEventListener("load", () => {
  const game = new Game(config);
});
