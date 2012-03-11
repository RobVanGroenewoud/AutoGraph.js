// Only used for examples page
// ---------------------------
/*globals prettyPrint:true */

!function ($) {

	$(function(){

		// make code pretty
		if(typeof window.prettyPrint !== "undefined")
		{
			prettyPrint();
		}

		function buildPreview() {
			var optionString = "";
			var preview = $('#preview');

			preview.empty();
			$('[data-option]').each(function(i){
				var dataOption = $(this).attr('data-option');
				var dataValue = $(this).val();
				preview.attr(dataOption, dataValue);
				if (dataValue.length)
				{
					var newline = (i === 0 || optionString.length < 1) ? '' : '\n';
					optionString += newline+' '+dataOption+'="'+dataValue+'"';
				}
				else
				{
					preview.removeAttr(dataOption);
				}
			});
			
			preview.AutoGraph();
			var tagName = $('#preview').get(0).tagName.toLowerCase();
			$('#preview-code').text('<'+tagName + '\n' + optionString+'>\n<'+tagName+'>');
			prettyPrint();
		}

		$('#preview-options button[type=submit]').on('click', function(evt){
			evt.preventDefault();
			buildPreview();
		});

		$('.presets a').on('click', function(evt){
			evt.preventDefault();
			if(!$(this).hasClass('noclear')){
				$('#preview-options')[0].reset();
			}

			var preset = $(this);
			var source = preset.get(0);
			var i = 0;
			for (i = 0; i < source.attributes.length; i++)
			{
				var a = source.attributes[i];
				if(a.name.substring(0, 5)==="data-")
				{
					$('#preview-options [data-option='+a.name+']').val(a.value);
				}
			}
			
			buildPreview();
		});

		$('[data-option=data-graph-url]').change(function(){
			var graphUrl = $(this).val();
			var dataUrlUndefined = graphUrl.length === 0;
			var showData = $("#showdata");
			showData.toggleClass('disabled', dataUrlUndefined);
			if (!dataUrlUndefined){
				showData.attr('href', graphUrl);
			} else {
				showData.removeAttr('href');	
			}
		});

		$('#showdata').on('click', function(e){
			if (this.hasClass('disabled')){
				e.preventDefault();
			}
		});
	});


}(window.jQuery);