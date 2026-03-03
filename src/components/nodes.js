import * as THREE from 'three';
import { CONFIG, CAREER_NODES } from '../config.js';

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
const skillCoreMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff, wireframe: true, transparent: true, opacity: 0.8 });
const skillShellMat = new THREE.MeshBasicMaterial({ color: 0x88ccff, wireframe: true, transparent: true, opacity: 0.5 });
const orbitLineMat = new THREE.LineBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.05 });

// --- Typing State ---
export const typingState = {};

// --- Toggle Card ---
export function toggleCard(index) {
    try {
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
    } catch (e) {
        document.querySelector('.hero-prompt').innerText = "TGL: " + e.message;
    }
}

// --- Create Node Group ---
export function createNodes(gridMat) {
    const nodeGroup = new THREE.Group();
    nodeGroup.visible = false;

    CAREER_NODES.forEach((node, index) => {
        typingState[index] = { lineIndex: 0, charIndex: 0, isTyping: false };
        if (index < 10) {
            gridMat.uniforms.uMassPositions.value[index] = new THREE.Vector3(node.x, 0, node.z);
            gridMat.uniforms.uMassStrengths.value[index] = node.mass * CONFIG.massStrength;
        }
        gridMat.uniforms.uMassCount.value = Math.min(CAREER_NODES.length, 10);

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
                // Abstract crystalline geometry instead of glowing sprites
                piv.add(new THREE.Mesh(new THREE.OctahedronGeometry(1.5, 0), skillCoreMat));
                piv.add(new THREE.Mesh(new THREE.OctahedronGeometry(2.5, 0), skillShellMat));
                piv.userData = { phase: Math.random() * Math.PI * 2 };
                skillShell.add(piv);
            });
        }
        wrapper.add(skillShell);
        nodeGroup.add(wrapper);

        // DOM
        const label = document.createElement('div'); label.className = 'node-container'; label.style.display = 'none';
        const massPct = Math.min((node.mass / 10) * 100, 100);

        const skillsHTML = node.skills ? node.skills.map((s, si) => `
            <div class="skill-label" id="skill-${index}-${si}">
                <div class="skill-line"></div>
                <div class="skill-text">${s}</div>
            </div>
        `).join('') : '';

        label.innerHTML = `
            ${skillsHTML}
            <div class="node-anchor"></div><div class="node-connector"></div>
            <div class="hud-card minimized" id="card-${index}">
                <div class="card-header"><span class="card-id">EVT-0${index + 1}</span><div class="card-mass-bar"><div class="card-mass-fill" style="width:${massPct}%"></div></div></div>
                <div class="card-body"><div class="card-title">${node.title}</div><div class="card-subtitle">${node.subtitle}</div></div>
                <div class="card-logs" id="logs-container-${index}"></div>
                <div class="card-footer"><span>G-POTENTIAL: ${node.mass.toFixed(2)}</span><button class="expander-btn" id="btn-${index}">[ + ]</button></div>
            </div>
        `;
        document.getElementById('labels-container').appendChild(label);
        label.querySelector(`#card-${index}`).addEventListener('click', (e) => {
            e.stopPropagation();
            try {
                toggleCard(index);
            } catch (err) {
                const prompt = document.querySelector('.hero-prompt');
                if (prompt) prompt.innerText = 'ERR click: ' + err.message;
            }
        });
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
