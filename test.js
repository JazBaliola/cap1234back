const { Client } = require('pg');

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const nodemailer = require('nodemailer');
const path = require('path');
const mysql = require("mysql2");

const connection_string = 'postgresql://anmolpreet:XKRWMlTLCRsBWpBLlVZBmw@capstone-3002.g95.cockroachlabs.cloud:26257/ticketingsytem?sslmode=verify-full';
const client = new Client({
  connectionString: connection_string,
});

const connection = mysql.createConnection({
  host: 'gator3403.hostgator.com',
  user: 'jazcoeit',
  password: 'Jaz@quickserve',
  database: 'jazcoeit_quickserve',
});

async function connectToDatabase() {
  try {
    connection.connect();
    console.log('Connected to the CockroachDB database!');
  } catch (err) {
    console.error('Error connecting to the database:', err.message);
  }
}

connectToDatabase();


const app = express();
app.use(cors());


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get("/adminTickets", (req, res) => {
  const sql = "SELECT * FROM public.issued_tickets;";
  client.query(sql, (err,data) => {
      if(err)  return res.json('Error: ' + err.message);
       return res.json(data);
  })
})

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'prospectissuedticket@gmail.com',
    pass: 'mqqbblfvqbrezdfx',
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const mailOptions = {
  from: 'prospectissuedticket@gmail.com',
  to: 'anmol.bhangoo2002@gmail.com',
  subject: 'Ticket',
  text: 'Your Ticket Has been Issued!',
};

const sendEmail = function () {
  transporter.sendMail(mailOptions, function (err, succ) {
    if (err) {
      console.log(err);
    } else {
      console.log('Email Sent');
    }
  });
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads');
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '_' + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
});


app.use(express.json());
app.post('/createTicket', upload.single('image'), async (req, res) => {
    const sql =
      'INSERT INTO public.issued_tickets (TICKET_DATE, TICKET_SUBJECT, TICKET_CATEGORY, TICKET_DESCRIPTION, TICKET_PRIORITY, TICKET_STATUS, TICKET_PIC)  VALUES ($1, $2, $3, $4, $5, $6, $7);';

    let filename = '';
    if (req.file) {
      filename = req.file.filename;
    }

    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().slice(0, 10);
    const values = [
      formattedDate,
      req.body.subject,
      req.body.category,
      req.body.description,
      req.body.priority,
      'NotSolved',
      filename,
    ];

     client.query(sql, values);

});


const port = 3001;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
