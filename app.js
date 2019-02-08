var http = require('http');
var request = require('request');
var url = require('url');
var geohash = require('ngeohash');
var express = require('express');

/*
	initialize variables and functions
*/
var apikey_ticketmaster = "StLIqt2loYN6iRMBLpABkZdIqUiig5MP";
var apikey_google = "AIzaSyBFW5i_f3ibT4moQsKTXpdA6cJakYMIjOY";
var engineId = "010032055342455600980:jnxccfxrbwk";
var engineKey = "AIzaSyAvnfp8WYPgUywymcClyMFn62LRpWkV0ho";
var apikey_songkick = "uhZ9jxqn1IWqFSnx";

function setDate(date) {
	if(date == "01") return "Jan ";
	if(date == "02") return "Feb ";
	if(date == "03") return "Mar ";
	if(date == "04") return "Apr ";
	if(date == "05") return "May ";
	if(date == "06") return "June ";
	if(date == "07") return "July ";
	if(date == "08") return "Aug ";
	if(date == "09") return "Sept ";
	if(date == "10") return "Otc ";
	if(date == "11") return "Nov ";
	if(date == "12") return "Dec ";
	return "Dec";
}

function isEmptyObject(obj) {
	for(var key in obj){
		return false;
	}
	return true;
}

function checkUndefined(data) {
	return typeof(data) == "undefined" ? true : false;
}


/*
	business starts
*/
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

var app = express();
app.use(express.static(__dirname+'/public')); // set frontend files(html,css,js) as static files
var server = app.listen(8081, function(){
	console.log("build server successfully");
});


/*
	return eventsSearch json
*/
app.get('/eventsSearch', function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Content-type', 'application/json; charset=utf-8');
	var urlObj = url.parse(req.url, true);

	var keyword = urlObj['query']['keyword'].replace(/(^\s*)|(\s*$)/g, "").replace(/\s+/g,"+");
	var segmentId = urlObj['query']['segmentId'];
	var radius = urlObj['query']['radius'];
	var unit = urlObj['query']['unit'].toLowerCase()=="kilometers" ? "km" : urlObj['query']['unit'].toLowerCase();
	if(urlObj['query']['from'] === 'location') {
		var url_geocoding = "https://maps.googleapis.com/maps/api/geocode/json?address="+ urlObj['query']['location'].replace(/(^\s*)|(\s*$)/g, "").replace(/\s+/g,"+") +"+&key="+ apikey_google;
		
		request(url_geocoding, function(error, response, body){
	  		if (!error && response.statusCode == 200) {
	  			lat = JSON.parse(body)['results'][0]['geometry']['location']['lat'];
	  			lon = JSON.parse(body)['results'][0]['geometry']['location']['lng'];
				geoPoint = geohash.encode(lat,lon);
	  			searchEvents();
	  		} else {
		  		console.log("failed to request ajax of geocoding");
	  		}
		});
	} else {
		lat = urlObj['query']['lat'];
		lon = urlObj['query']['lon'];
		geoPoint = geohash.encode(lat,lon);
		searchEvents();
	}

	// define a function of searching events
	function searchEvents(){
		var jsonSearchEvents = [];
		var url_eventsSearch = "https://app.ticketmaster.com/discovery/v2/events.json?sort=date,asc&apikey="+ apikey_ticketmaster +"&keyword="+ keyword +"&segmentId="+ segmentId +"&radius="+ radius +"&unit="+ unit +"&geoPoint="+ geoPoint;
		console.log(url_eventsSearch);
		request(url_eventsSearch ,async function (error, response, body) {
			await delay(1001);
		  	if (!error && response.statusCode == 200) {
			    var json = JSON.parse(body);
				if(typeof(json['_embedded']) == 'undefined') { //no search results
					res.end(JSON.stringify(jsonSearchEvents));
				} else {
					var events = json['_embedded']['events'];
					for(var i = 0; i < events.length; i++) {
						var date = events[i]['dates']['start']['localDate'];
						// console.log(date);
						var name = events[i]['name'];
						var category = ((typeof(events[i]['classifications'][0]['genre'])=='undefined' || events[i]['classifications'][0]['genre']['name']=="Undefined") ? "" : events[i]['classifications'][0]['genre']['name'] + "-") + ((typeof(events[i]['classifications'][0]['segment'])=='undefined' || events[i]['classifications'][0]['segment']['name']=="Undefined") ? '' : events[i]['classifications'][0]['segment']['name'] + "-"); 
						category = category.substr(0, category.length-1);
						var venueInfo = events[i]['_embedded']['venues'][0]['name'];
						var id = events[i]['id'];
						var artistTeam = "";
						if(typeof(events[i]['_embedded']['attractions']) != "undefined") {
							for(var j = 0; j < events[i]['_embedded']['attractions'].length; j++) {
								artistTeam += events[i]['_embedded']['attractions'][j]['name'] + " | ";
							}
						}
						artistTeam = artistTeam.substr(0, artistTeam.length-2);
						var obj = {
							date : date,
							name : name,
							category : category,
							venueInfo : venueInfo,
							id : id,
							artistTeam : artistTeam
						}
						jsonSearchEvents.push(obj);
					}
					var result = {"results" : jsonSearchEvents};
					res.end(JSON.stringify(result)); //return a json-format string
				}	
		  	} else {
		  		res.end(JSON.stringify("['error']")); // failed to get response
		  		console.log("failed to request ajax of eventsSearch");
		  	}
		});
	}
	return
});


/*
	return eventsDetails json	
*/
app.get('/eventsDetails', function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Content-type', 'application/json; charset=utf-8');
	var urlObj = url.parse(req.url, true);

	var url_eventsDetails = "https://app.ticketmaster.com/discovery/v2/events/"+ urlObj['query']['id'] +"?apikey="+ apikey_ticketmaster;
	console.log(url_eventsDetails);
	request(url_eventsDetails, async function(error, response, body) {
		await delay(1001);
		if(!error && response.statusCode == 200) {
			var jsonEventsDetails = [];
			var json = JSON.parse(body);
			var name = json['name'];
			var artistTeam = "";
			if(typeof(json['_embedded']['attractions']) != "undefined") {
				for(var i = 0; i < json['_embedded']['attractions'].length; i++) {
					artistTeam += json['_embedded']['attractions'][i]['name'] + " | ";
				}
			}
			artistTeam = artistTeam.substr(0, artistTeam.length-2);
			var venue = json['_embedded']['venues'][0]['name'];
			var time = (typeof(json['dates']['start']['localDate'])=='undefined' ? "" : json['dates']['start']['localDate']) + " " + (typeof(json['dates']['start']['localTime'])=='undefined' ? "" : json['dates']['start']['localTime']);
			var category = ((typeof(json['classifications'][0]['genre'])=='undefined' || json['classifications'][0]['genre']['name'] == "Undefined") ? "" : json['classifications'][0]['genre']['name'] + " | ") + ((typeof(json['classifications'][0]['segment'])=='undefined' || json['classifications'][0]['segment']['name']=='Undefined') ? '' : json['classifications'][0]['segment']['name'] + " | "); 
			category = category.substr(0, category.length-2);
			var priceRange = "";
			if(!checkUndefined(json['priceRanges']) && !checkUndefined(json['priceRanges'][0])) {
				if(!checkUndefined(json['priceRanges'][0]['min'])) {
					priceRange = "$" + json['priceRanges'][0]['min'];
				}
				if(!checkUndefined(json['priceRanges'][0]['max'])) {
					if(priceRange == "") {
						priceRange = "$" + json['priceRanges'][0]['max'];
					} else {
						priceRange += " ~ $" + json['priceRanges'][0]['max'];
					}
				}
			}
			var ticketStatus = json['dates']['status']['code'];
			var buyTicketAt = json['url'];
			var seatmap = typeof(json['seatmap']) == 'undefined' ? '' : json['seatmap']['staticUrl'];
			var url = checkUndefined(json['url']) ? "" : json['url'];
			var obj = {
				name : name,
				artistTeam : artistTeam,
				venue : venue,
				time : time,
				category : category,
				priceRange : priceRange,
				ticketStatus : ticketStatus,
				buyTicketAt : buyTicketAt,
				seatmap : seatmap,
				url : url
			};
			jsonEventsDetails.push(obj);
			var result = {"results" : jsonEventsDetails}
			res.end(JSON.stringify(result));
		} else {
		  	res.end(JSON.stringify("['error']")); // failed to get response
		  	console.log("failed to request ajax of eventsDetails");
		}
	});
	return
});


/*
	return artist teams json
*/
app.get('/artistTeams/others', function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Content-type', 'application/json; charset=utf-8');
	var urlObj = url.parse(req.url, true);

	// var jsonArtistTeams = [];
	var jsonArtistTeams = {};
	if(req.url.indexOf("/artistTeams/music") == 0) { // use spodify API
		res.end(JSON.stringify(jsonArtistTeams));
	} else { // use google custom API
		var artistTeam = urlObj['query']['artistTeam'].split("|");
		var id = 0;
		for(var i = 0; i < artistTeam.length; i++) {
			var url_artistTeam = "https://www.googleapis.com/customsearch/v1?q="+ artistTeam[i].replace(/(^\s*)|(\s*$)/g, "").replace(/\s+/g,"+") +"&cx="+ engineId +"&imgSize =huge&imgType=news&num=8&searchType=image&key="+ apikey_google;
			// console.log(url_artistTeam);
			request(url_artistTeam, function(error, response, body){
				if(!error && response.statusCode == 200) {
					var json = JSON.parse(body);
					var images = [];
					for(var j = 0; j < json['items'].length; j++) {
						images.push(json['items'][j]['link']);
					}
					// artist = "artist"+id;
					// var obj = {};
					// obj[artist] = json['queries']['request'][0]['searchTerms'];
					// jsonArtistTeams.push(obj);
					var key = json['queries']['request'][0]['searchTerms'];
					jsonArtistTeams[key] = images;
					id++;
					if(id == i) { //key: Id is a flag to indicate to return json file to the front-end while id == times of the loop
						res.end(JSON.stringify(jsonArtistTeams));
					}
				} else {
		  			res.end(JSON.stringify("['error']")); // failed to get response
		  			console.log("failed to request ajax of artistTeams");
				}
			});
		}
	}
	return
});


/*
	return venue json
*/
app.get('/venue', function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Content-type', 'application/json; charset=utf-8');

	var urlObj = url.parse(req.url, true);
	var jsonVenue = [];
	var keyword = urlObj['query']['name'].replace(/(^\s*)|(\s*$)/g, "").replace(/\s+/g,"+");
	var url_venue = "https://app.ticketmaster.com/discovery/v2/venues?apikey="+ apikey_ticketmaster +"&keyword="+keyword;
	// console.log(url_venue);
	request(url_venue, async function(error, response, body){
		await delay(1001);
		if(!error && response.statusCode == 200) {
			var json = JSON.parse(body);
			if(typeof(json['_embedded']) == "undefined" || typeof(json['_embedded']['venues']) == "undefined" || typeof(json['_embedded']['venues'][0]) == "undefined") { // no venue details
				res.end(jsonVenue);
				return
			}
			var venue = json['_embedded']['venues'][0];
			var address = typeof(venue['address']) == "undefined" ? "" : typeof(venue['address']['line1']) == "undefined" ? "" : venue['address']['line1'];
			var city = (typeof(venue['city']) == "undefined" ? "" : venue['city']['name'] + ", ") + (typeof(venue['state']) == "undefined" ? "" : venue['state']['name'] + ", ");
			city = city == "" ? "" : city.substr(0, city.length-2);
			var phoneNumber = typeof(venue['boxOfficeInfo']) == "undefined" ? "" : typeof(venue['boxOfficeInfo']['phoneNumberDetail']) == "undefined" ? "" : venue['boxOfficeInfo']['phoneNumberDetail'];
			var openHours = typeof(venue['boxOfficeInfo']) == "undefined" ? "" : typeof(venue['boxOfficeInfo']['openHoursDetail']) == "undefined" ? "" : venue['boxOfficeInfo']['openHoursDetail'];
			var generalRule = typeof(venue['generalInfo']) == "undefined" ? "" : venue['generalInfo']['generalRule'] == "undefined" ? "" : venue['generalInfo']['generalRule'];
			var childRule = typeof(venue['generalInfo']) == "undefined" ? "" : venue['generalInfo']['childRule'] == "undefined" ? "" : venue['generalInfo']['childRule'];
			var lat = typeof(venue['location']) == "undefined" ? "" : venue['location']['latitude'];
			var lon = typeof(venue['location']) == "undefined" ? "" : venue['location']['longitude'];
			var obj = {
				address : address,
				city : city,
				phoneNumber : phoneNumber,
				openHours : openHours,
				generalRule : generalRule,
				childRule : childRule,
				lat : lat,
				lon : lon
			};
			jsonVenue.push(obj);
			var result = {"results" : jsonVenue}
			res.end(JSON.stringify(result));
		} else {
		  	res.end(JSON.stringify("['error']")); // failed to get response
  			console.log("failed to request ajax of venue");
		}
	});
	return
});


/*
	return coming events json
*/
app.get('/upcomingEvents', function(req, res) {
	console.log(1);
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Content-type', 'application/json; charset=utf-8');

	var urlObj = url.parse(req.url, true);
	var keyword = urlObj['query']['name'].replace(/(^\s*)|(\s*$)/g, "").replace(/\s+/g,"+");
	var url_getVenueId = "https://api.songkick.com/api/3.0/search/venues.json?query="+ keyword +"&apikey="+ apikey_songkick;
	// console.log(url_getVenueId);
	request(url_getVenueId, function(error, response, body) { // request for venue id
		if(!error && response.statusCode == 200) {
			var json = JSON.parse(body);
			if(isEmptyObject(json['resultsPage']['results']) || json['resultsPage']['status'] != "ok"){ // no return for upcoming events as no id
				res.end("[]");
				return
			}
			var venueId = json['resultsPage']['results']['venue'][0]['id'];
			var url_upcomingEvents = "https://api.songkick.com/api/3.0/venues/"+ venueId +"/calendar.json?apikey="+ apikey_songkick;
			// console.log(url_upcomingEvents);
			request(url_upcomingEvents, function(error, response, body) { // reqeust for upcoming events
				if(!error && response.statusCode == 200) {
					var jsonUpcomingEvents = [];
					var json = JSON.parse(body);
					if(json['resultsPage']['status'] != "ok" || isEmptyObject(json['resultsPage']['results'])) {
						res.end(JSON.stringify(jsonUpcomingEvents));
					} else {
						var events = json['resultsPage']['results']['event'];
						for(var i = 0; i < events.length; i++) {
							if(events[i]['status'] != "ok") {
								continue;
							}
							var url = events[i]['uri'];
							var displayName = events[i]['displayName'];
							var artist = checkUndefined(events[i]['performance'][0]) ? "" : events[i]['performance'][0]['displayName'];
							var dateTime = "";
							if(typeof(events[i]['start']) == "undefined") {
								dateTime = "";
							} else {
								var date = events[i]['start']['date'].split("-");
								dateTime = setDate(date[1]) + date[2] + "," + date[0] + " " + (typeof(events[i]['start']['time']) == "undefined" ? "" : events[i]['start']['time']);
							}
							var type = typeof(events[i]['type']) == "undefined" ? "" : events[i]['type'];
							var obj = {
								url : url,
								displayName : displayName,
								artist : artist,
								dateTime : dateTime,
								type : type
							}
							jsonUpcomingEvents.push(obj);
						}
						var result = {"results" : jsonUpcomingEvents};
						res.end(JSON.stringify(result));
					}
				} else {
		  			res.end(JSON.stringify("['error']")); // failed to get response
					console.log("failed to request ajax of upcoming events");
				}
			});
		} else {
		  	res.end(JSON.stringify("['error']")); // failed to get response
			console.log("failed to request ajax of venueId");
		}
	});
	return
});





app.get('/all', function(req,res){
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Content-type', 'application/json; charset=utf-8');
	var results = {};
	
	var urlObj = url.parse(req.url, true);

	//eventDetails
	var url_eventsDetails = "https://app.ticketmaster.com/discovery/v2/events/"+ urlObj['query']['id'] +"?apikey="+ apikey_ticketmaster;
	// console.log(url_eventsDetails);
	request(url_eventsDetails, async function(error, response, body) {
		await delay(1001);
		if(!error && response.statusCode == 200) {
			var jsonEventsDetails = [];
			var json = JSON.parse(body);
			var name = json['name'];
			var artistTeam = "";
			if(typeof(json['_embedded']['attractions']) != "undefined") {
				for(var i = 0; i < json['_embedded']['attractions'].length; i++) {
					artistTeam += json['_embedded']['attractions'][i]['name'] + " | ";
				}
			}
			artistTeam = artistTeam.substr(0, artistTeam.length-2);
			var venue = json['_embedded']['venues'][0]['name'];
			var time = (typeof(json['dates']['start']['localDate'])=='undefined' ? "" : json['dates']['start']['localDate']) + " " + (typeof(json['dates']['start']['localTime'])=='undefined' ? "" : json['dates']['start']['localTime']);
			var category = ((typeof(json['classifications'][0]['genre'])=='undefined' || json['classifications'][0]['genre']['name'] == "Undefined") ? "" : json['classifications'][0]['genre']['name'] + " | ") + ((typeof(json['classifications'][0]['segment'])=='undefined' || json['classifications'][0]['segment']['name']=='Undefined') ? '' : json['classifications'][0]['segment']['name'] + " | "); 
			category = category.substr(0, category.length-2);
			var priceRange = "";
			if(!checkUndefined(json['priceRanges']) && !checkUndefined(json['priceRanges'][0])) {
				if(!checkUndefined(json['priceRanges'][0]['min'])) {
					priceRange = "$" + json['priceRanges'][0]['min'];
				}
				if(!checkUndefined(json['priceRanges'][0]['max'])) {
					if(priceRange == "") {
						priceRange = "$" + json['priceRanges'][0]['max'];
					} else {
						priceRange += " ~ $" + json['priceRanges'][0]['max'];
					}
				}
			}
			var ticketStatus = json['dates']['status']['code'];
			var buyTicketAt = json['url'];
			var seatmap = typeof(json['seatmap']) == 'undefined' ? '' : json['seatmap']['staticUrl'];
			var url = checkUndefined(json['url']) ? "" : json['url'];
			var obj = {
				name : name,
				artistTeam : artistTeam,
				venue : venue,
				time : time,
				category : category,
				priceRange : priceRange,
				ticketStatus : ticketStatus,
				buyTicketAt : buyTicketAt,
				seatmap : seatmap,
				url : url
			};
			// results = {"eventsDetails" : obj};
			results["eventsDetails"] = obj;


			//artistTeam
			var jsonArtistTeams = {};
			var artistTeam = urlObj['query']['artistTeam'].split("|");
			console.log(artistTeam);
			var id = 0;
			for(var i = 0; i < artistTeam.length; i++) {
				var url_artistTeam = "https://www.googleapis.com/customsearch/v1?q="+ artistTeam[i].replace(/(^\s*)|(\s*$)/g, "").replace(/\s+/g,"+") +"&cx="+ engineId +"&imgSize =huge&imgType=news&num=8&searchType=image&key="+ apikey_google;
				request(url_artistTeam, function(error, response, body){
					if(!error && response.statusCode == 200) {
						var json = JSON.parse(body);
						var images = [];
						for(var j = 0; j < json['items'].length; j++) {
							images.push(json['items'][j]['link']);
						}
						var key = json['queries']['request'][0]['searchTerms'];
						jsonArtistTeams[key] = images;
						id++;
						if(id == i) { //key: Id is a flag to indicate to return json file to the front-end while id == times of the loop
							results['artistsTeams'] = jsonArtistTeams;
						}
					}
				});
			}


			//venue info
			var jsonVenue = [];
			var keyword = urlObj['query']['venue'].replace(/(^\s*)|(\s*$)/g, "").replace(/\s+/g,"+");
			var url_venue = "https://app.ticketmaster.com/discovery/v2/venues?apikey="+ apikey_ticketmaster +"&keyword="+keyword;
			// console.log(url_venue);
			request(url_venue, async function(error, response, body){
				await delay(1001);
				if(!error && response.statusCode == 200) {
					var json = JSON.parse(body);
					if(typeof(json['_embedded']) == "undefined" || typeof(json['_embedded']['venues']) == "undefined" || typeof(json['_embedded']['venues'][0]) == "undefined") { // no venue details
						res.end(jsonVenue);
						return
					}
					var venue = json['_embedded']['venues'][0];
					var address = typeof(venue['address']) == "undefined" ? "" : typeof(venue['address']['line1']) == "undefined" ? "" : venue['address']['line1'];
					var city = (typeof(venue['city']) == "undefined" ? "" : venue['city']['name'] + ", ") + (typeof(venue['state']) == "undefined" ? "" : venue['state']['name'] + ", ");
					city = city == "" ? "" : city.substr(0, city.length-2);
					var phoneNumber = typeof(venue['boxOfficeInfo']) == "undefined" ? "" : typeof(venue['boxOfficeInfo']['phoneNumberDetail']) == "undefined" ? "" : venue['boxOfficeInfo']['phoneNumberDetail'];
					var openHours = typeof(venue['boxOfficeInfo']) == "undefined" ? "" : typeof(venue['boxOfficeInfo']['openHoursDetail']) == "undefined" ? "" : venue['boxOfficeInfo']['openHoursDetail'];
					var generalRule = typeof(venue['generalInfo']) == "undefined" ? "" : venue['generalInfo']['generalRule'] == "undefined" ? "" : venue['generalInfo']['generalRule'];
					var childRule = typeof(venue['generalInfo']) == "undefined" ? "" : venue['generalInfo']['childRule'] == "undefined" ? "" : venue['generalInfo']['childRule'];
					var lat = typeof(venue['location']) == "undefined" ? "" : venue['location']['latitude'];
					var lon = typeof(venue['location']) == "undefined" ? "" : venue['location']['longitude'];
					var obj = {
						address : address,
						city : city,
						phoneNumber : phoneNumber,
						openHours : openHours,
						generalRule : generalRule,
						childRule : childRule,
						lat : lat,
						lon : lon
					};
					// results = {"venueInfo" : obj};
					results['venueInfo'] = obj;
				}
			});



			//upcoming events
			var keyword = urlObj['query']['venue'].replace(/(^\s*)|(\s*$)/g, "").replace(/\s+/g,"+");
			var url_getVenueId = "https://api.songkick.com/api/3.0/search/venues.json?query="+ keyword +"&apikey="+ apikey_songkick;
			// console.log(url_getVenueId);
			request(url_getVenueId, function(error, response, body) { // request for venue id
				if(!error && response.statusCode == 200) {
					var json = JSON.parse(body);
					if(isEmptyObject(json['resultsPage']['results']) || json['resultsPage']['status'] != "ok"){ // no return for upcoming events as no id
						res.end("[]");
						return
					}
					var venueId = json['resultsPage']['results']['venue'][0]['id'];
					var url_upcomingEvents = "https://api.songkick.com/api/3.0/venues/"+ venueId +"/calendar.json?apikey="+ apikey_songkick;
					// console.log(url_upcomingEvents);
					request(url_upcomingEvents, function(error, response, body) { // reqeust for upcoming events
						if(!error && response.statusCode == 200) {
							var jsonUpcomingEvents = [];
							var json = JSON.parse(body);
							if(json['resultsPage']['status'] != "ok" || isEmptyObject(json['resultsPage']['results'])) {
								res.end(JSON.stringify(jsonUpcomingEvents));
							} else {
								var events = json['resultsPage']['results']['event'];
								for(var i = 0; i < events.length; i++) {
									if(events[i]['status'] != "ok") {
										continue;
									}
									var url = events[i]['uri'];
									var displayName = events[i]['displayName'];
									var artist = checkUndefined(events[i]['performance'][0]) ? "" : events[i]['performance'][0]['displayName'];
									var dateTime = "";
									if(typeof(events[i]['start']) == "undefined") {
										dateTime = "";
									} else {
										var date = events[i]['start']['date'].split("-");
										dateTime = setDate(date[1]) + date[2] + "," + date[0] + " " + (typeof(events[i]['start']['time']) == "undefined" ? "" : events[i]['start']['time']);
									}
									var type = typeof(events[i]['type']) == "undefined" ? "" : events[i]['type'];
									var obj = {
										url : url,
										displayName : displayName,
										artist : artist,
										dateTime : dateTime,
										type : type
									}
									jsonUpcomingEvents.push(obj);
								}
								// results = {"upcomingEvents" : jsonUpcomingEvents};
								results['upcomingEvents'] = jsonUpcomingEvents;
								res.end(JSON.stringify(results));
							}
						} else {
							res.end(JSON.stringify(results));
						}
					});
				} else {
					res.end(JSON.stringify(results));
				}
			});
		} else {
		  	res.end(JSON.stringify("['error']")); // failed to get response
		  	console.log("failed to request ajax of eventsDetails");
		}
	});
});
/*
	return noting
*/
// app.get('/', function(req, res) {
// 	res.end("[]");
// })

/*business end*/
