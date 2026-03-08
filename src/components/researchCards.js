export async function initResearchCards() {
    const container = document.getElementById('research-cards-container');
    if (!container) return;

    try {
        const res = await fetch('/data/research.json');
        if (!res.ok) throw new Error("Failed to fetch research cards data");
        const researchData = await res.json();

        researchData.forEach((data, i) => {
            const numStr = (i + 1).toString().padStart(2, '0');

            let headerHTML = `<div class="res-card-header">${data.id}</div>`;
            if (data.link) {
                headerHTML += `
                    <a href="${data.link}" target="_blank" class="res-card-link" aria-label="View Project">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line>
                        </svg>
                    </a>
                `;
            }

            let collabHTML = '';
            if (data.collaborators && data.collaborators.length > 0) {
                collabHTML = `<div class="res-card-collab">with ${data.collaborators.join(', ')}</div>`;
            }

            container.innerHTML += `
                <div class="research-card" id="res-card-${i}">
                    <div class="editorial-number">${numStr}</div>
                    <div class="res-card-content">
                        ${headerHTML}
                        <div class="res-card-title">${data.title}</div>
                        ${collabHTML}
                        <div class="res-card-body">${data.desc}</div>
                        <div class="res-card-tags">${data.tags.map(t => `<span class="res-tag">${t}</span>`).join('')}</div>
                    </div>
                </div>
            `;
        });

        // Trigger MathJax typeset on the newly appended dynamic research text
        if (window.MathJax) {
            MathJax.typesetPromise([container]).catch((err) => console.log('MathJax typeset failed: ' + err.message));
        }

    } catch (e) {
        console.error("Failed to load research.json:", e);
    }
}

export function updateResearchCards(currentScroll) {
    const cards = document.querySelectorAll('.research-card');
    cards.forEach((card, i) => {
        const triggerPoint = 1.5 + i * 1.0;
        const diff = currentScroll - triggerPoint;

        const isEven = i % 2 === 0;
        card.style.width = isEven ? '80%' : '65%';
        card.style.left = isEven ? '0' : 'auto';
        card.style.right = isEven ? 'auto' : '0';

        const baseTilt = isEven ? -2 : 3;

        if (diff < 0) {
            // IN THE MESSY DECK
            const stackDepth = Math.abs(diff);
            const clampedDepth = Math.min(stackDepth, 3);

            const yOffset = 250 + (clampedDepth * 40);
            const zOffset = -100 * clampedDepth;

            const xOffset = isEven ? -(clampedDepth * 20) : (clampedDepth * 20);
            const rotateZ = baseTilt + (isEven ? -clampedDepth * 2 : clampedDepth * 2);

            card.style.transform = `translate3d(${xOffset}px, calc(-50% + ${yOffset}px), ${zOffset}px) rotateZ(${rotateZ}deg)`;
            card.style.opacity = 1.0 - (clampedDepth * 0.05);
            card.style.zIndex = 10 - Math.floor(stackDepth);
            card.style.pointerEvents = 'auto';

        } else if (diff < 1.0) {
            // ACTIVE TO PAST (Floating up with parallax)
            const yOffset = -300 * diff;
            const xOffset = isEven ? -10 * diff : 15 * diff;
            const opacity = 1.0 - diff;

            card.style.transform = `translate3d(${xOffset}px, calc(-50% + ${yOffset}px), 0px) rotateZ(${baseTilt}deg)`;
            card.style.opacity = opacity;
            card.style.zIndex = 10;
            card.style.pointerEvents = 'auto';
        } else {
            // ARCHIVED
            card.style.opacity = 0;
            card.style.pointerEvents = 'none';
        }
    });
}
