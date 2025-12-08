# CalAI Web Call Frontend

A simple web interface to test Retell AI web calling functionality.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

The app will open at `http://localhost:5173`

## 📋 Prerequisites

Before testing the web call:

1. **Backend Server**: Make sure your backend is running on `http://localhost:3003`

2. **Retell AI Agent**: 
   - Go to [Retell AI Dashboard](https://beta.retellai.com/dashboard)
   - Create an agent or use an existing one
   - Copy the Agent ID (format: `agent_xxxxx...`)

3. **API Key**: Ensure your `.env` file in the backend has:
   ```
   RETELL_API_KEY=your_retell_api_key_here
   ```

## 🎯 How to Use

1. **Open the app**: Navigate to `http://localhost:5173`

2. **Enter Agent ID**: Paste your Retell AI Agent ID

3. **Set Backend URL**: Default is `http://localhost:3003` (change if needed)

4. **Optional - Auth Token**: If your backend requires authentication, add your JWT token

5. **Start Call**: Click "📞 Start Call" button

6. **Talk**: Speak with the AI agent

7. **View Transcript**: See real-time conversation transcript

8. **Stop Call**: Click "❌ Stop Call" when done

## 🛠️ Troubleshooting

### Call Not Starting

**Error: "Failed to create web call"**
- Check if backend server is running
- Verify Retell API key is set in backend `.env`
- Make sure the Agent ID is valid

**Error: "401 Unauthorized"**
- Add your JWT token in the Auth Token field
- Or temporarily disable auth middleware for testing

**Error: "404 Not Found"**
- The Agent ID doesn't exist in your Retell AI account
- Create an agent first in the Retell AI Dashboard

### No Audio

- Allow microphone access in your browser
- Check browser console for errors
- Verify your device has a working microphone

### Backend Connection Issues

- Make sure backend is running on the correct port
- Check CORS settings in backend
- Verify the API URL is correct

## 📁 Project Structure

```
frontend/
├── index.html          # Main HTML file
├── app.js              # JavaScript application logic
├── package.json        # Dependencies
└── README.md           # This file
```

## 🔧 Configuration

### Change Backend URL

Edit the default value in `index.html`:
```html
<input 
    type="text" 
    id="apiUrl" 
    value="http://your-backend-url:3003"
/>
```

### Change Agent ID

Edit the default value in `index.html`:
```html
<input 
    type="text" 
    id="agentId" 
    value="your_default_agent_id"
/>
```

## 📚 Features

- ✅ Real-time web calling with Retell AI
- ✅ Live transcript display
- ✅ Agent status indicators
- ✅ Easy configuration
- ✅ Clean, modern UI
- ✅ Error handling
- ✅ Browser console logging for debugging

## 🎨 Technologies Used

- **Retell Web SDK**: `retell-client-js-sdk`
- **Vite**: Development server
- **Vanilla JavaScript**: No framework needed
- **Modern CSS**: Clean, responsive design

## 📝 API Endpoint Used

The frontend calls your backend endpoint:

```
POST /web-call/create
Body: { "agent_id": "agent_xxxxx..." }
Response: { 
    "status": 201,
    "data": {
        "access_token": "...",
        "call_id": "...",
        "agent_id": "..."
    }
}
```

## 🔐 Security Notes

- Never expose your Retell API key in the frontend
- Always call `create-web-call` from your backend
- Use JWT tokens for backend authentication in production
- The access token expires in 30 seconds if call doesn't start

## 🚀 Production Deployment

### Build for Production

```bash
npm run build
```

This creates a `dist/` folder with optimized files.

### Preview Production Build

```bash
npm run preview
```

### Deploy

Upload the `dist/` folder to:
- Netlify
- Vercel
- AWS S3 + CloudFront
- Any static hosting service

## 📞 Support

For issues related to:
- **Retell AI**: Check [Retell AI Docs](https://docs.retellai.com)
- **Backend**: Check your backend server logs
- **Frontend**: Check browser console for errors

---

**Happy calling! 🎙️**

