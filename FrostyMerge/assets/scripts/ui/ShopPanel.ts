import { PlayerData } from "../data/PlayerData";

export class ShopPanel {
  hotCocoaPrice = 30;

  constructor(private onPurchase?: () => void) {}

  buyHotCocoa(): boolean {
    const player = PlayerData.instance;
    if (!player.spendCookies(this.hotCocoaPrice)) {
      return false;
    }
    player.energy = player.maxEnergy;
    this.onPurchase?.();
    return true;
  }
}

