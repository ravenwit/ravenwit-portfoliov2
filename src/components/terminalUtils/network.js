// src/components/terminalUtils/network.js
// Handles simulated asynchronous network commands.

export function cmdPing(args, terminal) {
    if (args.length === 0) return 'Usage: ping <destination>';

    const target = args[0];
    terminal.printHistory(`ping ${target}`, `PING ${target} (192.168.1.${Math.floor(Math.random() * 255)}): 56 data bytes`);

    let count = 0;
    const maxPings = 4;

    terminal.input.disabled = true;
    terminal.input.blur();

    const interval = setInterval(() => {
        count++;

        // Simulate packet loss or normal ping
        if (Math.random() > 0.85) {
            terminal.printLine(`Request timeout for icmp_seq ${count - 1}`);
        } else {
            const ms = (Math.random() * 40 + 10).toFixed(3);
            terminal.printLine(`64 bytes from ${target}: icmp_seq=${count - 1} ttl=116 time=${ms} ms`);
        }

        if (count >= maxPings) {
            clearInterval(interval);
            terminal.printLine(`\n--- ${target} ping statistics ---`);
            terminal.printLine(`${maxPings} packets transmitted, ${Math.floor(maxPings * 0.8)} packets received, 20.0% packet loss`);

            terminal.input.disabled = false;
            terminal.printHistory('', ''); // print clean prompt
            terminal.input.focus();
        }
    }, 1000);

    return null; // Return null so the main executor does not double-print
}

export function cmdNmap(args, terminal) {
    const target = args.length > 0 ? args[0] : 'localhost';

    terminal.printHistory(`nmap ${target}`, `Starting Nmap 7.92 ( https://nmap.org ) at ${new Date().toISOString()}`);

    // Initial delay to simulate resolving
    terminal.input.disabled = true;
    terminal.input.blur();

    setTimeout(() => {
        terminal.printLine(`Nmap scan report for ${target}`);
        terminal.printLine(`Host is up (0.00${Math.floor(Math.random() * 900)}s latency).`);
        terminal.printLine(`Not shown: 996 closed tcp ports (conn-refused)`);
        terminal.printLine(`PORT     STATE SERVICE`);

        const ports = [
            { port: 22, proto: 'tcp', state: 'open', service: 'ssh' },
            { port: 80, proto: 'tcp', state: 'open', service: 'http' },
            { port: 443, proto: 'tcp', state: 'open', service: 'https' },
            { port: 8080, proto: 'tcp', state: 'open', service: 'http-proxy' }
        ];

        let index = 0;

        const printPort = () => {
            if (index < ports.length) {
                const p = ports[index];
                // basic column alignment
                const portStr = `${p.port}/${p.proto}`.padEnd(8, ' ');
                const stateStr = p.state.padEnd(5, ' ');
                terminal.printLine(`${portStr} ${stateStr} ${p.service}`);
                index++;
                setTimeout(printPort, Math.random() * 400 + 100);
            } else {
                terminal.printLine(`\nNmap done: 1 IP address (1 host up) scanned in ${(Math.random() * 2 + 0.5).toFixed(2)} seconds`);
                terminal.input.disabled = false;
                terminal.printHistory('', '');
                terminal.input.focus();
            }
        };

        setTimeout(printPort, 500);
    }, 800);

    return null;
}
