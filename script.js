const apiKey = "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"; // Your Hugging Face API key
const model = "tiiuae/falcon-7b-instruct";

const sendBtn = document.getElementById("send-btn");
const userInput = document.getElementById("user-message");
const chatBox = document.getElementById("chat-history");

sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
        e.preventDefault();
        sendMessage();
    }
});

function appendMessage(sender, message) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message", sender.toLowerCase());
    messageDiv.innerHTML = `<strong>${sender}:</strong> ${message}`;
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Filter inappropriate words (optional)
function filterResponse(text) {
    const bannedWords = ["sexy", "nude", "nsfw", "xxx", "inappropriate"];
    for (let word of bannedWords) {
        if (text.toLowerCase().includes(word)) {
            return "⚠ Inappropriate response filtered.";
        }
    }
    return text;
}

async function sendMessage() {
    const message = userInput.value.trim();
    if (message === "") return;

    appendMessage("You", message);
    userInput.value = "";
    appendMessage("Bot", "Typing...");

    try {
        const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                inputs: `Answer briefly and clearly:\nQ: ${message}\nA:`,
                parameters: {
                    max_new_tokens: 50, // ✅ Limit token length for shorter answers
                    temperature: 0.5,
                    top_p: 0.9,
                    do_sample: true,
                    repetition_penalty: 1.2,
                    return_full_text: false
                }
            })
        });

        const data = await response.json();

        const lastBotMsg = document.querySelector(".message.bot:last-child");
        if (lastBotMsg) lastBotMsg.remove();

        if (data && data[0]?.generated_text) {
            const reply = filterResponse(data[0].generated_text.trim());
            appendMessage("Bot", reply);
        } else if (data?.error) {
            appendMessage("Bot", `⚠ API Error: ${data.error}`);
        } else {
            appendMessage("Bot", "⚠ Something went wrong. Please try again.");
        }
    } catch (error) {
        console.error("Fetch error:", error);
        const lastBotMsg = document.querySelector(".message.bot:last-child");
        if (lastBotMsg) lastBotMsg.remove();
        appendMessage("Bot", "⚠ Network error. Please try again later.");
    }
}