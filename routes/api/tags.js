const express = require('express');
const router = express.Router();
const Tags = require('../../models/tag.model');
const Users = require('../../models/user.model');
const ObjectId = require('mongoose').Types.ObjectId;
const path = require('path');

router.get('/', async (req, res) => {
   let tags = await Tags.find().populate('user');

   if (tags) {
      res.send({
         tags
      });
   } else {
      res.send({
         error: 'No tags exist.'
      });
   }
});

router.get('/user/:id', async (req, res) => {
   try {
      let id = req.params.id;

      if (!ObjectId.isValid(id))
         return res.status(400).send(`No matching records with this ID: ${id}`);

      let tags = await Tags.find({
         user: id
      }).populate('user');

      if (tags) {
         return res.send({
            tags
         });
      }
      return res.send({
         error: "No tags found"
      });
   } catch (error) {
      return res.send({
         error
      });
   }
});

router.post('/add', async (req, res) => {
   try {
      let tag = new Tags({
         displayName: req.body.displayName,
         user: req.body.user
      });

      let result = await tag.save();
      if (result) {
         await Users.findByIdAndUpdate(result.user, {
            $push: {
               tags: result._id
            }
         }, {
            safe: true,
            upsert: true
         });

         res.send({
            result
         });
      } else {
         res.send({
            error: "Failed Saving Tag."
         });
      }
   } catch (err) {
      res.send({
         error: "Catch Error - Couldn't Add Tag" + err
      });
   }
});

router.get('/:id', async (req, res) => {
   try {
      let id = req.params.id;

      if (!ObjectId.isValid(id))
         return res.status(400).send(`No matching records with this ID: ${id}`);

      if (id) {
         let tag = await Tags.findById(id).populate('user');

         if (tag) {
            return res.send({
               tag
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
            activated: req.body.activated,
            description: req.body.description,
            user: req.body.user,
         };

         let doc = await Tags.findByIdAndUpdate(id, {
            $set: tag
         }, {
            new: true
         });
         if (doc) {
            return res.send({
               doc
            });
         }
         return res.send({
            error: "An error has occurred"
         });
      }

      return res.status(404).send('404 - Not Found! - Empty');
   } catch (err) {
      return res.send({
         catch: err
      });
   }
});

module.exports = router;