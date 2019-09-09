const express = require("express");
const router = express.Router();
const Product = require("../../models/product.model");
const ObjectId = require("mongoose").Types.ObjectId;
const multer = require("multer");
const path = require("path");

// Start File Upload
var store = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    var getFileExt = function (filename) {
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

router.post("/upload", function (req, res) {
  upload(req, res, function (err) {
    if (err) {
      return res.status(501).send({
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
    return res.send({
      products
    });
  } else {
    return res.send({
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
      return res.send({
        result
      });
    } else {
      return res.send({
        error: "Failed Saving Product"
      });
    }
  } catch (err) {
    return res.send({
      error: "Catch Error: Couldn't Add Product" + err
    });
  }
});

router.get("/details/:id", async (req, res) => {
  try {
    let id = req.params.id;

    if (!ObjectId.isValid(id))
      return res.status(400).send(`No matching records with this ID: ${id}`);

    if (id) {
      let product = await Product.findById(id);

      if (product) {
        return res.send({
          product
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
      let product = await Product.deleteById(id);

      if (product) {
        return res.send({
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

router.post('/cart', async (req, res) => {
  try {
    let cart = req.body.cart;

    // return res.send({
    //   cart
    // });

    newCart = [];
    cart.forEach(element => {
      newCart.push(element._id);
    });

    let products = await Product.find({
      _id: {
        $in: newCart
      }
    });

    if (products) {
      return res.send({
        products
      });
    }

    return res.send({
      error: "Couldn't find products"
    });
  } catch (error) {
    return res.send({
      error
    });
  }
});

router.put("/edit/:id", async (req, res) => {
  try {
    let id = req.params.id;

    if (!ObjectId.isValid(id))
      return res.status(400).send(`No matching records with this ID: ${id}`);

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

      let doc = await Product.updateOne({
        _id: id
      }, {
        $set: product
      }, {
        new: true
      });

      if (doc) {
        return res.send({
          doc
        });
      } else {
        console.log(
          "Error in product Update :" + JSON.stringify(err, undefined, 2)
        );
      }
    }

    return res.status(404).send("404 - Not Found! - Empty");
  } catch (err) {
    return res.send({
      catch: err
    });
  }
});

module.exports = router;