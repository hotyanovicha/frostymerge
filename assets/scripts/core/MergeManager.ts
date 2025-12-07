import { BoardController, GridSlot } from "./BoardController";
import { ItemData } from "../data/ItemData";

export class MergeManager {
  constructor(private board: BoardController) {}

  canMerge(slotA: GridSlot | null, slotB: GridSlot | null): boolean {
    if (!slotA || !slotB || !slotA.item || !slotB.item) return false;
    if (slotA === slotB) return false;
    const a = slotA.item;
    const b = slotB.item;
    return a.group === b.group && a.level === b.level && a.level < 5;
    }

  tryMerge(slotA: GridSlot | null, slotB: GridSlot | null): boolean {
    if (!this.canMerge(slotA, slotB)) return false;
    const target = slotA as GridSlot;
    const source = slotB as GridSlot;
    const newLevel = (target.item as ItemData).level + 1;

    // Clear source
    source.item = null;
    // Upgrade target
    target.item = new ItemData((target.item as ItemData).group, newLevel);
    return true;
  }
}
import { BoardController, GridSlot } from "./BoardController";
import { ItemData } from "../data/ItemData";

export class MergeManager {
  constructor(private board: BoardController) {}

  canMerge(slotA: GridSlot | null, slotB: GridSlot | null): boolean {
    if (!slotA || !slotB || !slotA.item || !slotB.item) return false;
    if (slotA === slotB) return false;
    const a = slotA.item;
    const b = slotB.item;
    return a.group === b.group && a.level === b.level && a.level < 5;
  }

  tryMerge(slotA: GridSlot | null, slotB: GridSlot | null): boolean {
    if (!this.canMerge(slotA, slotB)) return false;
    const target = slotA as GridSlot;
    const source = slotB as GridSlot;
    const newLevel = (target.item as ItemData).level + 1;

    // Clear source
    source.item = null;
    // Upgrade target
    target.item = new ItemData((target.item as ItemData).group, newLevel);
    return true;
  }
}

