const Product = require('../model/products');

// Page for adding New product
exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', { 
        pageTitle: 'Add Product | Admin', 
        pageURL: '/admin/add-product',
        editing: false,
        isAuthenticated: req.session.isLoggedin
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
                isAuthenticated: req.session.isLoggedin
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

    Product.findById(productId)
    .then(product => {
        product.title = title;
        product.price = price;
        product.description = description;
        product.imgUrl = imgUrl;
        return product.save();
    })
    .then( result => {
        res.redirect('/admin/products');
    })
    .catch(err => console.log(err));
};

// adding new product functionality
exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const price = req.body.price;
    const description = req.body.description;
    const imgUrl = req.body.imgUrl;
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
    Product.findByIdAndRemove(productId)
    .then(result => {
        res.redirect('/admin/products');
    })
    .catch(err => console.log(err));
};

exports.adminProducts = (req, res ,next) => {
    Product.find()
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