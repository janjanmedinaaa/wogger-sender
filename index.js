'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const requestIp = require('request-ip');
const MongoClient = require('mongodb').MongoClient;

const Messenger = require('./utils/messenger');
const SMS = require('./utils/sms');
require('./utils/mapAsync');

const PORT = process.env.PORT || 1337;

const USAGE_LIMIT = 50;

const app = express();

app.use(bodyParser.json());
app.use(requestIp.mw());

const mongoClient = () => {
  return MongoClient.connect(process.env.MONGODB_URI, { useUnifiedTopology: true })
}

app.post('/:platform', async(req, res) => {
  const client = await mongoClient();
  const db = client.db('wogger-logs');
  const logsCollection = db.collection('logs');

  let platform = req.params.platform;
  let body = req.body;
  let receiver = body.receiver || '';
  let messages = body.messages || [];
  let ip = req.clientIp;

  if (messages.length === 0) {
    return res.status(400).json({
      success: false, 
      message: 'Messages parameter is required.'
    });
  } else if (receiver === '') {
    return res.status(400).json({
      success: false, 
      message: 'Receiver parameter is required.'
    });
  }

  try {
    // Check logs for the last hour
    var logsLastHour = await logsCollection.find({
      timestamp: { $gt: new Date().getTime() - 1000 * 60 * 60 },
      ip
    }).toArray()

    if (logsLastHour.length >= USAGE_LIMIT) {
      return res.status(400).json({
        success: false, 
        message: 'Max Usage Limit for the last hour.'
      });
    }

    // Insert to Database
    var logsToInsert = messages.map(message => { 
      return { ip, message, timestamp: new Date().getTime() } 
    }).slice(0, USAGE_LIMIT - logsLastHour.length)

    await logsCollection.insertMany(logsToInsert, { ordered: false });

    // Send each message
    await messages.mapAsync(async message => {
      switch (platform) {
        case 'messenger':
          await Messenger.send(receiver, message);
          break;
        case 'sms':
          await SMS.send(receiver, message);
          break;
      }
    });
  } catch (e) {
    return res.status(400).json({
      success: false, 
      message: 'Failed to send logs.'
    });
  }

  return res.status(200).send({
    success: true,
    message: `Logs sent to ${platform.toUpperCase()}!`,
    total: logsLastHour.length + logsToInsert.length
  });
});

app.get('/', (req, res) => {
  return res.status(200).send('Welcome to Wogger! Development Logger with a Webhook functionality.');
});

app.listen(PORT, () => {
  console.log('Wogger Starter on Port:', PORT);
});