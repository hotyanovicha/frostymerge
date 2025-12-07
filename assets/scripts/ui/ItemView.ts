import { _decorator, Component, EventTouch, Label, Node, Vec3 } from "cc";
import { ItemData, ItemGroup } from "../data/ItemData";
import { GameView } from "./GameView";

const { ccclass, property } = _decorator;

@ccclass("ItemView")
export class ItemView extends Component {
  @property(Label)
  label: Label | null = null;

  game: GameView | null = null;
  data!: ItemData;
  col = 0;
  row = 0;

  private dragStartWorld = new Vec3();
  private originalPos = new Vec3();
  private dragThresholdSqr = 100; // ~10px

  setup(game: GameView, data: ItemData, col: number, row: number) {
    this.game = game;
    this.data = data;
    this.col = col;
    this.row = row;
    this.refreshVisual();
    this.registerEvents();
  }

  refreshVisual() {
    if (this.label) {
      this.label.string = this.data.getSpriteName();
    }
  }

  private registerEvents() {
    this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
    this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
    this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
    this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
  }

  private onTouchStart(event: EventTouch) {
    const loc = event.getUILocation();
    this.dragStartWorld.set(loc.x, loc.y, 0);
    this.node.getWorldPosition(this.originalPos);
  }

  private onTouchMove(event: EventTouch) {
    const loc = event.getUILocation();
    const delta = new Vec3(
      loc.x - this.dragStartWorld.x,
      loc.y - this.dragStartWorld.y,
      0
    );
    const newPos = this.originalPos.clone().add(delta);
    this.node.setWorldPosition(newPos);
  }

  private onTouchEnd(event: EventTouch) {
    const loc = event.getUILocation();
    const worldPos = new Vec3(loc.x, loc.y, 0);
    if (!this.game) return;

    const dragDistanceSqr = this.node
      .getWorldPosition(new Vec3())
      .subtract(this.originalPos)
      .lengthSqr();

    // Treat small movement as a tap
    const isTap = dragDistanceSqr <= this.dragThresholdSqr;

    if (isTap) {
      if (this.data.group === ItemGroup.GENERATOR) {
        this.game.handleGeneratorTap();
        this.snapToSlot(this.node);
        return;
      }
      if (this.game.tryFulfillOrder(this)) {
        return;
      }
    }

    this.game.handleItemDrop(this, worldPos);
  }

  moveTo(worldPos: Vec3) {
    this.node.setWorldPosition(worldPos);
  }

  snapToSlot(slotNode: Node) {
    const wpos = slotNode.worldPosition;
    this.node.setWorldPosition(wpos);
  }

  onDestroy() {
    this.node.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
    this.node.off(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
    this.node.off(Node.EventType.TOUCH_END, this.onTouchEnd, this);
    this.node.off(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
  }
}
import { _decorator, Component, EventTouch, Label, Node, Vec3 } from "cc";
import { ItemData, ItemGroup } from "../data/ItemData";
import { GameView } from "./GameView";

const { ccclass, property } = _decorator;

@ccclass("ItemView")
export class ItemView extends Component {
  @property(Label)
  label: Label | null = null;

  game: GameView | null = null;
  data!: ItemData;
  col = 0;
  row = 0;

  private dragStartWorld = new Vec3();
  private originalPos = new Vec3();
  private dragThresholdSqr = 100; // ~10px

  setup(game: GameView, data: ItemData, col: number, row: number) {
    this.game = game;
    this.data = data;
    this.col = col;
    this.row = row;
    this.refreshVisual();
    this.registerEvents();
  }

  refreshVisual() {
    if (this.label) {
      this.label.string = this.data.getSpriteName();
    }
  }

  private registerEvents() {
    this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
    this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
    this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
    this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
  }

  private onTouchStart(event: EventTouch) {
    const loc = event.getUILocation();
    this.dragStartWorld.set(loc.x, loc.y, 0);
    this.node.getWorldPosition(this.originalPos);
  }

  private onTouchMove(event: EventTouch) {
    const loc = event.getUILocation();
    const delta = new Vec3(
      loc.x - this.dragStartWorld.x,
      loc.y - this.dragStartWorld.y,
      0
    );
    const newPos = this.originalPos.clone().add(delta);
    this.node.setWorldPosition(newPos);
  }

  private onTouchEnd(event: EventTouch) {
    const loc = event.getUILocation();
    const worldPos = new Vec3(loc.x, loc.y, 0);
    if (!this.game) return;

    const dragDistanceSqr = this.node
      .getWorldPosition(new Vec3())
      .subtract(this.originalPos)
      .lengthSqr();

    // Treat small movement as a tap
    const isTap = dragDistanceSqr <= this.dragThresholdSqr;

    if (isTap) {
      if (this.data.group === ItemGroup.GENERATOR) {
        this.game.handleGeneratorTap();
        this.snapToSlot(this.node);
        return;
      }
      if (this.game.tryFulfillOrder(this)) {
        return;
      }
    }

    this.game.handleItemDrop(this, worldPos);
  }

  moveTo(worldPos: Vec3) {
    this.node.setWorldPosition(worldPos);
  }

  snapToSlot(slotNode: Node) {
    const wpos = slotNode.worldPosition;
    this.node.setWorldPosition(wpos);
  }

  onDestroy() {
    this.node.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
    this.node.off(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
    this.node.off(Node.EventType.TOUCH_END, this.onTouchEnd, this);
    this.node.off(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
  }
}

