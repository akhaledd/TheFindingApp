const express = require('express');
const router = express.Router();
const Verification = require('../../models/verification.model');
const Users = require('../../models/user.model');
const ObjectId = require('mongoose').Types.ObjectId;
const config = require('../../data.config');
const sgMail = require('@sendgrid/mail');
const bcrypt = require('bcrypt');
sgMail.setApiKey(config.SENDGRID_APIKEY);

const saltRounds = 10;

router.post('/reset-password', async (req, res) => {
  let verification = new Verification({
    email: req.body.email,
    used: false
  });

  let user = await Users.findOne({
    email: verification.email
  });

  if (!user) {
    return res.send({
      error: "A message has been sent to your email, follow instructions to reset your password."
    });
  }

  let result = await verification.save();

  if (result) {
    let html = `Please <a href='https://www.thefinderapp.com/reset-password/${result._id}'>click here</a> to reset your password
    <br><br>
    This link can be used only one time.`;
    sendMail("Password Reset Request at TheFinderApp.com", user.email, html);
    return res.send({
      success: "A message has been sent to your email, follow instructions to reset your password."
    });
  }
});

router.get('/verify-link/:id', async (req, res) => {
  let id = req.params.id;

  if (!ObjectId.isValid(id))
    return res.status(400).send(`Not valid ID.`);

  let verification = await Verification.findById(id);

  if (verification && !verification.used) {
    return res.send({
      valid: true
    });
  } else {
    return res.send({
      valid: false
    });
  }
});

router.put('/reset-password/:id', async (req, res) => {
  try {
    let id = req.params.id;

    if (!ObjectId.isValid(id))
      return res.status(400).send(`Not valid ID.`);

    let verification = await Verification.findById(id);

    let user = await Users.findOne({
      email: verification.email
    });

    if (user) {
      user.password = bcrypt.hashSync(req.body.password, saltRounds);

      let userResult = await Users.findByIdAndUpdate(user._id, {
        $set: user
      }, {
        new: true
      });

      userResult.save();

      verification.used = true;
      let verificationResult = await Verification.findByIdAndUpdate(verification._id, {
        $set: verification
      }, {
        new: true
      });
      verificationResult.save();

      if (userResult && verificationResult) {
        let html = `Your password has been changed successfully, now you can login using your new password.`;
        sendMail("Your password has been changed", user.email, html);
        return res.send({
          success: 'Password has been changed successfully.'
        });
      }
    }

    return res.send({
      error: 'User not found'
    });
  } catch (error) {
    return res.send({
      error
    });
  }
});

function sendMail(subject, to, html) {
  let msg = {
    from: 'no-reply@thefinderapp.com',
    to,
    subject,
    html
  }
  sgMail.send(msg);
}

module.exports = router;