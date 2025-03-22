const express = require("express");
const twilio = require("twilio");
const nodemailer = require("nodemailer");
const path = require("path");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

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
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post("/submit-feedback", async (req, res) => {
  const { rating, comment } = req.body;

  try {
    if (parseInt(rating) <= 3) {
      console.log("Low Rating Feedback:", { rating, comment });

      // Send SMS to owner
      try {
        await twilioClient.messages.create({
          body: `Low rating alert: ${rating} stars - ${
            comment || "No comment"
          }`,
          from: process.env.TWILIO_PHONE,
          to: process.env.YOUR_PHONE,
        });
        console.log("SMS sent");
      } catch (smsError) {
        console.error("SMS error:", smsError.message);
      }

      // Send email to owner
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: process.env.YOUR_EMAIL,
          subject: "MealJet: Low Rating Alert",
          text: `Rating: ${rating} stars\nComment: ${comment || "No comment"}`,
        });
        console.log("Email sent");
      } catch (emailError) {
        console.error("Email error:", emailError.message);
      }
    }
    // Hamesha response bhejo, chahe SMS/email fail ho
    res.status(200).send("Feedback received");
  } catch (error) {
    console.error("Error in /submit-feedback:", error.message);
    res.status(500).send("Server error");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
