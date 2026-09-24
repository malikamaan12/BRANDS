const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

async function main() {
  const artifactDir = 'C:\\Users\\pceve\\.gemini\\antigravity-ide\\brain\\787a8036-5c2d-4eba-80ef-655a28f8c9e1';
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const userDataDir = path.join(process.env.TEMP, 'chrome_cdp_verify_' + Date.now());

  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9223',
    '--window-size=1440,960',
    `--user-data-dir=${userDataDir}`,
    '--no-sandbox',
    '--disable-gpu',
    'http://localhost:3000/'
  ]);

  console.log('Chrome process spawned on port 9223...');
  await new Promise(r => setTimeout(r, 2000));

  let webSocketDebuggerUrl = null;
  for (let i = 0; i < 12; i++) {
    try {
      const res = await fetch('http://127.0.0.1:9223/json');
      const list = await res.json();
      if (list && list.length > 0 && list[0].webSocketDebuggerUrl) {
        webSocketDebuggerUrl = list[0].webSocketDebuggerUrl;
        break;
      }
    } catch (e) {
      await new Promise(r => setTimeout(r, 500));
    }
  }

  if (!webSocketDebuggerUrl) {
    console.error('Failed to get WebSocket debugger URL');
    chromeProc.kill();
    process.exit(1);
  }

  console.log('Connecting to CDP...');
  const ws = new WebSocket(webSocketDebuggerUrl);

  let idCounter = 1;
  const pending = new Map();

  function sendCommand(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = idCounter++;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id && pending.has(data.id)) {
      const { resolve, reject } = pending.get(data.id);
      pending.delete(data.id);
      if (data.error) reject(data.error);
      else resolve(data.result);
    }
  };

  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });

  console.log('CDP connected! Setting viewport...');
  await sendCommand('Page.enable');
  await sendCommand('DOM.enable');
  await sendCommand('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 960,
    deviceScaleFactor: 1,
    mobile: false
  });

  // Navigate to cards view
  await sendCommand('Page.navigate', { url: 'http://localhost:3000/' });
  console.log('Waiting 3s for images and network requests...');
  await new Promise(r => setTimeout(r, 3000));

  // Screenshot 1: Desktop Cards View with actual images, 1-click links, past show links
  const shot1 = await sendCommand('Page.captureScreenshot', { format: 'png' });
  const path1 = path.join(artifactDir, 'cards_view_verified.png');
  fs.writeFileSync(path1, Buffer.from(shot1.data, 'base64'));
  console.log('Saved cards_view_verified.png');

  // Click on the second card's venue button to reveal venue popover
  await sendCommand('Runtime.evaluate', {
    expression: `
      const buttons = document.querySelectorAll('.card-venue-toggle-btn');
      if (buttons.length > 1) {
        buttons[1].click();
      }
    `
  });
  await new Promise(r => setTimeout(r, 500));

  // Screenshot 2: Venue Revealed Box
  const shot2 = await sendCommand('Page.captureScreenshot', { format: 'png' });
  const path2 = path.join(artifactDir, 'cards_venue_revealed.png');
  fs.writeFileSync(path2, Buffer.from(shot2.data, 'base64'));
  console.log('Saved cards_venue_revealed.png');

  // Navigate to IP-004 Jurassic World Dossier
  await sendCommand('Page.navigate', { url: 'http://localhost:3000/?ip=IP-004' });
  await new Promise(r => setTimeout(r, 2000));

  // Screenshot 3: Modal with Brand Details and Past Show Clip
  const shot3 = await sendCommand('Page.captureScreenshot', { format: 'png' });
  const path3 = path.join(artifactDir, 'modal_verified.png');
  fs.writeFileSync(path3, Buffer.from(shot3.data, 'base64'));
  console.log('Saved modal_verified.png');

  ws.close();
  chromeProc.kill();
  console.log('Verification finished successfully!');
}

main().catch(err => {
  console.error('Error during capture:', err);
  process.exit(1);
});
