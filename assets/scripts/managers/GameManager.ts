import { BoardController } from "../core/BoardController";
import { GeneratorController } from "../core/GeneratorController";
import { MergeManager } from "../core/MergeManager";
import { OrderPanel } from "../ui/OrderPanel";
import { HUDController } from "../ui/HUDController";
import { ShopPanel } from "../ui/ShopPanel";
import { PlayerData } from "../data/PlayerData";
import { ItemController } from "../core/ItemController";
import { ItemData, ItemGroup } from "../data/ItemData";

export class GameManager {
  board = new BoardController();
  mergeManager = new MergeManager(this.board);
  hud = new HUDController(() => this.onHUDUpdate());
  generator = new GeneratorController(this.board, () => this.onHUDUpdate());
  orderPanel = new OrderPanel(this.board, () => this.onOrderChange());
  shop = new ShopPanel(() => this.onHUDUpdate());

  // Map of item controllers by coordinate key
  items: Map<string, ItemController> = new Map();

  // Hooks for view-layer rendering
  onSpawnItem?: (col: number, row: number, item: ItemData) => void;
  onRemoveItem?: (col: number, row: number) => void;
  onUpdateItem?: (col: number, row: number, item: ItemData) => void;
  onOrderChange?: () => void;

  start() {
    PlayerData.instance.startRegeneration(() => this.onHUDUpdate());
    this.placeGenerator();
    this.onHUDUpdate();
  }

  private key(col: number, row: number) {
    return `${col},${row}`;
  }

  private placeGenerator() {
    const col = Math.floor(this.board.cols / 2);
    const row = this.board.rows - 1; // bottom center
    const data = this.board.createItemAt(
      col,
      row,
      ItemGroup.GENERATOR,
      1
    ) as ItemData;
    const controller = new ItemController(data, col, row);
    this.items.set(this.key(col, row), controller);
    this.onSpawnItem?.(col, row, data);
  }

  onGeneratorTap() {
    const slot = this.generator.spawnItem();
    if (slot && slot.item) {
      const data = slot.item;
      const controller = new ItemController(data, slot.col, slot.row);
      this.items.set(this.key(slot.col, slot.row), controller);
      this.onSpawnItem?.(slot.col, slot.row, data);
    }
    this.onHUDUpdate();
  }

  onItemDropped(fromCol: number, fromRow: number, toCol: number, toRow: number) {
    const fromSlot = this.board.getSlot(fromCol, fromRow);
    const toSlot = this.board.getSlot(toCol, toRow);
    if (!fromSlot || !fromSlot.item) return;

    // Try merge first
    if (this.mergeManager.tryMerge(toSlot, fromSlot)) {
      this.board.removeItem(fromCol, fromRow);
      // Update visuals: remove source, update target
      this.items.delete(this.key(fromCol, fromRow));
      this.onRemoveItem?.(fromCol, fromRow);
      if (toSlot && toSlot.item) {
        const updated = toSlot.item;
        this.items.set(
          this.key(toCol, toRow),
          new ItemController(updated, toCol, toRow)
        );
        this.onUpdateItem?.(toCol, toRow, updated);
      }
      this.onHUDUpdate();
      return;
    }

    // Otherwise attempt move
    if (this.board.moveItem(fromCol, fromRow, toCol, toRow)) {
      const controllerKey = this.key(fromCol, fromRow);
      const controller = this.items.get(controllerKey);
      if (controller) {
        controller.setGridPosition(toCol, toRow);
        this.items.delete(controllerKey);
        this.items.set(this.key(toCol, toRow), controller);
        this.onRemoveItem?.(fromCol, fromRow);
        if (toSlot && toSlot.item) {
          this.onSpawnItem?.(toCol, toRow, toSlot.item);
        }
      }
    }
  }

  onOrderSubmit(col: number, row: number) {
    const success = this.orderPanel.tryFulfill(col, row);
    if (success) {
      this.items.delete(this.key(col, row));
      this.onRemoveItem?.(col, row);
      this.onHUDUpdate();
    }
    return success;
  }

  buyHotCocoa() {
    if (this.shop.buyHotCocoa()) {
      this.onHUDUpdate();
    }
  }

  private onHUDUpdate() {
    this.hud.refresh();
  }

  private onOrderChange() {
    this.onOrderChange?.();
  }
}
import { BoardController } from "../core/BoardController";
import { GeneratorController } from "../core/GeneratorController";
import { MergeManager } from "../core/MergeManager";
import { OrderPanel } from "../ui/OrderPanel";
import { HUDController } from "../ui/HUDController";
import { ShopPanel } from "../ui/ShopPanel";
import { PlayerData } from "../data/PlayerData";
import { ItemController } from "../core/ItemController";
import { ItemData, ItemGroup } from "../data/ItemData";

export class GameManager {
  board = new BoardController();
  mergeManager = new MergeManager(this.board);
  hud = new HUDController(() => this.onHUDUpdate());
  generator = new GeneratorController(this.board, () => this.onHUDUpdate());
  orderPanel = new OrderPanel(this.board, () => this.onOrderChange());
  shop = new ShopPanel(() => this.onHUDUpdate());

  // Map of item controllers by coordinate key
  items: Map<string, ItemController> = new Map();

  // Hooks for view-layer rendering
  onSpawnItem?: (col: number, row: number, item: ItemData) => void;
  onRemoveItem?: (col: number, row: number) => void;
  onUpdateItem?: (col: number, row: number, item: ItemData) => void;
  onOrderChange?: () => void;

  start() {
    PlayerData.instance.startRegeneration(() => this.onHUDUpdate());
    this.placeGenerator();
    this.onHUDUpdate();
  }

  private key(col: number, row: number) {
    return `${col},${row}`;
  }

  private placeGenerator() {
    const col = Math.floor(this.board.cols / 2);
    const row = this.board.rows - 1; // bottom center
    const data = this.board.createItemAt(
      col,
      row,
      ItemGroup.GENERATOR,
      1
    ) as ItemData;
    const controller = new ItemController(data, col, row);
    this.items.set(this.key(col, row), controller);
    this.onSpawnItem?.(col, row, data);
  }

  onGeneratorTap() {
    const slot = this.generator.spawnItem();
    if (slot && slot.item) {
      const data = slot.item;
      const controller = new ItemController(data, slot.col, slot.row);
      this.items.set(this.key(slot.col, slot.row), controller);
      this.onSpawnItem?.(slot.col, slot.row, data);
    }
    this.onHUDUpdate();
  }

  onItemDropped(fromCol: number, fromRow: number, toCol: number, toRow: number) {
    const fromSlot = this.board.getSlot(fromCol, fromRow);
    const toSlot = this.board.getSlot(toCol, toRow);
    if (!fromSlot || !fromSlot.item) return;

    // Try merge first
    if (this.mergeManager.tryMerge(toSlot, fromSlot)) {
      this.board.removeItem(fromCol, fromRow);
      // Update visuals: remove source, update target
      this.items.delete(this.key(fromCol, fromRow));
      this.onRemoveItem?.(fromCol, fromRow);
      if (toSlot && toSlot.item) {
        const updated = toSlot.item;
        this.items.set(
          this.key(toCol, toRow),
          new ItemController(updated, toCol, toRow)
        );
        this.onUpdateItem?.(toCol, toRow, updated);
      }
      this.onHUDUpdate();
      return;
    }

    // Otherwise attempt move
    if (this.board.moveItem(fromCol, fromRow, toCol, toRow)) {
      const controllerKey = this.key(fromCol, fromRow);
      const controller = this.items.get(controllerKey);
      if (controller) {
        controller.setGridPosition(toCol, toRow);
        this.items.delete(controllerKey);
        this.items.set(this.key(toCol, toRow), controller);
        this.onRemoveItem?.(fromCol, fromRow);
        if (toSlot && toSlot.item) {
          this.onSpawnItem?.(toCol, toRow, toSlot.item);
        }
      }
    }
  }

  onOrderSubmit(col: number, row: number) {
    const success = this.orderPanel.tryFulfill(col, row);
    if (success) {
      this.items.delete(this.key(col, row));
      this.onRemoveItem?.(col, row);
      this.onHUDUpdate();
    }
  }

  buyHotCocoa() {
    if (this.shop.buyHotCocoa()) {
      this.onHUDUpdate();
    }
  }

  private onHUDUpdate() {
    this.hud.refresh();
  }

  private onOrderChange() {
    this.onOrderChange?.();
  }
}

