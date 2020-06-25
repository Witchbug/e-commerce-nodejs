const User = require('../model/user');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
// const sendgridTransport = require('nodemailer-sendgrid-transport');
const { validationResult } = require('express-validator/check');

// const transporter = nodemailer.createTransport(sendgridTransport());

exports.getLogin = (req, res, next) => {
    let message = req.flash('error');
    if(message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    res.render('auth/login',
    {
        pageTitle: 'Login',
        pageURL: '/login',
        errorMessage: message
    });
};

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const error = validationResult(req);

    if(!error.isEmpty()) {
        return res.status(422).render('auth/login', {
            pageTitle: 'Login',
            pageURL: '/login',
            errorMessage: error.array()[0].msg
        });
    }

    User.findOne({ email: email })
        .then(user => {
            if(!user) {
                req.flash('error', 'Invalid Email!!');
                return res.redirect('/login');
            }
            bcrypt.compare(password, user.password)
            .then(matched => {
                if(matched) {
                    req.session.isLoggedin = true;
                    req.session.user = user;
                    return req.session.save(() => {
                            res.redirect('/');
                        });
                }
                req.flash('error', 'Password doesn\'t match!!');
                res.redirect('/login');
            })
            .catch(err => {
                console.log(err);
                res.redirect('/login');
            });
        })
        .catch(err => console.log(err));
      
};

exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        console.log(err);
        res.redirect('./');
    });
};

exports.getSignup = (req, res, next) => {
    let message = req.flash('error');
    if(message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    res.render('auth/signup', {
        pageTitle: 'Signup',
        pageURL: '/signup',
        errorMessage: message,
        oldValue : {
            email : ''
        },
        isError: []
    });
};

exports.postSignup = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        return res.status(422).render('auth/signup', {
            pageTitle: 'Signup',
            pageURL: '/signup',
            errorMessage: errors.array()[0].msg,
            oldValue : {
                email : email
            },
            isError : errors.array()
        });
    }


    bcrypt.hash(password, 12)
    .then(hashPassword => {
        const user = new User({
            email: email,
            password: hashPassword,
            cart: { items: [] }
        });
        user.save()
        .then(result => {
            return res.redirect('/login');
        });
    });
};