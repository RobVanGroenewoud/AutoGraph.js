// jquery.autograph.js

(function( $ ){

	var settings = {
				defaultType: 'column'
			}; //default options

	function CreateGraph(target){
		var dataUrl = target.attr('data-graph');
		var graphOptions = {
			chart: { 
				renderTo : $(target)[0]
			},
			credits: {
					enabled : false
			},
			title: {
				text: null
			},
			xAxis: {
				categories: []
			},
			yAxis: {
				title: {
					text: null
				}
			},
			series: []
		};

		$.ajax({ 
			url: dataUrl,
			cache: false,
			success: function(xml) {
				var $xml = $(xml);

				graphOptions.title.text = $xml.find('title').text();
				graphOptions.yAxis.title.text = $xml.find('yAxis text').text();
				graphOptions.chart.type = $xml.find('type').text();

				// push categories
				var categories = $xml.find('categories').text();
				$.each(categories.split(","), function(i, category) {
					graphOptions.xAxis.categories.push(category);
				});
				
				// push series
				$xml.find('series').each(function(i, series) {
					var seriesOptions = {
						name: $(series).find('name').text(),
						data: []
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
				CreateGraph(target);
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

})( jQuery );

$(document).ready(function() {
	$('[data-graph]').AutoGraph();
});
