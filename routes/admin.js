const express = require('express');

const router = express.Router();

const adminControllers = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');

// add product middleware
router.get('/add-product', isAuth, adminControllers.getAddProduct);

// /admin/add-product
router.post('/add-product', isAuth, adminControllers.postAddProduct);
// Edit product
router.get('/edit-product/:productId', isAuth, adminControllers.getEditProduct);
router.post('/edit-product', isAuth, adminControllers.updateEditProdcut);
// //delete product
router.post('/delete-product', isAuth, adminControllers.getDeleteProduct);
// // /admin/products show all products
router.get('/products', isAuth, adminControllers.adminProducts);

module.exports = router;
