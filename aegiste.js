var express = require ('express');
var app = express();
var config = require ('./webconfigure')


app.set('port', process.env.PORT || 3000);

var handlebars = require('express3-handlebars').create({ 
        defaultLayout:'main',
        helpers: {
            section: function(name, options){
                if(!this._sections) {
                    this._sections = {};
                }
                console.log(options);
                console.log(this);
                this._sections[name] = options.fn(this);
                return null;
            }
        }
    });
    
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
// not allow to send server info for security consideration
app.disable('x-powered-by');

// indicate shared files location
app.use(express.static(__dirname + '/public'));

// config middleware to detect test mode
app.use(function(req, res, next){
    
    //check if this is test mode(page test)
    var testFlag = app.get('env') !== 'production' && req.query.test === '1';
    
    // set page test flag
    res.locals.showTests = testFlag;
    
    // print request headers if in page test mode
    if(testFlag) {
        var s = '';
        for(var name in req.headers){
            s += name + ": " + req.headers[name] + '\n';
        }
        console.log(s);
    }
    
    next();
});


// get metadata information 
app.use(function(req, res, next){
    if(!res.locals.meta) {
        res.locals.meta = {};
    }
    res.locals.meta = config.getConfigure();
    next();
});


// get dummy weather data to test partial view
app.use(function(req, res, next){
    if(!res.locals.partials) {
        res.locals.partials = {};
    }
    res.locals.partials.weather = getWeatherData();
    next();
});


// link body parser for posted form handling
app.use(require('body-parser')());
app.get('/newsletter', function(req, res){
    // Todo: deal with CSRF
    // provide a dummy value
    res.render('newsletter', { csrf: 'CSRF token goes here' });
});
app.post('/process', function(req, res){
    // Todo: store data into db
    console.log('Form (from querystring): ' + req.query.form);
    console.log('CSRF token (from hidden form field): ' + req.body._csrf);
    console.log('Name (from visible form field): ' + req.body.name);
    console.log('Email (from visible form field): ' + req.body.email);
    res.redirect(303, '/thank-you');
});
app.get('/thank-you', function(req, res){
    res.render('thank-you');
});


app.get('/nursery-rhyme',function(req, res) {
    res.render('nursery-rhyme');
});


app.get('/data/nursery-rhyme', function(req,res) {
    res.json({
        animal: 'squirrel',
        bodyPart: 'tail',
        adjective: 'bushy',
        noun: 'heck',
    });
});


app.get('/jquery-test', function(req, res){
    res.render('jquery-test');
});



app.get('/', function(req, res){
    res.render('home');    
//    res.type('text/plain');
//    res.send('Meadowlark Travel');
});



app.get('/about', function(req, res){
    var fortune = require('./lib/fortune');
    res.render('about', {
        fortune: fortune.getFortune(),
        pageTestScript: '/qa/tests-about.js'
    });
});


app.get('/tours/hood-river', function(req, res){
    res.render('tours/hood-river');
});

app.get('/tours/request-group-rate', function(req, res){
    res.render('tours/request-group-rate');
});



app.use(function(req, res, next){
//    res.type('text/plain');
    res.status(404).render('not-found');
//    res.send('404 Error');
});

app.use(function(req, res, next){
    console.error(err.stack);
//    res.type('text/plain');
    res.status(500);
    res.render('500');
//    res.send('500 - Server Error');
});


app.listen(app.get('port'), function(){
    console.log("process.env.PORT: " + process.env.PORT);
    console.log('Express started on http://localhost:' +
        app.get('port') + '; press Ctrl-c to terminate.');
});




// just some dummy data for partial view
function getWeatherData(){
    return {
        locations: [
            {
                name: 'Portland',
                forecastUrl: 'http://www.wunderground.com/US/OR/Portland.html',
                iconUrl: 'http://icons-ak.wxug.com/i/c/k/cloudy.gif',
                weather: 'Overcast',
                temp: '54.1 F (12.3 C)',
            },
            {
                name: 'Bend',
                forecastUrl: 'http://www.wunderground.com/US/OR/Bend.html',
                iconUrl: 'http://icons-ak.wxug.com/i/c/k/partlycloudy.gif',
                weather: 'Partly Cloudy',
                temp: '55.0 F (12.8 C)',
            },
            {
                name: 'Manzanita',
                forecastUrl: 'http://www.wunderground.com/US/OR/Manzanita.html',
                iconUrl: 'http://icons-ak.wxug.com/i/c/k/rain.gif',
                weather: 'Light Rain',
                temp: '55.0 F (12.8 C)',
            },
        ],
    };
}












