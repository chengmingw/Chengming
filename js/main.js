/*
	angular animation
*/
var app = angular.module('app', ['ngAnimate']);
app.controller('AppController', function($scope, $timeout) {
	$scope.isShow = true;
	$scope.list = [];

	$scope.showFromLeft = function(){
		// $scope.list.splice(0, $scope.list.length);
		$scope.animation = "slide-left";
		$scope.list.push({title:"1"});
		console.log("ng");
	}
});


/*
	function to return corrsponding segmentId
*/
function getSegmentId(category){
	if(category === "Music") {
		return "KZFzniwnSyZfZ7v7nJ";
	} else if(category === "Sports") {
		return "KZFzniwnSyZfZ7v7nE";
	} else if(category === "Arts & Theatre") {
		return "KZFzniwnSyZfZ7v7na";
	} else if(category === "Film") {
		return "KZFzniwnSyZfZ7v7nn";
	} else if(category === "Miscellaneous") {
		return "KZFzniwnSyZfZ7v7n1";
	} else {
		return "";
	}
}

/*
	function to make a 30-characters-length string
*/
function makeStr(str) {
	if(str.length <= 35){
		return str;
	} else {
		var index = 35;
		while(index >= 0) {
			if(str.charAt(index) === " ") {
				return str.substr(0, index+1) + "...";
			} else {
				index--;
			}
		}
		return str.substr(0, 36) + " ...";
	}
}

/*
	check for if an object is empty
*/
function isEmptyObject(obj) {
	for(var key in obj){
		return false;
	}
	return true;
}

/*
	compartor
*/
function compare (prop, type) {
	if(type == "Ascending") {
		return function (obj1, obj2) {
		    var val1 = obj1[prop]
		    var val2 = obj2[prop]
		    if (val1 > val2) {
		      return 1
		    } else if (val1 < val2) {
		      return -1
		    } else {
		      return 0
		    }
		}
	} else {
		return function (obj1, obj2) {
		    var val1 = obj1[prop]
		    var val2 = obj2[prop]
		    if (val1 > val2) {
		      return -1
		    } else if (val1 < val2) {
		      return 1
		    } else {
		      return 0
		    }
		 }
	}
}

/*
	get correct format prop
*/
function getProp(prop) {
	if(prop == "Event Name") {
		return "displayName";
	} else if(prop == "Time") {
		return "dateTime";
	} else if(prop == "Artist") {
		return "artist";
	} else if(prop == "Type") {
		return "type";
	} else {
		return "default";
	}
}




/*
	some validation before send requests
*/
// input validation
var getLocation = false;
$("#keyword").on("focusout", function(){
	if($("#keyword").val().replace(/\s+/g, "") == "") {
		$("#keyword").addClass("invalidInput");
		$("#errorMessage1").css("display", "inline");
		$("#search")[0].disabled = true;
	} else {
		$("#keyword").removeClass("invalidInput");
		$("#errorMessage1").css("display", "none");
		if((getLocation && $("#here")[0].checked) || (getLocation && $("#locationRadio")[0].checked && $("#location").val().replace("/\s+/g", "") == "")) {
			$("#search")[0].disabled = false;
		}
	}
});
$("#keyword").on("input", function(){
	if($("#keyword").val().replace(/\s+/g, "") == "") {
		$("#keyword").addClass("invalidInput");
		$("#errorMessage1").css("display", "inline");
		$("#search")[0].disabled = true;
	} else {
		$("#keyword").removeClass("invalidInput");
		$("#errorMessage1").css("display", "none");
		if((getLocation && $("#here")[0].checked) || (getLocation && $("#locationRadio")[0].checked && $("#location").val().replace("/\s+/g", "") != "")) {
			$("#search")[0].disabled = false;
		}
	}
});
$("#here").on("click", function(){
	$("#location").removeClass("invalidInput");
	$("#errorMessage2").css("display", "none");
	if(getLocation && $("#keyword").val().replace(/\s+/g, "") != "") {
		$("#search")[0].disabled = false;
	}
});
$("#locationRadio").on("click", function(){
	if($("#location").val().replace("/\s+/g", "") == "") {
		$("#search")[0].disabled = true;
	} else {
		if(getLocation && $("#keyword").val().replace(/\s+/g, "") != "") {
			$("#search")[0].disabled = false;
		}
	}
});
$("#location").on("focusout", function(){
	if($("#locationRadio")[0].checked && $("#location").val().replace("/\s+/g", "") == "") {
		$("#location").addClass("invalidInput");
		$("#errorMessage2").css("display", "inline");
		$("#search")[0].disabled = true;
	} else {
		$("#location").removeClass("invalidInput");
		$("#errorMessage2").css("display", "none");
		if(getLocation && $("#keyword").val().replace(/\s+/g, "") != "") {
			$("#search")[0].disabled = false;
		}
	}
});
$("#location").on("input", function(){
	if($("#location").val().replace("/\s+/g", "") != "") {
		$("#location").removeClass("invalidInput");
		$("#errorMessage2").css("display", "none");
		if(getLocation && $("#keyword").val().replace(/\s+/g, "") != "") {
			$("#search")[0].disabled = false;
		}
	} else {
		$("#search")[0].disabled = true;
	}
});


// disable raios
var radios = document.getElementsByName("from");
for(var i = 0; i < radios.length; i++){
	radios[i].onchange = function(){
		if(document.getElementById("here").checked == true) {
			document.getElementById("location").disabled = true;
		} else {
			document.getElementById("location").disabled = false;
		}
	}
}
if(document.getElementById("locationRadio").checked == true) {
	document.getElementById("location").disabled = false;
}

// check search button
$.get("http://ip-api.com/json", function(res){
	var ipJSONObj = res;
	if(typeof(ipJSONObj) == 'object') {
		lat = ipJSONObj["lat"];
		lon = ipJSONObj["lon"];
	}
	if(typeof(lat) != "undefined" && typeof(lon) != "undefined"){
		getLocation = true;
		if(($("#keyword").val().replace(/\s+/g, "") != "") && (($("#here")[0].checked) || ($("#locationRadio")[0].checked && $("#location").val().replace("/\s+/g", "") == ""))) {
			$("#search")[0].disabled = false;
		}
	}
});

// clear button function
$("#clear").on("click", function(){
	$("form")[0].reset();
	$("#search")[0].disabled = true;
	$("#container2").empty();
});

var status = 1;
//results button
$("#showResults").on("click",function(){
	if(status == 1) {
		$("#showResults").addClass("btn-link");
		$("#showResults").removeClass("btn-primary");
		$("#showFavorites").addClass("btn-primary");
		$("#showFavorites").removeClass("btn-link");
		status= 2;
	} else {
		$("#showFavorites").addClass("btn-link");
		$("#showFavorites").removeClass("btn-primary");
		$("#showResults").addClass("btn-primary");
		$("#showResults").removeClass("btn-link");
		status = 1;
	}
	$("#favoritesDiv").css("display","none");
	$("#container2").css("display","block");
});

//favorites button
$("#showFavorites").on("click", function(){
	if(status == 1) {
		$("#showResults").addClass("btn-link");
		$("#showResults").removeClass("btn-primary");
		$("#showFavorites").addClass("btn-primary");
		$("#showFavorites").removeClass("btn-link");
		status= 2;
	} else {
		$("#showFavorites").addClass("btn-link");
		$("#showFavorites").removeClass("btn-primary");
		$("#showResults").addClass("btn-primary");
		$("#showResults").removeClass("btn-link");
		status = 1;
	}
	$("#favoritesDiv").css("display","block");
	$("#container2").css("display","none");
})


/*
	ajax requests
*/
$(function(){
	/*
		ajax search events
	*/
	$("#search").on("click", function(){
		$("#container2").empty(); // empty contents in #container2
		$("#myProgress").css("display", "block"); // start progress animation1

		var keyword = $("#keyword").val();
		var segmentId = getSegmentId($("#category").val());
		var radius = $("#radius").val() == "" ? "10" : $("#radius").val();
		var unit = $("#unit").val();
		var from = $("#here")[0].checked ? $("#here").val() : $("#locationRadio").val();
		var location = $("#location").val();
		// console.log("lat:"+lat+" lon:"+lon);

		//send request to backend app.js to fetch jsonEventsSearch
		$.ajax({
			url:"http://127.0.0.1:8081/eventsSearch",
			type: "get",
			dataType: "json",
			data: {
					keyword : keyword,
					segmentId : segmentId,
					radius : radius,
					unit : unit,
					from : from,
					lon : lon,
					lat : lat,
					location : location
				},
			success:function(data){ //json object
				console.log("evnetsSearch:");
				console.log(data);
				$("#myProgress").css("display", "none"); // stop progress animation1 after data is fetched
				data = data['results'];
				if(typeof(data) == "undefined" || data.length == 0 || data == "['error']") { // no records
					var htmlEventsSearch = "<div class='alert alert-warning' role='alert' style='margin-top:100px;'>No records.</div>";
					$("#container2").append(htmlEventsSearch);
					return;
				}
				var htmlEventsSearch = "<div id='showEventsSearch'><button type='button' id='details' class='btn btn-default btn-light btn-sm' disabled='true' style='float: right; border: 1px solid #ccc; margin-bottom: 10px;'>Details<i class='material-icons'>keyboard_arrow_right</i></button><div class='clearfix'></div><table class='table table-hover'><thead><tr class=''><th scope='col'>#</th><th scope='col'>Date</th><th scope='col'>Event</th><th scope='col'>Category</th><th scope='col'>Venue Info</th><th scope='col'>Favorite</th></tr></thead>";
				for(var i = 0; i < data.length; i++) {
					htmlEventsSearch += "<tbody><tr id='highlight"+ i +"'><td><b>"+ (i+1) +"</b></td><td>"+ data[i]['date'] +"</td><td><a ng-click='showFromLeft()' class='a1' myid='"+ i +"' id='"+ data[i]['id'] +"' href='#' data-toggle='tooltip' data-placement='bottom' title='"+ data[i]['name'] +"'>"+ makeStr(data[i]['name']) +"</a></td><td>"+ data[i]['category'] +"</td><td>"+ data[i]['venueInfo'] +"</td><td><div class='favorite star'><i class='material-icons'>star_border</i></div></td></tr>";
				}
				htmlEventsSearch += "</tbody></table></div>";
				$("#container2").append(htmlEventsSearch);
				$('[data-toggle="tooltip"]').tooltip();

				/*
					favorite button in table function
				*/
				$(".star").on("click", function(){
					if(this.firstChild.innerText == "star_border") {
						this.firstChild.innerText = "star_rate";
						this.firstChild.style.paddingLeft = "10px";
						this.firstChild.style.color = "rgb(255,200,1)";
					} else {
						this.firstChild.innerText = "star_border";
						this.firstChild.style.paddingLeft = 0;
						this.firstChild.style.color = "";
					}
				});

				for(var i = 0; i < $(".a1").length; i++){
					$(".a1")[i].onclick = function(){
						var hlid = "highlight" + this.getAttribute("myid");
						var name = data[this.getAttribute("myid")]['name'];
						requestEventsDetails(this.id, hlid, name);
						return false;
					};
				}
			},
			error:function(err){
				$("#myProgress").css("display", "none"); // stop progress animation1 after data is fetched
				var htmlError = "<div class='alert alert-danger' role='alert' style='margin-top:100px;'>Failed to get search results.</div>";
				$("#container2").append(htmlError);
				console.log("error_eventsSearch: "+err);
			}
		});
	});


	/*
		ajax events details
	*/
	function requestEventsDetails(id, hlid, name){
		$('[data-toggle="tooltip"]').tooltip('hide');
		$("#showEventsSearch").css("display", "none");
		$("#showEventsDetails").remove();		
		/*
			details button function
		*/
		$("#details")[0].disabled = false;
		$("#details").on("click", function(){
			$("#showEventsSearch").css("display", "none");
			$("#showEventsDetails").css("display", "block");
		});

		/*
			hightlight function
		*/
		for(var i = 1; i < $("tr").length; i++) {
			$("tr")[i].style.backgroundColor = "";
		}
		$("#"+hlid).css("background-color", "#f9e0a7");


		// var htmlEventsDetails = "<div id='showEventsDetails'><h4 align='center'>"+ name +"</h4><div class='row'><div class='col-sm-1'><button id='showList' type='button' class='btn btn-default btn-light btn-sm' style='border: 1px solid #ccc; margin-bottom: 10px;'><i class='material-icons'>keyboard_arrow_left</i>List</button></div><div class='col-sm-4 col-md-10'></div><div class='twitter'><a class='twitter-share-button' target='_blank' href='https://twitter.com/intent/tweet'><img width='35px' height='30px' src='http://csci571.com/hw/hw8/Images/Twitter.png'></a></div><div class='favorite star'><i class='material-icons'>star_border</i></div></div>";
		var htmlEventsDetails = "<div id='showEventsDetails'><h4 align='center'>"+ name +"</h4>";
		htmlEventsDetails += "<div id='subNav' style='position:relative; height:40px'><div class='showList'><button id='showList' type='button' class='btn btn-default btn-light btn-sm' style='border: 1px solid #ccc; margin-bottom: 10px;'><i class='material-icons'>keyboard_arrow_left</i>List</button></div>";
		htmlEventsDetails += "<div class='twitter'><a class='twitter-share-button' target='_blank' href='https://twitter.com/intent/tweet'><img width='35px' height='30px' src='http://csci571.com/hw/hw8/Images/Twitter.png'></a></div>";
		htmlEventsDetails += "<div class='favorite star'><i class='material-icons'>star_border</i></div></div>";

		htmlEventsDetails += "<ul class='nav nav-tabs tabs-right' id='myTab' role='tablist'><li id='firstLi' class='nav-item'><a class='nav-link active' id='event-tab' data-toggle='tab' href='#event' role='tab' aria-controls='event' aria-selected='true'>Event</a></li><li class='nav-item'><a class='nav-link' id='artisTeams-tab' data-toggle='tab' href='#artisTeams' role='tab' aria-controls='artisTeams' aria-selected='false'>Artis/Teams</a></li><li class='nav-item'><a class='nav-link' id='venue-tab' data-toggle='tab' href='#venue' role='tab' aria-controls='venue' aria-selected='false'>Venue</a></li><li class='nav-item'><a class='nav-link' id='upcomingEvents-tab' data-toggle='tab' href='#upcomingEvents' role='tab' aria-controls='upcomingEvents' aria-selected='false'>Upcoming Events</a></li></ul>";
		htmlEventsDetails += "<div class='container' id='myProgress2'><div class='progress'><div class='progress-bar progress-bar-striped progress-bar-animated' role='progressbar' aria-valuenow='50' aria-valuemin='0' aria-valuemax='100' style='width: 50%;'></div></div></div>";
		htmlEventsDetails += "<div class='tab-content' id='myTabContent'></div>";
		htmlEventsDetails += "</div>";
		$("#container2").append(htmlEventsDetails); // show nav tabs

		//nav tabs postion
		var marginLeft = $(".container").width()-444 < 0 ? 0 : $(".container").width()-444;
		$("#firstLi").css("marginLeft", marginLeft);
		$(window).resize(function(){
			console.log($("body"));
			console.log($(".container").width());
			marginLeft = $(".container").width()-444 < 0 ? 0 : $(".container").width()-444;
			$("#firstLi").css("marginLeft", marginLeft);
		});

		//showList function				
		$("#showList").on("click", function(){
			$("#showEventsSearch").css("display", "block");
			$("#showEventsDetails").css("display", "none");
		});

		//favorite button function
		$("#showEventsDetails .star").on("click", function(){
			if(this.firstChild.innerText == "star_border") {
				this.firstChild.innerText = "star_rate";
				this.firstChild.style.paddingLeft = "10px";
				this.firstChild.style.color = "rgb(255,200,1)";
			} else {
				this.firstChild.innerText = "star_border";
				this.firstChild.style.paddingLeft = 0;
				this.firstChild.style.color = "";
			}
		});

		
		$.ajax({ // ajax request for events details
			url : "http://127.0.0.1:8081/eventsDetails",
			type : "get",
			dataType : "json",
			data : {
				id : id
			},
			success : function(data) {
				console.log("eventsDetails:");
				console.log(data);
				data = data['results'];
				if(typeof(data) == "undefined" || data.length == 0 || data == "['error']") { // check for empty data
					var htmlEventsDetails = "<div class='alert alert-warning' role='alert' style='margin-top:100px;'>No records.</div>";
					$("#myTabContent").append(htmlEventsDetails);
					return;
				}


				data = data[0];
				htmlEventsDetails = "";
				htmlEventsDetails += "<div class='tab-pane fade show active' id='event' role='tabpanel' aria-labelledby='event-tab'>";
				htmlEventsDetails += "<table class='table table-striped'><tbody>";
				htmlEventsDetails += "<tr><td><b>Atrits/Team(s)</b></td><td>"+ data['artistTeam'] +"</td></tr>";
				htmlEventsDetails += "<tr><td><b>Venue</b></td><td>"+ data['venue'] +"</td></tr>";
				htmlEventsDetails += "<tr><td><b>Time</b></td><td>"+ data['time'] +"</td></tr>";
				htmlEventsDetails += "<tr><td><b>Category</b></td><td>"+ data['category'] +"</td></tr>";
				htmlEventsDetails += data['priceRange'] == '' ? "" : "<tr><td><b>PriceRanges</b></td><td>"+ data['priceRange'] +"</td></tr>";
				htmlEventsDetails += "<tr><td><b>Ticket Status</b></td><td>"+ data['ticketStatus'] +"</td></tr>";
				htmlEventsDetails += "<tr><td><b>Buy Ticket At</b></td><td><a target='_blank' href='"+ data['buyTicketAt'] +"'>Ticketmaster</a></td></tr>";
				htmlEventsDetails += "<tr><td><b>Seat Map</b></td><td><a href='#' id='showCard'>View Seat Map Here</a></td></tr>";
				htmlEventsDetails += "</tbody></table></div>";
				htmlEventsDetails += "<div id='card' class='card' style='max-width: 22rem; display: none;'><div class='card-header'><b>View Seat Map</b><i class='material-icons' id='closeTop'>close</i></div><div class='card-body'><a href='"+ data['seatmap'] +"' target='_blank'><img width='100%' height='auto' src='"+ data['seatmap'] +"'></a></div><div class='card-footer'><button type='button' class='btn btn-outline-dark' id='close'>close</button></div></div>";
				$("#myTabContent").append(htmlEventsDetails);

				$("#myTabContent").css("display","none"); // hide myTabContent div for progress bar animation

				var twitterText = "https://twitter.com/intent/tweet?text=Check out "+ data['name'] +" located at "+ data['venue'] +". Website: "+ data['url'] +" #CSCI571EventSearch"
				$(".twitter-share-button").attr("href", twitterText);


				/*
					function for show card
				*/
				$("#showCard")[0].onclick = function(){
					$("#shadow").css("display", "block");
					$("#card").css("display", "block");
					return false;
				};
				$("#card").css("left", $(window).width()/2 - 350/2);
				$("#close").on("click", function(){
					$("#shadow").css("display", "none");
					$("#card").css("display", "none");
				})
				
				requestArtistTeams(data['category'], data['artistTeam']); // data for Artist/Team(s)
				requestVenue(data['venue']); // data for venue details
				requestUpcomingEvents(data['venue']); // data for upcoming events
			},
			error : function(err) {
				var htmlError = "<div class='alert alert-danger' role='alert' style='margin-top:100px;'>Failed to get search results.</div>";
				$("#myTabContent").append(htmlError);
				console.log("error_envetsDetails: "+err);
				$("#myProgress2").css("display", "none"); // stop progress animation after data is fetched
			}
		});
	}


	/*
		ajax artist/teams
	*/
	function requestArtistTeams(category, artistTeam){
		console.log("request:"+ artistTeam);
		if(category.indexOf("Music") != -1) { //use spodify API
			var htmlArtistTeam = "<div class='tab-pane fade' id='artisTeams' role='tabpanel' aria-labelledby='artisTeams-tab'>";
			htmlArtistTeam += "<div class='alert alert-warning' role='alert' style='margin-top:66px;'>No records.</div>";
			htmlArtistTeam += "</div>";
			$("#myTabContent").append(htmlArtistTeam);
		} else { //use google custom search API
			$.ajax({
				url : "http://127.0.0.1:8081/artistTeams/others",
				type : "get",
				dataType : "json",
				data : {
					artistTeam : artistTeam
				},
				success : function(data){
					console.log("artistTeam:");
					console.log(data);
					if(isEmptyObject(data) || data == "['error']") { // check for empty data
						var htmlArtistTeam = "<div class='tab-pane fade' id='artisTeams' role='tabpanel' aria-labelledby='artisTeams-tab'>";
						htmlArtistTeam += "<div class='alert alert-warning' role='alert' style='margin-top:100px;'>No records.</div>";
						htmlArtistTeam += "</div>";
						$("#myTabContent").append(htmlArtistTeam);
						return;
					}
					var artist = artistTeam.split("|");
					var htmlArtistTeam = "<div class='tab-pane fade' id='artisTeams' role='tabpanel' aria-labelledby='artisTeams-tab'>";
					// for(var i = 0; i < data.length; i++) {
					for(var i = 0; i < artist.length; i++) {
						htmlArtistTeam += "<h5 align='center'>"+ artist[i] +"</h5>";
						htmlArtistTeam += "<div class='row' style='margin: 36px 0;'>";
						// var key = "artist"+i;
						var key = artist[i].replace(/(^\s*)|(\s*$)/g, "");
						for(var j = 0; j < data[key].length; j++) {
							if(j == 0) {
								htmlArtistTeam += "<div class='col-sm-4'>";
							}
							if(j == 3) {
								htmlArtistTeam += "</div><div class='col-sm-4'>";
							}
							if(j == 5) {
								htmlArtistTeam += "</div><div class='col-sm-4'>";
							}
							if(data[key][j].indexOf(".jpg") == -1 && data[key][j].indexOf(".png") == -1 && data[key][j].indexOf(".jpeg") == -1 && data[key][j].indexOf(".gif") == -1) { // invalid image url
								continue;
							}
							htmlArtistTeam += "<a target='_blank' href='"+ data[key][j] +"'><image alt='invalid image' width='100%' height='240px' src='"+ data[key][j] +"'></a>";
							if(j == data[key].length-1) {
								htmlArtistTeam += "</div>";
							}
						}
						htmlArtistTeam += "</div>";
					}
					htmlArtistTeam += "</div>";
					$("#myTabContent").append(htmlArtistTeam);
				},
				error : function(err){
					console.log("error_ArtistTeams: "+err);
					var htmlError = "<div class='tab-pane fade' id='artisTeams' role='tabpanel' aria-labelledby='artisTeams-tab'>";
					htmlError += "<div class='alert alert-danger' role='alert' style='margin-top:66px;'>Failed to get search results.</div>";
					htmlError += "</div>";
					$("#myTabContent").append(htmlError);
				}
			});
		}
	}


	/*
		ajax venue
	*/
	function requestVenue(name) {
		$.ajax({
			url : "http://127.0.0.1:8081/venue",
			type : "get",
			dataType : "json",
			data : {
				name : name
			},
			success : function(data) {
				console.log("venue:");
				console.log(data);
				data = data['results'];
				if(typeof(data) == "undefined" || data.length == 0 || data == "['error']") { // check for empty data
					var htmlVenue = "<div class='tab-pane fade' id='venue' role='tabpanel' aria-labelledby='venue-tab'>";
					htmlVenue += "<div class='alert alert-warning' role='alert' style='margin-top:100px;'>No records.</div>";
					htmlVenue += "</div>";
					$("#myTabContent").append(htmlVenue);
					return;
				}
				var htmlVenue = "<div class='tab-pane fade' id='venue' role='tabpanel' aria-labelledby='venue-tab'>";
				htmlVenue += "<table class='table table-striped'><tbody>";
				htmlVenue += "<tr><td style='width:140px;'><b>Address</b></td><td>"+ data[0]['address'] +"</td></tr>";
				htmlVenue += "<tr><td><b>City</b></td><td>"+ data[0]['city'] +"</td></tr>";
				htmlVenue += "<tr><td><b>Phone Number</b></td><td>"+ data[0]['phoneNumber'] +"</td></tr>";
				htmlVenue += "<tr><td><b>Open Hours</b></td><td>"+ data[0]['openHours'] +"</td></tr>";
				htmlVenue += "<tr><td><b>General Rule</b></td><td>"+ data[0]['generalRule'] +"</td></tr>";
				htmlVenue += "<tr><td><b>Child Rule</b></td><td>"+ data[0]['childRule'] +"</td></tr>";
				htmlVenue += "</tbody></table>";
				htmlVenue += "<div id='map'></div>";
				htmlVenue += "</div>"
				$("#myTabContent").append(htmlVenue);
				var lat = parseFloat(data[0]['lat']);
				var lon = parseFloat(data[0]['lon']);
				initMap(lat, lon);
			},
			error : function(err) {
				var htmlError = "<div class='tab-pane fade' id='venue' role='tabpanel' aria-labelledby='venue-tab'>";
				htmlError += "<div class='alert alert-danger' role='alert' style='margin-top:66px;'>Failed to get search results.</div>";
				htmlError += "</div>";
				$("#myTabContent").append(htmlError);
				$("#myProgress2").css("display", "none"); // stop progress animation after data is fetched
				$("#myTabContent").css("display", "block") // show content of myTabContent
			}
		});

		function initMap(lat, lon) { // google map
			var origin = {lat: lat, lng: lon};
			var map = new google.maps.Map(
			    document.getElementById('map'), {zoom: 14, center: origin});
			var marker = new google.maps.Marker({position: origin, map: map});
		}
	}


	/*
		ajax coming events
	*/
	function requestUpcomingEvents(name) {
		$.ajax({
			url : "http://127.0.0.1:8081/upcomingEvents",
			type : "get",
			dataType : "json",
			data : {
				name : name
			},
			success : function(data) {
				console.log("upcomingEvents:");
				console.log(data);
				data = data['results'];

				$("#myProgress2").css("display", "none"); // stop progress animation2 after data is fetched
				$("#myTabContent").css("display", "block") // show content of myTabContent
				if(typeof(data) == "undefined" || data.length == 0) { // empty data
					var htmlUpcomingEvents = "<div class='tab-pane fade' id='upcomingEvents' role='tabpanel' aria-labelledby='upcomingEvents-tab'>";
					htmlUpcomingEvents += "<div class='alert alert-warning' role='alert' style='margin-top:100px;'>No records.</div>";
					htmlUpcomingEvents += "</div>";
					$("#myTabContent").append(htmlUpcomingEvents);
					return;
				}

				var htmlUpcomingEvents = "<div class='tab-pane fade' id='upcomingEvents' role='tabpanel' aria-labelledby='upcomingEvents-tab'>";
				htmlUpcomingEvents += "<div id='upcomingEvents_selection' class='row'><div class='col-sm-3' style='margin-left: 30px'><select id='sortCategory' class='form-control'><option>Default</option><option>Event Name</option><option>Time</option><option>Artist</option><option>Type</option></select></div><div class='col-sm-3'><select id='sortType' class='form-control' disabled='true'><option val='asc'>Ascending</option><option val='desc'>Descending</option></select></div></div>";
				htmlUpcomingEvents += "<div id='upcomingEventsContent'>"
				for(var i = 0; i < data.length; i++) {
					htmlUpcomingEvents += "<div class='upcomingEvents_div'><ul>";
					htmlUpcomingEvents += "<li><a href='"+ data[i]['url'] +"' target='_blank'>"+ data[i]['displayName'] +"</a></li>";
					htmlUpcomingEvents += "<li><span style='color: #e7754b;'>Artist: "+ data[i]['artist'] +"  </span><span style='color: gray'>"+ data[i]['dateTime'] +"</span></li>";
					htmlUpcomingEvents += "<li><span>Type: "+ data[i]['type'] +"</span></li>";
					htmlUpcomingEvents += "</ul></div>"
				}
				htmlUpcomingEvents += "</div>"
				htmlUpcomingEvents += "<div class='showMore'><button class='btn btn-primary'>Show More</button></div>"
				htmlUpcomingEvents += "</div>";
				$("#myTabContent").append(htmlUpcomingEvents);

				var prop = "default";
				var sortType = "Ascending";
				var tempData = data.concat();

				/*
					function of sort by prop
				*/
				$("#sortCategory").on("change", function(){
					var temphtml = "";
					if($("#sortCategory").val() == "Default") { //disable sortType selector
						$("#sortType").prop("disabled", true);
						$("#sortType")[0].value = "Ascending";
						for(var i = 0; i < data.length; i++) {
							temphtml += "<div class='upcomingEvents_div'><ul>";
							temphtml += "<li><a href='"+ data[i]['url'] +"' target='_blank'>"+ data[i]['displayName'] +"</a></li>";
							temphtml += "<li><span style='color: #e7754b;'>Artist: "+ data[i]['artist'] +"  </span><span style='color: gray'>"+ data[i]['dateTime'] +"</span></li>";
							temphtml += "<li><span>Type: "+ data[i]['type'] +"</span></li>";
							temphtml += "</ul></div>"
						}
					} else {
						$("#sortType").prop("disabled", false);
						prop = $("#sortCategory").val();
						prop = getProp(prop);
						sortType = $("#sortType").val();
						tempData.sort(compare(prop,sortType));
						for(var i = 0; i < tempData.length; i++) {
							temphtml += "<div class='upcomingEvents_div'><ul>";
							temphtml += "<li><a href='"+ tempData[i]['url'] +"' target='_blank'>"+ tempData[i]['displayName'] +"</a></li>";
							temphtml += "<li><span style='color: #e7754b;'>Artist: "+ tempData[i]['artist'] +"  </span><span style='color: gray'>"+ tempData[i]['dateTime'] +"</span></li>";
							temphtml += "<li><span>Type: "+ tempData[i]['type'] +"</span></li>";
							temphtml += "</ul></div>"
						}
					}
					$("#upcomingEventsContent").empty();
					$("#upcomingEventsContent").append(temphtml);
				});

				/*
					function of sort by asc or desc
				*/
				$("#sortType").on("change", function(){
					var temphtml = "";
					prop = $("#sortCategory").val();
					prop = getProp(prop);
					sortType = $("#sortType").val();
					tempData.sort(compare(prop,sortType));
					for(var i = 0; i < tempData.length; i++) {
						temphtml += "<div class='upcomingEvents_div'><ul>";
						temphtml += "<li><a href='"+ tempData[i]['url'] +"' target='_blank'>"+ tempData[i]['displayName'] +"</a></li>";
						temphtml += "<li><span style='color: #e7754b;'>Artist: "+ tempData[i]['artist'] +"  </span><span style='color: gray'>"+ tempData[i]['dateTime'] +"</span></li>";
						temphtml += "<li><span>Type: "+ tempData[i]['type'] +"</span></li>";
						temphtml += "</ul></div>"
					}
					$("#upcomingEventsContent").empty();
					$("#upcomingEventsContent").append(temphtml);
				})

			},
			error : function(err, XMLHttpRequest, textStatus, errorThrown) {
				console.log(err);
				var htmlError = "<div class='tab-pane fade' id='upcomingEvents' role='tabpanel' aria-labelledby='upcomingEvents-tab'>";
				htmlError += "<div class='alert alert-danger' role='alert' style='margin-top:66px;'>Failed to get search results.</div>";
				htmlError += "</div>";
				$("#myTabContent").append(htmlError);
				$("#myProgress2").css("display", "none"); // stop progress animation after data is fetched
				$("#myTabContent").css("display", "block") // show content of myTabContent
			}
		});
	}


})

