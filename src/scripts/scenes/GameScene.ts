import "phaser";
import { ILifecycle } from "./Lifecycle";

export class GameScene extends Phaser.Scene implements ILifecycle {
  public music: Phaser.Sound.BaseSound;
  public map: Phaser.Tilemaps.Tilemap;
  public tileset: Phaser.Tilemaps.Tileset;
  public groundLayer: Phaser.Tilemaps.DynamicTilemapLayer;
  public keys: { jump: Phaser.Input.Keyboard.Key };
  public player: Phaser.Physics.Arcade.Sprite;

  constructor() {
    super({
      key: "GameScene"
    });
  }

  public preload(): void {
    // tslint:disable-next-line:no-console
    console.info("Nothing to preload here...");
  }
  public create(): void {
    this.music = this.sound.add("mainTheme");
    this.music.play("", {
      loop: true
    });

    this.map = this.make.tilemap({
      key: "world1"
    });
    this.tileset = this.map.addTilesetImage("spritesheet", "spritesheet");

    this.groundLayer = this.map.createDynamicLayer(
      "Tile Layer 1",
      this.tileset,
      0,
      0
    );

    this.groundLayer.setCollisionByExclusion([-1]);
    this.physics.world.bounds.width = this.groundLayer.width;
    this.physics.world.bounds.height = this.groundLayer.height;

    // this.add.tileSprite(0, 4000, this.groundLayer.width, 720, "backgroundA");

    this.cameras.main.centerOnX(650);
    this.cameras.main.centerOnY(4200);

    this.player = this.physics.add.sprite(200, 4150, "hero");
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);

    this.physics.add.collider(this.groundLayer, this.player);

  }

  public update(time: number, delta: number): void {
    // tslint:disable-next-line:no-console
    console.info("Nothing to update here...");
  }
}
