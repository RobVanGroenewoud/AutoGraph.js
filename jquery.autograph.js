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

	var settings = {
				defaultType: 'column',
				errorClassName: 'alert alert-error' // Matches Bootstrap v2.0
			}; // default options

	function createGraph(target){
		var dataUrl = target.attr('data-graph-url');
		var graphTitle = target.attr('data-graph-title');
		var graphType = target.attr('data-graph-type');
		var graphCategories = target.attr('data-graph-categories');
		var graphYaxisText = target.attr('data-graph-yaxis-text');
		var graphStacking = target.attr('data-graph-stacking');

		var graphOptions = {
			chart: {
				renderTo : $(target)[0],
				type : graphType || settings.defaultType
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

		// In case the Ajax call takes some time, show a progress bar.
		// Don't show it if the call was short enough, to prevent flickering.
		var progressBar = $('<div class="progress progress-striped active"><div class="bar" style="width: 100%;"></div></div');
		var progressBarTimer = setTimeout(function(){
			target.prepend(progressBar);
		}, 200);

		$.ajax({
			url: dataUrl,
			cache: false,
			success: function(xml) {
				var $xml = $(xml);

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

				var chart = new Highcharts.Chart(graphOptions);
			},
			error: function(jqXHR, textStatus, errorThrown){
				var errorMessage = $("<div>Unable to load data from '" + dataUrl + "'</div>").addClass(settings.errorClassName);
				target.prepend(errorMessage);
			},
			complete: function(){
				clearTimeout(progressBarTimer);
				progressBar.hide();
			}
		});
	}

	var methods = {
		init : function( options ) {
			
			if ( options ) {
				$.extend( settings, options );
			}

			return this.each(function(){
				var target = $(this);
				createGraph(target);
			});
		}
	};

	$.fn.AutoGraph = function(method) {
		// Method calling logic
		if ( methods[method] ) {
			return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object' || ! method ) {
			return methods.init.apply( this, arguments );
		} else {
			$.error( 'Method ' +  method + ' does not exist on jQuery.AutoGraph' );
		}
	};

	$.fn.AutoGraph.options = {
		errorClassName: 'alert alert-error', // Matches Bootstrap v2.0
		graphType: 'column'
	};
})( jQuery, window, document );
