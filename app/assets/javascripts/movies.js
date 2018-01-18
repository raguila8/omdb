$(document).on('turbolinks:load', function() {
	main();
});

function main() {

	if ($(".search-container").length) {
		var omdb = {
			
			moviePages: new Map(),
			totalMovies: 0,
			query: "",
			currentPage: 1,
			perPage: 10,
			totalPages: 0,
			paginationNums: [],

			initializeMovieDialog: function() {
				$('#dialog').dialog({
					draggable: false,
					resizable: false,
					closeOnEscape: false,	
					modal: true,
					autoOpen: false,
					dialogClass: 'custom-dialog',
					width: '80%',
					height: 'auto'
				});
			},

			openMovieInfoDialog: function() {
				var self = this;
				self.initializeMovieDialog();
				$('#movies-container').on('click', 'a', function() {
					console.log("info-box open");
					var imdbID = $(this).attr('id');
					self.movieInfo(imdbID);
					$('#dialog').dialog('open');
				});
			},

			movieInfo: function(imdbID) {
				var self = this;
				$.ajax({
					type: "GET",
					url: "http://www.omdbapi.com/?i=" + imdbID + "&plot=full" + "&apikey=803c9598",
					async: false,
					success: function(data) {
						if (data.Response === "True") {
							self.putsMovieInfo(data);
						} else {
							// error
						}
					},
					error: function() {
					
					}
				});

			},

			putsMovieInfo: function(data) {
				var self = this;
				var html = "<div class=\"well\"><img ";
				if (data.Poster !== "N/A") {
						html += "src=\"" + data.Poster + "\"></div>";
					} else {
						html += "src=\"/assets/image-not-available.jpg\"></div>";
					}

				$('#dialog .movie-img').html(html);
				html = "<h1 style=\"font-weight: bold;\">" + data.Title + "</h1>";
				html += "<div class=\"info-box\">";
				$.each(data, function(key, val) {
					console.log("key: " + key + "	val: "+ val);
					if (key !== "Plot" && key !== "Poster" && key !== "Ratings" && 
							key !== "imdbVotes" && key !== "imdbID" && key !== "Type" &&
							key !== "Website" && key !== "Response" && val !== "N/A") {
						html += "<p class=\"info-item\"><b>" + key + "</b>: " + val;
					}
				});
				html += "</div>";
				$('#dialog .movie-info').html(html);
				html = "<h2 style=\"font-weight: bold;\">Plot</h1>";

				html += "<p class=\"plot\">" + data.Plot + "</p>";
				$('#dialog .movie-plot').html(html);
				$('#dialog .imdb-link').attr("href","http://www.imdb.com/title/" + data.imdbID + "/");
				$('#dialog .close-dialog').on('click', function() {
					$('#dialog').dialog('close');
				});
			},

			newSearch: function() {
				var self = this;
				$("button").on("click", function(e) {
    			var query = $("#search").val();
					self.query = query;
					self.moviePages.clear();
					self.currentPage = 1;
					omdb.getPage();
    			e.preventDefault();
  			});
			},

			getPage: function() {
				var self = this;
				console.log(self.query);
				if (self.moviePages.has(self.currentPage)) {
					self.putsMovies(self.moviePages.get(self.currentPage));
				} else {
				$.ajax({
					type: "GET",
					url: "http://www.omdbapi.com/?s=" + self.query + "&page=" + self.currentPage + "&type=movie" + "&apikey=803c9598",
					async: false,
					success: function(data) {
						if (data.Response === "True") {
							self.totalMovies = data.totalResults;
							if (self.moviePages.size === 0) {
								console.log("movies pages size is 0");
								if (self.totalMovies > self.perPage) {
									console.log("paginating");
									self.paginate();
								} else {
									$('.pagination-container').html("");
								}
							}
							self.moviePages.set(self.currentPage, data.Search);
							self.putsMovies(data.Search);
						} else {
							// error
						}
					},
					error: function() {
					}
				});
				}
			},


			putsMovies: function(movies) {
				var self = this;
				console.log(movies);
				var html = self.template(self.moviePages.get(self.currentPage));
				$('#movies-container').html(html);
			},

			newPage: function() {
				var self = this;
					$('.pagination-container').on('click', 'a', function() {
					$("." + self.currentPage).removeClass('active');
					var id = $(this).attr("class");
					console.log("id: " + id);
					if (id === "prev") {
						if (self.currentPage !== 1) {
							self.currentPage -= 1;
						}
					} else if (id === "next") {
						if (self.currentPage !== Math.ceil(self.totalMovies / 10)) {
							self.currentPage += 1;
						}
					} else if (Number.isInteger(parseInt($(this).attr("class")))){
						self.currentPage = parseInt($(this).attr("class"));
					}
					if (self.totalPages > 10) {
						self.updatePagination();
					}
					console.log("current Page: " + self.currentPage);
					$("." + self.currentPage).addClass('active');
					self.getPage();
				});
			},

			updatePagination: function() {
				var self = this;
				var endEllipsis = false;
				var n = 0;
				console.log(self.paginationNums);
				if ((self.paginationNums[self.paginationNums.length - 1] - self.currentPage) <= 3 && self.paginationNums[self.paginationNums.length - 1] !== self.totalPages) {
					console.log("first loop");
					var firstNum = self.paginationNums[0];	
					for (var i = 0; i < ((self.currentPage - firstNum) % 5); i++) {
						if ((self.paginationNums[self.paginationNums.length - 1] + 1) <= self.totalPages) {
							self.paginationNums.shift();
							self.paginationNums.push(self.paginationNums[self.paginationNums.length - 1] + 1);
						} else {
							break;
						}
					}
					if (self.paginationNums[self.paginationNums.length] !== self.totalPages) {
						endEllispsis = true;
					}
				}	else if ((self.paginationNums[9] - self.currentPage) > 4 && self.paginationNums[0] !== 1) {
					console.log("second loop");
					if (self.paginationNums[0] === self.currentPage) {
						n = 5;
					} else if (self.paginationNums[1] === self.currentPage) {
						n = 4;
					} else if (self.paginationNums[2] === self.currentPage) {
						n = 3;
					} else if (self.paginationNums[3] === self.currentPage) {
						n = 2;
					} else if (self.paginationNums[4] === self.currentPage) {
						n = 1;
					}
					for (var i = 0; i < n; i++) {
						if ((self.paginationNums[0] - 1) >= 1)  {
							self.paginationNums.pop();
							self.paginationNums.unshift(self.paginationNums[0] - 1);
						} else {
							break;
						}
					}
				}
				var pagination = "<div class=\"pagination\">" +
  														"<a class=\"prev\">&laquo;</a>";
				if (self.paginationNums[0] !== 1) {
					pagination += "<a class=\"ellipsis\">...</a>";
				}
				for (var i = 0; i < self.paginationNums.length; i++) {
					pagination += "<a class=\"" + self.paginationNums[i] + "\">" + self.paginationNums[i] + "</a>";
				}
				if (self.paginationNums[self.paginationNums.length -1] !== self.totalPages) {
					pagination += "<a class=\"ellipsis\">...</a>";
				}

				pagination += "<a class=\"next\">&raquo;</a>" +
														"</div>";


				$('.pagination-container').html(pagination);
			},

/*************************PAGINATE******************/

			paginate: function() {
				var self = this;
				self.paginationNums = [];
				self.totalPages = Math.ceil(self.totalMovies / 10);
				var pagination = "<div class=\"pagination\">" +
  														"<a class=\"prev\">&laquo;</a>";
				var i = 1;
				pagination += "<a class=\"" + i + " active\">" + i + "</a>";
				self.paginationNums.push(i);
				if (self.totalPages > 10) {
					for (i = 2; i < 11; i++) {
						pagination += "<a class=\"" + i + "\">" + i + "</a>";
						self.paginationNums.push(i);
					}
					pagination += "<a class=\"ellipsis\">...</a>";
				} else {
					for (i = 2; i < self.totalPages + 1; i++) {
						pagination += "<a class=\"" + i + "\">" + i + "</a>";
						self.paginationNums.push(i);
					}
				}
				pagination += "<a class=\"next\">&raquo;</a>" +
														"</div>";
				$('.pagination-container').html(pagination);
			},

			template: function(data) {
				var html = "";
				$.each(data, function(index, movie) {
					html += "\n<div class=\"col-md-6\">\n" +
									"<div class=\"thumbnail\">\n<h3 class=\"movie-title\">";
					html += "" + movie.Title + " (" + movie.Year + ")</h3>\n<img class=\"movie-poster\" ";
					if (movie.Poster !== "N/A") {
						html += "src=\"" + movie.Poster + "\">";
					} else {
						html += "src=\"/assets/image-not-available.jpg\">";
					}
					html += "\n<div class=\"caption\">\n";
					html += "<a id=\"" + movie.imdbID + "\" class=\"btn btn-info more-info\">More Info</a>\n" +
									"</div>\n</div>\n</div>\n</div>";

	});
	return html;
	},

		};
		omdb.newSearch();
		omdb.newPage();
		omdb.openMovieInfoDialog();
	}

}
