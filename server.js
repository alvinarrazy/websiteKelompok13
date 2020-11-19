var MongoClient = require('mongodb').MongoClient;
var objectId = require('mongodb').ObjectID;

var url = "mongodb://localhost:27017/kelompok13db";

var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
var loginToken = false;
var hbs = require('express-handlebars');
var assert = require('assert');

var app = express();

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(path.join(__dirname, '/')));

app.engine('hbs', hbs({ extname: 'hbs', defaultLayout: 'layout', layoutsDir: __dirname + '/views/layouts/' }));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

//Untuk Login-Logout
app.get('/', function (request, response) {
	if (loginToken == true) {
		response.sendFile(path.join(__dirname + '/homepage.html'));
	}

	response.sendFile(path.join(__dirname + '/noLogin.html'));

});

app.get('/loggingout', function (request, response) {
	loginToken = true;
	response.redirect('/');
});

MongoClient.connect(url, function (err, db) {
	if (err) throw err;
});

app.post('/auth', function (request, response) {
	MongoClient.connect(url, function (err, db) {
		var inputid = request.body.adminid;
		var inputpassword = request.body.password;

		console.log(inputid + " " + inputpassword);
		var finding = { ID: inputid, password: inputpassword };
		var dbo = db.db("kelompok13db");
		dbo.collection("adminaccounts").find(finding).toArray(function (err, res) {
			if (res.length > 0) {
				loginToken = true;
				response.sendFile(path.join(__dirname + '/homepage.html'));
				console.log("account found");
			} else {
				response.send("ERROR!");
			}
		});
	});
});

app.post('/createaccount', function (request, response) {
	response.sendFile(path.join(__dirname + '/registration.html'));
});

app.post('/creatingaccount', function (request, response) {
	MongoClient.connect(url, function (err, db) {
		var newname = request.body.fullname;
		var newid = request.body.adminid;
		var newemail = request.body.email;
		var newpassword = request.body.password;
		var confpassword = request.body.confpassword;
		var myobj = { fullname: newname, ID: newid, email: newemail, password: newpassword };
		var dbo = db.db("kelompok13db");
		dbo.collection("adminaccounts").insertOne(myobj, function (err, res) {
			if (err) throw err;
			console.log("1 document inserted");
			db.close();
		});
		if (newpassword == confpassword) {
			response.sendFile(path.join(__dirname + '/login.html'));
		} else {
			this.setCustomValidity("Passwords Don't Match");
		}
	});
});


//Untuk Order
app.get('/orderList/get-data', function (req, res, next) {
	var resultArray = [];
	MongoClient.connect(url, function (err, db) {
		assert.equal(null, err);
		var dbo = db.db("kelompok13db");
		var cursor = dbo.collection('regularorder').find();
		cursor.forEach(function (doc, err) {
			assert.equal(null, err);
			resultArray.push(doc);
		}, function () {
			db.close();
			res.render('index', { items: resultArray });
		});
	});
});

 app.post('/orderList/delete', function(req, res, next) {
 	var id = req.body.id;
  
 	MongoClient.connect(url, function(err, db) {
 	  assert.equal(null, err);
 	  var dbo = db.db("kelompok13db");
 	  dbo.collection('user-data').deleteOne({"_id": id}, function(err, result) {
 		assert.equal(null, err);
		console.log('Item deleted');
 		db.close();
	  });
 	});
   });

app.post('/orderRegular', function (request, response) {
	MongoClient.connect(url, function (err, db) {
		var fullname = request.body.fullname;
		var email = request.body.email;
		var address = request.body.address;
		var quantity = request.body.quantity;
		var total = request.body.total;
		var cardname = request.body.cardname;
		var cardnumber = request.body.cardnumber;
		var myobj = {
			fullname: fullname,
			email: email,
			address: address,
			quantity: quantity,
			total: total,
			cardname: cardname,
			cardnumber: cardnumber,
		};
		var dbo = db.db("kelompok13db");
		dbo.collection("regularorder").insertOne(myobj, function (err, res) {
			if (err) throw err;
			console.log("1 new regular order inserted");
			db.close();
			response.redirect('/');
		});
	});
});


app.listen(3000, () => console.log(__dirname + '/'));