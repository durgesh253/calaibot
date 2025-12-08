import { RetellWebClient } from 'retell-client-js-sdk';

// Initialize Retell Web Client
const retellWebClient = new RetellWebClient();

// DOM Elements
const startCallBtn = document.getElementById('startCallBtn');
const stopCallBtn = document.getElementById('stopCallBtn');
const statusDiv = document.getElementById('status');
const transcriptBox = document.getElementById('transcriptBox');
const transcriptContent = document.getElementById('transcriptContent');
const agentIdInput = document.getElementById('agentId');
const apiUrlInput = document.getElementById('apiUrl');
const authTokenInput = document.getElementById('authToken');

// State
let isCallActive = false;

// Update status
function updateStatus(message, className) {
    statusDiv.textContent = message;
    statusDiv.className = `status ${className}`;
}

// Add transcript
function addTranscript(role, content) {
    const item = document.createElement('div');
    item.className = `transcript-item ${role}`;
    
    const roleSpan = document.createElement('div');
    roleSpan.className = 'transcript-role';
    roleSpan.textContent = role === 'agent' ? '🤖 Agent' : '👤 User';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'transcript-content';
    contentDiv.textContent = content;
    
    item.appendChild(roleSpan);
    item.appendChild(contentDiv);
    transcriptContent.appendChild(item);
    
    // Auto scroll to bottom
    transcriptBox.scrollTop = transcriptBox.scrollHeight;
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
        
        const response = await fetch(`${apiUrl}/web-call/create`, {
            method: 'POST',
            headers: headers,
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

// Start call
async function startCall() {
    try {
        const agentId = agentIdInput.value.trim();
        const apiUrl = apiUrlInput.value.trim();
        const authToken = authTokenInput.value.trim();

        if (!agentId) {
            alert('Please enter an Agent ID');
            return;
        }

        if (!apiUrl) {
            alert('Please enter API URL');
            return;
        }

        // Update UI
        startCallBtn.disabled = true;
        startCallBtn.innerHTML = '<span class="loading"></span><span>Connecting...</span>';
        updateStatus('🔄 Creating web call...', 'connecting');

        // Create web call
        console.log('Creating web call with agent:', agentId);
        const callData = await createWebCall(agentId, apiUrl, authToken);
        
        console.log('Web call created:', callData);
        updateStatus('🔄 Starting call...', 'connecting');

        // Start the call with Retell SDK
        await retellWebClient.startCall({
            accessToken: callData.access_token,
            sampleRate: 24000,
            emitRawAudioSamples: false,
        });

        console.log('Call started successfully');
        
        // Update UI
        isCallActive = true;
        stopCallBtn.disabled = false;
        startCallBtn.innerHTML = '<span>📞 Start Call</span>';
        updateStatus('✅ Call connected!', 'connected');
        transcriptBox.classList.add('active');
        
    } catch (error) {
        console.error('Error starting call:', error);
        updateStatus(`❌ Error: ${error.message}`, 'error');
        startCallBtn.disabled = false;
        startCallBtn.innerHTML = '<span>📞 Start Call</span>';
        
        // Show detailed error
        alert(`Failed to start call:\n${error.message}\n\nPlease check:\n1. Agent ID is valid\n2. Backend server is running\n3. Retell API key is configured`);
    }
}

// Stop call
function stopCall() {
    try {
        retellWebClient.stopCall();
        console.log('Call stopped');
    } catch (error) {
        console.error('Error stopping call:', error);
    }
}

// Event listeners for Retell SDK
retellWebClient.on('call_started', () => {
    console.log('📞 Call started');
    updateStatus('✅ Call active', 'connected');
});

retellWebClient.on('call_ended', () => {
    console.log('📞 Call ended');
    updateStatus('⚪ Call ended', 'idle');
    isCallActive = false;
    startCallBtn.disabled = false;
    stopCallBtn.disabled = true;
});

retellWebClient.on('agent_start_talking', () => {
    console.log('🤖 Agent started talking');
    updateStatus('🗣️ Agent speaking...', 'connected');
});

retellWebClient.on('agent_stop_talking', () => {
    console.log('🤖 Agent stopped talking');
    updateStatus('👂 Listening...', 'connected');
});

retellWebClient.on('update', (update) => {
    console.log('📝 Update:', update);
    
    // Display transcript
    if (update.transcript && Array.isArray(update.transcript)) {
        // Clear previous transcript
        transcriptContent.innerHTML = '';
        
        // Add all transcript items
        update.transcript.forEach(item => {
            if (item.content && item.content.trim()) {
                addTranscript(item.role, item.content);
            }
        });
    }
});

retellWebClient.on('metadata', (metadata) => {
    console.log('📋 Metadata:', metadata);
});

retellWebClient.on('error', (error) => {
    console.error('❌ An error occurred:', error);
    updateStatus(`❌ Error: ${error.message || 'Unknown error'}`, 'error');
    
    // Stop the call
    retellWebClient.stopCall();
    startCallBtn.disabled = false;
    stopCallBtn.disabled = true;
});

// Button event listeners
startCallBtn.addEventListener('click', startCall);
stopCallBtn.addEventListener('click', stopCall);

// Log SDK version
console.log('Retell Web Client SDK loaded');
console.log('Ready to make calls!');

