const express = require('express');
const router = express.Router();
const Order = require('../../models/order.model');
const ObjectId = require('mongoose').Types.ObjectId;
const path = require('path');

router.get('/', async (req, res) => {
   let orders = await Order.find();

   if (orders) {
      res.send({orders});
   } else {
      res.send({
         error: 'There are no orders at this moment.'
      });
   }
});

router.post('/add', async (req, res) => {
   try {
      let order = new Order({
         totalPrice: req.body.totalPrice,
         subTotal: req.body.subTotal,
         shipping: req.body.shipping,
         tags: req.body.tags,
         user: req.body.user,
         status: 'Incomplete'
      });


      let result = await order.save();
      if (result) {
         res.send({
            result
         });
      } else {
         res.send({
            error: "Failed Saving Order."
         });
      }
   } catch (err) {
      res.send({
         error: "Catch Error - Couldn't Add Order" + err
      });
   }
});

router.get('/:id', async (req, res) => {
   try {
      let id = req.params.id;

      if (!ObjectId.isValid(id))
         return res.status(400).send(`No matching records with this ID: ${id}`);

      if (id) {
         let tag = await Tags.findById(id);

         if (tag) {
            res.send(
               {tag}
            );
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
         let tag = await Tags.deleteById(id);

         if (tag) {
            res.send({
               deleted: true
            });
         }
         return res.status(404).send('404 - Not Found!');
      }
      return res.status(500).send('500 - Something was error!');
   } catch (err) {
      console.error('Error occurred: ', err);
   }
});

router.put('/edit/:id', async (req, res) => {
   try {
      let id = req.params.id;

      if (!ObjectId.isValid(id))
         res.status(400).send(`No matching records with this ID: ${id}`);

      if (id) {
         let tag = {
            displayName: req.body.displayName,
            assigned: req.body.assigned,
            activated: req.body.activated,
            description: req.body.description,
            user: req.body.user,
            activationDate: req.body.activationDate
         };

         await Tags.findByIdAndUpdate(id, {
            $set: tag
         }, {
            new: true
         }, async (err, doc) => {
            if (!err) {
               await doc.save();
               await res.send(doc);
               return;
            } else {
               console.log('Error in subscriber Update :' + JSON.stringify(err, undefined, 2));
            }
         });
      }

      res.status(404).send('404 - Not Found! - Empty');
   } catch (err) {
      res.send({
         catch: err
      });
   }
});

module.exports = router;