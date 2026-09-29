import { useEffect, useRef } from 'react';

interface Point {
    x: number;
    y: number;
    time: number;
}

export const MouseHeatmap = ({ active = true }: { active?: boolean }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const pointsRef = useRef<Point[]>([]);
    const animationFrameRef = useRef<number>(0);

    useEffect(() => {
        if (!active) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        const handleMouseMove = (e: MouseEvent) => {
            pointsRef.current.push({
                x: e.clientX,
                y: e.clientY,
                time: Date.now()
            });

            // Keep only last 5 seconds of movement
            const now = Date.now();
            pointsRef.current = pointsRef.current.filter(p => now - p.time < 5000);
        };

        window.addEventListener('mousemove', handleMouseMove);

        const render = () => {
            if (!ctx || !canvas) return;

            // Clear with slight fade for trails
            ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const points = pointsRef.current;
            if (points.length < 2) {
                animationFrameRef.current = requestAnimationFrame(render);
                return;
            }

            const now = Date.now();

            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);

            for (let i = 1; i < points.length; i++) {
                const p = points[i];
                const age = now - p.time;
                const opacity = Math.max(0, 1 - age / 5000); // Fade out over 5s

                // Draw connecting lines (trajectory)
                // We use quadratic curves to smooth drawing for "humans"
                const xc = (points[i - 1].x + p.x) / 2;
                const yc = (points[i - 1].y + p.y) / 2;

                ctx.quadraticCurveTo(points[i - 1].x, points[i - 1].y, xc, yc);

                // Color based on speed (hesitation = red dots)
                const dx = p.x - points[i - 1].x;
                const dy = p.y - points[i - 1].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                // If moving very slow (hesitating/targeting), draw a concentrated dot
                if (dist < 2 && age < 100) {
                    ctx.fillStyle = `rgba(255, 0, 85, ${opacity * 0.8})`; // Neon Pink hesitation
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.beginPath(); // Resume path
                    ctx.moveTo(p.x, p.y);
                }
            }

            // Stroke the main path (Cyan for normal movement)
            ctx.strokeStyle = `rgba(0, 243, 255, 0.4)`; // cyber-primary glow
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#00f3ff';
            ctx.stroke();

            animationFrameRef.current = requestAnimationFrame(render);
        };

        // Start render loop
        render();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameRef.current);
        };
    }, [active]);

    return (
        <canvas
            ref={canvasRef}
            className={`fixed inset-0 pointer-events-none z-0 transition-opacity duration-1000 ${active ? 'opacity-100' : 'opacity-0'}`}
            style={{ mixBlendMode: 'screen' }}
        />
    );
};
