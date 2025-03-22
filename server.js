const express = require("express");
const twilio = require("twilio");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(express.static("public"));

const twilioClient = twilio(
  process.env.TWILIO_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.post("/submit-feedback", (req, res) => {
  const { rating, comment } = req.body;

  if (parseInt(rating) <= 3) {
    console.log("Low Rating Feedback:", { rating, comment });

    twilioClient.messages
      .create({
        body: `Low rating alert: ${rating} stars - ${comment || "No comment"}`,
        from: process.env.TWILIO_PHONE,
        to: process.env.YOUR_PHONE,
      })
      .then(() => console.log("SMS sent"))
      .catch((err) => console.error("SMS error:", err));

    transporter
      .sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.YOUR_EMAIL,
        subject: "MealJet: Low Rating Alert",
        text: `Rating: ${rating} stars\nComment: ${comment || "No comment"}`,
      })
      .then(() => console.log("Email sent"))
      .catch((err) => console.error("Email error:", err));
  }

  res.status(200).send("Feedback received");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
