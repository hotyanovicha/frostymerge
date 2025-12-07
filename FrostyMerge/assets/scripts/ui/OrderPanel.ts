import { BoardController } from "../core/BoardController";
import { PlayerData } from "../data/PlayerData";
import { Order, OrderData } from "../data/OrderData";
import { ItemData } from "../data/ItemData";

export class OrderPanel {
  currentOrder: Order = OrderData.firstOrder();

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
    console.log('[tryFulfill] col:', col, 'row:', row);
    console.log('[tryFulfill] slot:', slot, 'item:', slot?.item);
    console.log('[tryFulfill] order:', this.currentOrder);
    
    if (!slot || !slot.item) {
      console.log('[tryFulfill] FAIL: no slot or no item');
      return false;
    }
    const item = slot.item as ItemData;
    console.log('[tryFulfill] comparing:', item.group, '===', this.currentOrder.group, '&&', item.level, '===', this.currentOrder.level);
    
    if (
      item.group === this.currentOrder.group &&
      item.level === this.currentOrder.level
    ) {
      console.log('[tryFulfill] SUCCESS! Adding cookies:', this.currentOrder.reward);
      // Consume the item and pay reward
      this.board.removeItem(col, row);
      PlayerData.instance.addCookies(this.currentOrder.reward);
      this.generateNewOrder();
      return true;
    }
    console.log('[tryFulfill] FAIL: item does not match order');
    return false;
  }
}

