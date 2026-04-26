const chatContainer = document.getElementById('chat-container');
const messageInput = document.getElementById('message-input');
const newChatBtn = document.getElementById('new-chat-btn');

// Built-in API keys — pre-configured so users don't need to enter one
const BUILTIN_OPENROUTER_KEY = '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';
const GROQ_API = `https://api.groq.com/v1/chat/completions?api_key=${(typeof process !== 'undefined' && process.env.GROQ_API_KEY) || ''}`;
const OPEN_ROUTER = `https://openrouter.ai/api/v1/chat/completions?api_key=${(typeof process !== 'undefined' && process.env.OPEN_ROUTER_KEY) || BUILTIN_OPENROUTER_KEY}`;

async function sendMessage() {
  const message = messageInput.value.trim();
  if (!message) return;

  appendMessage('user', message);
  messageInput.value = '';

  const response = await fetch(GROQ_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: "mixtral-8x7b-32768",
      messages: [{ role: "user", content: message }],
      temperature: 0.7
    })
  });

  const data = await response.json();
  appendMessage('ai', data.choices[0].message.content);
}

function appendMessage(sender, text) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${sender}-message`;
  messageDiv.innerHTML = `
    <div class="message-content">${text}</div>
    <div class="message-footer">${new Date().toLocaleTimeString()}</div>
  `;
  chatContainer.appendChild(messageDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

newChatBtn.addEventListener('click', () => {
  chatContainer.innerHTML = '';
});
