// script.js
document.addEventListener("DOMContentLoaded", () => {
  // Initialize or restore session
  let sessionId = sessionStorage.getItem("chatbotSessionId");
  let chatHistory = [];
  
  try {
    chatHistory = JSON.parse(sessionStorage.getItem("chatHistory") || "[]");
  } catch (e) {
    console.error("Error parsing chat history:", e);
    chatHistory = [];
  }

  if (!sessionId) {
    sessionId = generateNewSessionId();
    sessionStorage.setItem("chatbotSessionId", sessionId);
  }

  function generateNewSessionId() {
    return Math.floor(100000000 + Math.random() * 900000000).toString();
  }

  function saveChatMessage(message, type) {
    chatHistory.push({ message, type });
    sessionStorage.setItem("chatHistory", JSON.stringify(chatHistory));
  }

  const chatBot = document.createElement("div");
  chatBot.classList.add("itnt_chatBot");
  const greetingMessage = itntChatbotSettings.greetingMessage;
  const webhookUrl = itntChatbotSettings.webhookUrl;
  const chatTitle = itntChatbotSettings.title;

  // Helper function to create message elements
  function createChatElement(message, type) {
    const chatDiv = document.createElement("div");
    chatDiv.classList.add("itnt_chat", `itnt_chat-${type}`);
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("itnt_message");
    messageDiv.textContent = message;
    chatDiv.appendChild(messageDiv);
    return chatDiv;
  }

  // Initialize chat UI
  chatBot.innerHTML = `
    <div class="itnt_container">      <div class="itnt_header">
        <span class="itnt_title">${chatTitle}</span>
        <button class="itnt_btn itnt_btn-reset" title="Start New Session">🔄</button>
        <button class="itnt_btn itnt_btn-close" aria-label="Close">X</button>
      </div>
      <div class="itnt_chatbox">
        ${chatHistory.length > 0 ? 
          chatHistory.map(msg => `
            <div class="itnt_chat itnt_chat-${msg.type}">
              <div class="itnt_message">${msg.message}</div>
            </div>
          `).join('') :
          `<div class="itnt_chat itnt_chat-incoming">
            <div class="itnt_message">${greetingMessage}</div>
          </div>`
        }
      </div>
      <div class="itnt_chat-input">
        <textarea class="itnt_input" rows="2" placeholder="Enter a message..."></textarea>
        <button class="itnt_btn itnt_btn-send">Send</button>
      </div>
    </div>
  `;

  document.body.appendChild(chatBot);

  // Get UI elements
  const chatInput = chatBot.querySelector(".itnt_input");
  const sendChatBtn = chatBot.querySelector(".itnt_btn-send");
  const chatbox = chatBot.querySelector(".itnt_chatbox");
  const resetBtn = chatBot.querySelector(".itnt_btn-reset");
  const closeBtn = chatBot.querySelector(".itnt_btn-close");

  // Create floating chat button
  const chatOpenBtn = document.createElement("button");
  chatOpenBtn.className = "itnt_open-btn";
  chatOpenBtn.title = "Chat öffnen";
  chatOpenBtn.innerHTML = '<div class="itnt_call-btn-content">💬</div>';
  document.body.appendChild(chatOpenBtn);

  // New session button handler
  resetBtn.addEventListener("click", () => {
    // Generate new session ID
    sessionId = generateNewSessionId();
    sessionStorage.setItem("chatbotSessionId", sessionId);
    
    // Clear chat history
    chatHistory = [];
    sessionStorage.removeItem("chatHistory");
    
    // Reset chat UI
    chatbox.innerHTML = '';
    const greetingLi = createChatElement(greetingMessage, "incoming");
    chatbox.appendChild(greetingLi);
    
    // Save initial greeting to history
    saveChatMessage(greetingMessage, "incoming");
    
    // Scroll to bottom
    chatbox.scrollTo(0, chatbox.scrollHeight);
  });

  function generateResponse(chatElement) {
    const messageElement = chatElement.querySelector(".itnt_message");
    
    fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chatInput: userMessage,
        sessionId: sessionId
      })
    })
    .then(res => {
      if (!res.ok) throw new Error("Network response was not ok");
      return res.json();
    })
    .then(data => {
      const aiResponse = data.output;
      messageElement.textContent = aiResponse;
      saveChatMessage(aiResponse, "incoming");
    })
    .catch(error => {
      const errorMessage = "Hoppla, da ist ein Fehler aufgetreten. Versuch's nochmal!";
      messageElement.textContent = errorMessage;
      messageElement.classList.add("error");
      saveChatMessage(errorMessage, "incoming");
    })
    .finally(() => chatbox.scrollTo(0, chatbox.scrollHeight));
  }

  function handleChat() {
    const message = chatInput.value.trim();
    if (!message) return;

    // Save and display user message
    const userChatElement = createChatElement(message, "outgoing");
    chatbox.appendChild(userChatElement);
    saveChatMessage(message, "outgoing");
    
    // Clear input and prepare for response
    chatInput.value = "";
    userMessage = message;

    // Show typing indicator and generate response
    setTimeout(() => {
      const botChatElement = createChatElement("...", "incoming");
      chatbox.appendChild(botChatElement);
      chatbox.scrollTo(0, chatbox.scrollHeight);
      generateResponse(botChatElement);
    }, 600);
  }

  // Event Listeners
  sendChatBtn.addEventListener("click", handleChat);
  
  chatInput.addEventListener("keypress", event => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleChat();
    }
  });

  resetBtn.addEventListener("click", () => {
    sessionId = generateNewSessionId();
    sessionStorage.setItem("chatbotSessionId", sessionId);
    chatHistory = [];
    sessionStorage.removeItem("chatHistory");
    chatbox.innerHTML = "";
    const greetingElement = createChatElement(greetingMessage, "incoming");
    chatbox.appendChild(greetingElement);
    saveChatMessage(greetingMessage, "incoming");
    chatbox.scrollTo(0, chatbox.scrollHeight);
  });

  // UI visibility functions
  function showChatbot() {
    chatBot.style.display = "block";
    chatOpenBtn.style.display = "none";
    setTimeout(() => chatInput.focus(), 100);
  }

  function hideChat() {
    chatBot.style.display = "none";
    chatOpenBtn.style.display = "block";
  }

  chatOpenBtn.addEventListener("click", showChatbot);
  closeBtn.addEventListener("click", hideChat);

  // Initial state
  hideChat();
});
