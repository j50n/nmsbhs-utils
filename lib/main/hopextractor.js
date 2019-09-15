"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isValidHop(hop) {
    const movesTowardCenter = hop.blackhole.coords.dist2Center() > hop.exit.coords.dist2Center();
    const isInsideGalacticCircle = hop.blackhole.coords.dist2Center() <= 0x7ff;
    const traveledANormalDistance = hop.radialDist * 400 <= 16000;
    return movesTowardCenter && (isInsideGalacticCircle ? traveledANormalDistance : true);
}
exports.isValidHop = isValidHop;
//# sourceMappingURL=hopextractor.js.map