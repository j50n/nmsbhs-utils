"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function lazily(f) {
    let t;
    return () => {
        if (typeof t === "undefined") {
            t = f();
        }
        return t;
    };
}
exports.lazily = lazily;
//# sourceMappingURL=utils.js.map