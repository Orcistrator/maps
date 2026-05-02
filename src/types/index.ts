export type RegionType = "room" | "corridor" | "outdoor" | "water" | "unknown";

export type GenerationStatus = "pending" | "running" | "complete" | "failed";

export interface RegionBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}
