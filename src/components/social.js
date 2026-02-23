const SOCIAL_LINKS = [
    { name: "RESEARCHGATE", url: "https://www.researchgate.net/" },
    { name: "INSTAGRAM", url: "https://www.instagram.com/" },
    { name: "GITHUB", url: "https://github.com/" },
    { name: "LINKEDIN", url: "https://www.linkedin.com/" },
    { name: "TWITTER", url: "https://twitter.com/" }
];

let recentLinks = [];

function getRandomLink() {
    // Filter out the items that are currently in our 'recentLinks' tracking queue
    const available = SOCIAL_LINKS.filter(link => !recentLinks.some(recent => recent.name === link.name));

    // Fallback in case we somehow filtered everything out, though theoretically impossible with size 4 
    if (available.length === 0) return SOCIAL_LINKS[Math.floor(Math.random() * SOCIAL_LINKS.length)];

    const selected = available[Math.floor(Math.random() * available.length)];

    recentLinks.push(selected);
    if (recentLinks.length > 4) {
        recentLinks.shift(); // Remove the oldest so we only track the last 4 observations
    }

    return selected;
}

const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*<>';

export function initSocialQuanta() {
    const nodes = document.querySelectorAll('.quanta-node');

    nodes.forEach(node => {
        let isObserved = false;
        let scrambleInterval;
        const labelSpan = node.querySelector('.node-label');

        node.addEventListener('mouseenter', () => {
            if (isObserved) return;
            isObserved = true;

            const collapsedState = getRandomLink();
            node.href = collapsedState.url;
            const targetText = "> " + collapsedState.name;

            node.classList.add('observed');

            // Glitch/Decipher Animation
            let iterations = 0;
            const maxIterations = 15;
            clearInterval(scrambleInterval);

            scrambleInterval = setInterval(() => {
                labelSpan.innerText = targetText.split('').map((char, index) => {
                    if (index < iterations / 2) return char;
                    return characters[Math.floor(Math.random() * characters.length)];
                }).join('');

                iterations++;
                if (iterations >= maxIterations) {
                    clearInterval(scrambleInterval);
                    labelSpan.innerText = targetText;
                }
            }, 30);
        });

        node.addEventListener('mouseleave', () => {
            isObserved = false;
            node.classList.remove('observed');
            clearInterval(scrambleInterval);
            // Revert to superposition visually, wait for CSS transition
            setTimeout(() => {
                if (!isObserved) labelSpan.innerText = "";
            }, 300);
        });
    });
}
