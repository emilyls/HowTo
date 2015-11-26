var express = require('express');
var http = require('http');

var app = express();
var handlebars = require('express-handlebars').create({defaultLayout: 'main'});
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.static(__dirname));

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 3000);

app.get('/AllParkData', function(req, res) {
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
        var data = JSON.parse(str);
        
        //var context = [];
        for (var i = 0; i < data.length; i++) {
          //var park = JSON.parse(data[i]);
          console.log(data[i].park_name);
        }
	//console.log(data);
        res.render('AllParkData', data);
      });
    }
    http.request(options,callback).end();
  // }
});

app.get('/home', function(req, res) {
  res.render('Form');
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
