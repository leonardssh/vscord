// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const throttle = <F extends (...args: any[]) => any>(func: F, delay: number, runAfterThrottleEnd = false) => {
    let timeout: NodeJS.Timeout | undefined;
    let lastCalled = 0;

    return {
        callable: (...args: Parameters<F>): ReturnType<F> | undefined => {
            const run = () => {
                if (timeout) clearTimeout(timeout);

                lastCalled = new Date().getTime();
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                return func(...args);
            };

            const now = new Date().getTime();
            if (now - lastCalled < delay) {
                if (!runAfterThrottleEnd) return;

                if (timeout) clearTimeout(timeout);

                timeout = setTimeout(run, delay - (now - lastCalled));
            } else {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                return run();
            }
        },
        reset: (setLastCalled = false) => {
            if (setLastCalled) lastCalled = new Date().getTime();

            if (timeout) clearTimeout(timeout);
        }
    };
};
