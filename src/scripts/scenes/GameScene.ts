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
  private smoothControls: SmoothHorizontalControl;
  private totalCoinsLife: number;
  private totalCoinsLifeText: Phaser.GameObjects.Text;
  private coinsLayer: Phaser.GameObjects.GameObject[];
  private coins: Phaser.Physics.Matter.Sprite[] = [];
  private heroFlyHeight: any;
  private cloudsBack: Phaser.GameObjects.TileSprite;
  private forestA: Phaser.GameObjects.TileSprite;
  forestB: Phaser.GameObjects.TileSprite;

  constructor() {
    super({
      key: "GameScene"
    });

    this.smoothControls = new SmoothHorizontalControl(0.0005);
    this.totalCoinsLife = 9;
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

    // ===========
    // BACKGROUNDS
    // ===========

    const levelW = this.map.widthInPixels;
    const levelH = this.map.heightInPixels;
    const camW = this.cameras.main.width;
    const camH = this.cameras.main.height;

    const skyImage = this.add.image(1280 / 2, 720 / 2, "backgroundZero");
    // skyImage.setDisplaySize(this.map.widthInPixels, this.map.heightInPixels);
    skyImage.setScrollFactor(0);

    const cloudsW = 1280;
    const cloudsH = 409;

    this.cloudsBack = this.add.tileSprite(
      camW / 2,
      camH / 2 - 100,
      cloudsW,
      cloudsH,
      "backgroundClouds"
    );
    this.cloudsBack.setScrollFactor(0);

    this.forestA = this.add.tileSprite(
      camW / 2,
      levelH - 720 / 2,
      1280,
      720,
      "forestA"
    );

    this.forestA.setScrollFactor(0, 1);

    this.forestB = this.add.tileSprite(
      camW / 2,
      levelH - 720 / 2,
      1280,
      720,
      "forestB"
    );

    this.forestB.setScrollFactor(0, 1);

    this.tileset = this.map.addTilesetImage("spritesheet", "spritesheet");

    this.groundLayer = this.map.createDynamicLayer("World", this.tileset, 0, 0);
    this.map.setCollisionFromCollisionGroup(true, true);

    this.coinsLayer = this.map.getObjectLayer("Coins").objects;

    const world = this.matter.world.convertTilemapLayer(this.groundLayer);

    world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    world.createDebugGraphic();
    world.drawDebug = true;

    this.heroFlyHeight = this.map.heightInPixels;

    this.coinsLayer.forEach((coin: any) => {
      const singleCoin = this.matter.add.sprite(
        coin.x + 64,
        coin.y - 32,
        "coin"
      );
      singleCoin.setRectangle(50, 64, {
        label: "coin",
        isSensor: true
      });

      singleCoin.setIgnoreGravity(true);
      singleCoin.setDisplayOrigin(64, 96);
      this.coins.push(singleCoin);
    });

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
        run: 7,
        jump: 10
      }
    };

    const playerBody = Phaser.Physics.Matter.Matter.Bodies.circle(0, 0, 32, {
      friction: 0.4,
      restitution: 0.09,
      label: "hero"
    });

    this.player = this.matter.add.sprite(0, 0, "hero");

    this.player.setBounce(1);
    this.player.setExistingBody(playerBody);
    this.player.setMass(9);
    this.player.setPosition(850, 1700);

    // KEYBOARD
    this.keys = this.input.keyboard.createCursorKeys();

    this.cameras.main.setBounds(
      0,
      0,
      this.map.widthInPixels,
      this.map.heightInPixels
    );
    this.smoothCameraFollow(this.player);
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
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < event.pairs.length; i++) {
          const bodyA = event.pairs[i].bodyA;
          const bodyB = event.pairs[i].bodyB;

          if (
            (bodyA.label === "coin" && bodyB === this.player.body) ||
            (bodyB.label === "coin" && bodyA === this.player.body)
          ) {
            this.totalCoinsLife += 1;
            this.updateHp();
            const coinBody = bodyA === this.player.body ? bodyB : bodyA;
            this.coins = this.coins.filter(coin => {
              if (coin.body === coinBody) {
                coin.destroy();
                return false;
              }

              return true;
            });
            continue;
          } else if (
            (bodyA === this.player.body && bodyB.isStatic) ||
            (bodyB === this.player.body && bodyA.isStatic)
          ) {
            const collisionNormal = event.pairs[i].collision.normal;

            const epsilon = 0.8;

            if (Phaser.Math.Vector2.DOWN.dot(collisionNormal) > epsilon) {
              this.playerState.numTouching.bottom += 1;
              const collidedBody = bodyA.isStatic ? bodyB : bodyA;

              const currentY = collidedBody.position.y;
              const flyDelta = Math.floor(
                Math.abs(this.heroFlyHeight - currentY)
              );

              const lifeLost = Math.floor(flyDelta / 300);

              this.totalCoinsLife -= lifeLost;
              this.updateHp();

              this.heroFlyHeight = currentY;
            } else if (Phaser.Math.Vector2.LEFT.dot(collisionNormal) > 0.8) {
              this.playerState.numTouching.left += 1;
            } else if (Phaser.Math.Vector2.RIGHT.dot(collisionNormal) > 0.8) {
              this.playerState.numTouching.right += 1;
            }
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

    this.totalCoinsLifeText = this.add.text(
      20,
      30,
      `HP: ${this.totalCoinsLife}`,
      {
        fontSize: "40px",
        fill: "#333333"
      }
    );

    this.totalCoinsLifeText.setScrollFactor(0);
  }

  public update(time: number, delta: number): void {
    this.cloudsBack.tilePositionX += 0.1;

    let oldVelocityX: number;
    let targetVelocityX: number;
    let newVelocityX: number;

    if (this.keys.left.isDown && !this.playerState.blocked.left) {
      this.smoothControls.moveLeft(delta);

      oldVelocityX = this.player.body.velocity.x;
      targetVelocityX = -this.playerState.speed.run;
      newVelocityX = Phaser.Math.Linear(
        oldVelocityX,
        targetVelocityX,
        -this.smoothControls.value
      );

      this.player.setVelocityX(newVelocityX);
    } else if (this.keys.right.isDown && !this.playerState.blocked.right) {
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

    const jumpDelta = time - this.playerState.lastJumpedAt;

    if (this.keys.up.isDown) {
      if (this.playerState.blocked.bottom && jumpDelta > 250) {
        this.player.setVelocityY(-this.playerState.speed.jump);
        this.playerState.lastJumpedAt = time;
      } else if (this.playerState.blocked.left && jumpDelta > 900) {
        this.player.setVelocityY(-this.playerState.speed.jump);
        this.player.setVelocityX(this.playerState.speed.run + 3);
        this.playerState.lastJumpedAt = time;
      } else if (this.playerState.blocked.right && jumpDelta > 900) {
        this.player.setVelocityY(-this.playerState.speed.jump);
        this.player.setVelocityX(-(this.playerState.speed.run + 3));
        this.playerState.lastJumpedAt = time;
      }
    }

    this.heroFlyHeight = Math.min(
      this.heroFlyHeight,
      this.player.body.position.y
    );

    this.smoothCameraFollow(this.player, 0.9);

    this.forestA.tilePositionX = this.cameras.main.scrollX * 0.8;
    this.forestB.tilePositionX = this.cameras.main.scrollX * 0.9;
  }

  private smoothCameraFollow(target, smoothFactor = 0) {
    const cam = this.cameras.main;
    cam.scrollX =
      smoothFactor * cam.scrollX +
      (1 - smoothFactor) * (target.x - cam.width * 0.5);
    cam.scrollY =
      smoothFactor * cam.scrollY +
      (1 - smoothFactor) * (target.y - cam.height * 0.5);
  }

  private updateHp() {
    this.totalCoinsLifeText.setText(`HP: ${this.totalCoinsLife}`);
  }
}
