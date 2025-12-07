import { BoardController, GridSlot } from "./BoardController";
import { ItemGroup } from "../data/ItemData";
import { PlayerData } from "../data/PlayerData";

export class GeneratorController {
  constructor(private board: BoardController, private onEnergyChange?: () => void) {}

  // Returns the slot where the item spawned, or null if spawn failed.
  spawnItem(): GridSlot | null {
    const player = PlayerData.instance;
    if (!player.spendEnergy(1)) {
      // TODO: hook up shake animation feedback
      return null;
    }

    const emptySlot = this.board.getRandomEmptySlot();
    if (!emptySlot) {
      // No room; refund energy
      player.energy += 1;
      this.onEnergyChange?.();
      return null;
    }

    // 50/50 between decoration and character, always level 1
    const randomGroup =
      Math.random() > 0.5 ? ItemGroup.DECORATION : ItemGroup.CHARACTER;
    this.board.createItemAt(emptySlot.col, emptySlot.row, randomGroup, 1);
    this.onEnergyChange?.();
    return emptySlot;
  }
}
import { BoardController, GridSlot } from "./BoardController";
import { ItemGroup } from "../data/ItemData";
import { PlayerData } from "../data/PlayerData";

export class GeneratorController {
  constructor(private board: BoardController, private onEnergyChange?: () => void) {}

  // Returns the slot where the item spawned, or null if spawn failed.
  spawnItem(): GridSlot | null {
    const player = PlayerData.instance;
    if (!player.spendEnergy(1)) {
      // TODO: hook up shake animation feedback
      return null;
    }

    const emptySlot = this.board.getRandomEmptySlot();
    if (!emptySlot) {
      // No room; refund energy
      player.energy += 1;
      this.onEnergyChange?.();
      return null;
    }

    // 50/50 between decoration and character, always level 1
    const randomGroup =
      Math.random() > 0.5 ? ItemGroup.DECORATION : ItemGroup.CHARACTER;
    this.board.createItemAt(emptySlot.col, emptySlot.row, randomGroup, 1);
    this.onEnergyChange?.();
    return emptySlot;
  }
}

