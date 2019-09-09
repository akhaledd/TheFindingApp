const express = require("express");
const router = express.Router();
const Order = require("../../models/order.model");
const ObjectId = require("mongoose").Types.ObjectId;
const path = require("path");
const config = require("../../data.config");
const stripe = require("stripe")(config.STRIPE_SK);

router.get("/", async (req, res) => {
  let orders = await Order.find().populate('user').sort({
    createdAt: 'desc'
  });

  if (orders) {
    return res.send({
      orders
    });
  } else {
    return res.send({
      error: "There are no orders at this moment."
    });
  }
});

router.get("/user/:id", async (req, res) => {
  try {
    let id = req.params.id;

    if (!ObjectId.isValid(id))
      return res.status(400).send(`No matching records with this ID: ${id}`);

    if (id) {
      let orders = await Order.find({
        user: id
      }).populate('products').sort({
        createdAt: 'desc'
      });

      if (orders) {
        return res.send({
          orders
        });
      }
      return res.status(404).send("404 - Not Found!");
    }
    return res.status(500).send("500 - Something was error!");
  } catch (err) {
    console.error("Error occurred: ", err);
  }
});

router.post("/add", async (req, res) => {
  try {
    let order = new Order({
      totalPrice: req.body.totalPrice,
      subTotal: req.body.subTotal,
      shipping: req.body.shipping,
      tags: req.body.tags,
      user: req.body.user._id,
      card_details: req.body.card_details,
      stripe_token: req.body.stripe_token,
      status: "Incomplete",
    });

    stripe.charges.create({
        amount: order.totalPrice * 100,
        currency: "usd",
        source: order.stripe_token, // obtained with Stripe.js
        metadata: {
          'userId': req.body.user._id,
          'fullName': `${req.body.user.fullName.firstName} ${req.body.user.fullName.lastName}`,
          'address': req.body.user.address,
          'phoneNumber': req.body.user.phoneNumber,
          'email': req.body.user.email,
          'subTotal': order.subTotal,
          'shipping': order.shipping
        },
        description: `Pet tags from TheFinderApp.com for User ${this.user}`,
        // shipping: req.body.shipping,
        // {
        //   address: req.body.shipping.address,
        //   name: req.body.shipping.name,
        //   phone: req.body.shipping.phone
        // },
        receipt_email: req.body.user.email
      },
      async function (err, charge) {
        try {
          if (err) {
            let errMsg = 'Unknown error';
            switch (err.type) {
              case 'StripeCardError':
                // A declined card error
                errMsg = err.message
                break;
              case 'StripeRateLimitError':
                // Too many requests made to the API too quickly
                errMsg = err.message
                break;
              case 'StripeInvalidRequestError':
                // Invalid parameters were supplied to Stripe's API
                errMsg = err.message
                break;
              case 'StripeAPIError':
                // An error occurred internally with Stripe's API
                errMsg = err.message
                break;
              case 'StripeConnectionError':
                // Some kind of error occurred during the HTTPS communication
                errMsg = err.message
                break;
              case 'StripeAuthenticationError':
                // You probably used an incorrect API key
                errMsg = err.message
                break;
              default:
                // Handle any other types of unexpected errors
                errMsg = err.message
                break;
            }

            return res.send({
              errMsg
            });
          }

          if (charge) {
            order.status = 'Pending';
            let result = await order.save();
            if (result) {
              return res.send({
                result,
                charge
              });
            } else {
              return res.send({
                error: "Failed Saving Order."
              });
            }
          }
        } catch (error) {
          return res.send({
            error
          });
        }
      }
    );
  } catch (err) {
    return res.send({
      error: "Catch Error - Couldn't Add Order: " + err
    });
  }
});

router.get("/details/:id", async (req, res) => {
  try {
    let id = req.params.id;

    if (!ObjectId.isValid(id))
      return res.status(400).send(`No matching records with this ID: ${id}`);

    if (id) {
      let order = await Order.findById(id).populate('user').populate('tags');

      if (order) {
        return res.send({
          order
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
      let order = await Order.deleteById(id);

      if (order) {
        res.send({
          deleted: true
        });
      }
      return res.status(404).send("404 - Not Found!");
    }
    return res.status(500).send("500 - Something was error!");
  } catch (err) {
    console.error("Error occurred: ", err);
  }
});

router.put("/edit/:id", async (req, res) => {
  try {
    let id = req.params.id;

    if (!ObjectId.isValid(id))
      res.status(400).send(`No matching records with this ID: ${id}`);

    if (id) {
      let order = {
        status: req.body.status
      };

      await Order.updateOne({
          _id: id
        }, {
          $set: order
        }, {
          new: true
        },
        (err, doc) => {
          if (!err) {
            return res.send(doc);
          } else {
            console.log(
              "Error in subscriber Update :" + JSON.stringify(err, undefined, 2)
            );
          }
        }
      );
    }

    res.status(404).send("404 - Not Found! - Empty");
  } catch (err) {
    res.send({
      catch: err
    });
  }
});

module.exports = router;