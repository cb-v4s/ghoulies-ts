import { FacingDirection, Position } from "../types";
import { frontRight, backLeft, frontLeft, backRight } from "../constants";

export const sleep = (delayMs: number) =>
  new Promise((resolve) => setTimeout(resolve, delayMs));

export function getFacingDirection(
  origin: Position,
  target: Position
): FacingDirection {
  const deltaX = target.Row - origin.Row;
  const deltaY = target.Col - origin.Col;

  if (deltaY === 0) {
    if (deltaX > 0) {
      return frontRight;
    } else if (deltaX < 0) {
      return backLeft;
    }
  } else if (deltaX === 0) {
    if (deltaY > 0) {
      return frontLeft;
    } else if (deltaY < 0) {
      return frontRight;
    }
  } else if (deltaX > 0 && deltaY > 0) {
    if (deltaX === 1) {
      return frontLeft;
    }
    return frontRight;
  } else if (deltaX < 0 && deltaY > 0) {
    return frontLeft;
  } else if (deltaX < 0 && deltaY < 0) {
    return backLeft;
  } else if (deltaX > 0 && deltaY < 0) {
    if (deltaX === 1) {
      return frontRight;
    }
    return backRight;
  }

  return frontRight;
}
