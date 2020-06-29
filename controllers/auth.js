const User = require('../model/user');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const { validationResult } = require('express-validator/check');

const transporter = nodemailer.createTransport(sendgridTransport({
    auth: {
        api_key: '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'
    }
}));

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
        errorMessage: message,
        isError: [],
        oldValue: {
            email: '',
            password: ''
        }
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
            errorMessage: error.array()[0].msg,
            isError: error.array(),
            oldValue: {
                email: email,
                password: password
            }
        });
    }

    User.findOne({ email: email })
        .then(user => {
            if(!user) {
                return res.status(422).render('auth/login', {
                    pageTitle: 'Login',
                    pageURL: '/login',
                    errorMessage: 'This Email is not registerd!!',
                    isError: [{ param: 'email' }],
                    oldValue: {
                        email: email,
                        password: password
                    }
                });
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
                return res.status(422).render('auth/login', {
                    pageTitle: 'Login',
                    pageURL: '/login',
                    errorMessage: 'Wrong Password!!',
                    isError: [{ param: 'password' }],
                    oldValue: {
                        email: email,
                        password: password
                    }
                });
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
            res.redirect('/login');
            return transporter.sendMail({
                to: email,
                from: 'mamunwitchbug@gmail.com',
                subject: 'Registration Completed',
                html: '<h1>Your Registration has been completed. Welcome to Nodejs Shop</h1>'
            });
        })
        .catch(err => console.log(err));
    })
    .catch(err => console.log(err));
};

exports.resetPassword = (req, res, next) => {
    let message = req.flash('error');
    if(message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    res.render('auth/reset',
    {
        pageTitle: 'Reset Password',
        pageURL: '/reset',
        errorMessage: message,
        isError: [],
        oldValue: {
            email: '',
            password: ''
        }
    });
};