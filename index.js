'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const Messenger = require('./utils/messenger');
const SMS = require('./utils/sms');
require('./utils/mapAsync');

const app = express().use(bodyParser.json());

const PORT = process.env.PORT || 1337

app.post('/:platform', async(req, res) => {
  let platform = req.params.platform;
  let body = req.body;
  let receiver = body.receiver;
  let messages = body.messages || [];

  try {
    await messages.mapAsync(async message => {
      switch (platform) {
        case 'messenger':
          await Messenger.send(receiver, message);
          break;
        case 'sms':
          await SMS.send(receiver, message);
          break;
      }
    })
  } catch (e) {
    return res.status(400).send('EVENT_RECEIVED_ERROR');
  }

  return res.status(200).send('EVENT_RECEIVED');
});

app.get('/', (req, res) => {
  return res.status(200).send('Welcome to Wogger! Development Logger with a Webhook functionality.');
});

app.listen(PORT, () => {
  console.log('Wogger Starter on Port:', PORT);
});