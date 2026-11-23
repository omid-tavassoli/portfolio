/* chat.js — the hero chat bar and the chat window on index.html (UI only for now) */
(function () {
    const $ = id => document.getElementById(id);
    const panel = $('chatPanel'), log = $('chatLog');
    const heroForm = $('heroChat'), heroInput = $('heroChatInput');
    const chatForm = $('chatForm'), chatInput = $('chatInput');
    const history = []; // [{ role: 'user' | 'bot', text }], ready to send to the backend later
    let busy = false;

    // The only part that changes when the Python backend is connected:
    // send the question (and history) to the backend and return its answer as text.
    async function askAssistant(question, history) {
        await new Promise(resolve => setTimeout(resolve, 900));
        return "I'm not connected yet. Soon I'll answer questions about Omid's projects, skills and experience right here.";
    }

    function addMessage(role, text) {
        const msg = document.createElement('div');
        msg.className = `chat-msg ${role}`;
        msg.textContent = text; // always plain text, never HTML
        log.append(msg);
        log.scrollTop = log.scrollHeight;
        return msg;
    }

    function addTyping() {
        const typing = document.createElement('div');
        typing.className = 'chat-msg bot chat-typing';
        typing.setAttribute('aria-label', 'Assistant is typing');
        typing.append(document.createElement('i'), document.createElement('i'), document.createElement('i'));
        log.append(typing);
        log.scrollTop = log.scrollHeight;
        return typing;
    }

    function setBusy(on) {
        busy = on;
        for (const btn of document.querySelectorAll('.chat-send, .chat-chip')) btn.disabled = on;
    }

    function openChat() {
        panel.classList.add('open');
        panel.setAttribute('aria-hidden', 'false');
    }

    function closeChat() {
        panel.classList.remove('open');
        panel.setAttribute('aria-hidden', 'true');
        heroInput.focus();
    }

    async function send(text) {
        const question = text.trim();
        if (!question || busy) return;
        openChat();
        addMessage('user', question);
        history.push({ role: 'user', text: question });
        setBusy(true);
        const typing = addTyping();
        let answer;
        try {
            answer = await askAssistant(question, history);
        } catch {
            answer = 'Something went wrong, please try again.';
        }
        typing.remove();
        addMessage('bot', answer);
        history.push({ role: 'bot', text: answer });
        setBusy(false);
        chatInput.focus();
    }

    heroForm.addEventListener('submit', e => {
        e.preventDefault();
        send(heroInput.value);
        heroInput.value = '';
    });

    chatForm.addEventListener('submit', e => {
        e.preventDefault();
        send(chatInput.value);
        chatInput.value = '';
    });

    for (const chip of document.querySelectorAll('.chat-chip')) {
        chip.addEventListener('click', () => send(chip.textContent));
    }

    // the full placeholder gets cut off on phones
    const narrow = matchMedia('(max-width: 560px)');
    const fullPlaceholder = heroInput.placeholder;
    const fitPlaceholder = () => { heroInput.placeholder = narrow.matches ? 'Ask me anything…' : fullPlaceholder; };
    narrow.addEventListener('change', fitPlaceholder);
    fitPlaceholder();

    $('chatClose').addEventListener('click', closeChat);
    addEventListener('keydown', e => {
        if (e.key === 'Escape' && panel.classList.contains('open')) closeChat();
    });
})();
