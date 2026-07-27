const WEBHOOK_URL = 'https://framing-guided-maintenance-assure.trycloudflare.com/webhook/generate-code';
const STEP_DELAYS = [0, 4000, 30000, 45000, 90000];

const el = (id) => document.getElementById(id);
const steps = () => document.querySelectorAll('#steps li');
let timers = [];

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

function runSteps() {
  el('steps').classList.remove('hidden');
  steps().forEach((li) => li.classList.remove('active', 'done'));
  STEP_DELAYS.forEach((delay, i) => {
    timers.push(setTimeout(() => {
      steps().forEach((li, j) => {
        li.classList.toggle('done', j < i);
        li.classList.toggle('active', j === i);
      });
      if (i === STEP_DELAYS.length - 1) {
        timers.push(setTimeout(() => {
          steps().forEach((li) => { li.classList.remove('active'); li.classList.add('done'); });
          setStatus('✅ All done — check your email for the live link!', 'ok');
          el('go').disabled = false;
          el('btn-label').textContent = 'Generate Another';
        }, 20000));
      }
    }, delay));
  });
}

el('go').addEventListener('click', async () => {
  const prompt = el('prompt').value.trim();
  if (!prompt) return setStatus('Please describe the webpage you want first.', 'err');
  timers.forEach(clearTimeout); timers = [];
  el('go').disabled = true;
  el('btn-label').textContent = 'Working…';
  setStatus('');
  try {
    const res = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    if (!res.ok) throw new Error('Webhook returned ' + res.status);
    runSteps();
  } catch (e) {
    setStatus('❌ ' + e.message + ' — is the tunnel running?', 'err');
    el('go').disabled = false;
    el('btn-label').textContent = 'Generate & Deploy';
  }
});
