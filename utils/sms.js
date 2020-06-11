const fetch = require('node-fetch');
require('dotenv').config();

const BASE_URL = 'https://ws-live.txtbox.com/v1/sms/push';
const ACCESS_TOKEN = process.env.TXTBOX_ACCESS_TOKEN;

const send = (number, text) => {
  var params = new URLSearchParams();
  params.append('message', text);
  params.append('number', number);

  return fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'X-TXTBOX-Auth': ACCESS_TOKEN
    },
    body: params
  })
}

module.exports = {
  send
}