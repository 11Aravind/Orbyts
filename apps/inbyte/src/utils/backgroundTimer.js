// Web Worker background timer to prevent browsers from throttling setInterval in minimized/locked tabs

export class BackgroundTimer {
    constructor(callback, intervalMs = 4000) {
        this.callback = callback;
        this.intervalMs = intervalMs;
        this.worker = null;
        this.fallbackTimerId = null;
        this.isRunning = false;
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;

        try {
            // Worker script creates a timer in an isolated background thread that browsers won't throttle
            const workerCode = `
                let timer = null;
                self.onmessage = function(e) {
                    if (e.data.action === 'start') {
                        if (timer) clearInterval(timer);
                        timer = setInterval(function() {
                            self.postMessage('tick');
                        }, e.data.interval || 4000);
                    } else if (e.data.action === 'stop') {
                        if (timer) clearInterval(timer);
                        timer = null;
                    }
                };
            `;
            const blob = new Blob([workerCode], { type: 'application/javascript' });
            this.workerUrl = URL.createObjectURL(blob);
            this.worker = new Worker(this.workerUrl);

            this.worker.onmessage = () => {
                if (this.isRunning && typeof this.callback === 'function') {
                    this.callback();
                }
            };

            this.worker.postMessage({ action: 'start', interval: this.intervalMs });
        } catch (e) {
            console.warn('[BackgroundTimer] Web Worker not available, falling back to window.setInterval:', e);
            this.fallbackTimerId = setInterval(() => {
                if (this.isRunning && typeof this.callback === 'function') {
                    this.callback();
                }
            }, this.intervalMs);
        }
    }

    stop() {
        this.isRunning = false;

        if (this.worker) {
            try {
                this.worker.postMessage({ action: 'stop' });
                this.worker.terminate();
            } catch (err) {
                // Ignore worker termination errors
                void err;
            }
            this.worker = null;
        }

        if (this.workerUrl) {
            try {
                URL.revokeObjectURL(this.workerUrl);
            } catch (err) {
                // Ignore revoke errors
                void err;
            }
            this.workerUrl = null;
        }

        if (this.fallbackTimerId) {
            clearInterval(this.fallbackTimerId);
            this.fallbackTimerId = null;
        }
    }
}
