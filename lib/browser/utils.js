function lazily(f) {
    let t;
    return () => {
        if (typeof t === "undefined") {
            t = f();
        }
        return t;
    };
}
export { lazily };
//# sourceMappingURL=utils.js.map