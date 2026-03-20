const fs = require('fs');
const path = require('path');

async function test() {
  // First, login to get a token
  const loginRes = await fetch('http://localhost:5000/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'testprovider@test.com', password: 'password' })
  });

  let token = null;

  if (!loginRes.ok) {
    // Need to register a provider first
    const regRes = await fetch('http://localhost:5000/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test',
        email: 'testprovider@test.com',
        password: 'password',
        userType: 'provider',
        location: { city: 'A', state: 'B', country: 'C' }
      })
    });
    const regData = await regRes.json();
    token = regData.token;
  } else {
    const loginData = await loginRes.json();
    token = loginData.token;
  }

  // Now perform the upload using form-data
  const FormData = require('form-data');
  const form = new FormData();
  form.append('file', fs.createReadStream(path.join(__dirname, 'package.json')));

  const uploadRes = await fetch('http://localhost:5000/api/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      ...form.getHeaders()
    },
    body: form
  });

  if (!uploadRes.ok) {
    const text = await uploadRes.text();
    console.error(`ERROR ${uploadRes.status}:`, text);
  } else {
    const data = await uploadRes.json();
    console.log('SUCCESS:', data);
  }
}

test();
