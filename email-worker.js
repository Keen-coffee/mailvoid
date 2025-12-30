/**
 * Cloudflare Email Worker for MailVoid
 * 
 * This worker intercepts emails sent to temporary email addresses
 * and forwards them to the associated personal email address.
 * 
 * Setup:
 * 1. Create a Cloudflare Email Routing rule for your domain
 * 2. Deploy this worker with: wrangler deploy
 * 3. Configure the API_ENDPOINT environment variable
 */

export default {
  async email(message, env, ctx) {
    try {
      // Get the temporary email address (the "to" field)
      const tempEmail = message.to;
      
      // Get the API endpoint from environment variables
      const apiEndpoint = env.API_ENDPOINT || 'http://localhost:3000';
      
      console.log(`Received email to: ${tempEmail}`);
      
      // Look up the personal email associated with this temp email
      const lookupResponse = await fetch(
        `${apiEndpoint}/api/lookup/temp?email=${encodeURIComponent(tempEmail)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!lookupResponse.ok) {
        console.warn(`Temp email not found or expired: ${tempEmail}`);
        message.setReject('Temporary email address not found or expired');
        return;
      }

      const lookupData = await lookupResponse.json();
      const personalEmail = lookupData.personalEmail;

      if (!personalEmail) {
        console.warn(`No personal email found for: ${tempEmail}`);
        message.setReject('No personal email address associated with this temporary email');
        return;
      }

      console.log(`Forwarding email from ${message.from} to personal email: ${personalEmail}`);

      // Forward the email to the personal email address
      await message.forward(personalEmail);
      
      console.log(`Email successfully forwarded to: ${personalEmail}`);
    } catch (error) {
      console.error('Error processing email:', error);
      message.setReject('Error processing your email. Please try again later.');
    }
  },
};
