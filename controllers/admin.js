const Product = require('../model/products');
const { validationResult } = require('express-validator/check');

// Page for adding New product
exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', { 
        pageTitle: 'Add Product | Admin', 
        pageURL: '/admin/add-product',
        editing: false,
        isAuthenticated: req.session.isLoggedin,
        hasError: false,
        errorMessage: null,
        isError: []
    });
};

// edit existing product
exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;
    if(!editMode){
        res.redirect('/');
    } else {
        const productId = req.params.productId;
        Product.findById(productId)
        .then(product => {
            res.render('admin/edit-product', { 
                pageTitle: 'Edit Product | Admin', 
                pageURL: '/admin/edit-product',
                editing: editMode,
                product: product,
                hasError: false,
                isAuthenticated: req.session.isLoggedin,
                errorMessage: null,
                isError: []
            });
        })
        .catch(err => console.log(err));
        
    }  
};

// update edited product 
exports.updateEditProdcut = (req, res, next) => {
    const productId = req.body.productId;
    const title = req.body.title;
    const price = req.body.price;
    const description = req.body.description;
    const imgUrl = req.body.imgUrl;

    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        const product = {
            title: title,
            price: price,
            description: description,
            imgUrl: imgUrl,
            _id: productId
        };

        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Edit Product | Admin', 
            pageURL: '/admin/edit-product',
            editing: true,
            hasError: true,
            product: product,
            isAuthenticated: req.session.isLoggedin,
            errorMessage: errors.array()[0].msg,
            isError: errors.array()
        });
    }

    Product.findById(productId)
    .then(product => {
        if(product.userId.toString() !== req.user._id.toString()) {
            return res.redirect('/');
        }

        product.title = title;
        product.price = price;
        product.description = description;
        product.imgUrl = imgUrl;
        return product.save()
        .then( result => {
            res.redirect('/admin/products');
        });
    })
    .catch(err => console.log(err));
};

// adding new product functionality
exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const price = req.body.price;
    const description = req.body.description;
    const imgUrl = req.body.imgUrl;

    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        const product = {
            title: title,
            price: price,
            description: description,
            imgUrl: imgUrl
        };

        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Add Product | Admin', 
            pageURL: '/admin/edit-product',
            editing: false,
            hasError: true,
            product: product,
            isAuthenticated: req.session.isLoggedin,
            errorMessage: errors.array()[0].msg,
            isError: errors.array()
        });
    }

    const product = new Product({
        title: title,
        price: price,
        description: description,
        imgUrl: imgUrl,
        userId: req.user
    });
    product.save()
    .then(() => {
        res.redirect('/admin/products');
    })
    .catch(err => console.log(err));
};

// deleting a product 
exports.getDeleteProduct = (req, res, next) => {
    const productId = req.body.productId;
    Product.deleteOne({ _id: productId, userId: req.user._id })
    .then(result => {
        res.redirect('/admin/products');
    })
    .catch(err => console.log(err));
};

exports.adminProducts = (req, res ,next) => {
    Product.find({ userId: req.user._id })
    .then(products => {
        res.render('admin/products', { 
            prods: products,
            pageTitle: 'Admin | Products',
            pageURL: '/admin/products',
            isAuthenticated: req.session.isLoggedin
         });
    })
    .catch(err => console.log(err)); 
};