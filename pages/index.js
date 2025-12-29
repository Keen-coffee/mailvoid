import { useState } from 'react';

export default function Home() {
  const [email, setEmail] = useState('');
  const [duration, setDuration] = useState('10min');
  const [emails, setEmails] = useState([]);

  const generateEmail = async () => {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ duration })
    });
    const data = await res.json();
    setEmail(data.email);
    setEmails([]);
  };

  const checkEmails = async () => {
    if (!email) return;
    const res = await fetch('/api/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (data.emails) {
      setEmails(data.emails);
    } else {
      alert(data.error);
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
                <strong>Body:</strong> {e.text}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}