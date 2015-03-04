/*Function To pre-load images for better performance*/
function MM_preloadImages() { 
  var d=document; if(d.images){ if(!d.MM_p) d.MM_p=new Array();
    var i,j=d.MM_p.length,a=MM_preloadImages.arguments; for(i=0; i<a.length; i++)
    if (a[i].indexOf("#")!=0){ d.MM_p[j]=new Image; d.MM_p[j++].src=a[i];}}
}


function reCalculateSliderParams() {
	/* Function used recalculate required elements positions and widths*/
	for(var view in EmSlider.CACHE) {
    	var element_id = '#' + view;
    	EmSlider.CACHE[view] = {};
    	var handle = $(element_id).find('.slider-handle');
		EmSlider.CACHE[view]['HANDLE_WIDTH'] = handle.width();
		EmSlider.CACHE[view]['HANDLE_POSITION'] = handle.position();
		EmSlider.CACHE[view]['PATH_WIDTH'] = $(element_id).find('.slider-path').width();
		EmSlider.CACHE[view]['INDICATOR_WIDTH'] = $(element_id).find('.slider-value-indicator').width();
    }
}

function cleanSliderCache() {
	EmSlider.CACHE = {};
	EmSlider.CONSTANTS = {};
}