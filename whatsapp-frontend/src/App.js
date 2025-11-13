import React, { useState, useEffect } from 'react';
import axios from 'axios';

function maskLink(message, link, displayText) {
  const shortLink = link; // Optionally implement a link shortener
  return message.replace('[link]', `<${shortLink}|${displayText}>`);
}

function App() {
  const [numbers, setNumbers] = useState('');
  const [message, setMessage] = useState('');
  const [maskedLink, setMaskedLink] = useState('');
  const [displayText, setDisplayText] = useState('');
  const [history, setHistory] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');

  useEffect(() => {
    axios.get('http://localhost:4000/history').then(res => setHistory(res.data));
    axios.get('http://localhost:4000/templates').then(res => setTemplates(res.data));
  }, []);

  const handleSend = async () => {
    let finalMessage = message;
    if (maskedLink && displayText) {
      finalMessage = maskLink(message, maskedLink, displayText);
    }
    const toList = numbers.split(',').map(n => n.trim()).filter(Boolean);
    await axios.post('http://localhost:4000/send', { to: toList, message: finalMessage });
    const res = await axios.get('http://localhost:4000/history');
    setHistory(res.data);
  };

  const handleUseTemplate = (tpl) => {
    setMessage(tpl.content);
    setSelectedTemplate(tpl.name);
  };

  const handleSaveTemplate = async () => {
    await axios.post('http://localhost:4000/template', { name: selectedTemplate || `Template ${Date.now()}`, content: message });
    const res = await axios.get('http://localhost:4000/templates');
    setTemplates(res.data);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Bulk WhatsApp Message Sender</h2>
      <div>
        <textarea rows="3" 
          placeholder="Paste phone numbers, comma separated"
          value={numbers} onChange={e => setNumbers(e.target.value)}
        /><br />
        <textarea rows="4"
          placeholder="Compose your message. Use [link] to insert a masked link."
          value={message} onChange={e => setMessage(e.target.value)}
        /><br />
        <input placeholder="URL to mask (optional)" value={maskedLink} onChange={e => setMaskedLink(e.target.value)} />
        <input placeholder="Display text" value={displayText} onChange={e => setDisplayText(e.target.value)} />
        <button onClick={handleSend}>Send</button>
        <button onClick={handleSaveTemplate}>Save as Template</button>
      </div>
      <h3>Templates</h3>
      <ul>
        {templates.map(tpl => (
          <li key={tpl._id}>
            <button onClick={() => handleUseTemplate(tpl)}>{tpl.name}</button>
          </li>
        ))}
      </ul>
      <h3>Sent History</h3>
      <ul>
        {history.map(msg => (
          <li key={msg._id}>
            [{msg.sentAt}] To: {msg.to.join(', ')} | Status: {msg.status} | {msg.message}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
