import { ItemData } from "../data/ItemData";

// Placeholder controller that would be attached to an item node in Cocos.
export class ItemController {
  data: ItemData;
  col: number;
  row: number;

  constructor(data: ItemData, col: number, row: number) {
    this.data = data;
    this.col = col;
    this.row = row;
  }

  setGridPosition(col: number, row: number) {
    this.col = col;
    this.row = row;
  }

  // Hooks for drag/drop UI
  onDragStart() {
    // Visual feedback would go here
  }

  onDragEnd() {
    // Reset visuals
  }

  onDrop(targetCol: number, targetRow: number) {
    // BoardController will handle movement; this is a placeholder
    this.col = targetCol;
    this.row = targetRow;
  }
}

