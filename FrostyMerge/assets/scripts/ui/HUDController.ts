import { PlayerData } from "../data/PlayerData";

export class HUDController {
  constructor(private onUpdate?: (energyText: string, cookies: number) => void) {}

  refresh() {
    const energy = PlayerData.instance.energy;
    const max = PlayerData.instance.maxEnergy;
    const cookies = PlayerData.instance.cookies;
    this.onUpdate?.(`${energy}/${max}`, cookies);
  }
}

