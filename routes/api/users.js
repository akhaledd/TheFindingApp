const express = require('express');
const router = express.Router();
const Users = require('../../models/user.model');
const ObjectId = require('mongoose').Types.ObjectId;
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('../../data.config');

const saltRounds = 10;

router.get('/', async (req, res) => {
  let users = await Users.find({
    email: {
      $nin: ['ahmedkhaled511998@gmail.com', 'admin@thefinderapp.com']
    }
  });
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
      let admin = false;

      if (result.email === 'ahmedkhaled511998@gmail.com' || result.email === 'admin@thefinderapp.com') {
        admin = true;
      }

      let token = jwt.sign({
        _id: result._id,
        fullName: result.fullName,
        phoneNumber: result.phoneNumber,
        email: result.email,
        address: result.address,
        tags: result.tags,
        orders: result.orders,
        admin,
        createdAt: result.createdAt
      }, config.JWT_SECRET);

      return res.send({
        token
      });
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
    let admin = false;

    if (user.email === 'ahmedkhaled511998@gmail.com' || user.email === 'admin@thefinderapp.com') {
      admin = true;
    }

    let token = jwt.sign({
      _id: user._id,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      email: user.email,
      address: user.address,
      tags: user.tags,
      orders: user.orders,
      admin,
      createdAt: user.createdAt
    }, config.JWT_SECRET);

    return res.send({
      token
    });
  }

  return res.send({
    //not matching password
    error: 'Invalid username or password.'
  });
});

router.get('/details/:id', async (req, res) => {
  try {
    let id = req.params.id;

    if (!ObjectId.isValid(id))
      return res.status(400).send(`No matching records with this ID: ${id}`);

    if (id) {
      let user = await Users.findOne({
        _id: id
      }).populate('tags').populate('orders');

      if (user) {
        return res.send({
          user
        });
      }
      return res.status(404).send('404 - Not Found!');
    }
    return res.status(500).send('500 - Something was error!');
  } catch (err) {
    console.error('Error occurred: ', err);
  }
});

router.delete('/delete/:id', async (req, res) => {
  try {
    let id = req.params.id;

    if (!ObjectId.isValid(id))
      return res.status(400).send(`No matching records with this ID: ${id}`);

    if (id) {
      let result = await Users.deleteById(id);

      if (result) {
        return res.send({
          result
        });
      }
      return res.status(404).send('404 - Not Found!');
    }
    return res.status(500).send('500 - Something was error!');
  } catch (err) {
    console.error('Error occurred: ', err);
  }
});

// router.put('/add-tag/:id', async (req, res) => {
//   try {
//     let id = req.params.id;
//     let tag = req.body._id;

//     if (!ObjectId.isValid(id))
//       return res.status(400).send(`Not valid code.`);

//     let doc = await Users.findByIdAndUpdate(id, {
//       $push: {
//         tags: tag
//       }
//     }, {
//       safe: true,
//       upsert: true
//     });

//     if (doc) {
//       return res.send({
//         doc
//       });
//     }

//     return res.send({
//       error: "An error has occurred."
//     });

//   } catch (error) {
//     return res.send({
//       error
//     });
//   }
// })

router.put('/edit/:id', async (req, res) => {
  let id = req.params.id;

  if (!ObjectId.isValid(id))
    return res.status(400).send(`Not valid code.`);

  let user = {
    fullName: {
      firstName: req.body.fullName.firstName,
      lastName: req.body.fullName.lastName
    },
    phoneNumber: req.body.phoneNumber,
    address: req.body.address,
    email: req.body.email
  };

  let count = await Users.find({
    email: user.email
  }).count();

  if (count > 0) {
    return res.send({
      error: 'Email already belongs to another user.'
    });
  }

  await Users.findByIdAndUpdate(id, {
    $set: user
  }, {
    new: true,
    // upsert: true
  }, (err, doc) => {
    if (!err) {
      let admin = false;

      if (doc.email === 'ahmedkhaled511998@gmail.com' || doc.email === 'admin@pjdmeds.com') {
        admin = true;
      }

      // doc.save();
      let token = jwt.sign({
        _id: doc._id,
        fullName: doc.fullName,
        phoneNumber: doc.phoneNumber,
        email: doc.email,
        address: doc.address,
        tags: doc.tags,
        orders: doc.orders,
        admin,
        createdAt: doc.createdAt
      }, config.JWT_SECRET);
      res.send({
        token
      });
    } else {
      console.log('Error in updating user :' + JSON.stringify(err, undefined, 2));
    }
  });
});

module.exports = router;