'use strict';

module.exports = function(_, passport, User, validator){
    
    return {
        SetRouting: function(router){
            router.get('/', this.indexPage);
            router.get('/signup', this.getSignUp);
            router.get('/auth/facebook', this.getFacebookLogin);
            router.get('/auth/facebook/callback', this.facebookLogin);
            router.get('/auth/google', this.getGoogleLogin);
            router.get('/auth/google/callback', this.googleLogin);
            
            
            // router.post('/', User.LoginValidation, this.postLogin);
            router.post('/', [
                validator.check('email').not().isEmpty().isEmail()
                    .withMessage('Email is invalid'),
                validator.check('password').not().isEmpty()
                    .withMessage('Password is required and must be at least 5 characters.'),
            ], this.postValidation, this.postLogin);
            // router.post('/signup', User.SignUpValidation, this.postSignUp);
            router.post('/signup', [
                validator.check('username').not().isEmpty().isLength({min: 5}).withMessage('Username is required and must be at least 5 characters.'),
                validator.check('email').not().isEmpty().isEmail()
                    .withMessage('Email is invalid'),
                validator.check('password').not().isEmpty()
                    .withMessage('Password is required and must be at least 5 characters.'),
            ], this.postValidation, this.postSignUp);
        },
        
        indexPage: function(req, res){
            const errors = req.flash('error');
            return res.render('index', {title: 'Footballkk | Login', messages: errors, hasErrors: errors.length > 0});
        },
        
        postLogin: passport.authenticate('local.login', {
            successRedirect: '/home',
            failureRedirect: '',
            failureFlash: true
        }),
        
        getSignUp: function(req, res){
            const errors = req.flash('error');
            return res.render('signup', {title: 'Footballkk | SignUp', messages: errors, hasErrors: errors.length > 0});
        },

        postValidation: function(req, res, next) {
            const err = validator.validationResult(req);
            const reqErrors = err.array();
            const errors = reqErrors.filter(e => e.msg !== 'Invalid value');
            let messages = [];
            errors.forEach((error) => {
                messages.push(error.msg);
            });
            // req.flash('error', messages);
            if (messages.length > 0) {
                req.flash('error', messages);
                if (req.url === '/signup') {
                    res.redirect('/signup');
                } else if(req.url === '/') {
                    res.redirect('/');
                }
            }
            return next();
        },
        
        postSignUp: passport.authenticate('local.signup', {
            successRedirect: '/home',
            failureRedirect: '',
            failureFlash: true
        }),
        
        getFacebookLogin: passport.authenticate('facebook', {
           scope: 'email' 
        }),
        
        getGoogleLogin: passport.authenticate('google', {
            scope: ['https://www.googleapis.com/auth/plus.login', 'https://www.googleapis.com/auth/plus.profile.emails.read']
        }),
        
        googleLogin: passport.authenticate('google', {
            successRedirect: '/home',
            failureRedirect: '/signup',
            failureFlash: true
        }),
        
        facebookLogin: passport.authenticate('facebook', {
            successRedirect: '/home',
            failureRedirect: '/signup',
            failureFlash: true
        })
    }
    
}















