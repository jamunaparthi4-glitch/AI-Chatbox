import { apikey } from "./config.js";

const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

function addMessage(message, className) {
    const msgDiv = document.createElement("div");
    msgDiv.classList.add("message", className);
    msgDiv.textContent = message;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function showTyping() {
    const typingDiv = document.createElement("div");
    typingDiv.classList.add("message", "bot-message");
    typingDiv.textContent = "AI is typing...";
    chatBox.appendChild(typingDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    return typingDiv;
}

async function getBotReply(userMessage) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apikey}`;

    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{ parts: [{ text: userMessage }] }]
        }),
    });

    const data = await response.json();
    console.log("Gemini API raw response:", data); // 👈 Check what it returns

    return data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn’t understand that.";
}

sendBtn.onclick = async () => {
    const message = userInput.value.trim();
    if (message === "") return;

    addMessage(message, "user-message");
    userInput.value = "";

    const typingDiv = showTyping();

    // Call Gemini API immediately
    try {
        const botReply = await getBotReply(message);

        // Instantly replace "AI is typing..." with the real reply
        typingDiv.textContent = botReply;

        // Save chat to local storage
        localStorage.setItem("chatHistory", chatBox.innerHTML);
    } catch (error) {
        typingDiv.textContent = "⚠️ Error: Could not fetch reply.";
        console.error(error);
    }
};

// Allow pressing "Enter" to send message
userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendBtn.click();
});
