// Built-in API keys — OpenRouter key pre-configured so users don't need to enter one
const OPEN_ROUTER_KEY = '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';
const GROQ_API_KEY = ''; // Add a Groq key here if you have one, otherwise OpenRouter is used

// Chat functionality
document.querySelector('.send-btn').addEventListener('click', () => {
  const input = document.querySelector('.input-area textarea');
  const message = input.value.trim();
  if (!message) return;

  addMessageToChat('user', message);
  input.value = '';
  
  // Simulate AI response
  setTimeout(() => {
    const response = getAIResponse(message);
    addMessageToChat('ai', response);
  }, 800);
});

function addMessageToChat(sender, text) {
  const chatWindow = document.querySelector('.chat-window');
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message', sender);
  messageDiv.innerHTML = `<p>${text}</p>`;
  chatWindow.appendChild(messageDiv);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function getAIResponse(query) {
  // In production, this would call Groq API with the query
  // For demo, we'll use a simple response system
  const responses = {
    "past papers": "I can help you analyze past exam papers and identify key topics. Upload a paper or ask about specific subjects.",
    "study plan": "Let's create a personalized study plan. What subjects are you focusing on and when is your exam?",
    "exam prep": "I can generate practice questions and mock exams. What level of difficulty would you like?",
    "default": "I'm here to help with your studies! Ask about past papers, exam prep, or study strategies."
  };
  
  return responses[query.toLowerCase()] || responses.default;
}

// Admin dashboard integration
function initAdminDashboard() {
  // In production, this would fetch real data from backend
  const stats = {
    users: 12450,
    active: 876,
    revenue: "$32,450"
  };
  
  document.getElementById('admin').addEventListener('click', () => {
    alert(`📊 Admin Stats:\nUsers: ${stats.users}\nActive: ${stats.active}\nRevenue: ${stats.revenue}`);
  });
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  initAdminDashboard();
});
