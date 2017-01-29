module.exports = {
    // HTTP port
    port: process.env.PORT || 3000,

    service_sid:process.env.SERVICE_SID,
    api_key:process.env.SYNC_API_KEY,
    sync_secret:process.env.SYNC_SECRET,

    account_sid: process.env.TWILIO_ACCOUNT_SID,

    auth_token: process.env.TWILIO_AUTH_TOKEN,
    authy_key: process.env.AUTHY_API_KEY,
    // MongoDB connection string - MONGO_URL is for local dev,
    // MONGOLAB_URI is for the MongoLab add-on for Heroku deployment
    mongoUrl: process.env.MONGOLAB_URI || process.env.MONGO_URL || process.env.MONGODB_URI
};
