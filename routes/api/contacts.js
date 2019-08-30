const express = require("express");
const router = express.Router();
const Contact = require("../../models/report.model");
const ObjectId = require("mongoose").Types.ObjectId;
const path = require("path");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(
  "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"
);

router.get("/", async (req, res) => {
  let contact = await Contact.find();

  if (contact) {
    res.send(contact);
  } else {
    res.send({
      error: "No submissions exist."
    });
  }
});

router.post("/add", async (req, res) => {
  try {
    let contact = new Contact({
      fullName: {
        firstName: req.body.fullName.firstName,
        lastName: req.body.fullName.lastName
      },
      phone: req.body.phone,
      email: req.body.email,
      message: req.body.message
    });

    sendMail(
      "Contact Form Submission",
      contact.email,
      contact.message,
      contact.fullName.firstName,
      contact.fullName.lastName,
      contact.phone
    );

    let result = await contact.save();
    if (result) {
      res.send({
        result
      });
    } else {
      res.send({
        error: "Failed Saving Submission"
      });
    }
  } catch (err) {
    res.send({
      error: "Couldn't Add Submission" + err
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    let id = req.params.id;

    if (!ObjectId.isValid(id))
      return res.status(400).send(`No matching records with this ID: ${id}`);

    if (id) {
      let contact = await Contact.findById(id);

      if (contact) {
        return res.send({
          contact
        });
      }
      return res.status(404).send("404 - Not Found!");
    }

    return res.status(500).send("500 - Something was error!");
  } catch (err) {
    console.error("Error occurred: ", err);
  }
});

router.delete("/delete/:id", async (req, res) => {
  try {
    let id = req.params.id;

    if (!ObjectId.isValid(id))
      return res.status(400).send(`No matching records with this ID: ${id}`);

    if (id) {
      let contact = await Contact.deleteById(id);

      if (contact) {
        res.send({
          deleted: true
        });
      }
      res.status(404).send("404 - Not Found!");
      return;
    }
    res.status(500).send("500 - Something was error!");
    return;
  } catch (err) {
    console.error("Error occurred: ", err);
  }
});

function sendMail(subject, fromEmail, message, fn, ln, phone) {
  let msg = {
    to: "ahmedkhaled511998@gmail.com",
    // to: "support@thefinderapp.com",
    from: fromEmail,
    subject: subject,
    html: `<strong>Full Name: </strong> ${fn} ${ln}<br><strong>Phone: </strong> ${phone}<br><strong>Email: </strong>${fromEmail}<br><strong>Message: </strong> ${message}`
  };
  sgMail.send(msg);
}

module.exports = router;