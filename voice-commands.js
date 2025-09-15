// Voice command functionality - Modified to work with dynamically loaded content
function initVoiceRecognition() {
    // Voice command functionality
    const voiceCommandBtn = document.getElementById('voiceCommandBtn');
    if (!voiceCommandBtn) {
        console.log('Voice command button not found');
        return; // Exit if button not found
    }

    let recognition = null;
    let isListening = false;

    // Check if browser supports Web Speech API
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US'; // Default language

        recognition.onstart = function() {
            isListening = true;
            voiceCommandBtn.classList.add('listening');
            voiceCommandBtn.innerHTML = '<i class="fas fa-circle"></i>';
            showVoiceFeedback("Listening...");
        };

        recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript;
            processVoiceCommand(transcript);
        };

        recognition.onerror = function(event) {
            console.error('Speech recognition error', event.error);
            let friendlyMessage = "An unknown error occurred.";
            switch (event.error) {
                case 'network':
                    friendlyMessage = "Network error. Please check your internet connection and try again.";
                    break;
                case 'not-allowed':
                case 'service-not-allowed':
                    friendlyMessage = "Microphone access was denied. Please allow it in your browser settings.";
                    break;
                case 'no-speech':
                    friendlyMessage = "I didn't hear anything. Please try again.";
                    break;
                case 'audio-capture':
                    friendlyMessage = "No microphone found. Please make sure it's connected and working.";
                    break;
            }
            showVoiceFeedback(friendlyMessage);
            resetVoiceButton();
        };

        recognition.onend = function() {
            resetVoiceButton();
        };
    } else {
        // Browser doesn't support speech recognition
        if (voiceCommandBtn) {
            voiceCommandBtn.style.display = 'none';
        }
        console.warn('Speech recognition not supported in this browser');
    }

    // Voice command button click handler
    voiceCommandBtn.addEventListener('click', () => {
        if (!recognition) {
            showVoiceFeedback("Voice commands not supported in your browser");
            return;
        }

        if (isListening) {
            recognition.stop();
            resetVoiceButton();
        } else {
            // Greet user based on time of day before listening
            greetUser();
            
            // Small delay before starting recognition to allow greeting to play
            setTimeout(() => {
                try {
                    recognition.start();
                } catch (error) {
                    console.error('Recognition start error:', error);
                    showVoiceFeedback("Error starting voice recognition");
                    resetVoiceButton();
                }
            }, 1500);
        }
    });

    // Reset voice button to default state
    function resetVoiceButton() {
        isListening = false;
        voiceCommandBtn.classList.remove('listening');
        voiceCommandBtn.innerHTML = '<i class="fas fa-microphone"></i>';
    }

    // Show voice feedback toast
    function showVoiceFeedback(message) {
        // Create or reuse toast element
        let toast = document.getElementById('voiceFeedbackToast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'voiceFeedbackToast';
            toast.style.position = 'fixed';
            toast.style.bottom = '70px';
            toast.style.right = '20px';
            toast.style.background = '#2E8B57';
            toast.style.color = 'white';
            toast.style.padding = '12px 18px';
            toast.style.borderRadius = '8px';
            toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            toast.style.zIndex = '10000';
            toast.style.display = 'none';
            toast.style.maxWidth = '300px';
            document.body.appendChild(toast);
        }
        
        toast.textContent = message;
        toast.style.display = 'block';
        
        // Auto hide after 3 seconds
        clearTimeout(window.voiceFeedbackTimer);
        window.voiceFeedbackTimer = setTimeout(() => {
            toast.style.display = 'none';
        }, 3000);
    }

    // Greet user based on time of day
    function greetUser() {
        const hour = new Date().getHours();
        let greeting;
        
        if (hour < 12) {
            greeting = "Good morning! How can I help you today?";
        } else if (hour < 18) {
            greeting = "Good afternoon! What would you like to do?";
        } else {
            greeting = "Good evening! How can I assist you?";
        }
        
        // Use speech synthesis to speak the greeting
        speakText(greeting);
        showVoiceFeedback(greeting);
    }

    // Text-to-speech function
    function speakText(text) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            utterance.volume = 0.8;
            window.speechSynthesis.speak(utterance);
        }
    }

    // Process voice commands
    async function processVoiceCommand(command) {
        showVoiceFeedback(`Processing: "${command}"`);
        
        try {
            // Translate if not in English (using a simple approach - in production use a translation API)
            const translatedCommand = await translateIfNeeded(command);
            
            // Process the command
            await executeCommand(translatedCommand);
        } catch (error) {
            console.error('Error processing command:', error);
            showVoiceFeedback("Sorry, I couldn't process that command");
        }
    }

    // Simple translation function (for demonstration)
    // In a real application, you would use a translation API
    async function translateIfNeeded(text) {
        // This is a placeholder - in reality you would call a translation API
        // For now, we'll assume the text is already in English
        return text;
    }

    // Execute the voice command
    async function executeCommand(command) {
        const lowerCommand = command.toLowerCase();
        
        const pageMap = {
            'home': 'home.html', 'dashboard': 'home.html',
            'client': 'booking.html', 'customer': 'booking.html',
            'vehicle': 'add.html', 'add vehicle': 'add.html',
            'fuel': 'route-details.html', 'gas': 'route-details.html',
            'trip': 'trip-expenses.html', 'expense': 'trip-expenses.html',
            'tyre': 'tyre.html', 'tire': 'tyre.html',
            'payment': 'payment-billing.html', 'bill': 'payment-billing.html',
            'report': 'combined_ca.html', 'trip report': 'combined_ca.html',
            'lr': 'lr-report.html', 'lr report': 'lr-report.html',
            'analytics': 'roll.html', 'chart': 'roll.html',
            'invoice': 'invoice.html',
            'reminder': 'alerts-system.html', 'alert': 'alerts-system.html'
        };

        const page = Object.keys(pageMap).find(key => lowerCommand.includes(key));

        if (page) {
            window.location.href = pageMap[page];
            speakText(`Navigating to ${page}`);
        } else if (lowerCommand.includes('help') || lowerCommand.includes('what can you do')) {
            const helpText = "I can help you navigate. Try saying 'go to vehicles', 'open analytics', or 'show me the dashboard'.";
            speakText(helpText);
            showVoiceFeedback(helpText);
        } else {
            speakText("I'm not sure how to help with that. Try saying 'help' to see what I can do");
            showVoiceFeedback("Command not recognized. Say 'help' for options");
        }
    }
}

// Initialize when DOM is ready or when called from navbar loader
if (document.readyState !== 'loading') {
    initVoiceRecognition();
} else {
    document.addEventListener('DOMContentLoaded', initVoiceRecognition);
}

// Make function available globally for navbar loader
window.initVoiceRecognition = initVoiceRecognition;
