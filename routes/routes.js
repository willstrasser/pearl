var request = require('request');
var mongoosePages = require('mongoose-pages');
var cities = require('cities');

module.exports = function(express, app, passport, config, mongoose){
	var router = express.Router();
	router.get('/login',function(req,res,next){
		res.render('index',{config:config});
	})

	function securePages(req,res,next){
		if(req.isAuthenticated()){
			next();
		}
		else{
			res.redirect('/login');
		}
	}

	router.get('/auth/facebook',passport.authenticate('facebook'));
	router.get('/auth/facebook/callback',passport.authenticate('facebook', {
		successRedirect:'/',
		failureRedirect:'/login'
	}));

	router.get('/', securePages, function(req, res, next) {
		var url = require('url');
		var url_parts = url.parse(req.url, true);
		var query = url_parts.query;

		request('http://'+req.headers.host+'/db/advance', function(error,response,body){
		  if (!error && response.statusCode == 200) {
		  	res.render('feed', { funds:response.body, query:JSON.stringify(query)});
		  }
		})
	});

	router.get('/logout', function(req, res, next){
		req.logout();
		res.redirect('/login');
	})

	var advanceSchema = mongoose.Schema({
		fundId: Number,
		fundLegId: Number,
		fundDate: String,
		merchId: Number,
		term: Number,
		factorPnt: Number,
		fundedAmount: Number,
		paybackAmount: Number,
		status: String,
		zipCode: Number,
		sector: String,
		industry: String
	},{collection:'fundings'});

	mongoosePages.anchor(advanceSchema);
	var docsPerPage = 10;

	var Advance = mongoose.model('Advance', advanceSchema);


	var paymentSchema = mongoose.Schema({
		paymentId: Number,
		fundId: Number,
		merchId: Number,
		systemDate: String,
		pmtCode: String,
		achCode: String,
		amount: Number,
	},{collection:'payments2'});
	var Payment = mongoose.model('Payment', paymentSchema);

	router.get('/db/advance', function(req, res, next) {
		var url = require('url');
		var url_parts = url.parse(req.url, true);
		var query = url_parts.query;

		var nextId = query.nextAnchorId;
		query.nextAnchorId=null;
		Advance.findPaginated(query, function (err, result) {
			if (err) throw err;
			for (var i = 0; i < result.documents.length; i++) {
				var doc = result.documents[i];
				if(doc.zipCode){
					locData = cities.zip_lookup(doc.zipCode);
					 if(locData && locData.city && locData.state_abbr) doc.locStr = locData.city+', '+locData.state_abbr;
				}
				else{
					doc.locStr = "";
				}
			};
			res.json(result);
		}, 30, nextId).setOptions({ lean: true });
	});

	router.get('/db/advance/all', function(req, res, next) {
		var q = Advance.find({});
		q.exec(function (err, docs) {
			res.json(docs);
		});
	});

	router.get('/db/payments', function(req, res, next) {
		var url = require('url');
		var url_parts = url.parse(req.url, true);
		var query = url_parts.query;

		var q = Payment.find({fundId:query.fundId}).sort({ systemDate: 1 });

		q.exec(function (err, docs) {
			res.json(docs);
		});
	});
	
	router.get('/advances', function(req, res, next) {
		res.render('advances', { title: 'Advances' });
	});

	app.use('/', router);
}