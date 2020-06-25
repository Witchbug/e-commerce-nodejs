const Product = require('../model/products');
const Order = require('../model/order');

exports.getProducts = (req, res, next) => {
    Product.find()
    .then(products => {
        res.render('shop/product-list', { 
            prods: products,
            pageTitle: 'Products', 
            pageURL: '/products', 
            isAuthenticated: req.session.isLoggedin
         });
    })
    .catch(err => console.log(err)); 
 };

 exports.getProduct = (req, res, next) => {
    const productId = req.params.productID;
    Product.findById(productId)
    .then(product => {
        res.render('shop/product-detail', {
            product: product, 
            pageTitle: product.title, 
            pageURL: '/products',
            isAuthenticated: req.session.isLoggedin
        });
    })
    .catch(err => console.log(err));
 };

 exports.getIndex = (req, res, next) => {
    Product.find()
    .then(products => {
        res.render('shop/index', { 
            prods: products,
            pageTitle: 'Home', 
            pageURL: '/'
         });
    })
    .catch(err => console.log(err)); 
 };

 exports.getCart = (req, res, next) => {
     req.user
     .populate('cart.items.productId')
     .execPopulate()
     .then(user => {
            const cartProducts = user.cart.items;
            res.render("shop/cart", {
            pageTitle: "Cart",
            pageURL: "/cart",
            products: cartProducts,
            isAuthenticated: req.session.isLoggedin
        });
    })
    .catch(err => console.log(err));
};

exports.postCart = (req, res, index) => {
    const productId = req.body.productId;
    Product.findById(productId)
    .then(product => {
        return req.user.addToCart(product)
            .then(result => {
                // console.log(result);
                res.redirect('/cart');
            })
            .catch(err => console.log(err));
    });
};

exports.postCartDelete = (req, res, index) => {
    const productId = req.body.productId;

    req.user.deleteFromCart(productId)
    .then(result => {
        res.redirect('/cart');
    })
    .catch(err => console.log(err));
};

// exports.getCheckout = (req, res, next) => {
//     res.render('shop/checkout',
//     {
//         pageTitle: 'checkout',
//         pageURL: '/checkout'
//     });
// };

exports.postOrder = (req, res, next) => {

    req.user
     .populate('cart.items.productId')
     .execPopulate()
     .then(user => {
         const products = user.cart.items.map(i => {
             return { qty: i.qty, products: { ...i.productId._doc } };
         });
         const order = new Order({
             user: {
                 userId: req.user
             },
             products: products
         });
         order.save();
     })
     .then(result => {
        return req.user.emptyCart();
     })
    .then(result => {
        res.redirect('/orders');
    })
    .catch(err => console.log(err));
};

exports.getOrder = (req, res, next) => {
    Order.find({ 'user.userId': req.user._id })
    .then(orders => {
        res.render('shop/orders',
        {
            pageTitle: 'Your Orders',
            pageURL: '/order',
            orders: orders,
            isAuthenticated: req.session.isLoggedin
        });
    })
    .catch(err => console.log(err));
};


