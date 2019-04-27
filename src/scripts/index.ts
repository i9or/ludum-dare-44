import "phaser";

const config: GameConfig = {
  width: 800,
  height: 600,
  type: Phaser.AUTO,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 200 },
    },
  }
};

export class Game extends Phaser.Game {
  constructor(configuration: GameConfig) {
    super(configuration);
  }
}

window.addEventListener("load", () => {
  const game = new Game(config);
});
