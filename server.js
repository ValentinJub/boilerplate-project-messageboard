'use strict';
require('dotenv').config();
const express     = require('express');
const bodyParser  = require('body-parser');
const cors        = require('cors');
const expressLayouts = require('express-ejs-layouts');
const methodOverride = require('method-override');


const threadsRouter = require('./routes/threads.js');
const fccTestingRoutes  = require('./routes/fcctesting.js');
const runner            = require('./test-runner');
const mongoose          = require('mongoose');
const helmet            = require('helmet');

const app = express();

mongoose.connect(process.env.DB).then(
  () => { console.log('Connected to database')},
  (err) => { console.log('Error connecting to database', err)}
);

app.use(cors({origin: '*'})); //For FCC testing purposes only
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var path = require ('path');
app.use(express.static(path.join(__dirname + '../public')));

app.set('view engine', 'ejs');
app.set('views, __dirname + ./views');
app.set('layout', 'layouts/layout');
app.use(expressLayouts);
app.use(methodOverride('_method'));




//Sample front-end
app.route('/b/:board/')
  .get(function (req, res) {
    res.render('board');
  });

app.route('/b/:board/:threadid')
  .get(function (req, res) {
    res.render('thread')
  });

//Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.render('index');
  });

//For FCC testing purposes
fccTestingRoutes(app);

//Routing for API 
app.use('/api/threads', threadsRouter)




//404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

//Start our server and tests!
const listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
  if(process.env.NODE_ENV==='test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch(e) {
        console.log('Tests are not valid:');
        console.error(e);
      }
    }, 1500);
  }
});

module.exports = app; //for testing
