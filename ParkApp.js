var express = require('express');
var http = require('http');

var app = express();
var handlebars = require('express-handlebars').create({defaultLayout: 'main'});
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 3000);

app.get('/home', function(req, res) {
  res.render('Form');
});

app.get('/results?', function(req, res) {
  // if(req.body['All Parks']){
    var url = 'http://oregonstateparks.org/data/index.cfm/parks';
    var options = {
      host: 'oregonstateparks.org',
      path: '/data/index.cfm/parks'
    };
    callback = function(response) {
      var str = '';
      response.on('data', function (chunk) {
        str += chunk;
      });
      response.on('end', function() {
        var data = JSON.parse(JSON.stringify(str));
//        context.data = data;
  console.log(data);
      });
    }
    http.request(options,callback).end();
  // }
});

app.use(function(req,res){
  res.type('text/plain');
  res.status(404);
  res.send('404 - Not Found');
});


app.use(function(err, req, res, next){
  console.error(err.stack);
  res.type('plain/text');
  res.status(500);
  res.send('500 - Server Error');
});

app.listen(app.get('port'), function(){
console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});
