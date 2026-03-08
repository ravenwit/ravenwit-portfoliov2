export function initFourier(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width, height;

    function resize() {
        width = canvas.parentElement.clientWidth || 600;
        height = canvas.parentElement.clientHeight || 600;
        // High DPI support
        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);
    }
    window.addEventListener('resize', resize);
    resize();

    function lerp(p0, p1, t) { return { x: (1 - t) * p0.x + t * p1.x, y: (1 - t) * p0.y + t * p1.y }; }
    function bezier(p0, p1, p2, p3, t) {
        const oneMinusT = 1 - t; const oneMinusTsq = oneMinusT * oneMinusT; const oneMinusTcub = oneMinusTsq * oneMinusT;
        const tSq = t * t; const tCub = tSq * t;
        return {
            x: oneMinusTcub * p0.x + 3 * oneMinusTsq * t * p1.x + 3 * oneMinusT * tSq * p2.x + tCub * p3.x,
            y: oneMinusTcub * p0.y + 3 * oneMinusTsq * t * p1.y + 3 * oneMinusT * tSq * p2.y + tCub * p3.y
        };
    }

    const P = (x, y) => ({ x: x, y: y });

    function generatePathPoints() {
        const points = [];
        const addLine = (p0, p1, steps = 20) => { for (let i = 0; i < steps; i++) points.push(lerp(p0, p1, i / steps)); };
        const addBezier = (p0, p1, p2, p3, steps = 20) => { for (let i = 0; i < steps; i++) points.push(bezier(p0, p1, p2, p3, i / steps)); };

        let p1_0 = P(74.8, 128.6); addBezier(p1_0, P(74.2, 128.2), P(74.1, 127.3), P(74.7, 126.9));
        let p1_1 = P(74.7, 126.9); addLine(p1_1, P(205.6, 28.2));
        let p1_2 = P(205.6, 28.2); addBezier(p1_2, P(205.7, 28.1), P(205.9, 28.1), P(206.0, 28.0));
        let p1_3 = P(206.0, 28.0); addLine(p1_3, P(338.6, 7.5));
        let p1_4 = P(338.6, 7.5); addBezier(p1_4, P(339.6, 7.4), P(340.2, 8.6), P(339.5, 9.3));
        let p1_5 = P(339.5, 9.3); addLine(p1_5, P(216.4, 116.1));
        let p1_6 = P(216.4, 116.1); addBezier(p1_6, P(215.9, 116.5), P(216.0, 117.3), P(216.5, 117.7));
        let p1_7 = P(216.5, 117.7); addLine(p1_7, P(310.5, 183.7));
        let p1_8 = P(310.5, 183.7); addBezier(p1_8, P(311.2, 184.2), P(311.1, 185.3), P(310.2, 185.5));
        let p1_9 = P(310.2, 185.5); addLine(p1_9, P(225.5, 205.7));
        let p1_10 = P(225.5, 205.7); addBezier(p1_10, P(225.3, 205.8), P(225.0, 205.8), P(224.8, 205.6));
        let p1_11 = P(224.8, 205.6); addLine(p1_11, p1_0);

        let p2_0 = P(295.5, 246.5); addLine(p1_0, p2_0, 10);
        addBezier(p2_0, P(295.7, 245.6), P(296.9, 245.4), P(297.4, 246.1));
        let p2_1 = P(297.4, 246.1); addLine(p2_1, P(385.5, 377.6));
        let p2_2 = P(385.5, 377.6); addBezier(p2_2, P(385.6, 377.8), P(385.6, 378.0), P(385.6, 378.2));
        let p2_3 = P(385.6, 378.2); addLine(p2_3, P(389.2, 500.4));
        let p2_4 = P(389.2, 500.4); addBezier(p2_4, P(389.2, 501.4), P(387.9, 501.8), P(387.3, 500.9));
        let p2_5 = P(387.3, 500.9); addLine(p2_5, P(303.9, 369.6));
        let p2_6 = P(303.9, 369.6); addLine(p2_6, P(288.0, 342.6));
        let p2_7 = P(288.0, 342.6); addBezier(p2_7, P(287.9, 342.5), P(287.8, 342.4), P(287.7, 342.3));
        let p2_8 = P(287.7, 342.3); addLine(p2_8, P(276.4, 334.1));
        let p2_9 = P(276.4, 334.1); addBezier(p2_9, P(276.1, 333.9), P(275.9, 333.5), P(276.0, 333.1));
        let p2_10 = P(276.0, 333.1); addLine(p2_10, p2_0);

        let p3_0 = P(399.0, 325.6); addLine(p2_0, p3_0, 10);
        addBezier(p3_0, P(399.4, 326.2), P(399.0, 327.0), P(398.2, 327.0));
        let p3_1 = P(398.2, 327.0); addLine(p3_1, P(216.3, 339.1));
        let p3_2 = P(216.3, 339.1); addBezier(p3_2, P(216.2, 339.2), P(216.0, 339.1), P(215.8, 339.1));
        let p3_3 = P(215.8, 339.1); addLine(p3_3, P(92.9, 289.2));
        let p3_4 = P(92.9, 289.2); addBezier(p3_4, P(92.0, 288.8), P(92.2, 287.5), P(93.2, 287.4));
        let p3_5 = P(93.2, 287.4); addLine(p3_5, P(260.4, 260.5));
        let p3_6 = P(260.4, 260.5); addBezier(p3_6, P(261.1, 260.4), P(261.5, 259.6), P(261.2, 259.1));
        let p3_7 = P(261.2, 259.1); addBezier(p3_7, P(257.7, 253.0), P(240.6, 225.0), P(216.1, 203.0));
        let p3_8 = P(216.1, 203.0); addBezier(p3_8, P(191.1, 180.6), P(190.0, 126.9), P(190.1, 116.7));
        let p3_9 = P(190.1, 116.7); addBezier(p3_9, P(190.1, 115.9), P(191.0, 115.4), P(191.6, 115.8));
        let p3_10 = P(191.6, 115.8); addLine(p3_10, P(312.0, 183.8));
        let p3_11 = P(312.0, 183.8); addBezier(p3_11, P(312.2, 183.9), P(312.3, 184.0), P(312.4, 184.1));
        let p3_12 = P(312.4, 184.1); addLine(p3_12, p3_0);

        let p4_0 = P(75.0, 128.0); addLine(p3_0, p4_0, 10);
        addLine(p4_0, P(127.0, 155.2));
        let p4_1 = P(127.0, 155.2); addBezier(p4_1, P(127.0, 155.2), P(118.2, 479.8), P(110.7, 481.0));
        let p4_2 = P(110.7, 481.0); addBezier(p4_2, P(103.2, 482.2), P(99.2, 275.1), P(99.2, 275.1));
        let p4_3 = P(99.2, 275.1); addLine(p4_3, P(92.6, 288.1));
        let p4_4 = P(92.6, 288.1); addLine(p4_4, p4_0);

        addLine(p4_0, p1_0, 10);
        return points;
    }

    function dft(points) {
        const N = points.length;
        const fourier = [];
        for (let k = 0; k < N; k++) {
            let re = 0; let im = 0;
            for (let n = 0; n < N; n++) {
                const phi = (2 * Math.PI * k * n) / N;
                re += points[n].x * Math.cos(phi) + points[n].y * Math.sin(phi);
                im += points[n].y * Math.cos(phi) - points[n].x * Math.sin(phi);
            }
            re /= N; im /= N;
            fourier.push({ re, im, freq: k, amp: Math.sqrt(re * re + im * im), phase: Math.atan2(im, re) });
        }
        return fourier;
    }

    let fourierSeries = [];
    let pathTrace = [];
    let time = 0;
    let activeCycles = 200;
    // You can control the overall size by adjusting the 'scale' parameter here (e.g. 0.3 for 30% size)
    const config = { activeEpicycles: activeCycles, scale: 0.4 };

    const discretePoints = generatePathPoints();
    const dftResult = dft(discretePoints);
    const N = dftResult.length;
    fourierSeries = dftResult.map(f => {
        let k = f.freq;
        if (k > N / 2) k -= N;
        return { ...f, freq: k };
    });
    fourierSeries.sort((a, b) => b.amp - a.amp);
    config.activeEpicycles = Math.min(activeCycles, fourierSeries.length);

    function render() {
        requestAnimationFrame(render);
        ctx.clearRect(0, 0, width, height);

        let vx = width / 2;
        let vy = height / 2;

        for (let i = 0; i < config.activeEpicycles; i++) {
            const circle = fourierSeries[i];
            if (circle.freq === 0) continue;

            let prevX = vx;
            let prevY = vy;

            const theta = circle.freq * time + circle.phase;
            const radius = circle.amp * config.scale;

            vx += radius * Math.cos(theta);
            vy += radius * Math.sin(theta);

            if (radius > 0.5) {
                ctx.strokeStyle = "rgba(67, 105, 238, 0.15)";
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(prevX, prevY, radius, 0, Math.PI * 2);
                ctx.stroke();

                ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
                ctx.beginPath();
                ctx.moveTo(prevX, prevY);
                ctx.lineTo(vx, vy);
                ctx.stroke();
            }
        }

        pathTrace.unshift({ x: vx, y: vy });
        if (pathTrace.length > discretePoints.length) {
            pathTrace.pop();
        }

        if (pathTrace.length > 0) {
            ctx.strokeStyle = "#4369EE";
            ctx.lineWidth = 2.5;
            ctx.shadowBlur = 10;
            ctx.shadowColor = "#4369EE";
            ctx.beginPath();
            ctx.moveTo(pathTrace[0].x, pathTrace[0].y);
            for (let i = 1; i < pathTrace.length; i++) {
                ctx.lineTo(pathTrace[i].x, pathTrace[i].y);
            }
            ctx.stroke();
            ctx.shadowBlur = 0;
        }

        const dt = (2 * Math.PI) / discretePoints.length;
        time += dt;
        if (time > 2 * Math.PI) time -= 2 * Math.PI;
    }

    requestAnimationFrame(render);
}
