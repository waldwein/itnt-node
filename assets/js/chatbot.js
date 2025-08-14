// script.js
document.addEventListener("DOMContentLoaded", () => {
    // Initialize or restore session and check privacy consent
    let sessionId = sessionStorage.getItem("chatbotSessionId");
    let chatHistory = [];
    let privacyAccepted = sessionStorage.getItem("chatbotPrivacyAccepted") === "true";
    let userMessage = ""; // Declare userMessage at the top level

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
    const privacyNotice = itntChatbotSettings.privacyNotice;
    const messageLimit = parseInt(itntChatbotSettings.messageLimit, 10) || 10;
    let messageCount = parseInt(sessionStorage.getItem("chatbotMessageCount") || "0", 10);
    const limitMessage =
        itntChatbotSettings.limitMessage ||
        "Du hast das Limit erreicht. Bitte kontaktiere uns unter info@example.com oder ruf uns an!";

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
    // Initialize chat UI with privacy notice overlay
    chatBot.innerHTML = `
    <div class="itnt_container">
      ${
          !privacyAccepted
              ? `
        <div class="itnt_privacy_overlay">
          <div class="itnt_privacy_content">
            <h3>Datenschutzhinweis</h3>
            <p>${privacyNotice}</p>
            <div class="itnt_privacy_buttons">
              <button class="itnt_btn itnt_btn-accept">Akzeptieren</button>
              <button class="itnt_btn itnt_btn-decline">Ablehnen</button>
            </div>
          </div>
        </div>
      `
              : ""
      }
      <div class="itnt_header">
        <span class="itnt_title">${chatTitle}</span>
        <button class="itnt_btn itnt_btn-reset" title="Start New Session">🔄</button>
        <button class="itnt_btn itnt_btn-close" aria-label="Close">X</button>
      </div>
      <div class="itnt_chatbox">
        ${
            chatHistory.length > 0
                ? chatHistory
                      .map(
                          (msg) => `
            <div class="itnt_chat itnt_chat-${msg.type}">
              <div class="itnt_message">${msg.message}</div>
            </div>
          `
                      )
                      .join("")
                : `<div class="itnt_chat itnt_chat-incoming">
            <div class="itnt_message">${greetingMessage}</div>
          </div>`
        }
      </div>
      <div class="itnt_chat-input">
        <textarea class="itnt_input" rows="2" placeholder="Enter a message..." ${
            !privacyAccepted ? "disabled" : ""
        }></textarea>
        <button class="itnt_btn itnt_btn-send" ${!privacyAccepted ? "disabled" : ""}>Send</button>
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
        chatbox.innerHTML = "";
        const greetingLi = createChatElement(greetingMessage, "incoming");
        chatbox.appendChild(greetingLi);

        // Save initial greeting to history
        saveChatMessage(greetingMessage, "incoming");

        // Scroll to bottom
        chatbox.scrollTo(0, chatbox.scrollHeight);
    });

    function generateResponse(chatElement, message) {
        // Add message parameter
        const messageElement = chatElement.querySelector(".itnt_message");

        fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chatInput: message, // Use the passed message
                sessionId: sessionId
            })
        })
            .then((res) => {
                if (!res.ok) throw new Error("Network response was not ok");
                return res.json();
            })
            .then((data) => {
                const aiResponse = data.output;
                messageElement.textContent = aiResponse;
                saveChatMessage(aiResponse, "incoming");
            })
            .catch((error) => {
                const errorMessage = "Hoppla, da ist ein Fehler aufgetreten. Versuch's nochmal!";
                messageElement.textContent = errorMessage;
                messageElement.classList.add("error");
                saveChatMessage(errorMessage, "incoming");
            })
            .finally(() => chatbox.scrollTo(0, chatbox.scrollHeight));
    }

    function handleChat() {
        if (messageCount >= messageLimit) {
            // Disable input and send button immediately
            chatInput.disabled = true;
            sendChatBtn.disabled = true;
            // Show friendly limit message
            const limitChatElement = createChatElement(limitMessage, "incoming");
            chatbox.appendChild(limitChatElement);
            saveChatMessage(limitMessage, "incoming");
            chatbox.scrollTo(0, chatbox.scrollHeight);
            return;
        }
        const message = chatInput.value.trim();
        if (!message) return;

        // Save and display user message
        const userChatElement = createChatElement(message, "outgoing");
        chatbox.appendChild(userChatElement);
        saveChatMessage(message, "outgoing");

        // Clear input
        chatInput.value = "";

        // Increment message count and persist
        messageCount++;
        sessionStorage.setItem("chatbotMessageCount", messageCount);

        // Show typing indicator and generate response
        setTimeout(() => {
            const botChatElement = createChatElement("...", "incoming");
            chatbox.appendChild(botChatElement);
            chatbox.scrollTo(0, chatbox.scrollHeight);
            generateResponse(botChatElement, message); // Pass the message
        }, 600);
    }

    // Event Listeners
    sendChatBtn.addEventListener("click", handleChat);

    chatInput.addEventListener("keypress", (event) => {
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
        // Reset message count
        messageCount = 0;
        sessionStorage.setItem("chatbotMessageCount", messageCount);
        // Re-enable input and send button
        chatInput.disabled = false;
        sendChatBtn.disabled = false;
    });

    // UI visibility functions
    function showChatbot() {
        if (!privacyAccepted) {
            chatBot.style.display = "block";
            chatOpenBtn.style.display = "none";
            const privacyOverlay = chatBot.querySelector(".itnt_privacy_overlay");
            if (privacyOverlay) {
                const acceptBtn = privacyOverlay.querySelector(".itnt_btn-accept");
                const declineBtn = privacyOverlay.querySelector(".itnt_btn-decline");

                acceptBtn.addEventListener("click", () => {
                    privacyOverlay.classList.add("hiding");
                    setTimeout(() => {
                        privacyAccepted = true;
                        sessionStorage.setItem("chatbotPrivacyAccepted", "true");
                        privacyOverlay.remove();
                        chatInput.disabled = false;
                        sendChatBtn.disabled = false;
                        setTimeout(() => chatInput.focus(), 100);
                    }, 300); // Match the CSS animation duration
                });

                declineBtn.addEventListener("click", () => {
                    privacyOverlay.classList.add("hiding");
                    setTimeout(() => {
                        hideChat();
                        sessionStorage.setItem("chatbotPrivacyAccepted", "false");
                    }, 300); // Match the CSS animation duration
                });
            }
        } else {
            chatBot.style.display = "block";
            chatOpenBtn.style.display = "none";
            setTimeout(() => chatInput.focus(), 100);
        }
    }

    function hideChat() {
        chatBot.style.display = "none";
        chatOpenBtn.style.display = "block";
    }

    chatOpenBtn.addEventListener("click", showChatbot);
    closeBtn.addEventListener("click", hideChat);

    // Initial state
    hideChat();

    // Check for declined privacy on open
    chatOpenBtn.addEventListener("click", () => {
        if (sessionStorage.getItem("chatbotPrivacyAccepted") === "false") {
            alert("Sie müssen die Datenschutzbestimmungen akzeptieren, um den Chat nutzen zu können.");
            return;
        }
        showChatbot();
    });

    // Disable input and send button if limit is already reached on page load
    if (messageCount >= messageLimit) {
        chatInput.disabled = true;
        sendChatBtn.disabled = true;
    }
});
