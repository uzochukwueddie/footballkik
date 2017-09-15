const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const http = require('http');
const cookieParser = require('cookie-parser');
const validator = require('express-validator');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const mongoose = require('mongoose');
const flash = require('connect-flash');
const passport = require('passport');
const socketIO = require('socket.io');
const {Users} = require('./helpers/UsersClass');
const {Global} = require('./helpers/Global');
const compression = require('compression');
const helmet = require('helmet');


const container = require('./container');



container.resolve(function(users, _, admin, home, group, results, privatechat, profile, interests, news){
    
    mongoose.Promise = global.Promise;
//    mongoose.connect('mongodb://adminfootball:adminfootballkik@ds137464.mlab.com:37464/footballkik', {useMongoClient: true});
    mongoose.connect(process.env.MONGODB_URI, {useMongoClient: true});
    
    const app = SetupExpress();
    
    function SetupExpress(){
        const app = express();
        const server = http.createServer(app);
        const io = socketIO(server);
        server.listen(process.env.PORT || 3000, function(){
            console.log('Listening on port 3000');
        });
        ConfigureExpress(app);
        
        require('./socket/groupchat')(io, Users);
        require('./socket/friend')(io);
        require('./socket/globalroom')(io, Global, _);
        require('./socket/privatemessage')(io);
        
        //Setup router
        const router = require('express-promise-router')();
        users.SetRouting(router);
        admin.SetRouting(router);
        home.SetRouting(router);
        group.SetRouting(router);
        results.SetRouting(router);
        privatechat.SetRouting(router);
        profile.SetRouting(router);
        interests.SetRouting(router);
        news.SetRouting(router);

        app.use(router);
        
        app.use(function(req, res){
            res.render('404');
        });
    }
    
    
    
    function ConfigureExpress(app){
        
        app.use(compression());
        app.use(helmet());
        
        
        require('./passport/passport-local');
        require('./passport/passport-facebook');
        require('./passport/passport-google');
        
        
        
        app.use(express.static('public'));
        app.use(cookieParser());
        app.set('view engine', 'ejs');
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({extended: true}));
        
        app.use(validator());
        
        app.use(session({
//            secret: process.env.SECRET_KEY,
            secret: 'thisisasecret',
            resave: false,
            saveUninitialized: false,
            store: new MongoStore({mongooseConnection: mongoose.connection})
        }));
        
        app.use(flash());
        
        app.use(passport.initialize());
        app.use(passport.session());
        
        app.locals._ = _;
        
    }
    
});


















