// script.js
document.addEventListener("DOMContentLoaded", () => {
  const chatBot = document.createElement("div");
  chatBot.classList.add("itnt_chatBot");

  // Get settings from WordPress
  const greetingMessage = itntChatbotSettings.greetingMessage;
  const webhookUrl = itntChatbotSettings.webhookUrl;

  chatBot.innerHTML = `
          <div class="itnt_container">
            <header class="cb_header">
                <h2 class="cb_title">ChatBot</h2>
                <span alt="Close" id="itnt_cross">X</span>
            </header>
            <ul class="itnt_chatbox">
                <li class="itnt_chat-incoming itnt_chat">
                    <p class="cb_message">${greetingMessage}</p>
                </li>
            </ul>
            <div class="itnt_chat-input">
              <textarea rows="2" cols="17" placeholder="Enter a message..."></textarea>
              <button id="itnt_sendBTN">Send</button>
            </div>
          </div>
        `;

  document.body.appendChild(chatBot);

  const chatInput = chatBot.querySelector(".itnt_chat-input textarea");
  const sendChatBtn = chatBot.querySelector("#itnt_sendBTN");
  const chatbox = chatBot.querySelector(".itnt_chatbox");

  let userMessage;

  // Fixing the createChatLi function to use document.createElement
  const createChatLi = (message, className) => {
    const chatLi = document.createElement("li");
    chatLi.classList.add("itnt_chat", className);
    let chatContent = `<p>${message}</p>`;
    chatLi.innerHTML = chatContent;
    return chatLi;
  };

  const generateResponse = (incomingChatLi) => {
    // Generate a numeric session ID for the conversation
    let sessionId = sessionStorage.getItem("chatbotSessionId");
    if (!sessionId) {
      sessionId = Math.floor(100000000 + Math.random() * 900000000).toString(); // 9 random digits
      sessionStorage.setItem("chatbotSessionId", sessionId);
    }
    const messageElement = incomingChatLi.querySelector("p");
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chatInput: userMessage, // Send the user's message
        sessionId: sessionId, // Send the session ID
      }),
    };

    fetch(webhookUrl, requestOptions)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Network response was not ok");
        }
        return res.json();
      })
      .then((data) => {
        // Show the actual AI/agent response from n8n
        // Try to find a response property, fallback to a generic message if not found
        // let aiResponse = data.response || data.result || data.message || data.reply || "Antwort erhalten.";
        let aiResponse = data.output;
        console.log(aiResponse);

        messageElement.textContent = aiResponse;
      })
      .catch((error) => {
        messageElement.classList.add("error");
        messageElement.textContent = "Hoppla, da ist ein Fehler aufgetreten. Versuch's nochmal!";
      })
      .finally(() => chatbox.scrollTo(0, chatbox.scrollHeight));
  };

  const handleChat = () => {
    userMessage = chatInput.value.trim();
    if (!userMessage) return;
    
    chatbox.appendChild(createChatLi(userMessage, "itnt_chat-outgoing"));
    chatbox.scrollTo(0, chatbox.scrollHeight);
    chatInput.value = "";

    setTimeout(() => {
      const incomingChatLi = createChatLi("...", "itnt_chat-incoming");
      chatbox.appendChild(incomingChatLi);
      chatbox.scrollTo(0, chatbox.scrollHeight);
      generateResponse(incomingChatLi);
    }, 600);
  };

  sendChatBtn.addEventListener("click", handleChat);

  // Adding support for 'Enter' key press in the textarea
  chatInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleChat();
    }
  });

  // Create the floating chat open button (hidden by default)
  const chatOpenBtn = document.createElement("button");
  chatOpenBtn.id = "itnt_chatOpenBtn";
  chatOpenBtn.title = "Chat öffnen";
  chatOpenBtn.innerHTML = `
    <div class="itnt_call-btn-container">💬</div>
  `;
  chatOpenBtn.style.display = "none";
  document.body.appendChild(chatOpenBtn);

  // Show chatbot and hide open button
  function showChatbot() {
    chatBot.style.display = "block";
    chatOpenBtn.style.display = "none";
    // Focus the textarea when chatbot opens
    setTimeout(() => {
      chatInput.focus();
    }, 100); // Small delay to ensure DOM is ready
  }

  // Hide chatbot and show open button
  function cancel() {
    chatBot.style.display = "none";
    chatOpenBtn.style.display = "block";
  }

  // Open chatbot when round button is clicked
  chatOpenBtn.addEventListener("click", showChatbot);

  // Remove inline onclick and use event delegation for close button
  chatBot.querySelector("#itnt_cross").addEventListener("click", cancel);

  // On page load, show only the round button, hide the chatbot
  window.addEventListener("DOMContentLoaded", () => {
    chatBot.style.display = "none";
    chatOpenBtn.style.display = "block";
  });
});
