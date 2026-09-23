// ==========================================================================
// Spacetime Portfolio — Mobile Page: Career Timeline (Tab 02)
// Vertical milestone trajectory from 2011 to 2026+, loaded from timeline.json
// ==========================================================================

let timelineData = [];
let sortOrder = 'DESC'; // 'DESC' (newest first) or 'ASC' (oldest first)

export async function renderTabTimeline(container, onNavigateTab) {
    container.innerHTML = `
        <div class="mobile-timeline-container">
            <!-- Telemetry Header -->
            <div class="mobile-timeline-header">
                <div class="mobile-section-header">
                    <span class="mobile-section-code">[02]</span>
                    <h1 class="mobile-section-heading">CAREER & RESEARCH TRAJECTORY</h1>
                </div>
                <div class="mobile-timeline-controls">
                    <span class="mobile-timeline-count-badge" id="timeline-count-badge">7 MILESTONES</span>
                    <button class="mobile-sort-toggle" id="timeline-sort-btn" aria-label="Toggle timeline sort order">
                        ${sortOrder === 'DESC' ? '↓ 2026→2011' : '↑ 2011→2026'}
                    </button>
                </div>
            </div>

            <!-- Milestone Stream -->
            <div class="mobile-milestone-stream" id="milestone-stream">
                <div class="mobile-loading-skeleton">Initializing Trajectory...</div>
            </div>
        </div>
    `;

    // Fetch data if needed
    if (timelineData.length === 0) {
        try {
            const res = await fetch('/data/timeline.json');
            timelineData = await res.json();
        } catch (err) {
            console.error("Failed to load timeline.json:", err);
            // Fallback data
            timelineData = [
                {
                    "id": "luna-innovations",
                    "category": "career",
                    "title": "WORKING STUDENT - ALGORITHMS",
                    "subtitle": "Luna Innovations Germany GmbH",
                    "location": "Cologne, Germany",
                    "date": "April 2024 - March 2026",
                    "time_range": { "start": "2024", "end": "2026" },
                    "skills": ["Python", "TensorFlow", "MLOps", "Signal Processing"],
                    "responsibilities": [
                        "ENGINEERING END-TO-END ML PIPELINES USING DVC",
                        "DEVELOPING CYCLEGAN FOR DATA AUGMENTATION USING PYTORCH",
                        "ARCHITECTING METADATA SEARCH ENGINE FOR TERABYTES OF SENSOR DATA",
                        "DEPLOYING CI/CD PIPELINES VIA JENKINS AND PREFECT"
                    ]
                },
                {
                    "id": "masters-physics",
                    "category": "career",
                    "title": "MASTER OF SCIENCE PHYSICS",
                    "subtitle": "University of Cologne",
                    "location": "Cologne, Germany",
                    "date": "2023 - 2027",
                    "time_range": { "start": "2023", "end": "2027" },
                    "skills": ["Quantum Field Theory", "Statistical Mechanics", "Quantum Error Correction", "Many Body Physics"],
                    "responsibilities": [
                        "DEVELOPING INTEREST ON QUANTUM ERROR CORRECTION",
                        "UNDERSTANDING PHASE TRANSITION",
                        "SIMULATED QUANTUM PHASE TRANSITION WITH TENSOR NETWORKS",
                        "DEVELOPING INSIGHTS ON QUANTUM INFORMATION"
                    ]
                }
            ];
        }
    }

    renderMilestones(container);

    // Setup sort listener
    const sortBtn = container.querySelector('#timeline-sort-btn');
    if (sortBtn) {
        sortBtn.addEventListener('click', () => {
            sortOrder = sortOrder === 'DESC' ? 'ASC' : 'DESC';
            sortBtn.innerText = sortOrder === 'DESC' ? '↓ 2026→2011' : '↑ 2011→2026';
            renderMilestones(container);
        });
    }
}

function renderMilestones(container) {
    const stream = container.querySelector('#milestone-stream');
    if (!stream) return;

    // Filter strictly to authentic career milestones
    let items = timelineData.filter(it => it.category === 'career');

    const countBadge = container.querySelector('#timeline-count-badge');
    if (countBadge) {
        countBadge.textContent = `${items.length} MILESTONES`;
    }

    // Sort by year
    items.sort((a, b) => {
        const getYear = (x) => {
            if (x.time_range && x.time_range.start) return parseInt(x.time_range.start, 10);
            if (x.timeRange && x.timeRange[0]) return parseInt(x.timeRange[0], 10);
            if (x.date) {
                const match = x.date.match(/\d{4}/);
                if (match) return parseInt(match[0], 10);
            }
            return 2011;
        };

        const yearA = getYear(a);
        const yearB = getYear(b);
        return sortOrder === 'DESC' ? yearB - yearA : yearA - yearB;
    });

    if (items.length === 0) {
        stream.innerHTML = `<div class="mobile-empty-state">No milestones found in this category.</div>`;
        return;
    }

    let html = '';
    items.forEach((item, index) => {
        const isCareer = item.category === 'career';
        const yearStr = item.time_range
            ? `${item.time_range.start} – ${item.time_range.end || 'PRESENT'}`
            : (item.timeRange ? `${item.timeRange[0]} – ${item.timeRange[1]}` : item.date);

        const subTitleStr = item.subtitle
            ? `${item.subtitle}${item.location ? ` · ${item.location}` : ''}`
            : (item.location || '');

        const skillsHtml = Array.isArray(item.skills) && item.skills.length > 0
            ? `<div class="milestone-skills">
                ${item.skills.map(s => `<span class="milestone-skill-pill">${s}</span>`).join('')}
               </div>`
            : '';

        let detailsHtml = '';
        if (Array.isArray(item.responsibilities) && item.responsibilities.length > 0) {
            detailsHtml = `
                <ul class="milestone-bullet-list">
                    ${item.responsibilities.map(r => `<li>${r}</li>`).join('')}
                </ul>
            `;
        } else if (item.description) {
            detailsHtml = `<p class="milestone-desc">${item.description}</p>`;
        }

        html += `
            <div class="mobile-milestone-card ${isCareer ? 'type-career' : 'type-hobby'}" data-index="${index}">
                <div class="milestone-spine-node">
                    <span class="spine-dot"></span>
                    <span class="spine-line"></span>
                </div>
                <div class="milestone-content">
                    <div class="milestone-top-row">
                        <span class="milestone-year-badge">${yearStr}</span>
                        <span class="milestone-category-tag">${item.category.toUpperCase()}</span>
                    </div>
                    <h3 class="milestone-title">${item.title}</h3>
                    ${subTitleStr ? `<div class="milestone-subtitle">${subTitleStr}</div>` : ''}
                    ${detailsHtml}
                    ${skillsHtml}
                </div>
            </div>
        `;
    });

    stream.innerHTML = html;
}
