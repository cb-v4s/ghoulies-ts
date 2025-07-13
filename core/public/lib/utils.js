"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sleep = void 0;
exports.getFacingDirection = getFacingDirection;
const constants_1 = require("../constants");
const sleep = (delayMs) => new Promise((resolve) => setTimeout(resolve, delayMs));
exports.sleep = sleep;
function getFacingDirection(origin, target) {
    const deltaX = target.Row - origin.Row;
    const deltaY = target.Col - origin.Col;
    if (deltaY === 0) {
        if (deltaX > 0) {
            return constants_1.frontRight;
        }
        else if (deltaX < 0) {
            return constants_1.backLeft;
        }
    }
    else if (deltaX === 0) {
        if (deltaY > 0) {
            return constants_1.frontLeft;
        }
        else if (deltaY < 0) {
            return constants_1.frontRight;
        }
    }
    else if (deltaX > 0 && deltaY > 0) {
        if (deltaX === 1) {
            return constants_1.frontLeft;
        }
        return constants_1.frontRight;
    }
    else if (deltaX < 0 && deltaY > 0) {
        return constants_1.frontLeft;
    }
    else if (deltaX < 0 && deltaY < 0) {
        return constants_1.backLeft;
    }
    else if (deltaX > 0 && deltaY < 0) {
        if (deltaX === 1) {
            return constants_1.frontRight;
        }
        return constants_1.backRight;
    }
    return constants_1.frontRight;
}
