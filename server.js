const express = require("express");
const twilio = require("twilio");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(express.static("public")); // Serve frontend files

// Twilio setup
const twilioClient = twilio(
  process.env.TWILIO_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// POST endpoint for feedback
app.post("/submit-feedback", (req, res) => {
  const { rating, comment } = req.body;

  if (rating < 4) {
    // Save feedback (for now, log to console; later add database)
    console.log("Low Rating Feedback:", { rating, comment });

    // Send SMS notification via Twilio
    twilioClient.messages
      .create({
        body: `Low rating alert: ${rating} stars - ${comment || "No comment"}`,
        from: process.env.TWILIO_PHONE,
        to: process.env.YOUR_PHONE,
      })
      .then(() => console.log("SMS sent"))
      .catch((err) => console.error("SMS error:", err));

    // Send email notification
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

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
