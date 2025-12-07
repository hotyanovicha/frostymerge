export enum MoveResult {
  SUCCESS_MOVE,
  SUCCESS_MERGE,
  INVALID_SOURCE,
  INVALID_TARGET,
  TARGET_OCCUPIED,
  CANNOT_MERGE_GENERATOR,
  MAX_LEVEL_REACHED,
  SAME_SLOT,
}

export type MoveOutcome = {
  result: MoveResult;
};

