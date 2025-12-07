import { BoardController } from "../core/BoardController";
import { PlayerData } from "../data/PlayerData";
import { Order, OrderData } from "../data/OrderData";
import { ItemData } from "../data/ItemData";

export class OrderPanel {
  currentOrder: Order = OrderData.randomOrder();

  constructor(private board: BoardController, private onOrderChange?: () => void) {}

  setOrder(order: Order) {
    this.currentOrder = order;
    this.onOrderChange?.();
  }

  generateNewOrder() {
    this.currentOrder = OrderData.randomOrder();
    this.onOrderChange?.();
  }

  tryFulfill(col: number, row: number): boolean {
    const slot = this.board.getSlot(col, row);
    if (!slot || !slot.item) return false;
    const item = slot.item as ItemData;
    if (
      item.group === this.currentOrder.group &&
      item.level === this.currentOrder.level
    ) {
      // Consume the item and pay reward
      this.board.removeItem(col, row);
      PlayerData.instance.addCookies(this.currentOrder.reward);
      this.generateNewOrder();
      return true;
    }
    return false;
  }
}
import { BoardController } from "../core/BoardController";
import { PlayerData } from "../data/PlayerData";
import { Order, OrderData } from "../data/OrderData";
import { ItemData } from "../data/ItemData";

export class OrderPanel {
  currentOrder: Order = OrderData.randomOrder();

  constructor(private board: BoardController, private onOrderChange?: () => void) {}

  setOrder(order: Order) {
    this.currentOrder = order;
    this.onOrderChange?.();
  }

  generateNewOrder() {
    this.currentOrder = OrderData.randomOrder();
    this.onOrderChange?.();
  }

  tryFulfill(col: number, row: number): boolean {
    const slot = this.board.getSlot(col, row);
    if (!slot || !slot.item) return false;
    const item = slot.item as ItemData;
    if (
      item.group === this.currentOrder.group &&
      item.level === this.currentOrder.level
    ) {
      // Consume the item and pay reward
      this.board.removeItem(col, row);
      PlayerData.instance.addCookies(this.currentOrder.reward);
      this.generateNewOrder();
      return true;
    }
    return false;
  }
}

