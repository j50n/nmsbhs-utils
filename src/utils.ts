function lazily<T>(f: () => T): () => T {
    let t: T;

    return () => {
        if (typeof t === "undefined") {
            t = f();
        }
        return t;
    };
}

export {  lazily };
