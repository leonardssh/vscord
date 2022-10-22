export const throttle = (fn: CallableFunction, delay: number, runAfterThrottleEnd: boolean = false) => {
    let lastCalled = 0;
    let timeout: NodeJS.Timeout;

    return (...args: any[]) => {
        const run = () => {
            clearTimeout(timeout);
            lastCalled = new Date().getTime();
            return fn(...args);
        };

        const now = new Date().getTime();
        if (now - lastCalled < delay) {
            if (runAfterThrottleEnd) {
                clearTimeout(timeout);
                timeout = setTimeout(run, delay - (now - lastCalled));
            }
            return;
        }

        return run();
    };
};
