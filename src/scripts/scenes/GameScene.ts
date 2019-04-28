import "phaser";
import { ILifecycle } from "./Lifecycle";

export class GameScene extends Phaser.Scene implements ILifecycle {
  public music: Phaser.Sound.BaseSound;
  public map: Phaser.Tilemaps.Tilemap;
  public tileset: Phaser.Tilemaps.Tileset;
  public groundLayer: Phaser.Tilemaps.DynamicTilemapLayer;
  public player: Phaser.Physics.Matter.Sprite;
  public keys: Phaser.Input.Keyboard.CursorKeys;
  public playerController: any;
  private oldVelocityX: number;
  private targetVelocityX: number;
  private newVelocityX: number;

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
    // this.music.play("", {
    //   loop: true
    // });

    this.map = this.make.tilemap({
      key: "world1"
    });
    this.tileset = this.map.addTilesetImage("spritesheet", "spritesheet");

    this.groundLayer = this.map.createDynamicLayer(0, this.tileset, 0, 0);
    this.map.setCollisionFromCollisionGroup(true, true);

    const world = this.matter.world.convertTilemapLayer(this.groundLayer);

    world.setBounds(this.map.widthInPixels, this.map.heightInPixels);
    world.createDebugGraphic();
    world.drawDebug = true;

    this.playerController = {
      blocked: {
        left: false,
        right: false,
        bottom: false
      },
      numTouching: {
        left: 0,
        right: 0,
        bottom: 0
      },
      sensors: {
        bottom: null,
        left: null,
        right: null
      },
      time: {
        leftDown: 0,
        rightDown: 0
      },
      lastJumpedAt: 0,
      speed: {
        run: 7,
        jump: 10
      }
    };

    this.player = this.matter.add.sprite(150, 1000, "hero");

    this.player.setPosition(200, 1100);
    this.player.setBounce(0.7);
    this.player.setCircle(32, {});

    this.keys = this.input.keyboard.createCursorKeys();

    this.cameras.main.setBounds(
      0,
      0,
      this.map.widthInPixels,
      this.map.heightInPixels
    );
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setBackgroundColor("#ccddff");
    this.cameras.main.roundPixels = true;
  }

  public update(time: number, delta: number): void {
    if (this.keys.left.isDown /*&& !this.playerController.blocked.left*/) {
      // smoothedControls.moveLeft(delta);
      // matterSprite.anims.play('left', true);

      this.oldVelocityX = this.player.body.velocity.x;
      this.targetVelocityX = -this.playerController.speed.run;
      this.newVelocityX = Phaser.Math.Linear(
        this.oldVelocityX,
        this.targetVelocityX,
        1 /*-smoothedControls.value*/
      );

      this.player.setVelocityX(this.newVelocityX);
    } else if (this.keys.right.isDown /*&& !playerController.blocked.right*/) {
      //     smoothedControls.moveRight(delta);
      //     matterSprite.anims.play('right', true);

      //     // Lerp the velocity towards the max run using the smoothed controls. This simulates a
      //     // player controlled acceleration.
      this.oldVelocityX = this.player.body.velocity.x;
      this.targetVelocityX = this.playerController.speed.run;
      this.newVelocityX = Phaser.Math.Linear(
        this.oldVelocityX,
        this.targetVelocityX,
        1 /*smoothedControls.value*/
      );

      this.player.setVelocityX(this.newVelocityX);
    }
    // else
    // {
    //     smoothedControls.reset();
    //     matterSprite.anims.play('idle', true);
    // }
  }
}
