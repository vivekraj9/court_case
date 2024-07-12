const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const flash = require('connect-flash');

const session = require('express-session');
const passport = require('passport');
const express = require('express');
const app = express();
//Hello vivek here
//HII
//passport config
require('./config/passport')(passport);

//db config
// const db = require('./config/keys').MongoURI; //for MongoDB Atlas
//const db = 'mongodb://127.0.0.1:27017/court_case_management' //for local MongoDB
//hello
mongoose.connect('mongodb+srv://vivekraj:vivekraj@cluster0.jpx9lxm.mongodb.net/court_case', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})

const dbConnection = mongoose.connection;


dbConnection.on('connected', () => {
    console.log('MongoDB connected successfully!');
});

dbConnection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});
//db connection
// mongoose.connect
//     (
//         db,
//         {
//             useNewUrlParser: true,
//             useUnifiedTopology: true
//         }
//     ).then
//     (
//         () => console.log('MongoDB Atlas connected...')
//         //() => console.log('MongoDB Local connected...')
//     ).catch
//     (
//         (err) => console.log(err)
//     );

//middleware

app.use(express.static(__dirname + '/public'));
/*ejs*/
app.use(expressLayouts);
app.set('view engine', 'ejs');
/*body parser*/
app.use(express.urlencoded({ extended: false }));
/*express session*/
app.use
    (
        session
            (
                {
                    secret: require('./config/secret.js').secret,
                    resave: true,
                    saveUninitialized: true
                }
            )
    );
/*passport - required for log in (authentication) - the position of these 2 lines matter. They should be below the session...*/
app.use(passport.initialize());
app.use(passport.session());
/*connect flash*/
app.use(flash());
/*Global var middleware for diff colours for diff msgs (error msgs, flash msgs, etc)*/
app.use
    (
        (req, res, next) => {
            res.locals.success_msg = req.flash('success_msg');
            res.locals.error_msg = req.flash('error_msg');
            res.locals.error = req.flash('error');
            next();
        }
    );

//Routes
app.use('/', require('./routes/index.js'));
app.use('/client', require('./routes/client.js'));
app.use('/lawyer', require('./routes/lawyer.js'));
app.use('/chat', require('./routes/chat.js'));


const PORT = process.env.PORT || 5000;
app.listen
    (
        PORT,
        (err) => {
            if (err)
                throw err;

            console.log(`Server started on PORT ${PORT}...`);
        }
    );
