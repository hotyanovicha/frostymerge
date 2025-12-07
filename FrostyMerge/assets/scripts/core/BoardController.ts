import { ItemData, ItemGroup } from "../data/ItemData";
import { MoveResult } from "./MoveResult";

export interface GridSlot {
  col: number;
  row: number;
  item: ItemData | null;
}

export class BoardController {
  readonly cols = 7;
  readonly rows = 7;
  private slots: GridSlot[][] = [];

  constructor() {
    this.initializeSlots();
  }

  private initializeSlots() {
    this.slots = [];
    for (let row = 0; row < this.rows; row++) {
      const rowSlots: GridSlot[] = [];
      for (let col = 0; col < this.cols; col++) {
        rowSlots.push({ col, row, item: null });
      }
      this.slots.push(rowSlots);
    }
  }

  getSlot(col: number, row: number): GridSlot | null {
    if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) return null;
    return this.slots[row][col];
  }

  getRandomEmptySlot(): GridSlot | null {
    const empties: GridSlot[] = [];
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const slot = this.slots[row][col];
        if (!slot.item) empties.push(slot);
      }
    }
    if (!empties.length) return null;
    const index = Math.floor(Math.random() * empties.length);
    return empties[index];
  }

  createItemAt(
    col: number,
    row: number,
    group: ItemGroup,
    level: number
  ): ItemData | null {
    const slot = this.getSlot(col, row);
    if (!slot || slot.item) return null;
    const item = new ItemData(group, level);
    slot.item = item;
    return item;
  }

  removeItem(col: number, row: number): ItemData | null {
    const slot = this.getSlot(col, row);
    if (!slot || !slot.item) return null;
    const item = slot.item;
    slot.item = null;
    return item;
  }

  moveItem(
    fromCol: number,
    fromRow: number,
    toCol: number,
    toRow: number
  ): MoveResult {
    const from = this.getSlot(fromCol, fromRow);
    const to = this.getSlot(toCol, toRow);

    if (!from || !from.item) return MoveResult.INVALID_SOURCE;
    if (!to) return MoveResult.INVALID_TARGET;
    if (from === to) return MoveResult.SAME_SLOT;
    if (to.item) return MoveResult.TARGET_OCCUPIED;

    to.item = from.item;
    from.item = null;
    return MoveResult.SUCCESS_MOVE;
  }
}

