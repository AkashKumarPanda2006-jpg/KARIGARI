
const jwt = require('jsonwebtoken');
const token = jwt.sign({ userId: 'dummy-id', role: 'ADMIN' }, 'super-secret-jwt-key-replace-me-in-production');
fetch('http://localhost:3000/api/admin/dashboard', {
  headers: { cookie: 'auth-token=' + token }
}).then(r => r.text()).then(t => console.log('RESPONSE:', t)).catch(console.error);

