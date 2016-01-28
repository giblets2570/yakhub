// config/twilio.js
module.exports = {
    appID     : process.env.TWILIO_APP_ID,
    accountID : process.env.TWILIO_ACCOUNT_ID,
    authToken : process.env.TWILIO_AUTH_TOKEN,
    outgoingNumber : process.env.TWILIO_NUMBER
}