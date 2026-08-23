
const jwt = require('jsonwebtoken');
const token = jwt.sign({ userId: 'dummy', role: 'ADMIN' }, 'fallback-secret');
fetch('http://localhost:3000/api/admin/dashboard', {
  headers: { cookie: 'auth-token=' + token }
}).then(r => r.text()).then(console.log);

