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

app.get('/home', function(req, res) {
  res.render('Form');
});

app.get('/AllParkData', function(req, res) {
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
      var parks = [];
      for (var i = 0; i < data.length; i++) {
        parks.push({'name':data[i].park_name, 'id': data[i].park_id});
      }
      var context = {};
      context.data = parks;
      res.render('AllParkData', context);
    });
  }
  http.request(options,callback).end();
});

app.post('/ParkPhotos', function(req, res) {
  
  var url = 'http://oregonstateparks.org/data/index.cfm/parkPhotos';
  var options = {
    host: 'oregonstateparks.org',
    path: '/data/index.cfm/parkPhotos?parkId=' + req.body.photos_Id 
  };
  callback = function(response) {
    var str = '';
    response.on('data', function (chunk) {
      str += chunk;
    });
    response.on('end', function() {
      var data = JSON.parse(str);
      var photos = [];
      for (var i = 0; i < data.length; i++) {
        var thumbnail = data[i].thumbFile.replace(/ /g,'%20');
        var image = data[i].imageFile.replace(/ /g,'%20');
        photos.push({'thumb': thumbnail, 'image': image});
      }
      var context = {};
      context.data = photos;
      context.id = req.body.photos_Id;
      res.render('ParkPhotos', context);
    });
  }
  http.request(options,callback).end();
});

app.post('/ParkFeatures', function(req, res) {
  var string = ""; 
  if (req.body.features_Id > 0) {
    string += 'parkId=';
    string += req.body.features_Id;
  }
  if (req.body.features_Name) {
    if (string != "") {
      string += '&';
    }
    string += 'parkName=';
    string += encodeURI(req.body.features_Name);
  }
  if (req.body.features_Titles) {
    if (string != "") {
      string += '&';
    }
    string += 'iconTitles=';
    string += encodeURI(req.body.features_Titles);
  }
  if (req.body.features_Class) {
    if (string != "") {
      string += '&';
    }
    string += 'iconClasses=';
    string += encodeURI(req.body.features_Classes);
  }
console.log(string);
  var url = 'http://oregonstateparks.org/data/index.cfm/parkFeatures';
  var options = {
    host: 'oregonstateparks.org',
    path: '/data/index.cfm/parkFeatures?' + string 
  };
  callback = function(response) {
    var str = '';
    response.on('data', function (chunk) {
      str += chunk;
    });
    response.on('end', function() {
      var data = JSON.parse(str);
      var context = {};
      var parks = [];
      for (var i = 0; i < data.length; i++) {
	var park = {};
        var features = [];
        park.latitude = data[i].park_latitude;
        park.longitude = data[i].park_longitude;
        park.name = data[i].park_name;
        park.id = data[i].park_id;
        park.ada = data[i].ada;
        features.push({'class': data[i].featureClass, 'title': data[i].featureTitle});
        while (i < data.length - 1 && data[i+1].park_id == data[i].park_id) {
          features.push({'class': data[i+1].featureClass, 'title': data[i+1].featureTitle});
          i++;
        }
        park.features = features;
        parks.push({'park': park});	
      }
      context.ParkList = parks;
      res.render('ParkFeatures', context);
    });
  }
  http.request(options,callback).end();
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
