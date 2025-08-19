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
    chatBot.classList.add("getgenius_chatBot");
    const greetingMessage = getgeniusChatbotSettings.greetingMessage;
    const webhookUrl = getgeniusChatbotSettings.webhookUrl;
    const chatTitle = getgeniusChatbotSettings.title;
    const privacyNotice = getgeniusChatbotSettings.privacyNotice;
    const messageLimit = parseInt(getgeniusChatbotSettings.messageLimit, 10) || 10;
    let messageCount = parseInt(sessionStorage.getItem("chatbotMessageCount") || "0", 10);
    const messageLimitGlobal = parseInt(getgeniusChatbotSettings.messageLimitGlobal, 10) || 1000;
    // Use localStorage for global per-day count (browser-wide)
    const todayKey = `chatbotGlobalDate`;
    const countKey = `chatbotGlobalCount`;
    const today = new Date().toISOString().slice(0, 10);
    let globalDate = localStorage.getItem(todayKey);
    let globalCount = parseInt(localStorage.getItem(countKey) || "0", 10);
    if (globalDate !== today) {
        globalDate = today;
        globalCount = 0;
        localStorage.setItem(todayKey, today);
        localStorage.setItem(countKey, globalCount);
    }
    const limitMessage =
        getgeniusChatbotSettings.limitMessage ||
        "Du hast das Limit erreicht. Bitte kontaktiere uns unter info@example.com oder ruf uns an!";

    // Helper function to create message elements

    function createChatElement(message, type) {
        const chatDiv = document.createElement("div");
        chatDiv.classList.add("getgenius_chat", `getgenius_chat-${type}`);
        const messageDiv = document.createElement("div");
        messageDiv.classList.add("getgenius_message");
        messageDiv.textContent = message;
        chatDiv.appendChild(messageDiv);
        return chatDiv;
    }

    // Initialize chat UI with privacy notice overlay
    chatBot.innerHTML = `
        <div class="getgenius_container">
            ${
                !privacyAccepted
                    ? `
                <div class="getgenius_privacy_overlay">
                    <div class="getgenius_privacy_content">
                        <h3>Datenschutzhinweis</h3>
                        <p>${privacyNotice}</p>
                        <div class="getgenius_privacy_buttons">
                            <button class="getgenius_btn getgenius_btn-accept">Akzeptieren</button>
                            <button class="getgenius_btn getgenius_btn-decline">Ablehnen</button>
                        </div>
                    </div>
                </div>
            `
                    : ""
            }
            <div class="getgenius_header">
                <span class="getgenius_title">${chatTitle}</span>
                <button class="getgenius_btn getgenius_btn-reset" title="Start New Session">🔄</button>
                <button class="getgenius_btn getgenius_btn-close" aria-label="Close">X</button>
            </div>
            <div class="getgenius_chatbox">
                ${
                    chatHistory.length > 0
                        ? chatHistory
                              .map(
                                  (msg) => `
                        <div class="getgenius_chat getgenius_chat-${msg.type}">
                            <div class="getgenius_message">${msg.message}</div>
                        </div>
                    `
                              )
                              .join("")
                        : `<div class="getgenius_chat getgenius_chat-incoming">
                        <div class="getgenius_message">${greetingMessage}</div>
                    </div>`
                }
            </div>
            <div class="getgenius_chat-input">
                <textarea class="getgenius_input" rows="2" placeholder="Enter a message..." ${
                    !privacyAccepted ? "disabled" : ""
                }></textarea>
                <button class="getgenius_btn getgenius_btn-send" ${!privacyAccepted ? "disabled" : ""}>Send</button>
            </div>
        </div>
    `;

    // Attach privacy button event listeners if overlay exists
    setTimeout(() => {
        const privacyOverlay = chatBot.querySelector(".getgenius_privacy_overlay");
        if (privacyOverlay) {
            const acceptBtn = privacyOverlay.querySelector(".getgenius_btn-accept");
            const declineBtn = privacyOverlay.querySelector(".getgenius_btn-decline");
            if (acceptBtn && !acceptBtn.hasAttribute("data-listener")) {
                acceptBtn.setAttribute("data-listener", "true");
                acceptBtn.addEventListener("click", () => {
                    privacyOverlay.classList.add("hiding");
                    setTimeout(() => {
                        privacyAccepted = true;
                        sessionStorage.setItem("chatbotPrivacyAccepted", "true");
                        privacyOverlay.remove();
                        chatInput.disabled = false;
                        sendChatBtn.disabled = false;
                        setTimeout(() => chatInput.focus(), 100);
                    }, 300);
                });
            }
            if (declineBtn && !declineBtn.hasAttribute("data-listener")) {
                declineBtn.setAttribute("data-listener", "true");
                declineBtn.addEventListener("click", () => {
                    privacyOverlay.classList.add("hiding");
                    setTimeout(() => {
                        hideChat();
                        sessionStorage.setItem("chatbotPrivacyAccepted", "false");
                    }, 300);
                });
            }
        }
    }, 0);

    document.body.appendChild(chatBot);

    // Get UI elements
    const chatInput = chatBot.querySelector(".getgenius_input");
    const sendChatBtn = chatBot.querySelector(".getgenius_btn-send");
    const chatbox = chatBot.querySelector(".getgenius_chatbox");
    const resetBtn = chatBot.querySelector(".getgenius_btn-reset");
    const closeBtn = chatBot.querySelector(".getgenius_btn-close");

    // Create floating chat button
    const chatOpenBtn = document.createElement("button");
    chatOpenBtn.className = "getgenius_open-btn";
    chatOpenBtn.title = "Chat öffnen";
    chatOpenBtn.innerHTML = '<div class="getgenius_call-btn-content">💬</div>';
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
        const messageElement = chatElement.querySelector(".getgenius_message");

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
        let blocked = false;
        // Check per-session limit
        if (messageCount >= messageLimit) {
            chatInput.disabled = true;
            sendChatBtn.disabled = true;
            const limitChatElement = createChatElement(limitMessage, "incoming");
            chatbox.appendChild(limitChatElement);
            saveChatMessage(limitMessage, "incoming");
            chatbox.scrollTo(0, chatbox.scrollHeight);
            blocked = true;
        }
        // Check global per-day limit
        if (globalCount >= messageLimitGlobal) {
            chatInput.disabled = true;
            sendChatBtn.disabled = true;
            const limitChatElement = createChatElement(limitMessage, "incoming");
            chatbox.appendChild(limitChatElement);
            saveChatMessage(limitMessage, "incoming");
            chatbox.scrollTo(0, chatbox.scrollHeight);
            blocked = true;
        }
        if (blocked) return;

        const message = chatInput.value.trim();
        if (!message) return;

        // Save and display user message
        const userChatElement = createChatElement(message, "outgoing");
        chatbox.appendChild(userChatElement);
        saveChatMessage(message, "outgoing");

        // Clear input
        chatInput.value = "";

        // Increment message count and persist (per session)
        if (messageCount < messageLimit) {
            messageCount++;
            sessionStorage.setItem("chatbotMessageCount", messageCount);
        }
        // Increment global count and persist (per day)
        if (globalCount < messageLimitGlobal) {
            globalCount++;
            localStorage.setItem(countKey, globalCount);
        }

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
            const privacyOverlay = chatBot.querySelector(".getgenius_privacy_overlay");
            if (privacyOverlay) {
                const acceptBtn = privacyOverlay.querySelector(".getgenius_btn-accept");
                const declineBtn = privacyOverlay.querySelector(".getgenius_btn-decline");

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

    // Disable input and send button if any limit is already reached on page load
    if (messageCount >= messageLimit) {
        chatInput.disabled = true;
        sendChatBtn.disabled = true;
    } else if (globalCount >= messageLimitGlobal) {
        chatInput.disabled = true;
        sendChatBtn.disabled = true;
    }
});
