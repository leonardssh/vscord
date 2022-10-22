export const throttle = (fn: CallableFunction, delay: number, runAfterThrottleEnd: boolean = false) => {
    let timeout: NodeJS.Timeout | undefined;
    let lastCalled = 0;

    return (...args: any[]): any => {
        const run = () => {
            clearTimeout(timeout);
            lastCalled = new Date().getTime();
            return fn(...args);
        };

        const now = new Date().getTime();
        if (now - lastCalled < delay) {
            if (!runAfterThrottleEnd) return;

            clearTimeout(timeout);
            timeout = setTimeout(run, delay - (now - lastCalled));
            return;
        }

        return run();
    };
};
