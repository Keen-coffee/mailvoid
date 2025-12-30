// Cloudflare Email Worker for MailVoid
// This worker forwards incoming emails to the MailVoid API for processing

export default {
  async email(message, env, ctx) {
    // Forward the email to the MailVoid API
    try {
      const response = await fetch('https://mailvoid.win/api/endpoint', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          // Add any authentication headers if needed
          // 'Authorization': 'Bearer your-token'
        },
        body: JSON.stringify({
          from: message.from,
          to: message.to,
          raw: message.raw,
          // Include other message properties if needed
          // subject: message.subject, // Note: subject might not be available in raw
          // You can add more fields from the ForwardableEmailMessage
        })
      });

      if (response.ok) {
        console.log('Email forwarded successfully');
      } else {
        console.error('Failed to forward email:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error forwarding email:', error);
    }
  }
};