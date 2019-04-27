import "phaser";
import { LoadingScene } from "./scenes/LoadScene";
import { MainMenuScene } from "./scenes/MainMenuScene";
import { GameScene } from "./scenes/GameScene";

const config: GameConfig = {
  width: 1280,
  height: 720,
  type: Phaser.WEBGL,
  parent: "content",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 800 },
      debug: true
    }
  },
  scene: [
    LoadingScene,
    MainMenuScene,
    GameScene
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
