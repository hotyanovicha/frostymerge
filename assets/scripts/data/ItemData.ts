// ItemData defines the item families and levels for the merge chains.
export enum ItemGroup {
  DECORATION = "DECORATION", // Tree decoration chain
  CHARACTER = "CHARACTER", // Holiday characters chain
  GENERATOR = "GENERATOR", // The magic gift box
}

export class ItemData {
  group: ItemGroup;
  level: number; // 1..5

  constructor(group: ItemGroup, level: number) {
    this.group = group;
    this.level = level;
  }

  // Returns a sprite name that can be mapped to a resource
  // Example: decoration_1 (red ball), character_5 (Santa), gift_box
  getSpriteName(): string {
    if (this.group === ItemGroup.GENERATOR) return "gift_box";
    const prefix =
      this.group === ItemGroup.DECORATION ? "decoration_" : "character_";
    return `${prefix}${this.level}`;
  }
}
// ItemData defines the item families and levels for the merge chains.
export enum ItemGroup {
  DECORATION = "DECORATION", // Tree decoration chain
  CHARACTER = "CHARACTER", // Holiday characters chain
  GENERATOR = "GENERATOR", // The magic gift box
}

export class ItemData {
  group: ItemGroup;
  level: number; // 1..5

  constructor(group: ItemGroup, level: number) {
    this.group = group;
    this.level = level;
  }

  // Returns a sprite name that can be mapped to a resource
  // Example: decoration_1 (red ball), character_5 (Santa), gift_box
  getSpriteName(): string {
    if (this.group === ItemGroup.GENERATOR) return "gift_box";
    const prefix =
      this.group === ItemGroup.DECORATION ? "decoration_" : "character_";
    return `${prefix}${this.level}`;
  }
}

