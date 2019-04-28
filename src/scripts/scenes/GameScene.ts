import "phaser";
import { ILifecycle } from "./Lifecycle";
import { SmoothHorizontalControl } from "../helpers/SmoothHorizontalControl";

export class GameScene extends Phaser.Scene implements ILifecycle {
  public music: Phaser.Sound.BaseSound;
  public map: Phaser.Tilemaps.Tilemap;
  public tileset: Phaser.Tilemaps.Tileset;
  public groundLayer: Phaser.Tilemaps.DynamicTilemapLayer;
  public player: Phaser.Physics.Matter.Sprite;
  public keys: Phaser.Input.Keyboard.CursorKeys;
  public playerState: any;
  private bottomSensor: Phaser.Physics.Matter.Sprite;
  private leftSensor: Phaser.Physics.Matter.Sprite;
  private rightSensor: Phaser.Physics.Matter.Sprite;
  private smoothControls: SmoothHorizontalControl;

  constructor() {
    super({
      key: "GameScene"
    });

    this.smoothControls = new SmoothHorizontalControl(0.0005);
  }

  public preload(): void {
    // tslint:disable-next-line:no-console
    console.log("Nothing to preload");
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

    world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    world.createDebugGraphic();
    world.drawDebug = true;

    this.playerState = {
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
      time: {
        leftDown: 0,
        rightDown: 0
      },
      lastJumpedAt: 0,
      speed: {
        run: 10,
        jump: 10
      }
    };

    const playerBody = Phaser.Physics.Matter.Matter.Bodies.circle(0, 0, 32, {
      friction: 0.4,
      restitution: 0.05
    });

    // const compoundBody = Phaser.Physics.Matter.Matter.Body.create({
    //   parts: [playerBody, this.playerState.sensors.bottom],
    //   friction: 0.4,
    //   restitution: 0.05
    // });

    this.player = this.matter.add.sprite(0, 0, "hero");

    // this.player.setBounce(0.7);
    this.player.setExistingBody(playerBody);
    this.player.setPosition(250, 1300);

    this.initPlayerSensors();

    // KEYBOARD
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

    // ================
    // COLLISION EVENTS
    // ================
    this.matter.world.on(
      "beforeupdate",
      (event: Phaser.Physics.Matter.Events.BeforeUpdateEvent) => {
        this.playerState.numTouching.left = 0;
        this.playerState.numTouching.right = 0;
        this.playerState.numTouching.bottom = 0;
      }
    );

    this.matter.world.on(
      "collisionactive",
      (event: Phaser.Physics.Matter.Events.CollisionActiveEvent) => {
        const bottom = this.bottomSensor.body;
        const left = this.leftSensor.body;
        const right = this.rightSensor.body;

        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < event.pairs.length; i++) {
          const bodyA = event.pairs[i].bodyA;
          const bodyB = event.pairs[i].bodyB;

          if (bodyA === this.player.body || bodyB === this.player.body) {
            continue;
          } else if (bodyA === bottom || bodyB === bottom) {
            // tslint:disable-next-line:no-console
            this.playerState.numTouching.bottom += 1;
          } else if (
            (bodyA === left && bodyB.isStatic) ||
            (bodyB === left && bodyA.isStatic)
          ) {
            this.playerState.numTouching.left += 1;
            console.log("left", Date.now());
          } else if (
            (bodyA === right && bodyB.isStatic) ||
            (bodyB === right && bodyA.isStatic)
          ) {
            this.playerState.numTouching.right += 1;
            console.log("right", Date.now());
          }
        }
      }
    );

    this.matter.world.on(
      "afterupdate",
      (event: Phaser.Physics.Matter.Events.AfterUpdateEvent) => {
        this.playerState.blocked.right =
          this.playerState.numTouching.right > 0 ? true : false;
        this.playerState.blocked.left =
          this.playerState.numTouching.left > 0 ? true : false;
        this.playerState.blocked.bottom =
          this.playerState.numTouching.bottom > 0 ? true : false;
      }
    );
  }

  public update(time: number, delta: number): void {
    this.updatePlayerSensors();

    let oldVelocityX;
    let targetVelocityX;
    let newVelocityX;

    if (this.keys.left.isDown /*&& !this.playerState.blocked.left*/) {
      this.smoothControls.moveLeft(delta);

      oldVelocityX = this.player.body.velocity.x;
      targetVelocityX = -this.playerState.speed.run;
      newVelocityX = Phaser.Math.Linear(
        oldVelocityX,
        targetVelocityX,
        -this.smoothControls.value
      );

      this.player.setVelocityX(newVelocityX);
    } else if (this.keys.right.isDown /*&& !this.playerState.blocked.right*/) {
      this.smoothControls.moveRight(delta);

      oldVelocityX = this.player.body.velocity.x;
      targetVelocityX = this.playerState.speed.run;
      newVelocityX = Phaser.Math.Linear(
        oldVelocityX,
        targetVelocityX,
        this.smoothControls.value
      );

      this.player.setVelocityX(newVelocityX);
    } else {
      this.smoothControls.reset();
    }

    const canJump = time - this.playerState.lastJumpedAt > 250;

    if (this.keys.up.isDown && canJump) {
      if (this.playerState.blocked.bottom) {
        this.player.setVelocityY(-this.playerState.speed.jump);
        this.playerState.lastJumpedAt = time;
      }
    }
  }

  private initPlayerSensors(): void {
    this.bottomSensor = this.matter.add.sprite(0, 0, "alphaPixel");
    this.bottomSensor.setRectangle(10, 4, {
      isSensor: true,
      iniertia: Infinity
    });

    this.leftSensor = this.matter.add.sprite(0, 0, "alphaPixel");
    this.leftSensor.setRectangle(4, 10, {
      isSensor: true,
      iniertia: Infinity
    });

    this.rightSensor = this.matter.add.sprite(0, 0, "alphaPixel");
    this.rightSensor.setRectangle(4, 10, {
      isSensor: true,
      iniertia: Infinity
    });
  }

  private updatePlayerSensors(): void {
    const px = this.player.body.position.x;
    const py = this.player.body.position.y;

    this.bottomSensor.setPosition(px, py + 34);
    this.leftSensor.setPosition(px - 34, py);
    this.rightSensor.setPosition(px + 34, py);
  }
}
