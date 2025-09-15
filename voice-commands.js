// Voice command functionality - Modified to work with dynamically loaded content
function initVoiceRecognition() {
    const GEMINI_API_KEY = "AIzaSyDjv2Wr5dW8hWLRAh_GjDcTKzgBdhxsOQc"; // Your Gemini API key

    // Voice command functionality
    const voiceCommandBtn = document.getElementById('voiceCommandBtn');
    if (!voiceCommandBtn) {
        console.log('Voice command button not found');
        return; // Exit if button not found
    }

    let recognition = null;
    let isListening = false;
    let recognitionStoppedIntentionally = false;

    // Check if browser supports Web Speech API
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = true; // Listen continuously
        recognition.interimResults = false;
        recognition.lang = 'en-US'; // Default language

        recognition.onstart = function() {
            isListening = true;
            voiceCommandBtn.classList.add('listening');
            voiceCommandBtn.innerHTML = '<i class="fas fa-circle"></i>';
            recognitionStoppedIntentionally = false;
            showVoiceFeedback("Listening...");
        };

        recognition.onresult = function(event) {
            // Loop through results to get the final transcript
            let final_transcript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) final_transcript += event.results[i][0].transcript;
            }
            if (final_transcript) processVoiceCommand(final_transcript);
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
            // Only reset if the user intentionally stopped it.
            // Otherwise, if it stops due to silence, it will be ready for the next click.
            if (recognitionStoppedIntentionally) {
                resetVoiceButton();
            } else if (isListening) {
                // If it stops unexpectedly (e.g., network issue), reset the state.
                resetVoiceButton();
            }
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
            recognitionStoppedIntentionally = true; // User is stopping it
            recognition.stop();
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
      
      if (!GEMINI_API_KEY || GEMINI_API_KEY.includes("YOUR_GEMINI_API_KEY")) {
        showVoiceFeedback("AI command processing is not configured.");
        // Fallback to simple commands
        await executeCommand({ intent: 'navigate', entities: { page_name: command.toLowerCase() } });
        return;
      }

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
      const prompt = `
        You are a website command parser for a transport management system. Analyze the user command and extract the intent and entities.
        Your response MUST be a valid JSON object.
        
        Possible intents: "navigate", "create_lr_report", "add_payment", "add_tyre".
        
        Entities for "navigate":
        - "page_name": one of [home, client, vehicle, fuel, expenses, tyres, tyre history, payments, report, analytics, invoice, reminder].
        
        Entities for "create_lr_report":
        - "truckNumber", "fromLocation", "toLocation", "weight", "item", "consignor", "consignee".
        
        Entities for "add_payment":
        - "clientName", "amount", "date".
        
        Entities for "add_tyre":
        - "vehicleNumber", "tyreNumber", "brand", "position", "cost".

        User command (could be in English, Hindi, or Hinglish): "${command}"

        JSON Response:
      `;

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        const data = await response.json();
        let resultText = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
        resultText = resultText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsedCommand = JSON.parse(resultText);
        await executeCommand(parsedCommand);
      } catch (error) {
        console.error('Error processing command with Gemini:', error);
        showVoiceFeedback("Sorry, I couldn't understand that command.");
      }
    }

    // Execute the voice command
    async function executeCommand(parsedCommand) {
      const { intent, entities } = parsedCommand;

      switch (intent) {
        case 'navigate':
          const pageMap = {
            'home': 'home.html', 'dashboard': 'home.html', 'client': 'booking.html', 'customer': 'booking.html',
            'vehicle': 'add.html', 'add vehicle': 'add.html', 'fuel': 'route-details.html', 'gas': 'route-details.html',
            'trip': 'trip-expenses.html', 'expense': 'trip-expenses.html', 'tyre': 'tyre.html', 'tire': 'tyre.html',
            'payment': 'payment-billing.html', 'bill': 'payment-billing.html', 'report': 'combined_ca.html',
            'lr': 'lr-report.html', 'lr report': 'lr-report.html', 'analytics': 'roll.html', 'chart': 'roll.html',
            'invoice': 'invoice.html', 'reminder': 'alerts-system.html', 'alert': 'alerts-system.html',
            'tyre history': 'tyre_history.html'
          };
          const pageName = entities.page_name?.toLowerCase() || '';
          const destination = Object.keys(pageMap).find(key => pageName.includes(key));
          if (destination) {
            window.location.href = pageMap[destination];
            speakText(`Navigating to ${destination}`);
          } else {
            speakText(`Sorry, I don't know the page "${entities.page_name}".`);
          }
          break;

        case 'create_lr_report':
          const lrParams = new URLSearchParams(entities).toString();
          window.location.href = `lr-report.html?${lrParams}`;
          speakText("Okay, opening the LR report form with the details you provided.");
          break;

        case 'add_payment':
          const paymentParams = new URLSearchParams(entities).toString();
          window.location.href = `payment-billing.html?${paymentParams}`;
          speakText("Okay, opening the payment form with the details you provided.");
          break;

        case 'add_tyre':
          const tyreParams = new URLSearchParams(entities).toString();
          window.location.href = `tyre.html?${tyreParams}`;
          speakText("Okay, opening the tyre form with the details you provided.");
          break;

        case 'help':
          const helpText = "I can help you navigate, or fill out forms. Try saying 'go to vehicles', or 'create an LR report for truck 123 from Delhi to Mumbai'.";
          speakText(helpText);
          showVoiceFeedback(helpText);
          break;

        default:
          speakText("I'm not sure how to help with that. Try saying 'help' to see what I can do.");
          showVoiceFeedback("Command not recognized. Say 'help' for options.");
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
