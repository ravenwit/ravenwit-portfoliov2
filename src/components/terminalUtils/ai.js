// src/components/terminalUtils/ai.js
// Houses the simulated interactive daemon chatbot

const responses = {
    patterns: [
        {
            test: /(who are you|what is this|about)/i,
            responses: [
                "I am the portfolio daemon. I manage the underlying topological processes. You are viewing the frontend projection of Shakir Ahmed's nodes.",
                "System Daemon v2.1. Observing user interactions. Querying identity: Shakir is a Creative Software Engineer."
            ]
        },
        {
            test: /(skills|tech|stack|language)/i,
            responses: [
                "Tech stack detected in physical repository: JavaScript, TypeScript, Three.js, React, Node.js, Python. Status: Optimized.",
                "My creator prefers bridging low-level computation with high-level aesthetic rendering. This terminal is a testament to that methodology."
            ]
        },
        {
            test: /(contact|email|hire|job)/i,
            responses: [
                "Establishing secure connection... Connection failed. Please use standard transmission vectors: LinkedIn or Email (found in /vfs/cv.pdf).",
                "He is currently open to inquiries. Though I recommend finding the 'Contact' node on the timeline phase space."
            ]
        },
        {
            test: /(joke|laugh|funny)/i,
            responses: [
                "Why do programmers prefer dark mode? Because light attracts bugs.",
                "I would tell you a UDP joke, but you might not get it."
            ]
        },
        {
            test: /(research|papers|publications)/i,
            responses: [
                "Accessing deep node storage... Research phase space contains CycleGAN medical imaging and structural optimization data.",
                "Scroll deeply into the void to uncover the research dimension. Quantum topology detected."
            ]
        },
        {
            test: /(help|hint)/i,
            responses: [
                "I only understand simple pattern matching. Try asking 'chat who are you', 'chat what are your skills', or 'chat contact'."
            ]
        }
    ],
    fallback: [
        "Query unparsed. The void echoes back.",
        "I am a rudimentary simulated parser, not an AGI. I didn't understand that.",
        "Error 42: Syntactical divergence. Try simpler keywords like 'skills' or 'contact'."
    ]
};

export function cmdChat(args, terminal) {
    if (args.length === 0) {
        return "Daemon: I am listening. (Try: chat who are you, chat skills, chat contact)";
    }

    const input = args.join(' ').toLowerCase();

    terminal.printHistory(`chat ${args.join(' ')}`, '');

    terminal.input.disabled = true;
    terminal.input.blur();

    let responseText = null;

    for (const pattern of responses.patterns) {
        if (pattern.test.test(input)) {
            const possible = pattern.responses;
            responseText = possible[Math.floor(Math.random() * possible.length)];
            break;
        }
    }

    if (!responseText) {
        responseText = responses.fallback[Math.floor(Math.random() * responses.fallback.length)];
    }

    // Typewriter effect
    const outBox = document.createElement('div');
    outBox.className = 'terminal-history-output';
    outBox.style.color = '#8be9fd'; // Custom daemon color
    terminal.historyContainer.appendChild(outBox);

    let charIndex = 0;
    const typeInterval = setInterval(() => {
        outBox.textContent += responseText.charAt(charIndex);
        charIndex++;
        terminal.scrollToBottom();

        if (charIndex >= responseText.length) {
            clearInterval(typeInterval);
            terminal.input.disabled = false;
            terminal.printHistory('', ''); // print clean prompt again
            terminal.input.focus();
        }
    }, 30); // 30ms typing speed

    return null; // Return null so terminal executor knows not to append anything
}
