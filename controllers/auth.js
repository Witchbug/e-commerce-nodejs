const User = require('../model/user');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
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

exports.getReset = (req, res, next) => {
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

exports.postReset = (req, res, next) => {
    crypto.randomBytes(32, (err, buffer) => {
        if(err) {
            console.log(err);
            return res.redirect('/reset');
        }
        const token = buffer.toString('hex');
        User.findOne({ email: req.body.email })
        .then(user => {
            if(!user) {
                req.flash('error', 'This email is not registered!!');
                return res.redirect('/reset');
            }
            user.resetToken = token;
            user.resetTokenExpiration = Date.now() + 3600000;
            return user.save();
        })
        .then(result => {
            res.redirect('/');
            transporter.sendMail({
                to: req.body.email,
                from: 'mamunwitchbug@gmail.com',
                subject: 'Password Reset | Node Shop',
                html: `
                    <p>Please <a href="http://localhost:3000/reset/${token}">Click here</a> to reset your password</p>
                `
            });
        })
        .catch(err => console.log(err));
    });
};

exports.getNewPassword = (req, res, next) => {
    const token = req.params.token;
    User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
    .then(user => {
        let message = req.flash('error');
        if(message.length > 0) {
            message = message[0];
        } else {
            message = null;
        }
        res.render('auth/new-password',
        {
            pageTitle: 'New Password',
            pageURL: '/new-password',
            userId: user._id.toString(),
            passwordToken: token,
            errorMessage: message,
            isError: [],
            oldValue: {
                email: '',
                password: ''
            }
        });
    })
    .catch(err => console.log(err));
};

exports.postNewPassword = (req, res, next) => {
    const newPassword = req.body.password;
    const userId = req.body.userId;
    const passwordToken = req.body.passwordToken;
    let resetUser;

    User.findOne({ resetToken: passwordToken, resetTokenExpiration: { $gt: Date.now() }, _id: userId })
    .then(user => {
        resetUser = user;
        return bcrypt.hash(newPassword, 12);
    })
    .then(hashedPassword => {
        resetUser.password = hashedPassword;
        resetUser.resetToken = undefined;
        resetUser.resetTokenExpiration = undefined;
        return resetUser.save();
    })
    .then(result => {
        res.redirect('/login');
    })
    .catch(err => console.log(err));
};