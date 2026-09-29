export type KeystrokeEvent = {
    key: string;
    type: 'down' | 'up';
    timestamp: number;
};

export type MouseEventData = {
    x: number;
    y: number;
    timestamp: number;
};

export type ScrollEventData = {
    deltaY: number;
    timestamp: number;
};

export type BiometricSample = {
    keystrokes: KeystrokeEvent[];
    mouseMovements: MouseEventData[];
    scrollMovements: ScrollEventData[];
};

export type FeatureVector = {
    meanFlightTime: number;
    stdFlightTime: number;
    meanDwellTime: number;
    stdDwellTime: number;
    mouseEntropy: number;
    mouseVelocityMean: number;
    pathStraightness: number;
    jerkVariance: number;
    scrollBurstiness: number;
};

// Calculate entropy of mouse movement direction changes
export const calculateEntropy = (movements: MouseEventData[]): number => {
    if (movements.length < 3) return 0;

    const angles: number[] = [];
    for (let i = 1; i < movements.length; i++) {
        const dx = movements[i].x - movements[i - 1].x;
        const dy = movements[i].y - movements[i - 1].y;
        angles.push(Math.atan2(dy, dx));
    }

    // Bin the angles
    const bins = new Array(36).fill(0); // 10 degree bins
    angles.forEach(a => {
        let deg = (a * 180 / Math.PI + 360) % 360;
        const idx = Math.floor(deg / 10);
        if (idx >= 0 && idx < 36) bins[idx]++;
    });

    // Calculate Shannon entropy
    const total = angles.length;
    let entropy = 0;
    bins.forEach(count => {
        if (count > 0) {
            const p = count / total;
            entropy -= p * Math.log2(p);
        }
    });

    return entropy;
};

export const extractFeatures = (sample: BiometricSample): FeatureVector => {
    const { keystrokes, mouseMovements } = sample;

    // Keystroke Dynamics
    const dwellTimes: number[] = [];
    const flightTimes: number[] = [];
    const keyPressMap = new Map<string, number>();

    // Sort by timestamp just in case
    const sortedKeys = [...keystrokes].sort((a, b) => a.timestamp - b.timestamp);

    for (let i = 0; i < sortedKeys.length; i++) {
        const event = sortedKeys[i];
        if (event.type === 'down') {
            keyPressMap.set(event.key, event.timestamp);

            // Flight time (Time since previous key UP)
            // Find the most recent UP event before this DOWN
            const prevUp = sortedKeys.slice(0, i).reverse().find(e => e.type === 'up');
            if (prevUp) {
                flightTimes.push(event.timestamp - prevUp.timestamp);
            }
        } else if (event.type === 'up') {
            const downTime = keyPressMap.get(event.key);
            if (downTime) {
                dwellTimes.push(event.timestamp - downTime);
                keyPressMap.delete(event.key);
            }
        }
    }

    // Mouse Dynamics
    let totalDist = 0;
    let totalTime = 0;
    const pathDistances: number[] = [];
    const accelerations: number[] = [];
    let startPoint = mouseMovements[0];
    let endPoint = mouseMovements[mouseMovements.length - 1];

    for (let i = 1; i < mouseMovements.length; i++) {
        const dt = mouseMovements[i].timestamp - mouseMovements[i - 1].timestamp;
        const dx = mouseMovements[i].x - mouseMovements[i - 1].x;
        const dy = mouseMovements[i].y - mouseMovements[i - 1].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dt > 0) {
            totalDist += dist;
            totalTime += dt;
            pathDistances.push(dist);

            // Calculate velocity and crude acceleration for Jerk
            const vel = dist / dt;
            if (i > 1) {
                const prevDt = mouseMovements[i - 1].timestamp - mouseMovements[i - 2].timestamp;
                const prevDist = Math.sqrt(
                    Math.pow(mouseMovements[i - 1].x - mouseMovements[i - 2].x, 2) +
                    Math.pow(mouseMovements[i - 1].y - mouseMovements[i - 2].y, 2)
                );
                if (prevDt > 0) {
                    const prevVel = prevDist / prevDt;
                    const acc = (vel - prevVel) / dt;
                    accelerations.push(acc);
                }
            }
        }
    }

    // Path Straightness
    let straightness = 1.0;
    if (startPoint && endPoint && totalDist > 0) {
        const directDist = Math.sqrt(Math.pow(endPoint.x - startPoint.x, 2) + Math.pow(endPoint.y - startPoint.y, 2));
        straightness = Math.min(1.0, directDist / totalDist); // 1.0 is perfectly straight line
    }

    const meanVelocity = totalTime > 0 ? totalDist / totalTime : 0;
    const entropy = calculateEntropy(mouseMovements);

    // Scroll Burstiness (Variance in time between scroll events)
    const scrollIntervals = [];
    for (let i = 1; i < sample.scrollMovements?.length; i++) {
        scrollIntervals.push(sample.scrollMovements[i].timestamp - sample.scrollMovements[i - 1].timestamp);
    }
    const mScroll = scrollIntervals.length > 0 ? scrollIntervals.reduce((a, b) => a + b, 0) / scrollIntervals.length : 0;
    const stdScroll = scrollIntervals.length > 0 ? Math.sqrt(scrollIntervals.reduce((a, b) => a + Math.pow(b - mScroll, 2), 0) / scrollIntervals.length) : 0;

    // Stats helpers
    const mean = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
    const std = (arr: number[], m: number) => arr.length > 0 ? Math.sqrt(arr.reduce((a, b) => a + Math.pow(b - m, 2), 0) / arr.length) : 0;

    const mDwell = mean(dwellTimes);
    const mFlight = mean(flightTimes);
    const mAcc = mean(accelerations);

    return {
        meanDwellTime: mDwell,
        stdDwellTime: std(dwellTimes, mDwell),
        meanFlightTime: mFlight,
        stdFlightTime: std(flightTimes, mFlight),
        mouseEntropy: entropy,
        mouseVelocityMean: meanVelocity,
        pathStraightness: isNaN(straightness) ? 1 : straightness,
        jerkVariance: std(accelerations, mAcc),
        scrollBurstiness: stdScroll
    };
}

export const compareFeatures = (profile: FeatureVector, sample: FeatureVector): number => {
    // Advanced Anomaly Detection Heuristic (Pseudo-SVM)
    // We expect bots to have:
    // 1. High Path Straightness (near 1.0)
    // 2. Low Jerk Variance (constant acceleration)
    // 3. Low Entropy (structured angular changes)

    // Check for exact duplicates (Replay Attack Defense)
    let isReplay = true;
    for (const key of Object.keys(profile) as Array<keyof FeatureVector>) {
        if (Math.abs(profile[key] - sample[key]) > 0.0001) {
            isReplay = false;
            break;
        }
    }

    // A replay attack immediately yields a 0 score (Detected anomaly)
    if (isReplay) return 0;

    const dDwell = Math.abs(profile.meanDwellTime - sample.meanDwellTime) / (profile.stdDwellTime + 1);
    const dFlight = Math.abs(profile.meanFlightTime - sample.meanFlightTime) / (profile.stdFlightTime + 1);
    const dEntropy = Math.abs(profile.mouseEntropy - sample.mouseEntropy);
    const dVelocity = Math.abs(profile.mouseVelocityMean - sample.mouseVelocityMean) / (profile.mouseVelocityMean + 1);

    // Penalize robotic straight lines and uniform speeds
    const roboticPenalty = (sample.pathStraightness > 0.95 ? 2.0 : 0) + (sample.jerkVariance < 0.01 ? 2.0 : 0);

    // Weighted distance (Highly sensitive to human-to-human timing/speed baseline differences)
    const distance = (dDwell * 0.35) + (dFlight * 0.25) + (dEntropy * 0.20) + (dVelocity * 0.20) + roboticPenalty;

    // Decreased the multiplier from 30 to 20 to make the model more forgiving.
    // This is tight enough to block impersonators but forgiving enough for the user's natural daily variance.
    const score = Math.max(0, 100 - (distance * 20));
    return score;
}
