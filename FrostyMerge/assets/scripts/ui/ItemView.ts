import {
  _decorator,
  Component,
  EventTouch,
  Label,
  Node,
  Vec3,
  tween,
  easing,
} from "cc";
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
  private dragThresholdSqr = 225; // ~15px
  private tapTimeThresholdMs = 350;
  private touchStartTime = 0;
  private destroyed = false;

  setup(game: GameView, data: ItemData, col: number, row: number) {
    this.game = game;
    this.data = data;
    this.col = col;
    this.row = row;
    this.refreshVisual();
    this.registerEvents();
  }

  refreshVisual() {
    if (!this.label) {
      this.label = this.getComponent(Label);
      if (!this.label) return;
    }
    const name = this.data.getSpriteName();
    this.label.string = this.emojiFor(name);
    this.node.name = name;
  }

  private registerEvents() {
    console.log('[ItemView.registerEvents] Registering touch events for', this.data?.group, 'L', this.data?.level, 'at', this.col, this.row);
    this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
    this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
    this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
    this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
  }

  private onTouchStart(event: EventTouch) {
    console.log('[ItemView.onTouchStart] Touch started on', this.data?.group, 'L', this.data?.level);
    const loc = event.getUILocation();
    this.dragStartWorld.set(loc.x, loc.y, 0);
    this.node.getWorldPosition(this.originalPos);
    this.touchStartTime = Date.now();
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
    if (!this.game) return;

    // Calculate drag distance using TOUCH positions (screen coords), not node world position
    const endLoc = event.getUILocation();
    const touchDragDelta = new Vec3(
      endLoc.x - this.dragStartWorld.x,
      endLoc.y - this.dragStartWorld.y,
      0
    );
    const dragDistanceSqr = touchDragDelta.lengthSqr();
    const touchDuration = Date.now() - this.touchStartTime;

    // Treat small finger movement as a tap (ignore duration for order fulfillment)
    // Use generous threshold - if finger moved less than 30px, it's a tap
    const isTap = dragDistanceSqr <= 900; // 30px squared

    console.log('[ItemView.onTouchEnd] isTap:', isTap, 'touchDragDistSqr:', dragDistanceSqr, 'duration:', touchDuration);
    console.log('[ItemView.onTouchEnd] item col:', this.col, 'row:', this.row, 'group:', this.data.group, 'level:', this.data.level);

    if (isTap) {
      // Snap back to original position first (onTouchMove might have moved it slightly)
      this.node.setWorldPosition(this.originalPos);
      
      if (this.data.group === ItemGroup.GENERATOR) {
        this.game.handleGeneratorTap();
        return;
      }
      console.log('[ItemView.onTouchEnd] Attempting to fulfill order...');
      if (this.game.tryFulfillOrder(this)) {
        console.log('[ItemView.onTouchEnd] Order fulfilled successfully!');
        return;
      }
      console.log('[ItemView.onTouchEnd] Order not fulfilled - item does not match order');
      return; // Don't fall through to drop for taps
    }

    // Use the item's current world position (where user lifted finger) for drop detection
    const currentWorld = this.node.getWorldPosition(new Vec3());
    this.game.handleItemDrop(this, currentWorld);
  }

  private emojiFor(spriteName: string): string {
    const map: Record<string, string> = {
      gift_box: "🎁",
      decoration_1: "🔴",
      decoration_2: "🟡",
      decoration_3: "✨",
      decoration_4: "🎀",
      decoration_5: "🎄",
      character_1: "🧦",
      character_2: "⛄",
      character_3: "🦌",
      character_4: "👸",
      character_5: "🎅",
      empty_slot: "□",
    };
    return map[spriteName] ?? spriteName;
  }

  moveTo(worldPos: Vec3) {
    this.node.setWorldPosition(worldPos);
  }

  snapToSlot(slotNode: Node) {
    const targetWorld = slotNode.worldPosition.clone();
    this.tweenToWorld(targetWorld, 0.2);
  }

  snapToSlotWithRejection(slotNode: Node) {
    const targetWorld = slotNode.worldPosition.clone();
    this.tweenToWorld(targetWorld, 0.2, () => this.playShake());
  }

  private tweenToWorld(target: Vec3, duration: number, onComplete?: () => void) {
    if (!this.node || !this.node.isValid) return;
    const start = this.node.getWorldPosition(new Vec3());
    const temp = new Vec3();
    tween({ t: 0 })
      .to(
        duration,
        { t: 1 },
        {
          easing: easing.quadOut,
          onUpdate: (obj: { t: number }) => {
            if (this.destroyed || !this.node || !this.node.isValid) return;
            Vec3.lerp(temp, start, target, obj.t);
            this.node.setWorldPosition(temp);
          },
        }
      )
      .call(() => {
        if (this.destroyed || !this.node || !this.node.isValid) return;
        if (onComplete) onComplete();
      })
      .start();
  }

  private playShake() {
    if (!this.node || !this.node.isValid) return;
    const base = this.node.getWorldPosition(new Vec3());
    const offset = 6;
    const temp = new Vec3();
    tween({ t: 0 })
      .to(
        0.15,
        { t: 1 },
        {
          easing: easing.elasticOut,
          onUpdate: (obj: { t: number }) => {
            if (this.destroyed || !this.node || !this.node.isValid) return;
            const dir = obj.t < 0.5 ? -1 : 1;
            Vec3.set(temp, base.x + dir * offset, base.y, base.z);
            this.node.setWorldPosition(temp);
          },
        }
      )
      .call(() => {
        if (this.destroyed || !this.node || !this.node.isValid) return;
        this.node.setWorldPosition(base);
      })
      .start();
  }

  onDestroy() {
    this.destroyed = true;
    this.node.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
    this.node.off(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
    this.node.off(Node.EventType.TOUCH_END, this.onTouchEnd, this);
    this.node.off(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
  }
}

