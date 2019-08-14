const express = require('express');
const router = express.Router();
const Users = require('../../models/user.model');
const ObjectId = require('mongoose').Types.ObjectId;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../../data.config');

const saltRounds = 10;

router.get('/', async (req, res) => {
  let users = await Users.find();
  return res.send({
    users
  });
})

router.post('/register', async (req, res) => {
  try {
    req.body.password = bcrypt.hashSync(req.body.password, saltRounds);

    let user = new Users({
      fullName: {
        firstName: req.body.fullName.firstName,
        lastName: req.body.fullName.lastName,
      },
      phoneNumber: req.body.phoneNumber,
      address: req.body.address,
      email: req.body.email,
      password: req.body.password
    });

    let count = await Users.find({
      email: user.email
    }).count();

    if (count > 0) {
      return res.send({
        error: 'Email already exists.'
      });
    }

    let result = await user.save();

    if (result) {
      return res.send(result);
    } else {
      return res.send({
        error: 'Failed adding user.'
      });
    }
  } catch (error) {
    res.send({
      error
    });
  }
});

router.post('/login', async (req, res) => {
  let email = req.body.email;
  let password = req.body.password;

  let emailExists = await Users.find({
    email
  }).countDocuments();

  if (emailExists == 0) {
    return res.send({
      error: 'Invalid username or password.'
    });
  }

  user = await Users.findOne({
    email
  });

  let matching = bcrypt.compareSync(password, user.password);

  if (matching) {
    let token = jwt.sign({
      _id: user._id,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      email: user.email,
      address: user.address,
      tags: user.tags,
      createdAt: user.createdAt
    }, config.JWT_SECRET);

    return res.send({
      token
    });
  }

  return res.send({
    error: 'Not matching password.'
  });
});

router.put('/edit/:id',async (req, res) => {
  let id = req.params.id;

  if (!ObjectId.isValid(id))
    return res.status(400).send(`Not valid code.`);
    
  let user = {
    fullName: {
        firstName: req.body.fullName.firstName,
        lastName: req.body.fullName.lastName
    },
    phoneNumber: req.body.phoneNumber,
    address: req.body.address
  };

  await Users.findByIdAndUpdate(id, {
    $set: user
  }, {
    new: true
  }, (err, doc) => {
    if (!err) {
      doc.save();
      let token = jwt.sign({
        _id: doc._id,
        fullName: doc.fullName,
        phoneNumber: doc.phoneNumber,
        email: doc.email,
        address: doc.address,
        tags: doc.tags,
        createdAt: doc.createdAt
      }, config.JWT_SECRET);
      res.send({token});
    } else {
      console.log('Error in updating user :' + JSON.stringify(err, undefined, 2));
    }
  });
});

module.exports = router;