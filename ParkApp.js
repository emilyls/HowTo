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

app.post('/Events', function(req, res) {
  var string = ""; 
  if (req.body.event_Id > 0) {
    string += 'parkId=';
    string += req.body.event_Id;
  }
  if (req.body.event_Category > 0) {
    string += 'categoryId=';
    string += req.body.event_Category;
  }
  if (req.body.event_Description) {
    if (string != "") {
      string += '&';
    }
    string += 'descr=';
    string += req.body.event_Description;
  }
  if (req.body.event_DateFrom) {
    if (string != "") {
      string += '&';
    }
    string += 'dateFrom=';
    string += req.body.event_DateFrom;
  }
  if (req.body.event_DateTo) {
    if (string != "") {
      string += '&';
    }
    string += 'dateTo=';
    string += req.body.event_DateTo;
  }
  if (req.body.event_EventId > 0) {
    if (string != "") {
      string += '&';
    }
    string += 'eventId=';
    string += req.body.event_EventId;
  }
console.log(string);
  var url = 'http://oregonstateparks.org/data/index.cfm/parkEvents';
  var options = {
    host: 'oregonstateparks.org',
    path: '/data/index.cfm/parkEvents?' + string 
  };
  callback = function(response) {
    var str = '';
    response.on('data', function (chunk) {
      str += chunk;
    });
    response.on('end', function() {
      var data = JSON.parse(str);
      var context = {};
      var eventList = [];
      for (var i = 0; i < data.length; i++) {
        var eventData = {};
        eventData.description = data[i].event_description;
        eventData.event_id = data[i].park_event_id;
        eventData.park_name = data[i].park_name;
        eventData.id = data[i].park_id;
        eventData.begin = data[i].event_start;
        eventData.end = data[i].event_end;
        eventData.location = data[i].event_location;
        eventData.all_day = data[i].allDay;
        eventData.category = data[i].park_event_category_desr;
        eventData.title = data[i].title;
        eventList.push(eventData);
      }
      context.data = eventList;
      res.render('Events', context);
    });
  }
  http.request(options,callback).end();
});

app.get('/AllFeatures', function(req, res) {
  var url = 'http://oregonstateparks.org/data/index.cfm/features';
  var options = {
    host: 'oregonstateparks.org',
    path: '/data/index.cfm/features'
  };
  callback = function(response) {
    var str = '';
    response.on('data', function (chunk) {
      str += chunk;
    });
    response.on('end', function() {
      var data = JSON.parse(str);
      var features = [];
      for (var i = 0; i < data.length; i++) {
        features.push({'class':data[i].featureClass, 'title': data[i].featureTitle});
      }
      var context = {};
      context.data = features;
      res.render('AllFeatures', context);
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
