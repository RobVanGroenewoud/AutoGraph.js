// jquery.autograph.js

// Utility
if ( typeof Object.create !== 'function' ) {
	Object.create = function( obj ) {
		function F() {}
		F.prototype = obj;
		return new F();
	};
}

/*global Highcharts:true */

(function( $, window, document, undefined ) {

	var AutoGraph = {
		init: function( options, elem ) {
			var self = this;
			self.elem = elem;
			self.$elem = $( elem );
			self.progressBar = $('<div class="progress progress-striped active"><div class="bar" style="width: 100%;"></div></div');

			self.options = $.extend( {}, $.fn.AutoGraph.options, options );

			self.run();
		},

		run: function() {
			var self = this;

			self.dataUrl = self.$elem.attr('data-graph-url');

			// In case the Ajax call takes some time, show a progress bar.
			// Don't show it if the call was short enough, to prevent flickering.
			var progressBarTimer = setTimeout(function(){
				self.$elem.prepend( self.progressBar );
			}, 200);

			self.fetch().done(function( results ) {
				self.buildGraphOptions( results );
				self.displayGraph();
			}).error(function( jqXHR, textStatus, errorThrown ){
				var errorMessage = $( "<div>Unable to load data from '" + self.dataUrl + "'</div>" ).addClass( self.options.errorClassName );
				self.$elem.prepend( errorMessage );
			}).complete(function() {
				clearTimeout( progressBarTimer );
				self.progressBar.hide();
			});
		},

		fetch: function() {
			return $.ajax({
				url: this.dataUrl,
				cache: false,
				dataType : 'xml'
			});
		},

		buildGraphOptions: function( results ){
			var self = this;

			var graphTitle = self.$elem.attr('data-graph-title');
			var graphType = self.$elem.attr('data-graph-type');
			var graphCategories = self.$elem.attr('data-graph-categories');
			var graphYaxisText = self.$elem.attr('data-graph-yaxis-text');
			var graphStacking = self.$elem.attr('data-graph-stacking');

			var graphOptions = {
				chart: {
					renderTo : self.elem,
					type : graphType || self.options.graphType
				},
				credits: {
						enabled : false
				},
				title: {
					text: graphTitle
				},
				xAxis: {
					categories: []
				},
				yAxis: {
					title: {
						text: graphYaxisText
					}
				},
				plotOptions: {
					series: {
						stacking: graphStacking
					}
				},
				series: []
			};


			var $xml = $(results);

			graphOptions.title.text = graphOptions.title.text || $xml.find('title').text();
			graphOptions.yAxis.title.text = graphOptions.yAxis.title.text || $xml.find('yAxis text').text();
			graphOptions.chart.type = graphOptions.chart.type || $xml.find('type').text();

			// push categories
			var categories = graphCategories || $xml.find('categories').text();
			$.each(categories.split(","), function(i, category) {
				graphOptions.xAxis.categories.push(category);
			});
			
			var stacking = false;
			// push series
			$xml.find('series').each(function(i, series) {
				
				var hidden = $(series).find('hidden').text() === "true";
				var stackVal = $(series).find('stack').text();
				var stackId = stackVal ? stackVal : null;
				stacking = stacking || stackVal.length > 0;
				var seriesOptions = {
					name: $(series).find('name').text(),
					data: [],
					visible: !hidden,
					stack: stackId
				};
				
				// push data points
				var data = $(series).find('data').text();
				$.each(data.split(","), function(i, point) {
					seriesOptions.data.push(
						parseInt(point, 10)
					);
				});
				
				// add it to the options
				graphOptions.series.push(seriesOptions);
			});

			self.graphOptions = graphOptions;
		},

		displayGraph: function() {
			var self = this;
			self.chart = new Highcharts.Chart(self.graphOptions);
		}
	};

	$.fn.AutoGraph = function( options ){
		return this.each(function(){

			var autograph = Object.create( AutoGraph );
			autograph.init( options, this );

			$.data( this, 'AutoGraph', autograph);
		});
	};

	$.fn.AutoGraph.options = {
		errorClassName: 'alert alert-error', // Matches Bootstrap v2.0
		graphType: 'column'
	};
})( jQuery, window, document );
