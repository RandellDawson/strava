import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { constants, processEvent } from '../utils/index.js';

const app = express();
app.use(cors({ optionsSuccessStatus: 200 }));
app.use(express.static('app/public'));
app.use(bodyParser.json());

// ROUTES
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

app.post('/webhook', processEvent);

app.get('/webhook', (req, res, next) => {
  console.log('Webhook GET Request')
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (mode && token) {
    // Verifies that the mode and token sent are valid
    if (mode === 'subscribe' && token === constants.VERIFY_TOKEN) {
      // Responds with the challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      res.json({ "hub.challenge": challenge });
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
  next();
});

const listener = app.listen(process.env.PORT, () => {
  console.log('App is listening on port ' + listener.address().port);
});