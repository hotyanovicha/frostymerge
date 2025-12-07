// PlayerData tracks energy, cookies, and regeneration logic.
export class PlayerData {
  static instance = new PlayerData();

  maxEnergy = 100;
  energy = 100;
  cookies = 0;
  regenIntervalMs = 5000;
  private regenTimer?: ReturnType<typeof setInterval>;

  private constructor() {}

  startRegeneration(onTick?: (energy: number) => void) {
    if (this.regenTimer) return;
    this.regenTimer = setInterval(() => {
      if (this.energy < this.maxEnergy) {
        this.energy += 1;
        if (this.energy > this.maxEnergy) this.energy = this.maxEnergy;
        onTick?.(this.energy);
      }
    }, this.regenIntervalMs);
  }

  stopRegeneration() {
    if (this.regenTimer) {
      clearInterval(this.regenTimer);
      this.regenTimer = undefined;
    }
  }

  spendEnergy(amount: number): boolean {
    if (this.energy < amount) return false;
    this.energy -= amount;
    return true;
  }

  addCookies(amount: number) {
    this.cookies += amount;
  }

  spendCookies(amount: number): boolean {
    if (this.cookies < amount) return false;
    this.cookies -= amount;
    return true;
  }
}
// PlayerData tracks energy, cookies, and regeneration logic.
export class PlayerData {
  static instance = new PlayerData();

  maxEnergy = 100;
  energy = 100;
  cookies = 0;
  regenIntervalMs = 5000;
  private regenTimer?: ReturnType<typeof setInterval>;

  private constructor() {}

  startRegeneration(onTick?: (energy: number) => void) {
    if (this.regenTimer) return;
    this.regenTimer = setInterval(() => {
      if (this.energy < this.maxEnergy) {
        this.energy += 1;
        if (this.energy > this.maxEnergy) this.energy = this.maxEnergy;
        onTick?.(this.energy);
      }
    }, this.regenIntervalMs);
  }

  stopRegeneration() {
    if (this.regenTimer) {
      clearInterval(this.regenTimer);
      this.regenTimer = undefined;
    }
  }

  spendEnergy(amount: number): boolean {
    if (this.energy < amount) return false;
    this.energy -= amount;
    return true;
  }

  addCookies(amount: number) {
    this.cookies += amount;
  }

  spendCookies(amount: number): boolean {
    if (this.cookies < amount) return false;
    this.cookies -= amount;
    return true;
  }
}

