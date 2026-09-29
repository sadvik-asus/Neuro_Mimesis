import { useEffect, useRef, useCallback } from 'react';
import type { BiometricSample, KeystrokeEvent, MouseEventData, ScrollEventData } from '../utils/analysis';

export const useBiometricRecorder = (isRecording: boolean) => {
    const keystrokesRef = useRef<KeystrokeEvent[]>([]);
    const mouseRef = useRef<MouseEventData[]>([]);
    const scrollRef = useRef<ScrollEventData[]>([]);

    const reset = useCallback(() => {
        keystrokesRef.current = [];
        mouseRef.current = [];
        scrollRef.current = [];
    }, []);

    useEffect(() => {
        if (!isRecording) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            const event: KeystrokeEvent = {
                key: e.key,
                type: 'down',
                timestamp: Date.now(),
            };
            keystrokesRef.current.push(event);
            // Optional: limit size or update state locally if needed for UI, but usually we just process at the end
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            const event: KeystrokeEvent = {
                key: e.key,
                type: 'up',
                timestamp: Date.now(),
            };
            keystrokesRef.current.push(event);
        };

        const handleMouseMove = (e: MouseEvent) => {
            // Throttle slightly?
            const event: MouseEventData = {
                x: e.clientX,
                y: e.clientY,
                timestamp: Date.now()
            };
            mouseRef.current.push(event);
        };

        const handleWheel = (e: WheelEvent) => {
            scrollRef.current.push({
                deltaY: e.deltaY,
                timestamp: Date.now()
            });
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('wheel', handleWheel, { passive: true });

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('wheel', handleWheel);
        };
    }, [isRecording]);

    const getSample = (): BiometricSample => {
        return {
            keystrokes: [...keystrokesRef.current],
            mouseMovements: [...mouseRef.current],
            scrollMovements: [...scrollRef.current]
        };
    };

    return { reset, getSample };
};
