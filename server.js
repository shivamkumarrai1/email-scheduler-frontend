const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const Agenda = require('agenda');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection string for Agenda (local MongoDB)
const agenda = new Agenda({ db: { address: 'mongodb://localhost/agenda' } });

// Define the Agenda job to use sender's credentials
agenda.define('send email', async (job) => {
  const { to, subject, body, from, pass } = job.attrs.data;
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: from,
      pass: pass
    }
  });
  await transporter.sendMail({
    from,
    to,
    subject,
    text: body
  });
  console.log(`Email sent to ${to} from ${from}`);
});

// Start Agenda
(async function() {
  await agenda.start();
})();

// POST API to schedule email after 1 hour, using sender's credentials
app.post('/api/email/schedule', async (req, res) => {
  const { to, subject, body, from, pass } = req.body;
  if (!to || !subject || !body || !from || !pass) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Schedule the job for 1 hour from now, including sender credentials
  const sendAt = new Date(Date.now() + 60 * 60 * 1000);
  await agenda.schedule(sendAt, 'send email', { to, subject, body, from, pass });
  res.json({ message: 'Email scheduled for 1 hour from now!' });
});

// Start Express server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 