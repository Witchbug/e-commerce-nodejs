const express = require('express');

const { body } = require('express-validator/check');

const router = express.Router();

const adminControllers = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');

// add product middleware
router.get('/add-product', isAuth, adminControllers.getAddProduct);

// /admin/add-product
router.post('/add-product',
    [
        body('title')
        .isString()
        .isLength({ min: 2 })
        .withMessage('Title must be at least 2 characters'),
        body('imgUrl')
        .isURL()
        .withMessage('Image must be URL')
        .trim(),
        body('price')
        .isFloat()
        .withMessage('Price must be numarical value'),
        body('description')
        .isLength({min: 3, max: 400})
        .withMessage('Description must be between 3 to 400 characters'),
    ],
    isAuth, 
    adminControllers.postAddProduct
);
// Edit product
router.get('/edit-product/:productId', isAuth, adminControllers.getEditProduct);
router.post('/edit-product',
    [
        body('title')
        .isString()
        .isLength({ min: 2 })
        .withMessage('Title must be at least 2 characters'),
        body('imgUrl')
        .isURL()
        .withMessage('Image must be URL')
        .trim(),
        body('price')
        .isFloat()
        .withMessage('Price must be numarical value'),
        body('description')
        .isLength({min: 3, max: 400})
        .withMessage('Description must be between 3 to 400 characters'),
    ],
    isAuth,
    adminControllers.updateEditProdcut
);
// //delete product
router.post('/delete-product', isAuth, adminControllers.getDeleteProduct);
// // /admin/products show all products
router.get('/products', isAuth, adminControllers.adminProducts);

module.exports = router;
