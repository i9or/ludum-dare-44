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
  private forestB: Phaser.GameObjects.TileSprite;
  private ambient: Phaser.Sound.BaseSound;
  private jumpSound: Phaser.Sound.BaseSound;
  private dropSoundA: Phaser.Sound.BaseSound;
  private dropSoundB: Phaser.Sound.BaseSound;
  private coinSound: Phaser.Sound.BaseSound;

  private startX = 1400;
  private startY = 1700;
  private spikesLayer: Phaser.GameObjects.GameObject[];
  private spikes: Phaser.Physics.Matter.Sprite[] = [];
  private line: Phaser.GameObjects.Graphics;
  private looseLayer: Phaser.GameObjects.GameObject[];
  private winLayer: Phaser.GameObjects.GameObject[];
  private wins: Phaser.Physics.Matter.Sprite[] = [];
  private looses: Phaser.Physics.Matter.Sprite[] = [];

  constructor() {
    super({
      key: "GameScene"
    });

    this.smoothControls = new SmoothHorizontalControl(0.0005);
  }

  public preload(): void {
    this.totalCoinsLife = 9;
  }

  public create(): void {
    this.music = this.sound.add("mainThemeMusic");
    this.music.play("", {
      loop: true
    });

    this.ambient = this.sound.add("ambientThemeMusic");
    this.ambient.play("", {
      loop: true
    });

    this.jumpSound = this.sound.add("jumpSound");
    this.dropSoundA = this.sound.add("dropSoundA");
    this.dropSoundB = this.sound.add("dropSoundB");

    this.coinSound = this.sound.add("coinSound");

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

    this.tileset = this.map.addTilesetImage("tilesheet", "spritesheet");

    this.groundLayer = this.map.createDynamicLayer("World", this.tileset, 0, 0);
    this.map.setCollisionFromCollisionGroup(true, true);

    this.coinsLayer = this.map.getObjectLayer("Coins").objects;
    this.spikesLayer = this.map.getObjectLayer("Spikes").objects;
    this.winLayer = this.map.getObjectLayer("Win").objects;
    this.looseLayer = this.map.getObjectLayer("Loose").objects;

    const world = this.matter.world.convertTilemapLayer(this.groundLayer);

    world.setBounds(
      0,
      0,
      this.map.widthInPixels,
      this.map.heightInPixels + 500
    );
    world.createDebugGraphic();
    world.drawDebug = true;

    this.heroFlyHeight = this.map.heightInPixels;

    this.coinsLayer.forEach((coin: any) => {
      const singleCoin = this.matter.add.sprite(
        coin.x + 64,
        coin.y - 32,
        "coin"
      );
      singleCoin.setRectangle(60, 64, {
        label: "coin",
        isSensor: true
      });

      singleCoin.setIgnoreGravity(true);
      singleCoin.setDisplayOrigin(64, 96);
      this.coins.push(singleCoin);
    });

    this.spikesLayer.forEach((spike: any) => {
      const singleSpike = this.matter.add.sprite(
        spike.x + 64,
        spike.y - 32,
        "spikes"
      );
      singleSpike.setRectangle(128, 35, {
        label: "spikes",
        isSensor: true
      });

      singleSpike.setIgnoreGravity(true);
      singleSpike.setDisplayOrigin(64, 96);
      this.spikes.push(singleSpike);
    });

    this.winLayer.forEach((win: any) => {
      const singleWin = this.matter.add.sprite(
        win.x + 112,
        win.y - 155,
        "flag"
      );
      singleWin.setCircle(60, {
        label: "win",
        isSensor: true
      });

      singleWin.setIgnoreGravity(true);
      singleWin.setDisplayOrigin(120, 100);
      this.wins.push(singleWin);
    });

    this.looseLayer.forEach((loose: any) => {
      const singleLoose = this.matter.add.sprite(
        loose.x + 64,
        loose.y - 0,
        "alphaPixel"
      );
      singleLoose.setRectangle(128, 10, {
        label: "loose",
        isSensor: true
      });

      singleLoose.setIgnoreGravity(true);
      singleLoose.setDisplayOrigin(64, 96);
      this.looses.push(singleLoose);
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

    this.player = this.matter.add.sprite(0, 0, "heroSet", 3);

    this.player.setExistingBody(playerBody);
    // this.player.setBounce(0.2);
    this.player.setMass(9);
    this.player.setPosition(this.startX, this.startY);

    this.anims.create({
      key: "normal",
      frames: this.anims.generateFrameNumbers("heroSet", { start: 3, end: 3 }),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: "flyUp",
      frames: this.anims.generateFrameNumbers("heroSet", { start: 0, end: 0 }),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: "flyDown",
      frames: this.anims.generateFrameNumbers("heroSet", { start: 2, end: 2 }),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: "smash",
      frames: this.anims.generateFrameNumbers("heroSet", { start: 4, end: 4 }),
      frameRate: 1,
      repeat: -1
    });
    this.anims.create({
      key: "dead",
      frames: this.anims.generateFrameNumbers("heroSet", { start: 1, end: 1 }),
      frameRate: 10,
      repeat: -1
    });

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
    this.cameras.main.fadeIn(3000);

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
                this.coinSound.play();
                return false;
              }

              return true;
            });
            continue;
          } else if (
            (bodyA.label === "spikes" && bodyB === this.player.body) ||
            (bodyB.label === "spikes" && bodyA === this.player.body)
          ) {
            this.totalCoinsLife -= 1;
            this.updateHp();
            this.player.setVelocityY(-(this.playerState.speed.jump + 3));
            continue;
          } else if (
            (bodyA.label === "loose" && bodyB === this.player.body) ||
            (bodyB.label === "loose" && bodyA === this.player.body)
          ) {
            this.totalCoinsLife = 0;
            this.updateHp();
            continue;
          } else if (
            (bodyA.label === "win" && bodyB === this.player.body) ||
            (bodyB.label === "win" && bodyA === this.player.body)
          ) {
            this.winCondition();
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

              const lifeLost = Math.floor(flyDelta / 200);

              this.totalCoinsLife -= lifeLost;
              this.updateHp();

              if (lifeLost > 1) {
                this.player.anims.play("smash", true);
                if (this.totalCoinsLife > 0) {
                  this.dropSoundA.play();
                } else {
                  this.dropSoundB.play();
                }
              }

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

    // TODO: remove
    this.line = this.add.graphics();

    this.input.addDownCallback(function() {
      if (this.game.sound.context.state === "suspended") {
        this.game.sound.context.resume();
      }
    });

    if (this.game.sound.context.state === "suspended") {
      this.game.sound.context.resume();
    }
  }

  public winCondition() {
    this.music.stop();
    this.ambient.stop();
    this.scene.start("WinScene");
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
      this.player.anims.play("normal", true);
    }

    const jumpDelta = time - this.playerState.lastJumpedAt;

    if (this.keys.up.isDown) {
      if (this.playerState.blocked.bottom && jumpDelta > 250) {
        this.player.setVelocityY(-this.playerState.speed.jump);
        this.playerState.lastJumpedAt = time;
        this.jumpSound.play("", {
          volume: 0.6
        });
      } else if (this.playerState.blocked.left && jumpDelta > 900) {
        this.player.setVelocityY(-this.playerState.speed.jump);
        this.player.setVelocityX(this.playerState.speed.run + 3);
        this.playerState.lastJumpedAt = time;
        this.jumpSound.play("", {
          volume: 0.6
        });
      } else if (this.playerState.blocked.right && jumpDelta > 900) {
        this.player.setVelocityY(-this.playerState.speed.jump);
        this.player.setVelocityX(-(this.playerState.speed.run + 3));
        this.playerState.lastJumpedAt = time;
        this.jumpSound.play("", {
          volume: 0.6
        });
      }
    }

    this.heroFlyHeight = Math.min(
      this.heroFlyHeight,
      this.player.body.position.y
    );

    this.smoothCameraFollow(this.player, 0.9);

    this.forestA.tilePositionX = this.cameras.main.scrollX * 0.8;
    this.forestB.tilePositionX = this.cameras.main.scrollX * 0.9;

    this.line.clear();
    this.line.lineStyle(2, 0xff0000);
    this.line.lineBetween(
      this.player.body.position.x,
      this.player.body.position.y,
      this.player.body.position.x + this.player.body.velocity.x * 10,
      this.player.body.position.y + this.player.body.velocity.y * 10
    );

    if (!this.playerState.blocked.bottom) {
      const vel = new Phaser.Math.Vector2(this.player.body.velocity);
      const dir = Phaser.Math.Vector2.UP.dot(vel.normalize());
      if (dir > 0.7) {
        this.player.anims.play("flyUp", true);
      }

      if (dir < -0.7) {
        this.player.anims.play("flyDown", true);
      }
    }
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
    if (this.totalCoinsLife > 0) {
      this.totalCoinsLifeText.setText(`HP: ${this.totalCoinsLife}`);
    } else {
      // Go to death scene
      this.player.anims.play("dead", true);
      this.totalCoinsLifeText.setText(`HP: 0`);
      this.music.stop();
      this.ambient.stop();
      this.scene.start("DeathScene");
    }
  }
}
