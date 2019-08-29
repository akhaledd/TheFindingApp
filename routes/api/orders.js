const express = require("express");
const router = express.Router();
const Order = require("../../models/order.model");
const ObjectId = require("mongoose").Types.ObjectId;
const path = require("path");
const config = require("../../data.config");
const stripe = require("stripe")(config.STRIPE_SK);

router.get("/", async (req, res) => {
  let orders = await Order.find();

  if (orders) {
    res.send({
      orders
    });
  } else {
    res.send({
      error: "There are no orders at this moment."
    });
  }
});

// router.post("/add", async (req, res) => {
//   try {
//     let order = new Order({
//       totalPrice: req.body.totalPrice,
//       subTotal: req.body.subTotal,
//       shipping: req.body.shipping,
//       tags: req.body.tags,
//       user: req.body.user,
//       status: "Incomplete",
//       orderId: req.body.orderId
//     });

//     let charge = stripe.charges.create({
//         amount: order.totalPrice,
//         currency: "usd",
//         source: req.body.token, // obtained with Stripe.js
//         //  description: "",
//         shipping: {
//           address: req.body.shipping.address,
//           name: req.body.shipping.name,
//           phone: req.body.shipping.phone
//         },
//         receipt_email: req.body.receipt_email
//       },
//       async function (err, charge) {
//         if (err) {
//           throw err;
//         }

//         if (charge) {
//           order.status = 'Pending';
//           let result = await order.save();
//           if (result) {
//             res.send({
//               result,
//               charge
//             });
//           } else {
//             res.send({
//               error: "Failed Saving Order."
//             });
//           }
//         }
//       }
//     );
//   } catch (err) {
//     res.send({
//       error: "Catch Error - Couldn't Add Order" + err
//     });
//   }
// });

router.get("/:id", async (req, res) => {
  try {
    let id = req.params.id;

    if (!ObjectId.isValid(id))
      return res.status(400).send(`No matching records with this ID: ${id}`);

    if (id) {
      let order = await Order.findById(id);

      if (order) {
        res.send({
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
        totalPrice: req.body.totalPrice,
        subTotal: req.body.subTotal,
        shipping: req.body.shipping,
        tags: req.body.tags,
        user: req.body.user,
        status: req.body.status
      };

      await Order.findByIdAndUpdate(
        id, {
          $set: order
        }, {
          new: true
        },
        async (err, doc) => {
          if (!err) {
            await doc.save();
            await res.send(doc);
            return;
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