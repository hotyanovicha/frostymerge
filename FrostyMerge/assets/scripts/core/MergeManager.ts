import { BoardController, GridSlot } from "./BoardController";
import { ItemData, ItemGroup } from "../data/ItemData";
import { MoveResult } from "./MoveResult";

const DEFAULT_MAX_LEVEL = 5;
const MAX_LEVELS: Partial<Record<ItemGroup, number>> = {
  [ItemGroup.DECORATION]: 5,
  [ItemGroup.CHARACTER]: 5,
  [ItemGroup.GENERATOR]: 1, // generators are not mergeable
};

export class MergeManager {
  constructor(private board: BoardController) {}

  private getMaxLevel(group: ItemGroup): number {
    return MAX_LEVELS[group] ?? DEFAULT_MAX_LEVEL;
  }

  validateMerge(target: GridSlot | null, source: GridSlot | null): MoveResult {
    if (!target || !target.item) return MoveResult.INVALID_TARGET;
    if (!source || !source.item) return MoveResult.INVALID_SOURCE;
    if (target === source) return MoveResult.SAME_SLOT;

    const a = target.item;
    const b = source.item;

    if (a.group === ItemGroup.GENERATOR || b.group === ItemGroup.GENERATOR) {
      return MoveResult.CANNOT_MERGE_GENERATOR;
    }

    if (a.group !== b.group || a.level !== b.level) {
      return MoveResult.INVALID_TARGET;
    }

    const maxLevel = this.getMaxLevel(a.group);
    if (a.level >= maxLevel) {
      return MoveResult.MAX_LEVEL_REACHED;
    }

    return MoveResult.SUCCESS_MERGE;
  }

  tryMerge(target: GridSlot | null, source: GridSlot | null): MoveResult {
    const validation = this.validateMerge(target, source);
    if (validation !== MoveResult.SUCCESS_MERGE) {
      return validation;
    }

    const newLevel = (target as GridSlot).item
      ? ((target as GridSlot).item as ItemData).level + 1
      : 0;
    const newGroup = (target as GridSlot).item
      ? ((target as GridSlot).item as ItemData).group
      : ItemGroup.DECORATION;

    // Clear source
    (source as GridSlot).item = null;
    // Upgrade target
    (target as GridSlot).item = new ItemData(newGroup, newLevel);

    return MoveResult.SUCCESS_MERGE;
  }
}

