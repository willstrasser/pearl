var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var cities = require('cities');

mongoose.connect('mongodb://pearluser:QXk-8Ed-8Ur-wzd@ds061741.mongolab.com:61741/pearl');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
	console.log('connected');
});

var mongoosePages = require('mongoose-pages');

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


router.get('/', function(req, res, next) {
	var url = require('url');
	var url_parts = url.parse(req.url, true);
	var query = url_parts.query;

	var q = Advance.find({ }).limit(1).skip(query.skip);

	q.exec(function (err, docs) {
		res.json(docs[0]);
	});
});

router.get('/advance', function(req, res, next) {
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

router.get('/payments', function(req, res, next) {
	var url = require('url');
	var url_parts = url.parse(req.url, true);
	var query = url_parts.query;

	var q = Payment.find({fundId:query.fundId}).sort({ systemDate: 1 });

	q.exec(function (err, docs) {
		res.json(docs);
	});
});

module.exports = router;