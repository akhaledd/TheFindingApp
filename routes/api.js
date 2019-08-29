const express = require('express');
const router = express.Router();

const usersRouter = require('./api/users');
const contactsRouter = require('./api/contacts');
const tagsRouter = require('./api/tags');
const productsRouter = require('./api/products');
const ordersRouter = require('./api/orders');
// const subscribersRouter = require('./api/subscribers');

router.use('/users', usersRouter);
router.use('/contacts', contactsRouter);
router.use('/tags', tagsRouter);
router.use('/products', productsRouter);
router.use('/orders', ordersRouter);
// router.use('/subscribers', subscribersRouter);

module.exports = router;