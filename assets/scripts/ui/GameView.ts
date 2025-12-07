import {
  _decorator,
  Component,
  Label,
  Node,
  Prefab,
  Vec3,
  instantiate,
  EventTouch,
  Color,
  UITransform,
  Layers,
} from "cc";
import { GameManager } from "../managers/GameManager";
import { ItemData } from "../data/ItemData";
import { ItemView } from "./ItemView";
import { HUDController } from "./HUDController";

const { ccclass, property } = _decorator;

type SlotRef = {
  node: Node;
  col: number;
  row: number;
};

@ccclass("GameView")
export class GameView extends Component {
  @property(Node)
  gridRoot: Node | null = null;

  @property(Prefab)
  slotPrefab: Prefab | null = null;

  @property(Prefab)
  itemPrefab: Prefab | null = null;

  @property(Label)
  energyLabel: Label | null = null;

  @property(Label)
  cookiesLabel: Label | null = null;

  @property(Label)
  orderLabel: Label | null = null;

  @property
  cellSize = 100;

  @property
  spacing = 10;

  private manager = new GameManager();
  private slots: SlotRef[] = [];
  private items: Map<string, ItemView> = new Map();

  onLoad() {
    this.ensureFallbackUI();
    this.buildGrid();
    this.bindManagerCallbacks();
    // Replace HUD controller with UI binding before starting logic
    this.manager.hud = new HUDController((energyText, cookies) =>
      this.updateHUD(energyText, cookies)
    );
    this.manager.start();
    this.refreshOrderLabel();
    this.manager.hud.refresh();
  }

  // Build a simple grid layout of slot prefabs
  private buildGrid() {
    if (!this.gridRoot) return;
    if (!this.slotPrefab) {
      this.slotPrefab = this.createFallbackSlotPrefab() as any;
    }
    const width = this.manager.board.cols;
    const height = this.manager.board.rows;
    const startX = -((width - 1) * (this.cellSize + this.spacing)) / 2;
    const startY = ((height - 1) * (this.cellSize + this.spacing)) / 2;

    for (let row = 0; row < height; row++) {
      for (let col = 0; col < width; col++) {
        const slotNode = instantiate(this.slotPrefab);
        slotNode.setParent(this.gridRoot);
        const x = startX + col * (this.cellSize + this.spacing);
        const y = startY - row * (this.cellSize + this.spacing);
        slotNode.setPosition(x, y, 0);
        this.slots.push({ node: slotNode, col, row });
      }
    }
  }

  private bindManagerCallbacks() {
    this.manager.onSpawnItem = (col, row, item) => {
      this.createItemNode(col, row, item);
    };
    this.manager.onRemoveItem = (col, row) => {
      this.removeItemNode(col, row);
    };
    this.manager.onUpdateItem = (col, row, item) => {
      this.updateItemNode(col, row, item);
    };
    this.manager.onOrderChange = () => this.refreshOrderLabel();
  }

  private updateHUD(energyText: string, cookies: number) {
    if (this.energyLabel) {
      this.energyLabel.string = `❄️ ${energyText}`;
    }
    if (this.cookiesLabel) {
      this.cookiesLabel.string = `🍪 ${cookies}`;
    }
  }

  onGeneratorButton() {
    this.manager.onGeneratorTap();
  }

  handleItemDrop(view: ItemView, worldPos: Vec3) {
    const target = this.findNearestSlot(worldPos);
    if (!target) {
      view.snapToSlot(view.node);
      return;
    }
    const fromCol = view.col;
    const fromRow = view.row;
    const toCol = target.col;
    const toRow = target.row;

    this.manager.onItemDropped(fromCol, fromRow, toCol, toRow);
    view.col = toCol;
    view.row = toRow;
    view.snapToSlot(target.node);
  }

  handleGeneratorTap() {
    this.manager.onGeneratorTap();
  }

  tryFulfillOrder(view: ItemView): boolean {
    const success = this.manager.onOrderSubmit(view.col, view.row);
    if (success) {
      // Item node will be destroyed via onRemoveItem callback
      this.refreshOrderLabel();
      return true;
    }
    return false;
  }

  onOrderSubmitButton(event: EventTouch, customData?: string) {
    // For a simple demo, pick the selected slot via custom data "col,row"
    if (!customData) return;
    const [colStr, rowStr] = customData.split(",");
    const col = parseInt(colStr, 10);
    const row = parseInt(rowStr, 10);
    this.manager.onOrderSubmit(col, row);
    this.refreshOrderLabel();
  }

  onBuyHotCocoa() {
    this.manager.buyHotCocoa();
  }

  private createItemNode(col: number, row: number, item: ItemData) {
    if (!this.gridRoot) return;
    if (!this.itemPrefab) {
      this.itemPrefab = this.createFallbackItemPrefab() as any;
    }
    const slot = this.getSlot(col, row);
    if (!slot) return;
    const node = instantiate(this.itemPrefab);
    node.setParent(this.gridRoot);
    node.setWorldPosition(slot.node.worldPosition);

    const view = node.getComponent(ItemView) || node.addComponent(ItemView);
    view.setup(this, item, col, row);
    this.items.set(this.key(col, row), view);
  }

  private removeItemNode(col: number, row: number) {
    const key = this.key(col, row);
    const view = this.items.get(key);
    if (view) {
      view.node.destroy();
      this.items.delete(key);
    }
  }

  private updateItemNode(col: number, row: number, item: ItemData) {
    const view = this.items.get(this.key(col, row));
    if (view) {
      view.data = item;
      view.refreshVisual();
    } else {
      this.createItemNode(col, row, item);
    }
  }

  private findNearestSlot(worldPos: Vec3): SlotRef | null {
    let best: SlotRef | null = null;
    let bestDist = Number.MAX_VALUE;
    for (const slot of this.slots) {
      const dist = slot.node.worldPosition.subtract(worldPos).lengthSqr();
      if (dist < bestDist) {
        bestDist = dist;
        best = slot;
      }
    }
    return best;
  }

  private getSlot(col: number, row: number): SlotRef | null {
    return this.slots.find((s) => s.col === col && s.row === row) || null;
  }

  private key(col: number, row: number) {
    return `${col},${row}`;
  }

  private refreshOrderLabel() {
    if (!this.orderLabel) return;
    const order = this.manager.orderPanel.currentOrder;
    this.orderLabel.string = `Order: ${order.group} L${order.level} for ${order.reward}🍪`;
  }

  // ----------------------
  // Fallback creation
  // ----------------------
  private ensureFallbackUI() {
    if (!this.gridRoot) {
      this.gridRoot = new Node("GridRoot");
      this.gridRoot.layer = Layers.Enum.UI_2D;
      this.node.addChild(this.gridRoot);
    }
    if (!this.energyLabel) {
      this.energyLabel = this.createHudLabel("EnergyLabel", new Vec3(-300, 360, 0));
    }
    if (!this.cookiesLabel) {
      this.cookiesLabel = this.createHudLabel("CookiesLabel", new Vec3(120, 360, 0));
    }
    if (!this.orderLabel) {
      this.orderLabel = this.createHudLabel("OrderLabel", new Vec3(0, 300, 0));
    }
  }

  private createHudLabel(name: string, pos: Vec3) {
    const n = new Node(name);
    n.layer = Layers.Enum.UI_2D;
    const label = n.addComponent(Label);
    label.color = Color.WHITE;
    label.string = "";
    n.setParent(this.node);
    n.setPosition(pos);
    return label;
  }

  private createFallbackSlotPrefab(): Prefab | Node {
    const slot = new Node("Slot");
    slot.layer = Layers.Enum.UI_2D;
    const label = slot.addComponent(Label);
    label.string = "□";
    label.color = new Color(180, 220, 255);
    const trans = slot.getComponent(UITransform) || slot.addComponent(UITransform);
    trans.setContentSize(this.cellSize, this.cellSize);
    return slot;
  }

  private createFallbackItemPrefab(): Prefab | Node {
    const item = new Node("Item");
    item.layer = Layers.Enum.UI_2D;
    const label = item.addComponent(Label);
    label.string = "item";
    label.color = Color.WHITE;
    const trans = item.getComponent(UITransform) || item.addComponent(UITransform);
    trans.setContentSize(this.cellSize, this.cellSize);
    return item;
  }
}

