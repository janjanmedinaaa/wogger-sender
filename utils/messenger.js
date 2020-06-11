const fetch = require('node-fetch');
require('dotenv').config();

const BASE_URL = 'https://graph.facebook.com/v7.0/me/messages';
const ACCESS_TOKEN = process.env.MESSENGER_ACCESS_TOKEN;

const MESSAGE_URL = `${BASE_URL}?access_token=${ACCESS_TOKEN}`;

const send = (id, text) => {
  let body = {
    recipient: { id },
    message: { text }
  }

  return fetch(MESSAGE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body)
  })
  .then(res => res.json())
}

module.exports = {
  send
}