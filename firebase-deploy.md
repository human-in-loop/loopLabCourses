# Firebase Deployment Instructions

## Prerequisites
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login to Firebase: `firebase login`
3. Create a new Firebase project or use existing one

## Deployment Steps

### 1. Initialize Firebase (if not done)
```bash
firebase init
```
Select:
- Hosting
- Functions
- Use existing project or create new one

### 2. Set Environment Variables
```bash
firebase functions:config:set \
  session.secret="your-secret-key" \
  moneris.store_id="your-store-id" \
  moneris.api_token="your-api-token" \
  moneris.environment="sandbox" \
  mongodb.url="your-mongodb-connection-string"
```

### 3. Build and Deploy
```bash
# Build the frontend
npm run build

# Copy server code to functions
cp -r server functions/src/
cp -r shared functions/src/

# Deploy to Firebase
firebase deploy
```

## Environment Variables Needed
- `SESSION_SECRET`: Secret key for session management
- `MONERIS_STORE_ID`: Your Moneris store ID
- `MONERIS_API_TOKEN`: Your Moneris API token
- `MONERIS_ENVIRONMENT`: "sandbox" or "production"
- `MONERIS_WEBHOOK_SECRET`: Secret for webhook verification
- `MONGODB_URL`: MongoDB connection string
- `EMAIL_USER`: Gmail account for sending emails
- `EMAIL_PASS`: Gmail app password

## Post-Deployment
1. Configure custom domain (optional)
2. Set up Moneris webhook URL pointing to your Firebase function
3. Test payment flow end-to-end
4. Monitor Firebase Console for logs and errors