const express = require("express");
const router = express.Router();
const Product = require("../../models/product.model");
const ObjectId = require("mongoose").Types.ObjectId;
const multer = require("multer");
const path = require("path");

// Start File Upload
var store = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "./public/uploads/");
  },
  filename: function(req, file, cb) {
    var getFileExt = function(filename) {
      var fileExt = filename.split(".");
      if (fileExt.length === 1 || (fileExt[0] === "" && fileExt.length === 2)) {
        return "";
      }
      return fileExt.pop();
    };
    cb(null, Date.now() + "." + getFileExt(file.originalname));
  }
});

var upload = multer({
  storage: store
}).single("file");
// End File Upload (Check Post)

router.post("/upload", function(req, res) {
  upload(req, res, function(err) {
    if (err) {
      res.status(501).send({
        error: err
      });
    }

    return res.json({
      originalname: req.file.originalname,
      uploadname: req.file.filename
    });
  });
});

router.get("/", async (req, res) => {
  let products = await Product.find();

  if (products) {
    res.send({
      products
    });
  } else {
    res.send({
      error: "No products available."
    });
  }
});

router.post("/add", async (req, res) => {
  try {
    let product = new Product({
      displayName: req.body.displayName,
      description: req.body.description,
      price: req.body.price,
      onSale: req.body.onSale,
      afterSale: req.body.afterSale,
      mainImage: req.body.mainImage,
      otherImages: req.body.otherImages
    });

    let result = await product.save();
    if (result) {
      res.send({
        result
      });
    } else {
      res.send({
        error: "Failed Saving Product"
      });
    }
  } catch (err) {
    res.send({
      error: "Catch Error: Couldn't Add Product" + err
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    let id = req.params.id;

    if (!ObjectId.isValid(id))
      return res.status(400).send(`No matching records with this ID: ${id}`);

    if (id) {
      let product = await Product.findById(id);

      if (product) {
        res.send({
          product
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

router.delete("/delete/:id", async (req, res) => {
  try {
    let id = req.params.id;

    if (!ObjectId.isValid(id))
      return res.status(400).send(`No matching records with this ID: ${id}`);

    if (id) {
      let product = await Product.deleteById(id);

      if (product) {
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
      let product = {
        displayName: req.body.displayName,
        description: req.body.description,
        price: req.body.price,
        onSale: req.body.onSale,
        afterSale: req.body.afterSale,
        mainImage: req.body.mainImage,
        otherImages: req.body.otherImages
      };

      await Product.findByIdAndUpdate(
        id,
        {
          $set: product
        },
        {
          new: true
        },
        async (err, doc) => {
          if (!err) {
            await doc.save();
            await res.send(doc);
          } else {
            console.log(
              "Error in product Update :" + JSON.stringify(err, undefined, 2)
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
