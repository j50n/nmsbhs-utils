"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function perpPt(p1, p2, q) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const dz = p2.z - p1.z;
    function alpha() {
        function sq(v) {
            return v * v;
        }
        const n = dx * (q.x - p1.x) + dy * (q.y - p1.y) + dz * (q.z - p1.z);
        const d = sq(dx) + sq(dy) + sq(dz);
        return n / d;
    }
    const a = alpha();
    return { x: p1.x + a * dx, y: p1.y + a * dy, z: p1.z + a * dz };
}
function dist(p1, p2) {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    const dz = p1.z - p2.z;
    return Math.sqrt(dx * dx + dy * dy * dz * dz);
}
function isOnSegment(p1, p2, q) {
    const dseg = dist(p1, p2);
    const d1 = dist(p1, q);
    const d2 = dist(p2, q);
    return dseg - (d1 + d2) < 0.000001;
}
function segmentIntersectsSphere(p1, p2, q, r) {
    const perp = perpPt(p1, p2, q);
    if (isOnSegment(p1, p2, perp)) {
        return dist(perp, q) <= r;
    }
    else {
        return dist(p1, q) <= r || dist(p2, q) <= r;
    }
}
exports.segmentIntersectsSphere = segmentIntersectsSphere;
//# sourceMappingURL=intersection.js.map