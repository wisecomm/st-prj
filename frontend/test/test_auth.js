const http = require('http');

async function test() {
  const urlParams = new URLSearchParams({
    username: 'admin', // assuming there is an admin user
    password: 'password', // use common password or dummy, actually auth might check the backend
    json: 'true'
  });

  // Since we don't know the exact credentials, let's just make a req to /api/backend/v1/mgmt/orders and see the error.
}

test();
