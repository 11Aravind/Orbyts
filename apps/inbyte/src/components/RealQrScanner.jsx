import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { SwitchCamera, Zap, ZapOff, RefreshCw, CameraOff, QrCode } from 'lucide-react';

export default function RealQrScanner({ onScanSuccess, onScanError }) {
    const containerIdRef = useRef(`qr-reader-${Math.random().toString(36).slice(2, 9)}`);
    const scannerRef = useRef(null);
    const isMountedRef = useRef(true);
    const isSwitchingRef = useRef(false);
    const onScanSuccessRef = useRef(onScanSuccess);
    const onScanErrorRef = useRef(onScanError);

    const [isScanning, setIsScanning] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSwitching, setIsSwitching] = useState(false);
    const [cameras, setCameras] = useState([]);
    const [activeCameraIndex, setActiveCameraIndex] = useState(0);
    const [torchSupported, setTorchSupported] = useState(false);
    const [isTorchOn, setIsTorchOn] = useState(false);
    const [cameraError, setCameraError] = useState(null);
    const [flipDegree, setFlipDegree] = useState(0);

    useEffect(() => {
        onScanSuccessRef.current = onScanSuccess;
        onScanErrorRef.current = onScanError;
    }, [onScanSuccess, onScanError]);

    // Helper: format camera label nicely for UI badge
    const getCameraLabel = (cam, index) => {
        if (!cam) return `Camera ${index + 1}`;
        const l = (cam.label || '').toLowerCase();
        if (/back|rear|environment/i.test(l)) return 'Back Camera';
        if (/front|user|selfie|face/i.test(l)) return 'Front Camera';
        if (cam.label && cam.label.trim().length > 0) {
            return cam.label.length > 16 ? `${cam.label.slice(0, 14)}...` : cam.label;
        }
        return `Camera ${index + 1}`;
    };

    // Helper: start scanning with camera configuration
    const startScanner = useCallback(async (cameraConfig, isInitial = false) => {
        if (!isMountedRef.current) return;
        const scanner = scannerRef.current;
        if (!scanner) return;

        setIsLoading(true);
        setCameraError(null);

        const qrConfig = {
            fps: 12,
            qrbox: (viewfinderWidth, viewfinderHeight) => {
                const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
                const size = Math.max(180, Math.floor(minEdge * 0.72));
                return { width: size, height: size };
            },
            aspectRatio: 1.0,
        };

        try {
            await scanner.start(
                cameraConfig,
                qrConfig,
                (decodedText, decodedResult) => {
                    if (isMountedRef.current && onScanSuccessRef.current) {
                        onScanSuccessRef.current(decodedText, decodedResult);
                    }
                },
                (errorMessage) => {
                    if (isMountedRef.current && onScanErrorRef.current) {
                        onScanErrorRef.current(errorMessage);
                    }
                }
            );

            if (!isMountedRef.current) {
                if (scanner.isScanning) {
                    await scanner.stop().catch(() => {});
                }
                return;
            }

            setIsScanning(true);
            setIsLoading(false);

            // Enumerate cameras once permission is granted
            try {
                const devices = await Html5Qrcode.getCameras();
                if (devices && devices.length > 0 && isMountedRef.current) {
                    setCameras(devices);
                    if (isInitial) {
                        const backIdx = devices.findIndex(d => /back|rear|environment/i.test(d.label));
                        setActiveCameraIndex(backIdx !== -1 ? backIdx : 0);
                    }
                }
            } catch (e) {
                console.warn('Could not enumerate cameras:', e);
            }

            // Check torch capabilities
            try {
                const caps = scanner.getRunningTrackCameraCapabilities?.();
                const torch = caps?.torchFeature?.();
                if (isMountedRef.current) {
                    setTorchSupported(Boolean(torch?.isSupported?.()));
                    setIsTorchOn(false);
                }
            } catch {
                if (isMountedRef.current) {
                    setTorchSupported(false);
                    setIsTorchOn(false);
                }
            }
        } catch (err) {
            console.error('Camera startup error:', err);

            // Fallback for initial environment request if device lacks an environment-named camera
            if (isInitial && cameraConfig?.facingMode === 'environment') {
                try {
                    const devices = await Html5Qrcode.getCameras();
                    if (devices && devices.length > 0 && isMountedRef.current) {
                        const rearCam = devices.find(d => /back|rear|environment/i.test(d.label));
                        const chosen = rearCam || devices[0];
                        setCameras(devices);
                        setActiveCameraIndex(devices.indexOf(chosen));
                        await startScanner(chosen.id, false);
                        return;
                    }
                } catch (fallbackErr) {
                    console.error('Camera fallback failed:', fallbackErr);
                }
            }

            if (isMountedRef.current) {
                setIsLoading(false);
                setIsScanning(false);
                setCameraError(
                    err?.message || 'Unable to access camera. Please allow camera permissions.'
                );
            }
        }
    }, []);

    // Initial mount: create instance and request back camera by default
    useEffect(() => {
        isMountedRef.current = true;
        const containerId = containerIdRef.current;
        const scanner = new Html5Qrcode(containerId, { verbose: false });
        scannerRef.current = scanner;

        // Default to back camera for mobile/tablet devices
        startScanner({ facingMode: 'environment' }, true);

        return () => {
            isMountedRef.current = false;
            if (scannerRef.current) {
                const sc = scannerRef.current;
                if (sc.isScanning) {
                    sc.stop()
                        .then(() => {
                            try {
                                sc.clear();
                            } catch (clearErr) {
                                void clearErr;
                            }
                        })
                        .catch((stopErr) => {
                            void stopErr;
                        });
                } else {
                    try {
                        sc.clear();
                    } catch (clearErr) {
                        void clearErr;
                    }
                }
            }
        };
    }, [startScanner]);

    // Handle switching camera
    const handleSwitchCamera = async () => {
        if (!scannerRef.current || isSwitchingRef.current || cameras.length < 2) return;
        isSwitchingRef.current = true;
        setIsSwitching(true);
        setFlipDegree(prev => prev + 180);

        const nextIndex = (activeCameraIndex + 1) % cameras.length;
        const nextCamera = cameras[nextIndex];

        try {
            if (scannerRef.current.isScanning) {
                await scannerRef.current.stop();
            }
            setActiveCameraIndex(nextIndex);
            await startScanner(nextCamera.id, false);
        } catch (err) {
            console.error('Failed to switch camera:', err);
        } finally {
            if (isMountedRef.current) {
                setIsSwitching(false);
                isSwitchingRef.current = false;
            }
        }
    };

    // Handle toggling torch / flashlight
    const handleToggleTorch = async () => {
        if (!scannerRef.current || !torchSupported) return;
        try {
            const caps = scannerRef.current.getRunningTrackCameraCapabilities?.();
            const torch = caps?.torchFeature?.();
            if (torch?.isSupported?.()) {
                const nextVal = !isTorchOn;
                await torch.apply(nextVal);
                setIsTorchOn(nextVal);
            }
        } catch (err) {
            console.warn('Torch toggle failed:', err);
        }
    };

    // Retry camera access
    const handleRetry = () => {
        startScanner({ facingMode: 'environment' }, true);
    };

    const containerId = containerIdRef.current;

    return (
        <div className="w-full max-w-sm mx-auto flex flex-col items-center">
            {/* Viewfinder Outer Container */}
            <div className="relative w-full aspect-square max-w-[320px] rounded-3xl overflow-hidden bg-slate-950 border border-slate-200/90 shadow-2xl shadow-blue-500/5 select-none">
                {/* HTML5-Qrcode Container */}
                <div id={containerId} className="w-full h-full" />

                {/* Animated Scanner Laser & Corner Brackets (Active when scanning) */}
                {isScanning && !isLoading && !isSwitching && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-8 z-10">
                        <div className="relative w-full h-full max-w-[210px] max-h-[210px]">
                            {/* 4 Sleek Rounded Corner Brackets */}
                            <div className="absolute top-0 left-0 w-7 h-7 border-t-[3.5px] border-l-[3.5px] border-blue-500 rounded-tl-xl shadow-[0_0_12px_rgba(59,130,246,0.5)]" />
                            <div className="absolute top-0 right-0 w-7 h-7 border-t-[3.5px] border-r-[3.5px] border-blue-500 rounded-tr-xl shadow-[0_0_12px_rgba(59,130,246,0.5)]" />
                            <div className="absolute bottom-0 left-0 w-7 h-7 border-b-[3.5px] border-l-[3.5px] border-blue-500 rounded-bl-xl shadow-[0_0_12px_rgba(59,130,246,0.5)]" />
                            <div className="absolute bottom-0 right-0 w-7 h-7 border-b-[3.5px] border-r-[3.5px] border-blue-500 rounded-br-xl shadow-[0_0_12px_rgba(59,130,246,0.5)]" />

                            {/* Center Target Crosshair Accent */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-30">
                                <div className="w-2.5 h-2.5 rounded-full border border-blue-400" />
                            </div>

                            {/* Animated Glowing Laser Scan Beam */}
                            <div className="absolute inset-x-1 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_14px_#3b82f6] animate-scanner-laser" />
                        </div>
                    </div>
                )}

                {/* Top Overlay Bar: Camera Label Badge & Torch Toggle */}
                {isScanning && !isLoading && (
                    <div className="absolute top-3 inset-x-3 z-20 flex items-center justify-between pointer-events-none">
                        {/* Camera Indicator Badge */}
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/55 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold tracking-tight shadow-md select-none">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span>{getCameraLabel(cameras[activeCameraIndex], activeCameraIndex)}</span>
                        </div>

                        {/* Torch / Flashlight Toggle (if supported) */}
                        {torchSupported && (
                            <button
                                type="button"
                                onClick={handleToggleTorch}
                                aria-label={isTorchOn ? 'Turn off flashlight' : 'Turn on flashlight'}
                                title={isTorchOn ? 'Turn off flashlight' : 'Turn on flashlight'}
                                className={`pointer-events-auto w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md border transition-all duration-200 shadow-md active:scale-95 cursor-pointer ${
                                    isTorchOn
                                        ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-[0_0_16px_rgba(245,158,11,0.6)]'
                                        : 'bg-black/55 text-white/90 border-white/20 hover:bg-black/75'
                                }`}
                            >
                                {isTorchOn ? <Zap className="w-4 h-4 fill-current" /> : <ZapOff className="w-4 h-4" />}
                            </button>
                        )}
                    </div>
                )}

                {/* Floating Flip Camera Button (Bottom-Right, shown when 2+ cameras exist) */}
                {cameras.length >= 2 && !isLoading && (
                    <button
                        type="button"
                        onClick={handleSwitchCamera}
                        disabled={isSwitching}
                        aria-label="Switch camera"
                        title="Flip to next camera"
                        className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-black/60 hover:bg-black/80 active:scale-95 text-white backdrop-blur-md border border-white/25 shadow-lg transition-all duration-200 cursor-pointer disabled:opacity-50"
                    >
                        <SwitchCamera
                            className="w-4 h-4 text-white transition-transform duration-500 ease-out"
                            style={{ transform: `rotate(${flipDegree}deg)` }}
                        />
                        <span className="text-[11px] font-bold tracking-tight text-white/95">
                            Flip
                        </span>
                    </button>
                )}

                {/* Loading / Camera Starting State */}
                {isLoading && !cameraError && (
                    <div className="absolute inset-0 z-30 bg-slate-950 flex flex-col items-center justify-center gap-3 p-4 text-center">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-inner">
                            <QrCode className="w-6 h-6 animate-pulse" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-white tracking-tight">Starting Back Camera...</p>
                            <p className="text-[11px] text-slate-400">Please allow camera access if prompted</p>
                        </div>
                    </div>
                )}

                {/* Camera Switching Overlay */}
                {isSwitching && (
                    <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-2.5 text-white transition-all">
                        <RefreshCw className="w-7 h-7 text-blue-400 animate-spin" />
                        <span className="text-xs font-bold tracking-tight">Switching Camera...</span>
                    </div>
                )}

                {/* Permission Denied or Camera Error State */}
                {cameraError && (
                    <div className="absolute inset-0 z-30 bg-slate-950 p-6 flex flex-col items-center justify-center text-center space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                            <CameraOff className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-xs font-bold text-white">Camera Access Required</h3>
                            <p className="text-[11px] text-slate-400 leading-relaxed max-w-[220px]">
                                {cameraError.includes('NotAllowedError') || cameraError.includes('permission')
                                    ? 'Camera permission was denied. Please allow camera access in your browser.'
                                    : 'Unable to start camera. Please verify device camera settings.'}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={handleRetry}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold rounded-xl text-xs transition-all shadow-md cursor-pointer"
                        >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Try Again</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Helper Text Under Viewfinder */}
            <p className="text-[11px] font-medium text-slate-500 mt-2.5">
                Align the table QR code within the frame to scan
            </p>

            {/* CSS to ensure video fills cleanly and hide default HTML5-qrcode artifacts */}
            <style>{`
                #${containerId} {
                    position: relative;
                    width: 100% !important;
                    height: 100% !important;
                    background-color: #020617 !important;
                }
                #${containerId} video {
                    width: 100% !important;
                    height: 100% !important;
                    object-fit: cover !important;
                    border-radius: 1.5rem !important;
                    display: block !important;
                }
                #${containerId} #qr-shaded-region {
                    display: none !important;
                }
                #${containerId} img {
                    display: none !important;
                }

                @keyframes scannerLaser {
                    0% {
                        top: 4%;
                        opacity: 0.7;
                    }
                    50% {
                        top: 96%;
                        opacity: 1;
                    }
                    100% {
                        top: 4%;
                        opacity: 0.7;
                    }
                }
                .animate-scanner-laser {
                    animation: scannerLaser 2.2s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}
