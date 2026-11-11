// Web Audio API & HTML5 Audio Chime with Continuous Alarm Subsystem

let sharedAudioContext = null;
let fallbackAudioElement = null;
let readyAlarmInterval = null;
let readyAlarmData = null;
const alarmListeners = new Set();

// Generate an offline WAV chime data URI so HTML5 Audio can play even if Web Audio is suspended
const generateChimeWavUri = () => {
    try {
        const sampleRate = 22050;
        const duration = 1.0;
        const totalSamples = Math.floor(sampleRate * duration);
        const buffer = new ArrayBuffer(44 + totalSamples * 2);
        const view = new DataView(buffer);

        const writeString = (offset, string) => {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        };

        // RIFF chunk descriptor
        writeString(0, 'RIFF');
        view.setUint32(4, 36 + totalSamples * 2, true);
        writeString(8, 'WAVE');

        // "fmt " sub-chunk
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
        view.setUint16(20, 1, true);  // AudioFormat (1 for PCM)
        view.setUint16(22, 1, true);  // NumChannels (1 = Mono)
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * 2, true); // ByteRate (sampleRate * numChannels * bitsPerSample/8)
        view.setUint16(32, 2, true);  // BlockAlign (numChannels * bitsPerSample/8)
        view.setUint16(34, 16, true); // BitsPerSample

        // "data" sub-chunk
        writeString(36, 'data');
        view.setUint32(40, totalSamples * 2, true);

        // Synthesize the 3-tone pleasant chime notes: E5 (659Hz), A5 (880Hz), C#6 (1108Hz)
        let offset = 44;
        for (let i = 0; i < totalSamples; i++) {
            const t = i / sampleRate;
            let sample = 0;

            // Note 1: E5 (0s to 0.4s)
            if (t >= 0 && t <= 0.4) {
                const env = Math.exp(-6 * t);
                sample += Math.sin(2 * Math.PI * 659.25 * t) * env * 0.35;
            }

            // Note 2: A5 (0.15s to 0.6s)
            if (t >= 0.15 && t <= 0.6) {
                const dt = t - 0.15;
                const env = Math.exp(-6 * dt);
                sample += Math.sin(2 * Math.PI * 880 * t) * env * 0.45;
            }

            // Note 3: C#6 (0.3s to 0.95s)
            if (t >= 0.3 && t <= 0.95) {
                const dt = t - 0.3;
                const env = Math.exp(-5 * dt);
                sample += Math.sin(2 * Math.PI * 1108.73 * t) * env * 0.5;
            }

            // Clamp and convert to 16-bit signed integer
            const clamped = Math.max(-1, Math.min(1, sample));
            view.setInt16(offset, clamped < 0 ? clamped * 0x8000 : clamped * 0x7FFF, true);
            offset += 2;
        }

        const blob = new Blob([buffer], { type: 'audio/wav' });
        return URL.createObjectURL(blob);
    } catch (e) {
        console.warn('WAV generation failed:', e);
        return null;
    }
};

// Web Audio API buffer cache for /order-bell.wav
let customBellAudioBuffer = null;
let isLoadingCustomBell = false;

// Preload and decode custom order-bell.wav into Web Audio memory for zero-latency, reliable playback
export const loadCustomBellAudioBuffer = async () => {
    if (customBellAudioBuffer) return customBellAudioBuffer;
    if (isLoadingCustomBell) return null;
    if (typeof window === 'undefined') return null;
    try {
        isLoadingCustomBell = true;
        if (!sharedAudioContext) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) sharedAudioContext = new AudioCtx();
        }
        const res = await fetch('/order-bell.wav');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const arrayBuf = await res.arrayBuffer();
        if (sharedAudioContext) {
            if (sharedAudioContext.decodeAudioData.length > 1) {
                customBellAudioBuffer = await new Promise((resolve, reject) => {
                    sharedAudioContext.decodeAudioData(arrayBuf, resolve, reject);
                });
            } else {
                customBellAudioBuffer = await sharedAudioContext.decodeAudioData(arrayBuf);
            }
            return customBellAudioBuffer;
        }
    } catch (e) {
        console.warn('[Audio] Failed to load /order-bell.wav into Web Audio buffer:', e);
    } finally {
        isLoadingCustomBell = false;
    }
    return null;
};

// Proactively unlock audio on user gesture
export const unlockAudio = () => {
    try {
        if (!sharedAudioContext) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) sharedAudioContext = new AudioCtx();
        }
        if (sharedAudioContext && sharedAudioContext.state === 'suspended') {
            sharedAudioContext.resume().catch(() => {});
        }

        // Preload Web Audio custom bell buffer in background
        loadCustomBellAudioBuffer().catch(() => {});

        if (!fallbackAudioElement && typeof Audio !== 'undefined') {
            const wavUrl = generateChimeWavUri();
            if (wavUrl) {
                fallbackAudioElement = new Audio(wavUrl);
                fallbackAudioElement.load();
            }
        }

        // Proactively preload order bell and keep-alive audio elements on user gesture
        if (typeof Audio !== 'undefined') {
            const bell = getOrderBellAudio();
            if (bell) bell.load();
            const keepAlive = getKeepAliveAudio();
            if (keepAlive) keepAlive.load();
        }
    } catch (err) {
        void err;
    }
};

if (typeof window !== 'undefined') {
    ['click', 'touchstart', 'keydown'].forEach(evt => {
        window.addEventListener(evt, unlockAudio, { passive: true });
    });
}

// Play single custom order bell sound (/order-bell.wav) with Web Audio buffer + HTML5 audio dual fallback
export const playCustomBellSound = () => {
    let played = false;
    unlockAudio();

    // 1. Try Web Audio buffer source (lowest latency, zero network roundtrip, immune to element busy states)
    try {
        const ctx = sharedAudioContext;
        if (ctx && ctx.state !== 'closed' && customBellAudioBuffer) {
            if (ctx.state === 'suspended') {
                ctx.resume().catch(() => {});
            }
            const source = ctx.createBufferSource();
            const gainNode = ctx.createGain();
            source.buffer = customBellAudioBuffer;
            gainNode.gain.setValueAtTime(1.0, ctx.currentTime);
            source.connect(gainNode);
            gainNode.connect(ctx.destination);
            source.start(0);
            played = true;
        }
    } catch (e) {
        console.warn('[Audio] Web Audio custom bell play error:', e);
    }

    // 2. Dual fallback: Dedicated HTML5 Audio element instance
    if (!played && typeof Audio !== 'undefined') {
        try {
            const audio = new Audio('/order-bell.wav');
            audio.volume = 1.0;
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    played = true;
                }).catch((err) => {
                    console.warn('[Audio] HTML5 audio.play() blocked or failed:', err);
                    playUrgentOrderBell();
                });
            }
        } catch (err) {
            console.warn('[Audio] HTML5 audio error:', err);
            playUrgentOrderBell();
        }
    }

    // Trigger preload if not yet ready for subsequent calls
    if (!customBellAudioBuffer) {
        loadCustomBellAudioBuffer().catch(() => {});
    }
};

// Play single order chime
export const playOrderChimeSound = () => {
    let played = false;

    // Try Web Audio API first
    try {
        unlockAudio();
        const ctx = sharedAudioContext;
        if (ctx && ctx.state !== 'closed') {
            if (ctx.state === 'suspended') {
                ctx.resume();
            }

            const now = ctx.currentTime;

            // Note 1: E5 (659.25 Hz)
            const osc1 = ctx.createOscillator();
            const gain1 = ctx.createGain();
            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(659.25, now);
            gain1.gain.setValueAtTime(0.3, now);
            gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
            osc1.connect(gain1);
            gain1.connect(ctx.destination);
            osc1.start(now);
            osc1.stop(now + 0.35);

            // Note 2: A5 (880 Hz)
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(880, now + 0.15);
            gain2.gain.setValueAtTime(0.4, now + 0.15);
            gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
            osc2.connect(gain2);
            gain2.connect(ctx.destination);
            osc2.start(now + 0.15);
            osc2.stop(now + 0.55);

            // Note 3: C#6 (1108.73 Hz)
            const osc3 = ctx.createOscillator();
            const gain3 = ctx.createGain();
            osc3.type = 'sine';
            osc3.frequency.setValueAtTime(1108.73, now + 0.3);
            gain3.gain.setValueAtTime(0.5, now + 0.3);
            gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.95);
            osc3.connect(gain3);
            gain3.connect(ctx.destination);
            osc3.start(now + 0.3);
            osc3.stop(now + 0.95);

            played = true;
        }
    } catch (e) {
        console.warn('Web Audio playback error:', e);
    }

    // Fallback to HTML5 audio element
    if (!played && fallbackAudioElement) {
        try {
            fallbackAudioElement.currentTime = 0;
            fallbackAudioElement.play().catch(() => {});
        } catch (err) {
            void err;
        }
    }
};

// Continuous Ready Status Alarm Subsystem
export const isReadyAlarmActive = () => !!readyAlarmInterval;

export const getReadyAlarmData = () => readyAlarmData;

export const subscribeAlarmState = (callback) => {
    alarmListeners.add(callback);
    callback(isReadyAlarmActive(), readyAlarmData);
    return () => alarmListeners.delete(callback);
};

const notifyAlarmListeners = () => {
    alarmListeners.forEach(cb => {
        try {
            cb(isReadyAlarmActive(), readyAlarmData);
        } catch (err) {
            void err;
        }
    });
};

export const startReadyAlarm = ({ orderId, orderNumber }) => {
    if (readyAlarmInterval) return; // already ringing
    readyAlarmData = { orderId, orderNumber, startTime: Date.now() };

    // Repeat chime and vibration every 4 seconds
    readyAlarmInterval = setInterval(() => {
        playOrderChimeSound();
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
            try {
                navigator.vibrate([400, 200, 400]);
            } catch (err) {
                void err;
            }
        }
    }, 4000);

    // Play immediately
    playOrderChimeSound();
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
            navigator.vibrate([400, 200, 400]);
        } catch (err) {
            void err;
        }
    }

    notifyAlarmListeners();
};

export const stopReadyAlarm = () => {
    if (readyAlarmInterval) {
        clearInterval(readyAlarmInterval);
        readyAlarmInterval = null;
    }
    readyAlarmData = null;
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
            navigator.vibrate(0);
        } catch (err) {
            void err;
        }
    }
    notifyAlarmListeners();
};

// ==============================================================================
// SWIGGY / ZOMATO STYLE URGENT INCOMING ORDER RINGING SYSTEM
// ==============================================================================
let orderRingingInterval = null;
let orderRingingData = null;
const orderRingingListeners = new Set();

let orderBellAudioElement = null;
let keepAliveAudioElement = null;
let isKeepAliveActive = false;

const getOrderBellAudio = () => {
    if (!orderBellAudioElement && typeof Audio !== 'undefined') {
        orderBellAudioElement = new Audio('/order-bell.wav');
        orderBellAudioElement.preload = 'auto';
        orderBellAudioElement.loop = true;
    }
    return orderBellAudioElement;
};

const getKeepAliveAudio = () => {
    if (!keepAliveAudioElement && typeof Audio !== 'undefined') {
        keepAliveAudioElement = new Audio('/silent.wav');
        keepAliveAudioElement.preload = 'auto';
        keepAliveAudioElement.loop = true;
        keepAliveAudioElement.volume = 0.01;
    }
    return keepAliveAudioElement;
};

// Keeps Android/iOS audio pipeline and background processing awake while phone is locked
export const startBackgroundAudioKeepAlive = () => {
    isKeepAliveActive = true;
    try {
        const keepAlive = getKeepAliveAudio();
        if (keepAlive && keepAlive.paused) {
            keepAlive.play().catch(() => {});
        }
        if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: 'InnBite Waiter · Shift Active',
                artist: 'Listening for new incoming orders...',
                album: 'InnBite Orders'
            });
            navigator.mediaSession.playbackState = 'playing';
        }
    } catch (err) {
        console.warn('Keep-alive audio error:', err);
    }
};

export const stopBackgroundAudioKeepAlive = () => {
    isKeepAliveActive = false;
    try {
        if (keepAliveAudioElement) {
            keepAliveAudioElement.pause();
        }
    } catch {
        // Ignore
    }
};

// Synthesize loud urgent 2-tone order bell (A5 -> E6 double pulse)
export const playUrgentOrderBell = () => {
    let played = false;
    try {
        unlockAudio();
        const ctx = sharedAudioContext;
        if (ctx && ctx.state !== 'closed') {
            if (ctx.state === 'suspended') ctx.resume();

            const now = ctx.currentTime;

            // Pulse 1: Note A5 (880 Hz)
            const osc1 = ctx.createOscillator();
            const gain1 = ctx.createGain();
            osc1.type = 'triangle';
            osc1.frequency.setValueAtTime(880, now);
            gain1.gain.setValueAtTime(0.45, now);
            gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
            osc1.connect(gain1);
            gain1.connect(ctx.destination);
            osc1.start(now);
            osc1.stop(now + 0.18);

            // Pulse 2: Note E6 (1318.5 Hz)
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.type = 'triangle';
            osc2.frequency.setValueAtTime(1318.51, now + 0.12);
            gain2.gain.setValueAtTime(0.55, now + 0.12);
            gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
            osc2.connect(gain2);
            gain2.connect(ctx.destination);
            osc2.start(now + 0.12);
            osc2.stop(now + 0.38);

            // Pulse 3: Echo chime (1318.5 Hz)
            const osc3 = ctx.createOscillator();
            const gain3 = ctx.createGain();
            osc3.type = 'triangle';
            osc3.frequency.setValueAtTime(1318.51, now + 0.42);
            gain3.gain.setValueAtTime(0.5, now + 0.42);
            gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.75);
            osc3.connect(gain3);
            gain3.connect(ctx.destination);
            osc3.start(now + 0.42);
            osc3.stop(now + 0.75);

            played = true;
        }
    } catch (e) {
        console.warn('Urgent bell Web Audio error:', e);
    }

    if (!played) {
        playOrderChimeSound();
    }
};

export const isOrderRingingActive = () => !!orderRingingInterval;
export const getOrderRingingData = () => orderRingingData;

export const subscribeOrderRingingState = (callback) => {
    orderRingingListeners.add(callback);
    callback(isOrderRingingActive(), orderRingingData);
    return () => orderRingingListeners.delete(callback);
};

const notifyOrderRingingListeners = () => {
    orderRingingListeners.forEach(cb => {
        try {
            cb(isOrderRingingActive(), orderRingingData);
        } catch (err) {
            void err;
        }
    });
};

let activeWebAudioRingingSource = null;

// Start urgent ringing loop (Web Audio buffer loop + HTML5 native loop + MediaSession lock-screen alert + fallback interval)
export const startOrderRingingAlarm = (order) => {
    if (orderRingingInterval) {
        orderRingingData = order;
        notifyOrderRingingListeners();
        return;
    }
    orderRingingData = order;

    // 1. Play looping audio bell (Web Audio BufferSource loop if preloaded)
    let playedWebAudio = false;
    try {
        unlockAudio();
        const ctx = sharedAudioContext;
        if (ctx && ctx.state !== 'closed' && customBellAudioBuffer) {
            if (ctx.state === 'suspended') ctx.resume().catch(() => {});
            const source = ctx.createBufferSource();
            source.buffer = customBellAudioBuffer;
            source.loop = true;
            const gainNode = ctx.createGain();
            gainNode.gain.setValueAtTime(1.0, ctx.currentTime);
            source.connect(gainNode);
            gainNode.connect(ctx.destination);
            source.start(0);
            activeWebAudioRingingSource = source;
            playedWebAudio = true;
        }
    } catch (e) {
        console.warn('[Audio] Web Audio loop start error:', e);
    }

    // HTML5 native audio fallback loop if Web Audio loop wasn't ready
    if (!playedWebAudio) {
        try {
            const bellAudio = getOrderBellAudio();
            if (bellAudio) {
                bellAudio.currentTime = 0;
                bellAudio.loop = true;
                bellAudio.volume = 1.0;
                bellAudio.play().catch(err => {
                    console.warn('[Audio] HTML5 bell play error, falling back to Web Audio synth:', err);
                    playUrgentOrderBell();
                });
            }
        } catch (err) {
            console.warn('[Audio] Failed to start HTML5 bell audio:', err);
        }
    }

    // 2. Register with OS Media Session API (shows lock screen player with controls)
    if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
        try {
            const tableText = (order?.table_number ?? order?.tableNumber) ? `Table #${order?.table_number ?? order?.tableNumber}` : 'Takeaway Order';
            const orderNum = order?.order_number || order?.orderNumber || order?.id || order?.orderId || '';
            const totalVal = Number(order?.total_amount ?? order?.totalAmount ?? 0);
            navigator.mediaSession.metadata = new MediaMetadata({
                title: `🚨 NEW ORDER #${orderNum} (${tableText})`,
                artist: `Total: ₹${(isNaN(totalVal) ? 0 : totalVal).toFixed(2)} · ${order?.customer_name || order?.customerName || 'Guest'}`,
                album: 'InnBite Kitchen Alert',
                artwork: [
                    { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
                    { src: '/icon-512.png', sizes: '512x512', type: 'image/png' }
                ]
            });
            navigator.mediaSession.playbackState = 'playing';
            navigator.mediaSession.setActionHandler('pause', () => stopOrderRingingAlarm());
            navigator.mediaSession.setActionHandler('stop', () => stopOrderRingingAlarm());
        } catch {
            // Ignore MediaSession error
        }
    }

    // 3. Fallback interval & vibration loop
    orderRingingInterval = setInterval(() => {
        if (!playedWebAudio && !orderBellAudioElement?.playing) {
            playCustomBellSound();
        }
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
            try {
                navigator.vibrate([1000, 300, 1000, 300, 1000]);
            } catch {
                // Ignore vibration error
            }
        }
    }, 2500);

    // Trigger immediate ring & vibration
    if (!playedWebAudio) {
        playUrgentOrderBell();
    }
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
            navigator.vibrate([1000, 300, 1000, 300, 1000]);
        } catch {
            // Ignore vibration error
        }
    }

    notifyOrderRingingListeners();
};

// Stop urgent ringing alarm
export const stopOrderRingingAlarm = () => {
    if (orderRingingInterval) {
        clearInterval(orderRingingInterval);
        orderRingingInterval = null;
    }
    orderRingingData = null;

    // Stop Web Audio ringing source if active
    if (activeWebAudioRingingSource) {
        try {
            activeWebAudioRingingSource.stop();
            activeWebAudioRingingSource.disconnect();
        } catch (e) {
            void e;
        }
        activeWebAudioRingingSource = null;
    }

    // Pause native HTML5 order bell
    if (orderBellAudioElement) {
        try {
            orderBellAudioElement.pause();
            orderBellAudioElement.currentTime = 0;
        } catch (e) {
            void e;
        }
    }

    // Stop vibration
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
            navigator.vibrate(0);
        } catch {
            // Ignore vibration error
        }
    }

    // Reset Media Session or resume keep-alive if shift is active
    if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
        try {
            navigator.mediaSession.playbackState = 'none';
        } catch (e) {
            void e;
        }
    }

    if (isKeepAliveActive) {
        startBackgroundAudioKeepAlive();
    }

    notifyOrderRingingListeners();
};
