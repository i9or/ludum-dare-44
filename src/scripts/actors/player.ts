import "phaser";

export interface IPlayer extends Phaser.GameObjects.Sprite {
  id: string;
}

export class Player {
  public player: IPlayer;

  constructor(private gameInstance: Phaser.Game, public playerInstance?: any) {
    
  }
}
