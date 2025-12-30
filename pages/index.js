import { useState } from 'react';

export default function Home() {
  const [email, setEmail] = useState('');
  const [duration, setDuration] = useState('10min');
  const [emails, setEmails] = useState([]);

  const generateEmail = async () => {
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duration })
      });
      const data = await res.json();
      if (data.email) {
        setEmail(data.email);
        setEmails([]);
      } else {
        alert(data.error || 'Failed to generate email');
      }
    } catch (error) {
      console.error('Error generating email:', error);
      alert('Error generating email: ' + error.message);
    }
  };

  const checkEmails = async () => {
    if (!email) return;
    try {
      const res = await fetch('/api/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (data.emails) {
        setEmails(data.emails);
      } else {
        alert(data.error || 'Failed to fetch emails');
      }
    } catch (error) {
      console.error('Error fetching emails:', error);
      alert('Error fetching emails: ' + error.message);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>MailVoid - Temporary Email</h1>
      <select value={duration} onChange={e => setDuration(e.target.value)}>
        <option value="10min">10 Minutes</option>
        <option value="unlimited">Unlimited</option>
      </select>
      <button onClick={generateEmail}>Generate Email</button>
      {email && (
        <div>
          <p>Your temporary email: {email}</p>
          <button onClick={checkEmails}>Check Emails</button>
          <h2>Received Emails:</h2>
          <ul>
            {emails.map((e, i) => (
              <li key={i}>
                <strong>From:</strong> {e.from}<br />
                <strong>Subject:</strong> {e.subject}<br />
                <strong>Body:</strong> {e.text.length > 500 ? e.text.substring(0, 500) + '...' : e.text}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}