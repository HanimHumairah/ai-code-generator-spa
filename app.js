const WEBHOOK_URL = 'https://stanford-firewall-wisdom-forbes.trycloudflare.com/webhook/generate-code';

const el = (id) => document.getElementById(id);

document.querySelectorAll('.chip').forEach((chip) => {
  chip.addEventListener('click', () => {
    el('prompt').value = chip.dataset.prompt;
    el('prompt').focus();
  });
});

function setStatus(msg, cls) {
  el('status').textContent = msg;
  el('status').className = cls || '';
}

el('go').addEventListener('click', async () => {
  const prompt = el('prompt').value.trim();
  if (!prompt) return setStatus('Please describe the webpage you want first.', 'err');
  el('go').disabled = true;
  el('btn-label').textContent = 'Sending…';
  setStatus('');
  try {
    const res = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    if (!res.ok) throw new Error('Webhook returned ' + res.status);
    setStatus('✅ Request received! Building and deploying now — the email with the live link usually arrives within 2–3 minutes.', 'ok');
    el('btn-label').textContent = 'Generate Another';
  } catch (e) {
    setStatus('❌ ' + e.message + ' — is the tunnel running?', 'err');
    el('btn-label').textContent = 'Generate & Deploy';
  } finally {
    el('go').disabled = false;
  }
});
