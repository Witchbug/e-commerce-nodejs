const express = require('express');
const User = require('../model/user');

const { check, body } = require('express-validator/check');
 
const authController = require('../controllers/auth');

const router = express.Router();

router.get('/login', authController.getLogin);
router.post('/logout', authController.postLogout);
router.get('/signup', authController.getSignup);
router.post('/login',
    [
        body('email')
            .isEmail()
            .withMessage('Please Enter a valid Email.')
            .normalizeEmail(),
        body('password', 'Password must be at least 5 alphanumeric character.')
            .isLength({ min: 5 })
            .isAlphanumeric()
            .trim()
    ],
    authController.postLogin
);

router.post('/signup',
    [
        check('email')
        .isEmail()
        .custom((value, { req }) => {
            return User.findOne({ email: value })
                .then(user => {
                    if(user) {
                        return Promise.reject('This email has been already Registerd. Please try another email address.');
                    }
                });
        })
        .normalizeEmail(),
        body('password', 'Please enter at least 6 alphanumeric value!!')
        .isLength({ min: 5 })
        .isAlphanumeric()
        .trim(),
        body('confirmPassword').custom((value, { req }) => {
            if(value !== req.body.password) {
                throw new Error('Password dosn\'t match');
            }
            return true;
        })
        .trim()
    ],
    authController.postSignup
);

router.get('/reset', authController.resetPassword);

module.exports = router;

