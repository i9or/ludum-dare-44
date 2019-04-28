export class SmoothHorizontalControl {
  public msSpeed: number;
  public value: number;

  constructor(speed: number) {
    this.msSpeed = speed;
    this.value = 0;
  }

  public moveLeft(delta: number): number {
    if (this.value > 0) {
      this.reset();
    }

    this.value -= this.msSpeed * delta;

    if (this.value < -1) {
      this.value = -1;
    }

    return delta;
  }

  public moveRight(delta: number): number {
    if (this.value < 0) {
      this.reset();
    }

    this.value += this.msSpeed * delta;

    if (this.value > 1) {
      this.value = 1;
    }

    return delta;
  }

  public reset(): void {
    this.value = 0;
  }
}
