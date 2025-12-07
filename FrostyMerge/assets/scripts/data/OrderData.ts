import { ItemGroup } from "./ItemData";

export interface Order {
  group: ItemGroup;
  level: number;
  reward: number;
}

export class OrderData {
  // Simple reward curve; can be tuned later
  static rewardForLevel(level: number): number {
    switch (level) {
      case 1:
        return 5;
      case 2:
        return 15;
      case 3:
        return 40;
      case 4:
        return 100;
      case 5:
      default:
        return 250;
    }
  }

  static randomOrder(): Order {
    const group =
      Math.random() > 0.5 ? ItemGroup.DECORATION : ItemGroup.CHARACTER;
    const level = Math.max(1, Math.min(5, Math.floor(Math.random() * 5) + 1));
    return {
      group,
      level,
      reward: this.rewardForLevel(level),
    };
  }

  static firstOrder(): Order {
    // First order is always level 2 for easier testing
    const group =
      Math.random() > 0.5 ? ItemGroup.DECORATION : ItemGroup.CHARACTER;
    return {
      group,
      level: 2,
      reward: this.rewardForLevel(2),
    };
  }
}

