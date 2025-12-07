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
  tween,
  easing,
} from "cc";
import { GameManager } from "../managers/GameManager";
import { ItemData } from "../data/ItemData";
import { ItemView } from "./ItemView";
import { HUDController } from "./HUDController";
import { MoveResult } from "../core/MoveResult";
import { PlayerData } from "../data/PlayerData";

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
  slotPrefab: Prefab | Node | null = null;

  @property(Prefab)
  itemPrefab: Prefab | Node | null = null;

  @property(Label)
  energyLabel: Label | null = null;

  @property(Label)
  cookiesLabel: Label | null = null;

  @property(Label)
  orderLabel: Label | null = null;

  @property
  cellSize = 70;

  @property
  spacing = 8;

  private manager = new GameManager();
  private slots: SlotRef[] = [];
  private items: Map<string, ItemView> = new Map();
  private buyEnergyBtn: Node | null = null;
  private buyEnergyLabel: Label | null = null;

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
    if (!this.slotPrefab) this.slotPrefab = this.createFallbackSlotPrefab();
    const layout = this.computeGridLayout();
    this.cellSize = layout.cellSize;
    this.spacing = layout.spacing;
    const startX = layout.startX;
    const startY = layout.startY;

    for (let row = 0; row < layout.rows; row++) {
      for (let col = 0; col < layout.cols; col++) {
        const slotNode = instantiate(this.slotPrefab as any) as Node;
        slotNode.setParent(this.gridRoot);
        const trans =
          slotNode.getComponent(UITransform) || slotNode.addComponent(UITransform);
        trans.setContentSize(this.cellSize, this.cellSize);
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
    this.manager.onMoveItem = (fromCol, fromRow, toCol, toRow) => {
      this.moveItemNode(fromCol, fromRow, toCol, toRow);
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
    this.updateBuyEnergyButtonState();
  }

  onGeneratorButton() {
    this.manager.onGeneratorTap();
  }

  handleItemDrop(view: ItemView, worldPos: Vec3) {
    const local = this.worldToGridLocal(worldPos);
    const target = this.findNearestSlot(local);
    if (!target) {
      const origin = this.getSlot(view.col, view.row);
      if (origin) view.snapToSlotWithRejection(origin.node);
      return;
    }
    const prevCol = view.col;
    const prevRow = view.row;
    const fromCol = view.col;
    const fromRow = view.row;
    const toCol = target.col;
    const toRow = target.row;

    const result = this.manager.onItemDropped(fromCol, fromRow, toCol, toRow);

    this.applyMoveFeedback(view, result, toCol, toRow, prevCol, prevRow);
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
    if (!this.itemPrefab) this.itemPrefab = this.createFallbackItemPrefab();
    const slot = this.getSlot(col, row);
    if (!slot) return;
    const node = instantiate(this.itemPrefab as any) as Node;
    node.setParent(this.gridRoot);
    node.setPosition(slot.node.position);

    // Ensure proper UITransform size for touch detection
    const trans = node.getComponent(UITransform) || node.addComponent(UITransform);
    const touchSize = this.cellSize * 1.5; // Make touch area larger for easier tapping
    trans.setContentSize(touchSize, touchSize);
    
    console.log('[createItemNode] Creating item at', col, row, 'cellSize:', this.cellSize, 'touchSize:', touchSize);

    const view = node.getComponent(ItemView) || node.addComponent(ItemView);
    view.setup(this, item, col, row);
    this.items.set(this.key(col, row), view);
    
    console.log('[createItemNode] ItemView setup complete, touch events registered');
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

  private moveItemNode(fromCol: number, fromRow: number, toCol: number, toRow: number) {
    const fromKey = this.key(fromCol, fromRow);
    const toKey = this.key(toCol, toRow);
    const view = this.items.get(fromKey);
    if (view) {
      // Update the item map with new coordinates
      this.items.delete(fromKey);
      this.items.set(toKey, view);
      // Update the view's grid coordinates
      view.col = toCol;
      view.row = toRow;
      // Note: The actual position animation is handled by applyMoveFeedback
    }
  }

  private findNearestSlot(localPos: Vec3): SlotRef | null {
    let best: SlotRef | null = null;
    let bestDist = Number.MAX_VALUE;
    for (const slot of this.slots) {
      const dist = Vec3.subtract(new Vec3(), slot.node.position, localPos).lengthSqr();
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

  private applyMoveFeedback(
    view: ItemView,
    result: MoveResult,
    toCol: number,
    toRow: number,
    prevCol: number,
    prevRow: number
  ) {
    switch (result) {
      case MoveResult.SUCCESS_MOVE: {
        // Note: view.col and view.row are already updated by moveItemNode callback
        const slot = this.getSlot(toCol, toRow);
        if (slot) {
          view.snapToSlot(slot.node);
        }
        break;
      }
      case MoveResult.SUCCESS_MERGE: {
        // Source view will be destroyed; add a quick pop on the target if it exists
        const targetView = this.items.get(this.key(toCol, toRow));
        if (targetView) {
          this.playMergeBounce(targetView.node);
        }
        break;
      }
      default: {
        const originSlot = this.getSlot(prevCol, prevRow);
        if (originSlot) {
          view.snapToSlotWithRejection(originSlot.node);
        }
      }
    }
  }

  private playMergeBounce(node: Node) {
    const startScale = node.scale.clone();
    const up = new Vec3(startScale.x * 1.1, startScale.y * 1.1, startScale.z);
    tween(node)
      .to(0.12, { scale: up }, { easing: easing.quadOut })
      .to(0.12, { scale: startScale }, { easing: easing.quadIn })
      .start();
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
      const ui = this.gridRoot.addComponent(UITransform);
      ui.setContentSize(1, 1); // will be sized in computeGridLayout
      ui.anchorX = 0.5;
      ui.anchorY = 0.5;
      this.node.addChild(this.gridRoot);
    }
    
    // HUD layout with proper spacing
    const hudTopY = 580;
    const legendY = hudTopY - 80;   // Legend level (500)
    const orderY = legendY - 60;    // Order below legend (440)
    
    if (!this.energyLabel) {
      this.energyLabel = this.createHudLabel(
        "EnergyLabel",
        new Vec3(-250, hudTopY, 0),
        32,
        new Color(150, 220, 255)
      );
    }
    if (!this.cookiesLabel) {
      this.cookiesLabel = this.createHudLabel(
        "CookiesLabel",
        new Vec3(0, hudTopY, 0),
        32,
        new Color(255, 200, 100)
      );
    }
    if (!this.orderLabel) {
      this.orderLabel = this.createHudLabel(
        "OrderLabel", 
        new Vec3(0, orderY, 0),
        28,
        new Color(255, 255, 200)
      );
    }
    // Buy Energy button - positioned on the right
    this.createBuyEnergyButton(new Vec3(250, hudTopY, 0));
    
    // Item legend - DECORATION left, CHARACTER right
    this.createItemLegend(legendY);
  }

  private createItemLegend(legendY: number) {
    const iconSpacing = 40;
    const fontSize = 24;
    
    // Left side: DECORATION (levels 1-5): 🔴 🟡 ✨ 🎀 🎄
    const leftStartX = -280;
    this.createLegendLabel("DECORATION:", new Vec3(leftStartX, legendY + 20, 0), 12, new Color(200, 200, 200));
    const decorationEmojis = ["🔴", "🟡", "✨", "🎀", "🎄"];
    for (let i = 0; i < decorationEmojis.length; i++) {
      this.createLegendLabel(decorationEmojis[i], new Vec3(leftStartX + i * iconSpacing, legendY - 10, 0), fontSize);
    }
    
    // Right side: CHARACTER (levels 1-5): 🧦 ⛄ 🦌 👸 🎅
    const rightStartX = 80;
    this.createLegendLabel("CHARACTER:", new Vec3(rightStartX, legendY + 20, 0), 12, new Color(200, 200, 200));
    const characterEmojis = ["🧦", "⛄", "🦌", "👸", "🎅"];
    for (let i = 0; i < characterEmojis.length; i++) {
      this.createLegendLabel(characterEmojis[i], new Vec3(rightStartX + i * iconSpacing, legendY - 10, 0), fontSize);
    }
  }

  private createLegendLabel(text: string, pos: Vec3, fontSize: number, color: Color = Color.WHITE): Label {
    const n = new Node("LegendItem");
    n.layer = Layers.Enum.UI_2D;
    const label = n.addComponent(Label);
    label.string = text;
    label.fontSize = fontSize;
    label.color = color;
    n.setParent(this.node);
    n.setPosition(pos);
    return label;
  }

  private createBuyEnergyButton(pos: Vec3) {
    const btn = new Node("BuyEnergyBtn");
    btn.layer = Layers.Enum.UI_2D;
    const label = btn.addComponent(Label);
    label.string = "⚡+100 (30🍪)";
    label.fontSize = 18;
    const trans = btn.addComponent(UITransform);
    trans.setContentSize(120, 36);
    btn.setParent(this.node);
    btn.setPosition(pos);
    
    // Store references for state updates
    this.buyEnergyBtn = btn;
    this.buyEnergyLabel = label;
    
    // Make it clickable with cookie check
    btn.on(Node.EventType.TOUCH_END, () => {
      if (PlayerData.instance.cookies >= this.manager.shop.hotCocoaPrice) {
        this.onBuyHotCocoa();
      }
    }, this);
    
    // Set initial state
    this.updateBuyEnergyButtonState();
  }
  
  private updateBuyEnergyButtonState() {
    if (!this.buyEnergyLabel) return;
    const cookies = PlayerData.instance.cookies;
    const canAfford = cookies >= this.manager.shop.hotCocoaPrice;
    
    if (canAfford) {
      this.buyEnergyLabel.color = new Color(100, 255, 150); // Green - active
    } else {
      this.buyEnergyLabel.color = new Color(128, 128, 128); // Gray - disabled
    }
  }

  private createHudLabel(name: string, pos: Vec3, fontSize: number = 28, color: Color = Color.WHITE) {
    const n = new Node(name);
    n.layer = Layers.Enum.UI_2D;
    const label = n.addComponent(Label);
    label.color = color;
    label.fontSize = fontSize;
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
    label.string = "🎁";
    label.color = Color.WHITE;
    label.fontSize = 64; // 2x bigger icons
    label.overflow = 0; // Label.Overflow.NONE - no clipping
    const trans = item.getComponent(UITransform) || item.addComponent(UITransform);
    trans.setContentSize(this.cellSize * 2, this.cellSize * 2); // larger content area to prevent clipping
    return item;
  }

  private worldToGridLocal(worldPos: Vec3): Vec3 {
    if (this.gridRoot) {
      const ui = this.gridRoot.getComponent(UITransform);
      if (ui) return ui.convertToNodeSpaceAR(worldPos);
    }
    const rootUI = this.node.getComponent(UITransform);
    if (rootUI) return rootUI.convertToNodeSpaceAR(worldPos);
    return worldPos;
  }

  private computeGridLayout() {
    const cols = this.manager.board.cols;
    const rows = this.manager.board.rows;
    const targetAspect = 1; // 7/7 = 1 (square grid)
    const rootUI = this.node.getComponent(UITransform);
    const availableW = rootUI ? rootUI.width : 720;
    const availableH = rootUI ? rootUI.height : 1280;

    // Margins: 5% sides, 10% bottom, 20% top for HUD text
    const sideMargin = availableW * 0.05;
    const topMargin = availableH * 0.20;
    const bottomMargin = availableH * 0.10;

    // Max available space for grid
    const maxW = availableW - sideMargin * 2;
    const maxH = availableH - topMargin - bottomMargin;

    // Calculate grid size respecting aspect ratio
    let gridW = maxW;
    let gridH = gridW / targetAspect;

    // If too tall, constrain by height
    if (gridH > maxH) {
      gridH = maxH;
      gridW = gridH * targetAspect;
    }

    const cell = Math.min(gridW / cols, gridH / rows);
    const spacing = cell * 0.15;
    const exactGridW = cols * cell + (cols - 1) * spacing;
    const exactGridH = rows * cell + (rows - 1) * spacing;

    if (this.gridRoot) {
      const ui = this.gridRoot.getComponent(UITransform);
      if (ui) ui.setContentSize(exactGridW, exactGridH);
      // Position grid: centered horizontally, 5% from bottom
      const gridY = -availableH / 2 + bottomMargin + exactGridH / 2;
      this.gridRoot.setPosition(0, gridY);
    }

    const startX = -exactGridW / 2 + cell / 2;
    const startY = exactGridH / 2 - cell / 2;

    return {
      cols,
      rows,
      cellSize: cell,
      spacing,
      startX,
      startY,
    };
  }
}

