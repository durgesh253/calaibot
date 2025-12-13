import { RetellWebClient } from 'retell-client-js-sdk';

// Initialize Retell Web Client
const retellWebClient = new RetellWebClient();

// Hardcoded Configuration
const CONFIG = {
    agentId: 'agent_8e7412714271314dd96d857d07',
    apiUrl: '/api/web-call',
    authToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMwMjkyLCJpYXQiOjE3NjU2MDQ5NDcsImV4cCI6MTc3MDc4ODk0N30.QaEC6jMxat4nla56avNs8bXzbRwuW4F-scCfVb6UNkA'
};

// DOM Elements
const chatBubble = document.getElementById('chatBubble');
const chatWindow = document.getElementById('chatWindow');
const closeChat = document.getElementById('closeChat');
const micButton = document.getElementById('micButton');
const headerStatus = document.getElementById('headerStatus');
const headerAvatar = document.getElementById('headerAvatar');
const chatWelcome = document.getElementById('chatWelcome');
const voiceScreen = document.getElementById('voiceScreen');
const callStatusText = document.getElementById('callStatusText');
const chatBody = document.getElementById('chatBody');

// State
let isCallActive = false;
let isChatOpen = true; // Start open
let isOnVoiceScreen = false; // Track which screen we're on

// Navigate to voice screen
function showVoiceScreen() {
    chatWelcome.style.display = 'none';
    voiceScreen.style.display = 'flex';
    chatBubble.classList.add('hidden');
    isOnVoiceScreen = true;
}

// Navigate back to home screen
function showHomeScreen() {
    chatWelcome.style.display = 'flex';
    voiceScreen.style.display = 'none';
    chatBubble.classList.remove('hidden');
    isOnVoiceScreen = false;
}

// Update status
function updateStatus(message) {
    headerStatus.textContent = message;
}

// Update call animation status
function updateCallStatus(message) {
    if (callStatusText) {
        callStatusText.textContent = message;
    }
}

// Toggle microphone button state
function toggleMicButton(isRecording) {
    if (micButton) {
        if (isRecording) {
            micButton.classList.add('recording');
        } else {
            micButton.classList.remove('recording');
        }
    }
}

// Create web call
async function createWebCall(agentId, apiUrl, authToken) {
    try {
        const headers = {
            'Content-Type': 'application/json',
        };
        
        // Add auth token if provided
        if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
        }
        
        const response = await fetch(`${apiUrl}/create`, {
            method: 'POST',
            headers: headers,
            credentials: 'include',
            body: JSON.stringify({
                agent_id: agentId
            })
        });

        if (!response.ok) {
            const contentType = response.headers.get('content-type');
            let errorMessage = `HTTP ${response.status}: Failed to create web call`;
            
            // Only parse as JSON if response is JSON
            if (contentType && contentType.includes('application/json')) {
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch (e) {
                    // JSON parse failed, use default error
                }
            } else {
                const text = await response.text();
                errorMessage = `HTTP ${response.status}: ${text.substring(0, 100)}`;
            }
            throw new Error(errorMessage);
        }

        const data = await response.json();
        return data.data; // Contains access_token, call_id, etc.
    } catch (error) {
        console.error('Error creating web call:', error);
        throw error;
    }
}

// Toggle call (start or stop)
async function toggleCall() {
    if (isCallActive) {
        stopCall();
    } else {
        await startCall();
    }
}

// Start call
async function startCall() {
    try {
        // Update UI
        chatBubble.classList.add('active');
        updateStatus('Connecting...');

        // Create web call
        console.log('Creating web call with agent:', CONFIG.agentId);
        const callData = await createWebCall(CONFIG.agentId, CONFIG.apiUrl, CONFIG.authToken);
        
        console.log('Web call created:', callData);
        updateStatus('Starting call...');

        // Start the call with Retell SDK
        await retellWebClient.startCall({
            accessToken: callData.access_token,
            sampleRate: 24000,
            emitRawAudioSamples: false,
        });

        console.log('Call started successfully');
        
        // Update UI
        isCallActive = true;
        updateStatus('On Call - Speaking...');
        headerAvatar.classList.add('talking');
        
        // Already on voice screen, just update animation
        updateCallStatus('התחלת להקליט אודיו בקול');
        toggleMicButton(true);
        
    } catch (error) {
        console.error('Error starting call:', error);
        updateStatus('Connection failed');
        chatBubble.classList.remove('active');
        
        // Show detailed error
        alert(`Failed to start call:\n${error.message}\n\nPlease check:\n1. Agent ID is valid\n2. Backend server is running\n3. Retell API key is configured`);
    }
}

// Stop call
function stopCall() {
    try {
        retellWebClient.stopCall();
        console.log('Call stopped');
        
        // Update UI immediately
        isCallActive = false;
        chatBubble.classList.remove('active');
        headerAvatar.classList.remove('talking');
        updateStatus('Online - Ready to help');
        toggleMicButton(false);
        
        // Go back to home screen
        showHomeScreen();
    } catch (error) {
        console.error('Error stopping call:', error);
    }
}

// Event listeners for Retell SDK
retellWebClient.on('call_started', () => {
    console.log('📞 Call started');
    updateStatus('Call Active');
});

retellWebClient.on('call_ended', () => {
    console.log('📞 Call ended');
    updateStatus('Online - Ready to help');
    isCallActive = false;
    chatBubble.classList.remove('active');
    headerAvatar.classList.remove('talking');
    toggleMicButton(false);
    
    // Go back to home screen
    showHomeScreen();
});

retellWebClient.on('agent_start_talking', () => {
    console.log('🤖 Agent started talking');
    updateStatus('🗣️ AI is speaking...');
    updateCallStatus('🗣️ AI מדבר עכשיו...');
    headerAvatar.classList.add('talking');
    toggleMicButton(false);
});

retellWebClient.on('agent_stop_talking', () => {
    console.log('🤖 Agent stopped talking');
    updateStatus('👂 Listening to you...');
    updateCallStatus('👂 אנחנו מקשיבים לך...');
    headerAvatar.classList.remove('talking');
    toggleMicButton(true);
});

retellWebClient.on('update', (update) => {
    console.log('📝 Update:', update);
    // Update events are logged but we're showing animation instead of transcript
});

retellWebClient.on('metadata', (metadata) => {
    console.log('📋 Metadata:', metadata);
});

retellWebClient.on('error', (error) => {
    console.error('❌ An error occurred:', error);
    updateStatus('Error occurred');
    
    // Stop the call
    retellWebClient.stopCall();
    isCallActive = false;
    chatBubble.classList.remove('active');
    headerAvatar.classList.remove('talking');
    toggleMicButton(false);
    
    // Go back to home screen
    showHomeScreen();
});

// Chat widget event listeners
chatBubble.addEventListener('click', () => {
    // Navigate to voice screen when clicking floating icon
    showVoiceScreen();
});

closeChat.addEventListener('click', () => {
    // Go back to home screen when closing
    showHomeScreen();
    // Stop call if active
    if (isCallActive) {
        stopCall();
    }
});

// Mic button listener - same as call toggle
if (micButton) {
    micButton.addEventListener('click', toggleCall);
}

// Log SDK version
console.log('Retell Web Client SDK loaded');
console.log('Ready to make calls!');

