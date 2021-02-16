const path = require('path');
const rootDir = require('./util/path');

const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoDBSession = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');

// constant values
const MongoDB_URI = 'mongodb://root:root@cluster0-shard-00-00-ri30u.gcp.mongodb.net:27017,cluster0-shard-00-01-ri30u.gcp.mongodb.net:27017,cluster0-shard-00-02-ri30u.gcp.mongodb.net:27017/shopMongoose?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority';
const csrfProtection = csrf();

const app = express();
const sessionStore = new MongoDBSession({
    uri: MongoDB_URI,
    collection: 'session'
});

// Registering Template Engines
app.set('view engine', 'ejs');
app.set('views', 'views');

// importing mongoose
const mongoose = require('mongoose');

// importing models 
const User = require('./model/user');

// importing routes
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

// Body Parser Middleware
app.use(bodyParser.urlencoded({extended: false}));
// making public folder static
app.use(express.static(path.join(rootDir, 'public')));
// initializing session middleware
app.use(session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: sessionStore
}));
app.use(csrfProtection);
app.use(flash());

// importing controllers
const errorController = require('./controllers/error');

// middleware
app.use((req, res, next) => {
    if(!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id)
    .then(user => {
        if(!user) {
            return next();
        }
        req.user = user;
        next();
    })
    .catch(err => {
        throw new Error(err);
    });
});

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedin;
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
// 404 page
app.use(errorController.page404);

mongoose.connect(MongoDB_URI)
    .then(result => {
        app.listen(3000);
        console.log('Database Connected');
    })
    .catch(err => console.log(err));






