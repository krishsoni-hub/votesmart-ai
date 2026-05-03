document.addEventListener('DOMContentLoaded', () => {
    const chatWindow = document.getElementById('chat-window');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    const voiceBtn = document.getElementById('voice-btn');

    // Generate a simple unique user ID for the session
    const userId = 'user_' + Math.random().toString(36).substr(2, 9);

    // Auto-focus input on load
    chatInput.focus();

    // Global function for chatbot scroll & highlight
    window.openChatbot = () => {
        const chatbot = document.getElementById('chatbot');
        chatbot.scrollIntoView({ behavior: 'smooth' });
        chatbot.classList.remove('highlight-chat');
        void chatbot.offsetWidth; // trigger reflow
        chatbot.classList.add('highlight-chat');
        chatInput.focus();
    };

    // Scroll chat to bottom
    const scrollToBottom = () => {
        chatWindow.scrollTop = chatWindow.scrollHeight;
    };

    // Add message to UI
    const addMessage = (text, sender) => {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${sender}`;
        
        // Use marked/markdown parsing for simple bolding if needed, or just insert as text
        // For simplicity and safety, we set innerHTML but we escape basic HTML, then convert \n to <br>, **text** to <strong>text</strong>
        let formattedText = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        formattedText = formattedText.replace(/\n/g, '<br>');
        formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        msgDiv.innerHTML = formattedText;
        chatWindow.appendChild(msgDiv);
        scrollToBottom();
        return msgDiv; // Return element to append suggestions if needed
    };

    // Render suggestions
    const renderSuggestions = (suggestions, parentElement) => {
        if (!suggestions || suggestions.length === 0) return;
        const suggContainer = document.createElement('div');
        suggContainer.className = 'suggestions';
        suggestions.forEach(sugg => {
            const btn = document.createElement('button');
            btn.className = 'suggestion-btn';
            btn.textContent = sugg;
            btn.onclick = () => {
                chatInput.value = sugg;
                handleSendMessage();
                // Remove suggestions after clicking one
                suggContainer.remove();
            };
            suggContainer.appendChild(btn);
        });
        parentElement.appendChild(suggContainer);
        scrollToBottom();
    };

    // Show typing indicator
    const showTypingIndicator = () => {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator';
        typingDiv.id = 'typing-indicator';
        typingDiv.innerHTML = '<span style="color: var(--text-secondary); margin-right: 8px; font-size: 0.9rem; animation: none; width: auto; height: auto; background: none;">Thinking...</span><span></span><span></span><span></span>';
        chatWindow.appendChild(typingDiv);
        scrollToBottom();
    };

    // Remove typing indicator
    const removeTypingIndicator = () => {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    };

    // Handle sending message to backend
    const handleSendMessage = async () => {
        const message = chatInput.value.trim();
        if (!message) return;

        if (message.length > 200) {
            addMessage("Invalid input: Please keep your message under 200 characters.", 'bot');
            return;
        }

        // Clear input & show user message
        chatInput.value = '';
        addMessage(message, 'user');

        showTypingIndicator();

        try {
            const response = await fetch('http://localhost:3000/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message, user: userId })
            });

            const data = await response.json();
            
            removeTypingIndicator();
            
            if (data.response) {
                const botMsgDiv = addMessage(data.response, 'bot');
                if (data.suggestions) {
                    renderSuggestions(data.suggestions, botMsgDiv);
                }
            } else {
                addMessage("Sorry, I didn't get a valid response.", 'bot');
            }

        } catch (error) {
            console.error("Error connecting to server:", error);
            removeTypingIndicator();
            addMessage("⚠️ Cannot connect to the server. Please ensure the backend is running on port 3000.", 'bot');
        }
    };

    // Global quick action handler
    window.sendQuickMessage = (msg) => {
        chatInput.value = msg;
        handleSendMessage();
    };

    // Event listeners for sending
    sendBtn.addEventListener('click', handleSendMessage);
    
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    });

    // Voice Recognition Logic
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => {
            voiceBtn.style.color = 'var(--accent-color)';
            voiceBtn.style.transform = 'scale(1.1)';
            chatInput.placeholder = "Listening...";
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            chatInput.value = transcript;
            handleSendMessage();
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error:", event.error);
            resetVoiceBtn();
        };

        recognition.onend = () => {
            resetVoiceBtn();
        };

        const resetVoiceBtn = () => {
            voiceBtn.style.color = 'var(--text-secondary)';
            voiceBtn.style.transform = 'scale(1)';
            chatInput.placeholder = "Type your message here...";
        };

        voiceBtn.addEventListener('click', () => {
            recognition.start();
        });
    } else {
        // Fallback if not supported
        voiceBtn.addEventListener('click', () => {
            alert("Speech recognition is not supported in this browser.");
        });
    }
});
