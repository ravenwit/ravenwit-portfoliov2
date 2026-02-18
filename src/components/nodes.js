import * as THREE from 'three';
import { CONFIG, CAREER_NODES } from '../config.js';

// --- Icon Texture Generator ---
function createIconTexture(skillName) {
    const canvas = document.createElement('canvas'); canvas.width = 128; canvas.height = 128;
    const ctx = canvas.getContext('2d'); ctx.clearRect(0, 0, 128, 128);
    ctx.strokeStyle = "#00ffff"; ctx.lineWidth = 4; ctx.fillStyle = "#00ffff"; ctx.shadowColor = "#00ffff"; ctx.shadowBlur = 15;
    const cx = 64, cy = 64; const name = skillName.toLowerCase();
    if (name.includes("react")) {
        ctx.beginPath(); ctx.ellipse(cx, cy, 20, 50, Math.PI / 4, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(cx, cy, 20, 50, -Math.PI / 4, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(cx, cy, 20, 50, 0, 0, Math.PI * 2); ctx.stroke(); ctx.beginPath(); ctx.arc(cx, cy, 8, 0, Math.PI * 2); ctx.fill();
    } else if (name.includes("python")) {
        ctx.beginPath(); ctx.arc(cx, cy - 15, 15, Math.PI, 0); ctx.lineTo(cx + 15, cy + 15); ctx.arc(cx, cy + 15, 15, 0, Math.PI); ctx.lineTo(cx - 15, cy - 15); ctx.stroke();
    } else if (name.includes("c++") || name.includes("linux") || name.includes("root") || name.includes("latex") || name.includes("tex")) {
        ctx.font = "bold 40px monospace"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(skillName.substring(0, 3), cx, cy);
    } else {
        ctx.strokeRect(20, 20, 88, 88); ctx.font = "bold 40px monospace"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(skillName.substring(0, 2).toUpperCase(), cx, cy);
    }
    const tex = new THREE.CanvasTexture(canvas); tex.minFilter = THREE.LinearFilter; return tex;
}

// --- Glow Texture ---
const glowTexture = (() => {
    const c = document.createElement('canvas'); c.width = 64; c.height = 64;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.3, 'rgba(100,200,255,0.5)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c);
})();

// --- Shared Materials ---
const glowMaterial = new THREE.SpriteMaterial({ map: glowTexture, color: 0xffffff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
const coreMaterial = new THREE.SpriteMaterial({ map: glowTexture, color: 0xffffff });
const skillCoreMat = new THREE.MeshBasicMaterial({ color: 0x001122, transparent: true, opacity: 0.9 });
const skillShellMat = new THREE.MeshBasicMaterial({ color: 0x00ffff, wireframe: true, transparent: true, opacity: 0.5 });
const orbitLineMat = new THREE.LineBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.15 });

// --- Typing State ---
export const typingState = {};

// --- Toggle Card ---
export function toggleCard(index) {
    const card = document.getElementById(`card-${index}`);
    const btn = document.getElementById(`btn-${index}`);
    const logC = document.getElementById(`logs-container-${index}`);

    if (card.classList.contains('expanded')) {
        card.classList.remove('expanded'); btn.innerHTML = "[ + ]"; typingState[index].isTyping = false;
    } else {
        card.classList.remove('minimized'); card.classList.add('expanded'); btn.innerHTML = "[ - ]";
        logC.innerHTML = "";
        typingState[index].isTyping = true; typingState[index].lineIndex = 0; typingState[index].charIndex = 0;
    }
}

// --- Create Node Group ---
export function createNodes(gridMat) {
    const nodeGroup = new THREE.Group();
    nodeGroup.visible = false;

    CAREER_NODES.forEach((node, index) => {
        typingState[index] = { lineIndex: 0, charIndex: 0, isTyping: false };
        gridMat.uniforms.uMassPositions.value[index] = new THREE.Vector3(node.x, 0, node.z);
        gridMat.uniforms.uMassStrengths.value[index] = node.mass * CONFIG.massStrength;

        const wrapper = new THREE.Group();
        wrapper.position.set(node.x, -(node.mass * CONFIG.massStrength) * 0.4, node.z);

        // 1. Glow
        const scale = 12 + (node.mass * 1.5);
        const sprite = new THREE.Sprite(glowMaterial); sprite.scale.set(scale, scale, 1); wrapper.add(sprite);

        // 2. Core
        const core = new THREE.Sprite(coreMaterial); core.scale.set(scale * 0.2, scale * 0.2, 1); wrapper.add(core);

        // 3. Accretion Disk
        const ringGeo = new THREE.BufferGeometry(); const ringPos = [];
        for (let i = 0; i < 80; i++) {
            const theta = Math.random() * Math.PI * 2; const r = scale * 0.4 + Math.random() * (scale * 0.2);
            ringPos.push(r * Math.cos(theta), (Math.random() - 0.5) * 2.0, r * Math.sin(theta));
        }
        ringGeo.setAttribute('position', new THREE.Float32BufferAttribute(ringPos, 3));
        const ring = new THREE.Points(ringGeo, new THREE.PointsMaterial({ color: 0xffcc88, size: 0.3, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending }));
        wrapper.add(ring);

        // 4. Skills
        const skillShell = new THREE.Group(); skillShell.position.y = 12;
        const orbitR = 12;
        const orbitC = new THREE.EllipseCurve(0, 0, orbitR, orbitR, 0, 2 * Math.PI, false, 0);
        const orbitG = new THREE.BufferGeometry().setFromPoints(orbitC.getPoints(64)); orbitG.rotateX(-Math.PI / 2);
        skillShell.add(new THREE.Line(orbitG, orbitLineMat));

        if (node.skills) {
            const step = (Math.PI * 2) / node.skills.length;
            node.skills.forEach((s, si) => {
                const ang = step * si;
                const piv = new THREE.Group(); piv.position.set(Math.cos(ang) * orbitR, 0, Math.sin(ang) * orbitR);
                piv.add(new THREE.Mesh(new THREE.IcosahedronGeometry(1.5, 0), skillCoreMat));
                piv.add(new THREE.Mesh(new THREE.IcosahedronGeometry(2.5, 0), skillShellMat));
                const icon = new THREE.Sprite(new THREE.SpriteMaterial({ map: createIconTexture(s), transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false }));
                icon.scale.set(2, 2, 1); piv.add(icon);
                piv.userData = { phase: Math.random() * Math.PI * 2 };
                skillShell.add(piv);
            });
        }
        wrapper.add(skillShell);
        nodeGroup.add(wrapper);

        // DOM
        const label = document.createElement('div'); label.className = 'node-container'; label.style.display = 'none';
        const massPct = Math.min((node.mass / 10) * 100, 100);
        label.innerHTML = `
            <div class="node-anchor"></div><div class="node-connector"></div>
            <div class="hud-card minimized" id="card-${index}">
                <div class="card-header"><span class="card-id">EVT-0${index + 1}</span><div class="card-mass-bar"><div class="card-mass-fill" style="width:${massPct}%"></div></div></div>
                <div class="card-body"><div class="card-title">${node.title}</div><div class="card-subtitle">${node.subtitle}</div></div>
                <div class="card-logs" id="logs-container-${index}"></div>
                <div class="card-footer"><span>G-POTENTIAL: ${node.mass.toFixed(2)}</span><button class="expander-btn" id="btn-${index}">[ + ]</button></div>
            </div>
        `;
        document.getElementById('labels-container').appendChild(label);
        label.querySelector(`#card-${index}`).addEventListener('click', (e) => { e.stopPropagation(); toggleCard(index); });
        node.element = label;
    });

    return nodeGroup;
}

// --- Start Typing Interval ---
export function startTypingInterval() {
    setInterval(() => {
        CAREER_NODES.forEach((node, i) => {
            if (typingState[i].isTyping) {
                const st = typingState[i];
                if (st.lineIndex < node.responsibilities.length) {
                    const txt = node.responsibilities[st.lineIndex];
                    const cont = document.getElementById(`logs-container-${i}`);
                    let line = document.getElementById(`log-line-${i}-${st.lineIndex}`);
                    if (!line) {
                        line = document.createElement('div'); line.className = 'log-line'; line.id = `log-line-${i}-${st.lineIndex}`;
                        line.innerHTML = `<span class="log-prefix">>></span><span class="log-content"></span>`; cont.appendChild(line);
                    }
                    const span = line.querySelector('.log-content');
                    if (st.charIndex <= txt.length) {
                        span.innerText = txt.substring(0, st.charIndex) + (st.charIndex < txt.length ? "█" : ""); st.charIndex++;
                    } else { span.innerText = txt; st.lineIndex++; st.charIndex = 0; }
                } else { typingState[i].isTyping = false; }
            }
        });
    }, 30);
}
