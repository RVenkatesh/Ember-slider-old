(function() {
var ZoomRx = window.ZoomRx = Ember.Namespace.create();
// ZoomRx.handleMoveTimeOut = []; // This can be at the view level
/* Contains the necessary attributes of slider elements.
 * Note: Performance optimization
 */
ZoomRx.CACHE = {};
/* Constants store the atrributes temporarily 
 * if the slider are of same size
 * Note: Performance optimization
 */
ZoomRx.CONSTANTS = {}; 

/* Arrow color in slider value indicator */
ZoomRx.indicatorArrowColor = 'rgb(60,199,222)';
ZoomRx.indicatorTouchedColor = 'rgb(50,180,212)';

/* To know whether user knows about adjusters */
ZoomRx.usersAdjustingKnowledge = 0;

/* Load necessary images before loading */
MM_preloadImages( // TO INCLUDE THE ACTUAL FUNCTION IN SLIDER MODULE
				'images/handle.png', 
				'images/slider_stops.png',
				'images/slider_stops_active.png',
				'images/slider_adjusters_help_hand.png',
				'images/slider_adjusters_help_hand_touched.png');

/* Detect whether device supports orientationchange event, otherwise fall back to
 * the resize event. 
 */
var supportsOrientationChange = "orientationchange" in window,
    orientationEvent = supportsOrientationChange ? "orientationchange" : "resize";

window.addEventListener(orientationEvent, function() {
    reCalculateSliderParams();
}, false);

})();
	
ZoomRx.SliderAdjusters= Ember.View.extend({
	classNames: ['slider-adjusters'],
	template: Ember.TEMPLATES['template_SliderAdjusters'],
	touchStart: function(event){
		this.get('parentView').addAdjusterFeedBack(event);
	},
	touchEnd: function(event){
		this.get('parentView').removeAdjusterFeedback();
	},
	tapEnd: function(r, event) {
		event.preventDefault();
		event.stopPropagation();
		this.get('parentView').adjustValue(event);
	}
});

ZoomRx.SliderPath = Ember.View.extend({
	classNames: ['slider-path-container'],
	template: Ember.TEMPLATES['template_SliderPath'],
	slider_handle:null,
	slider_path:null,
	slider_color_filler:null,
	slider_value_indicator:null,
	slider_value_arrow:null,
	handlePositionPer:0,
	panning: false, // This can be removed while using panAllowed
	panAllowed: false,
	/* Used to tell whether a touch move event can be allowed to detect as pan or not. 
	 * true => pan is allowed and slider handle can be moved
	 * false => page scroll is allowed and pan/slide is disabled
	 */
	touchMoveDetected: false,
	/* To identify whether a touch move event is already detected for current interaction
	 * true => touch move is already detected
	 * false => First touch move is detected
	 */
	didInsertElement: function() {
		this.refreshParams();
	},
	refreshParams : function() {
		var parent_view = this.get('parentView');
		var view_id = parent_view.get('elementId');
		
		var options = parent_view.get('options');

		/*Just assign handle, path and indicator selectors to reduce time*/
		var handle = this.$('.slider-handle');
		var path = this.$('.slider-path');
		var indicator = this.$('.slider-value-indicator');
		if(!options.sameSizedSliders || !ZoomRx.CONSTANTS.valid) {
			ZoomRx.CACHE[view_id] = {};
			ZoomRx.CACHE[view_id]['HANDLE_WIDTH'] = handle.width();
			ZoomRx.CACHE[view_id]['PATH_WIDTH'] = path.width();
			ZoomRx.CACHE[view_id]['INDICATOR_WIDTH'] = indicator.width();

			/*Copy to constants and use them during loading of other sliders 
			 * if all are of equal size
			 */
			ZoomRx.CONSTANTS['HANDLE_WIDTH'] = ZoomRx.CACHE[view_id]['HANDLE_WIDTH'];
			ZoomRx.CONSTANTS['PATH_WIDTH'] = ZoomRx.CACHE[view_id]['PATH_WIDTH'];
			ZoomRx.CONSTANTS['INDICATOR_WIDTH'] = ZoomRx.CACHE[view_id]['INDICATOR_WIDTH'];
			ZoomRx.CONSTANTS.valid = true;
		} else {
			ZoomRx.CACHE[view_id] = {};
			ZoomRx.CACHE[view_id]['HANDLE_WIDTH'] = ZoomRx.CONSTANTS['HANDLE_WIDTH'];
			ZoomRx.CACHE[view_id]['PATH_WIDTH'] = ZoomRx.CONSTANTS['PATH_WIDTH'];
			ZoomRx.CACHE[view_id]['INDICATOR_WIDTH'] = ZoomRx.CONSTANTS['INDICATOR_WIDTH'];
		}
		
		this.set('slider_handle', handle);
		this.set('slider_path',path);
		this.set('slider_color_filler',this.$('.slider-color-filler'));
		this.set('slider_value_indicator',indicator);
		this.set('slider_value_arrow',this.$('.slider-value-arrow'));

		ZoomRx.noHandleAnimation = true; // Disable Handle move animation initially
		if(parent_view.get('value') == parent_view.get('svalue')) {
			/* Since move handle function sets the slider elements to their valid positions,
			 * Move Handle should be called atleast once.(If the value is not affected then, 
			 * observer wont be called)
			 */
			this.moveHandle();
		} else {
			parent_view.set('value', parent_view.get('svalue'));
		}
        /* Add/ remove highlighting range
        * This can be removed if binding is properly done */
        this.$('.slider-path').addClass(parent_view.getPath('options.highlightRange'));
		
		if(options.type == 'default') {
			// Remove the likert class since options change will not reflect while parsing the template
			path.removeClass('likert'); 
		}
		
		/* Add or remove these classes to alternate b/w indicator and labels */
		if(typeof (options.labels) != 'undefined'){
			path.addClass('likert-with-label'); 	
		} else if(options.showMinMax) {
			path.addClass('show-min-max-labels'); 
		}

		/* Hide adjuster help */
		parent_view.$('.slider-adjusters').css('opacity', 0);
		this.$('.adjuster-help').hide();

		/* Falback for android canvas bug */
		var ua = navigator.userAgent;
		if(ua.toLowerCase().indexOf("android") > -1) {
			this.$('.slider-value-arrow-svg').hide();
		} else {
			this.$('.slider-value-arrow').hide();
		}
		ZoomRx.noHandleAnimation = false;
	}.observes('parentView.options'),
	
	panOptions: {
		numberOfRequiredTouches: 1,
		direction: 2 // Ember.GestureDirection.Horizontal
	},
	touchStart: function(event) {
		/* Reset all slider states here(Starting point for all action) */
		this.set('touchMoveDetected', false);
		this.set('panAllowed', false);
		this.set('panning', false);

		/* Save the start point of touch for calculating angle for sliding*/
		this.set('panStartPointX', event.originalEvent.changedTouches[0].pageX);
		this.set('panStartPointY', event.originalEvent.changedTouches[0].pageY);

		/* Add feedback if point is inside adjuster */
		var target_data = $(event.target).data();
		if(target_data.adjust){
			this.get('parentView').addAdjusterFeedBack(event);
			return;
		}
		var parent_view = this.get('parentView');
		/* Hide help when the user drags the handle*/
		if(!ZoomRx.CONSTANTS['SLIDER_WITH_HELP']) {
			ZoomRx.CONSTANTS['SLIDER_WITH_HELP'] = parent_view.get('elementId');
		}
		if(!ZoomRx.usersAdjustingKnowledge && ZoomRx.CONSTANTS['SLIDER_WITH_HELP'] == parent_view.get('elementId') && parent_view.get('help')) {
			this.$('.adjuster-help').css({'display': 'block', 'opacity': 0});
			this.$('.adjuster-help-hand').addClass('adjuster-auto-slide');
			parent_view.$('.slider-adjusters')
						.addClass('area-visible')
						.css('opacity', 0);
		}
	},
	touchMove: function(event) {
		if(!this.get('touchMoveDetected')) {
			this.set('touchMoveDetected', true);
			this.isScrollingIntention(event);
		}
		if(this.get('panAllowed')) {
			event.preventDefault();
			return false;
		}
	},
	panStart: function(rec, event) {
		if(!this.get('panAllowed')) {
			return false;
		}

		this.set('panning', true);
		this.get('parentView').callBack(event, 'start');
	},
	panChange: function(rec, event) {
		if(!this.get('panAllowed')) {
			return false;
		}
		var translated = rec.get('translation');
		var parent_view = this.get('parentView');
		var view_id = parent_view.get('elementId');
		var handle_current_left = ZoomRx.CACHE[view_id]['HANDLE_POSITION'].left;
		var slider_width = ZoomRx.CACHE[view_id]['PATH_WIDTH'];
		var newLeft = handle_current_left + translated.x;
		if(newLeft<=0){
			//Left most corner
			newLeft=0;
		} else if(newLeft>=slider_width){
			//Right most corner
			newLeft=slider_width;
		}
		ZoomRx.CACHE[view_id]['HANDLE_POSITION'].left = newLeft;
		
		//Calculate handle position in terms of percentage
		var inPercentage = (newLeft / slider_width * 100);
		var highlightPercent;
		var options = parent_view.get('options');
		
		var approximateVal = Math.round(options.get('sliderMin') + ((inPercentage * options.get('difference'))/100)); // min + (per *tot/100)
		var jumpedOnStep = (approximateVal - options.get('sliderMin')) % options.get('stepVal') == 0 ? true : false;
		if(jumpedOnStep) { // Check if the handle is moved on to one of the possible values
			parent_view.set('value', approximateVal);
			this.get('slider_value_indicator').find('span').html(approximateVal);
			parent_view.callBack(event, 'slide'); 
		}// else { // Update the handle element alone not the actual value
			this.get('slider_handle').css('left', inPercentage+'%');
			/* Set the width of the color filler a NON-ZERO value to fix the issue 
			 * of background being not shown.
			 * Reported issue: Slider => Bubble only gets filled , not the pipe connecting them.
			 */
			if(options.get('type') == 'likert') {
				highlightPercent = inPercentage?inPercentage:0.1;
			} else {
				highlightPercent = inPercentage;
			}
			this.get('slider_color_filler').css('width', highlightPercent+'%');
			this.changeArrowShape();
			if(options.get('type') == 'likert') {
				this.updateStops(inPercentage);
			}
		//}
		this.set('handlePositionPer', inPercentage);
	},
	touchEnd : function(){
		/* Show help when the user releases the handle*/
		if(!this.get('panAllowed')) {
			return false;
		}
		this.$('.adjuster-help').css('opacity', 1);
		this.get('parentView').$('.slider-adjusters').css('opacity', 1);
	},
	panEnd: function(rec, event){
		this.set('touchMoveDetected', false);
		if(!this.get('panAllowed')) {
			return false;
		}
		this.set('panAllowed', false);

		/* User stops sliding
		 * Set the slider value to one possible value based on the current position percentage of handle
		 */
		var value = this.percentageToValue();
		this.set('panning', false); //Set panning false so that handle can be moved to exact positions
		if(this.getPath('parentView.value') == value) {
			this.moveHandle();
			this.get('parentView').callBack(event, 'stop');
			return;
		}
		this.setPath('parentView.value', value);
		this.get('parentView').callBack(event, 'stop');
	},
	tapEnd: function(rec, event) {
		var target_data = $(event.target).data();
		if(target_data.notap) {
			event.stopPropagation();
			return;
		} else if(target_data.adjust){
			this.get('parentView').adjustValue(event);
			this.get('parentView').removeAdjusterFeedback();
			return;
		}
		var reduction_offset = this.get('slider_path').offset().left;
		var tap_point = event.originalEvent.changedTouches[0].pageX;
		var path_relative_tap_point = tap_point - reduction_offset;
		path_relative_tap_point = (path_relative_tap_point < 0) ? 0 : path_relative_tap_point;
		var slider_width = ZoomRx.CACHE[this.getPath('parentView.elementId')]['PATH_WIDTH'];
		var percent = path_relative_tap_point / slider_width * 100;
		
		this.set('handlePositionPer', percent);
		this.set('panning', false); //Set panning false so that handle can be moved to exact positions
		var value = this.percentageToValue();
		if(this.getPath('parentView.value') == value) {
			this.moveHandle();
			this.get('parentView').callBack(event, 'stop');
			return;
		}
		this.setPath('parentView.value', value);
		this.get('parentView').callBack(event, 'stop');
		event.stopPropagation();
		this.$('.adjuster-help').css('opacity', 1);
		this.get('parentView').$('.slider-adjusters').css('opacity', 1);
	},
	percentageToValue: function() {
		/* Calculates the value of the slider based on the percentage considering the slider options */
		var options = this.get('parentView').get('options');
		var min = options.get('sliderMin');
		var max = options.get('sliderMax');
		var approximateVal = min + ((this.get('handlePositionPer') * options.get('difference'))/100);			
		var displacement = approximateVal- min;
		//find n th step
		var nthStep = displacement / options.get('stepVal');
		//round off n
		nthStep = Math.round(nthStep);
		
		var actualVal = min + nthStep * options.get('stepVal');
		if(actualVal > max) {
			actualVal = max;
		}
		return actualVal;
	},
	moveHandle: function() {
		/* Moves the handle element and the color Filler according to the current slider value
		 * this.noHandleAnimation - If the handle to be moved without the animations
		 */
		if(!this.get('panning')) {
			var self = this;
			var options = this.get('parentView').get('options');
			var current_value = this.getPath('parentView.value');
			this.get('slider_value_indicator').find('span').html(current_value);
			var percent = ((current_value - options.get('sliderMin'))/ options.get('difference')) *100;
			var highlightPercent;
			if(options.get('type') == 'likert') {
				highlightPercent = percent?percent:0.1;
			} else {
				highlightPercent = percent;
			}
			this.set('handlePositionPer', percent);
			if(ZoomRx.noHandleAnimation) {
				/* Move the handle without animation during loading */
				this.get('slider_handle').css({'left': percent+'%'});
				/* Set the width of the color filler a NON-ZERO value to fix the issue 
				 * of background being not shown.
				 * Reported issue: Slider => Bubble only gets filled , not the pipe connecting them.
				 */
				this.get('slider_color_filler').css({'width': highlightPercent+'%'});
				self.cacheHandlePosition();
				self.changeArrowShape();
				if(options.get('type') == 'likert') {
					self.updateStops(percent);
				}
				return;
			}
			this.get('slider_handle').stop(true, true).animate({'left': percent+'%'}, {
				// duration: 500,
				step: function(percentage, t) {
					self.set('handlePositionPer', percentage);
					self.get('slider_value_indicator').find('span').html(self.percentageToValue());
					self.cacheHandlePosition();
					self.changeArrowShape();
					if(options.get('type') == 'likert') {
						self.updateStops(percentage);
					}
				},
				complete: function() {
					self.set('handlePositionPer', percent);
					self.get('slider_value_indicator').find('span').html(self.percentageToValue());
					self.cacheHandlePosition();
					self.changeArrowShape();
					if(options.get('type') == 'likert') {
						self.updateStops(percent);
					}
				}
			});
			/* Set the width of the color filler a NON-ZERO value to fix the issue 
			 * of background being not shown.
			 * Reported issue: Slider => Bubble only gets filled , not the pipe connecting them.
			 */
			this.get('slider_color_filler').stop(true, true).animate({'width': highlightPercent+'%'});
			/* Prefer using css3 transitions, instead of jQuery animate... 
			 * Since we can not capture transition intervals during css3 transitions, 
			 * we are currently using jQuery animate
			 */
			// this.get('slider_color_filler').css('width', percent+'%');
		}
	}.observes('parentView.value'),
	changeArrowShape: function() {
		var view_id = this.get('parentView').get('elementId');
		var handle_current_left = ZoomRx.CACHE[view_id]['HANDLE_POSITION'].left;
		var path_width = ZoomRx.CACHE[view_id]['PATH_WIDTH'];
		var indicator_width = ZoomRx.CACHE[view_id]['INDICATOR_WIDTH'] / 2;
		
		var percent = (handle_current_left / path_width * 100); // To check whether we can use handlepositionPercentage of the view
		var percentage_limit = (indicator_width / path_width) * 100;

		var canvas = this.$('.slider-value-arrow-svg')[0];

		var ua = navigator.userAgent;
		var userOS = '';
		if(ua.toLowerCase().indexOf("android") > -1) {
			userOS = 'Android';
		}
		// canvas.width = canvas.width;
		var center = canvas.width/2;

		/* Point where the middle vertex of the triangle lies*/
		var middle_corner;
		if(percent <= percentage_limit) { // Left pointed arrow
			var offset_percentage = percentage_limit - percent;
			var px = (offset_percentage / 100) * path_width;
			if(!ZoomRx.usersAdjustingKnowledge) {
				px = px  + px*3/4; // Just to make sure the indicator always stays with the path boundaries and doesnt cause the wierd scrolling effect.
				this.$('.adjuster-help').css('margin-left', px + 'px');
			} else {
				px = px  + px/4; // Just to make sure the indicator always stays with the path boundaries and doesnt cause the wierd scrolling effect.
			}
			this.get('slider_value_indicator').css('margin-left', px + 'px');
			middle_corner = (center - px);

			/* Android 4.x versions have bug in using html5 canvas
			 * Retaining the canvas drawn initially even after clearing the canvas
			 * So, effective prevention of that by just using the normal div triangle
			 * References:  1. https://code.google.com/p/android/issues/detail?id=41312#makechanges
			 *				2. https://code.google.com/p/android/issues/detail?id=35474
			 *				3. https://code.google.com/p/android/issues/detail?id=37529
			 * 				4. http://www.html5rocks.com/en/tutorials/canvas/hidpi/
			 */
			if(userOS == 'Android') {
				this.$('.slider-value-arrow').removeClass('arrow-right-pointed').addClass('arrow-left-pointed');
			}

			/* Arrow using svg logic*/
			// var svg_path = '55,1 '+ (62 - px/2) +',12 69,1';
			// this.get('slider_value_arrow').attr('points', svg_path);
		} else if(percent >= (100 - percentage_limit)) { // Right pointed arrow			
			var offset_percentage = percent - (100 - percentage_limit);
			var px = (offset_percentage / 100) * path_width;
			if(!ZoomRx.usersAdjustingKnowledge) {
				px = px  + px*3/4; // Just to make sure the indicator always stays with the path boundaries and doesnt cause the wierd scrolling effect.
				this.$('.adjuster-help').css('margin-left', (-px) + 'px');
			} else {
				px = px  + px/4; // Just to make sure the indicator always stays with the path boundaries and doesnt cause the wierd scrolling effect.
			}
			this.get('slider_value_indicator').css('margin-left', (-px) + 'px');
			middle_corner = (px + center);

			/* Preventing Android canvas bug*/
			if(userOS == 'Android') {
				this.$('.slider-value-arrow').removeClass('arrow-left-pointed').addClass('arrow-right-pointed');
			}

			/* Arrow using svg logic*/
			// var svg_path = '55,1 '+ (px/2 + 62) +',12 69,1';
			// this.get('slider_value_arrow').attr('points', svg_path);
		} else { // Middle pointed arrow
			this.get('slider_value_indicator').css('margin-left', '');
			if(!ZoomRx.usersAdjustingKnowledge) {
				this.$('.adjuster-help').css('margin-left', '');
			}
			middle_corner = center;

			/* Preventing Android canvas bug*/
			if(userOS == 'Android') {
				this.$('.slider-value-arrow').removeClass('arrow-right-pointed arrow-left-pointed');
			}

			/* Arrow using svg logic*/
			// var svg_path = '55,1 62,10 69,1';
			// this.get('slider_value_arrow').attr('points', svg_path);
		}
		if(!ZoomRx.usersAdjustingKnowledge) {
			var options = this.get('parentView').get('options');
			var min = options.get('sliderMin');
			var max = options.get('sliderMax');
			var help_hand = this.$('.adjuster-help-hand');
			if(percent < 30) {
				help_hand.removeClass('adjuster-only-left adjuster-auto-slide')
							.addClass('adjuster-only-right');
			} else if(percent > 70) {
				help_hand.removeClass('adjuster-only-right adjuster-auto-slide')
							.addClass('adjuster-only-left');
			} else {
				help_hand.removeClass('adjuster-only-left adjuster-only-right')
							.addClass('adjuster-auto-slide');
			}
		}
		if(userOS == 'Android') {
			return;
		}
		var ctx = canvas.getContext("2d");
		if(!this.get('panning')) {
			ctx.strokeStyle = ZoomRx.indicatorArrowColor;
			ctx.fillStyle = ZoomRx.indicatorArrowColor;
			this.$('.slider-value').removeClass('slider-value-touched');
		} else {
			ctx.strokeStyle = ZoomRx.indicatorTouchedColor;
			ctx.fillStyle = ZoomRx.indicatorTouchedColor;
			this.$('.slider-value').addClass('slider-value-touched');
		}
		ctx.clearRect(0,0,canvas.width, canvas.height);
		ctx.beginPath();
		ctx.moveTo(center - 18,1);
		ctx.lineTo(middle_corner, 115);
		ctx.lineTo(center + 18,1);
		ctx.lineTo(center - 18,1);
		ctx.stroke();
		ctx.fill();
		ctx.closePath();
	},
	updateStops: function(percent) {
		var options = this.get('parentView').get('options');
		var slider_min = options.get('sliderMin');
		var slider_max = options.get('sliderMax');
		var stepVal = options.get('stepVal');
		var approximateVal = slider_min + ((percent * options.get('difference'))/100);
		
		for(var step = slider_min; step <= slider_max; step = step + stepVal) {
			if(step <= approximateVal) {
				this.$('#step' + step).addClass('active');
			} else {
				this.$('#step' + step).removeClass('active');
			}
		}
		/*Show or hide likert lables*/
		this.$('.slider-labels').removeClass('active');
		this.$('#label' + Math.round(approximateVal)).addClass('active');
	},
	cacheHandlePosition: function() {
		var view_id = this.get('parentView').get('elementId');
		ZoomRx.CACHE[view_id]['HANDLE_POSITION'] = this.get('slider_handle').position();
	},
	isScrollingIntention: function(event) {
		/* Detect if the intention of the user is scroll or slide 
		 * By measuring the angle between the horizontal and the currently moved point, 
		 * the intention is detected as scroll if angle > 45
		 * the intention is detected as slide if angle < 45
		 */
		var x0 = this.get('panStartPointX');
		var x = event.originalEvent.changedTouches[0].pageX;
		var y0 = this.get('panStartPointY');
		var y = event.originalEvent.changedTouches[0].pageY;
		var Xd = Math.abs(x0 - x);
		var Yd = Math.abs(y0 - y);
		if((Math.atan2(Yd,Xd) * 180 / Math.PI) > 45) {
			// Intention is scroll
			this.set('panAllowed', false);
			return;
		}
		// Intention is slide
		this.set('panAllowed', true);
	}
});

ZoomRx.Slider = Ember.View.extend({
	classNames: ['slider-container'],
	handlePositionPer:0,
	value:0,
	duplicateValue:0,
	template: Ember.TEMPLATES['template_Slider'],
	stops: '',
	hideTimeout: null, /* Hides the tap feedback after some interval to make it visible to the user*/
	help:false,
	didInsertElement: function() {
		this.refreshParams();
	},
	refreshParams:function(){
		if(typeof this.get('options') == 'undefined') {
			this.set('options', Ember.Object.create());
		}
		// this.options.value = isNaN(parseInt(this.options.value))? 0: parseInt(this.options.value);
		this.options.sliderMin = isNaN(parseInt(this.options.sliderMin))? 1: parseInt(this.options.sliderMin);
		this.options.sliderMax = isNaN(parseInt(this.options.sliderMax))? 100: parseInt(this.options.sliderMax);
		this.options.stepVal = this.options.stepVal > 0? this.options.stepVal: 1;
		this.options.type = this.options.type? this.options.type: 'default';
		this.options.highlightRange = this.options.highlightRange? 'highlight': 'no-highlight'; 
		this.set('help', this.get('help')? true: false);

		var options = this.get('options');
		if(!(this.get('svalue') >= options.get('sliderMin')) && !(this.get('svalue') <= options.get('sliderMax'))) {
			// If the slider is initiated with an invalid value, then set Slider min as the value
			this.set('svalue', options.get('sliderMin'));
		}

		var remaining = (options.get('sliderMax')-options.get('sliderMin')) % options.get('stepVal');
		var isValidMaxVal = remaining == 0 ? true : false;
		if(!isValidMaxVal) {
			options.set('sliderMax',options.get('sliderMax')-remaining);
		}
		options.set('difference',options.get('sliderMax')-options.get('sliderMin'));


		if(this.stops) {
			/* If the html for stops is sent initially just use it.
			 * Note: Performance optimization*/
			return;
		}
		if(this.options['type'] == 'likert') {
			// options.set('showMinMax', false);
			var sliderMin = options.get('sliderMin');
			var sliderMax = options.get('sliderMax');
			var stepVal = options.get('stepVal');
			
			var number_of_stops = (sliderMax - sliderMin) / stepVal;
			var stops_gap = 100 / number_of_stops;
			var stops = '';
			var stops_class_name = 'slider-stops';
			var labels_class_name = '';	
			var optionLabels = options.get('labels');			
			if(number_of_stops <= 10) { // likert scale with bubbles
				if(number_of_stops > 6) { // likert scale with dashes
					stops_class_name += ' stop-dashes';
				}
				var label;
				var middleValue = sliderMin + Math.ceil(number_of_stops/ 2) * stepVal;

				stops += '<div class="' + stops_class_name + ' first-stop" style="left:0%" id="step' + sliderMin + '"></div>';
				stops += '<div class="slider-labels first-label" style="left:0%; ';
				stops += 'margin-left:-'+ (stops_gap * 2/3) +'%;width:'+ ((stops_gap * 3)/2) +'%;" id="label' + sliderMin +'"><div class="slider-label-positioner">';
				label = optionLabels?optionLabels[0]?optionLabels[0]:'':'';
				stops += label + '</div></div>';
				for(var step = 1; step < number_of_stops; step++) {
					var step_value = sliderMin + step * stepVal; 
					if(step_value == middleValue) {
						labels_class_name = 'slider-labels middle-label';
						if(options.get('showMiddleLabel')) {
							labels_class_name += ' show-always';
						}
					} else {
						labels_class_name = 'slider-labels';
					}

					stops += '<div class="' + stops_class_name + '" style="left:' + (step * stops_gap) + '%" id="step' + step_value + '"></div>';
					stops += '<div class="' + labels_class_name + '" style="left:' + (step * stops_gap) + '%; ';
					stops += 'margin-left:-' + (stops_gap) + '%;width:' + (stops_gap * 2) + '%;" id="label' + step_value +'"><div class="slider-label-positioner">';
					label = optionLabels?optionLabels[step]?optionLabels[step]:'':'';
					stops += label + '</div></div>';
				}
				stops += '<div class="' + stops_class_name + ' last-stop" style="left:100%" id="step' + sliderMax + '"></div>';
				stops += '<div class="slider-labels last-label" style="left:100%; ';
				stops += 'margin-left:-'+ (stops_gap * 5/6) +'%;width:'+ ((stops_gap * 3)/2) +'%;" id="label' + sliderMax +'"><div class="slider-label-positioner">';
				label = optionLabels?optionLabels[step]?optionLabels[step]:'':'';
				stops += label + '</div></div>';
				this.set('stops', stops);
			} else {
				// this.options.type();
				this.options.type = 'default';
			}
		}
	}.observes('options'),
	stopHelpAnimation: function() {
		/* Function to stop the adjuster help animation*/
		$('.slider-adjusters').removeClass('area-visible');
		$('.adjuster-help').hide();
		$('.adjuster-help-hand').removeClass('adjuster-auto-slide adjuster-only-left adjuster-only-right');
	},
	callBack: function(event, function_name) {
		/* This function invokes the user callbacks if provided..
		 * Arguments for the callback function which the user can use are 
		 * arg1 - The event object for corresponding user action
		 * arg2 - The object instance of the ZoomRx.Slider view
		 * arg3 - Current value of the corresponding slider
		 */
		var arg1 = event,
			arg2 = this,
			arg3 = this.get('value');
		if(typeof this.callbacks !== "undefined" && typeof this.callbacks[function_name] !== "undefined") {
			this.callbacks[function_name](arg1, arg2, arg3);
		}
	},
	adjustValue: function(event) {
		/* Increase or decrease slider value if the user touches the corresponding adjuster*/
		var target_class_list = event.target.className.toLowerCase();
		// var parent_view = this.get('parentView');
		var current_value = this.get('value');
		var options = this.get('options');
		var Max = options.get('sliderMax');
		var Min = options.get('sliderMin');
		var handle_position = ZoomRx.CACHE[this.get('elementId')]['HANDLE_POSITION'].left;
		var reduction_offset = this.$('.slider-path').offset().left;
		var tap_point = event.originalEvent.changedTouches[0].pageX;
		var current_position = tap_point - reduction_offset;
		current_position = (current_position < 0) ? 0 : current_position;
		var offset_value = options.get('stepVal');
		if(((current_position < handle_position) || target_class_list.indexOf('left-corner') != -1) && !target_class_list.indexOf('right-corner') != -1)
		{
			/* Check if the tap point is inside a valid element*/
			offset_value = offset_value*-1;
		}
		var new_value = current_value + offset_value;
		if((new_value > Max) || (new_value < Min)) {
			/* Dont move beyond the boundaries */
			return;
		}
		this.set('value',new_value);
		if(!ZoomRx.usersAdjustingKnowledge) {
			ZoomRx.usersAdjustingKnowledge = 1;
			this.stopHelpAnimation();	
		}
		this.get('parentView').$('.slider-adjusters').css('opacity', 1);
		this.callBack(event, 'stop');
	},
	addAdjusterFeedBack: function(event) {
		/* Add feedback for tapping adjuster area.*/
		var circle = this.$('.feedback-circle');

		/* Move the feedback circle to the point of contact*/
		circle.css('left', event.originalEvent.changedTouches[0].pageX - 70);
		
		/* Clear the feedback removal timeout, 
		 * just to make sure that no unnecessary timers are running
		 */
		clearTimeout(this.hideTimeout);
		
		/* Show the element with animation*/
		circle.addClass('element-shown');
	},
	removeAdjusterFeedback: function() {
		/* Hide the element after a time interval, 
		 * allowing the feedback to spread to a visible range
		 */
		var self = this;
		this.hideTimeout = setTimeout(function(){
			self.$('.feedback-circle').removeClass('element-shown');
		}, 200);
	}
});