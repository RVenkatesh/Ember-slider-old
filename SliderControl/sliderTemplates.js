Ember.TEMPLATES["template_Slider"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Ember.Handlebars.helpers;
    var buffer = '', stack1, stack2, stack3, foundHelper, tmp1, self=this, escapeExpression=this.escapeExpression;


    stack1 = depth0;
    stack2 = "ZoomRx.SliderAdjusters";
    stack3 = helpers.view;
    tmp1 = {};
    tmp1.hash = {};
    tmp1.contexts = [];
    tmp1.contexts.push(stack1);
    tmp1.data = data;
    stack1 = stack3.call(depth0, stack2, tmp1);
    data.buffer.push(escapeExpression(stack1) + "\n");
    stack1 = depth0;
    stack2 = "ZoomRx.SliderPath";
    stack3 = helpers.view;
    tmp1 = {};
    tmp1.hash = {};
    tmp1.contexts = [];
    tmp1.contexts.push(stack1);
    tmp1.data = data;
    stack1 = stack3.call(depth0, stack2, tmp1);
    data.buffer.push(escapeExpression(stack1));
    return buffer;
});
Ember.TEMPLATES["template_SliderAdjusters"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Ember.Handlebars.helpers;
    var foundHelper, self=this;


    data.buffer.push("<div class=\"adjuster-corners left-corner\"></div>\n<div class=\"adjuster-corners right-corner\"></div>\n<div class=\"feedback-circle\"></div>");
});
Ember.TEMPLATES["template_SliderPath"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
    helpers = helpers || Ember.Handlebars.helpers;
    var buffer = '', stack1, stack2, stack3, stack4, foundHelper, tmp1, self=this, escapeExpression=this.escapeExpression;


    data.buffer.push("<div class=\"slider-path ");
    stack1 = depth0;
    stack2 = "view.parentView.options.highlightRange";
    stack3 = helpers.unbound;
    tmp1 = {};
    tmp1.hash = {};
    tmp1.contexts = [];
    tmp1.contexts.push(stack1);
    tmp1.data = data;
    stack1 = stack3.call(depth0, stack2, tmp1);
    data.buffer.push(escapeExpression(stack1) + " ");
    stack1 = depth0;
    stack2 = "view.parentView.options.type";
    stack3 = helpers.unbound;
    tmp1 = {};
    tmp1.hash = {};
    tmp1.contexts = [];
    tmp1.contexts.push(stack1);
    tmp1.data = data;
    stack1 = stack3.call(depth0, stack2, tmp1);
    data.buffer.push(escapeExpression(stack1) + "\">\n	<div class=\"slider-color-filler\"></div>\n	<div class=\"slider-stops-container\">");
    stack1 = depth0;
    stack2 = "view.parentView.stops";
    stack3 = {};
    stack4 = "true";
    stack3['unescaped'] = stack4;
    stack4 = helpers._triageMustache;
    tmp1 = {};
    tmp1.hash = stack3;
    tmp1.contexts = [];
    tmp1.contexts.push(stack1);
    tmp1.data = data;
    stack1 = stack4.call(depth0, stack2, tmp1);
    if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
    data.buffer.push("</div>\n	<div class=\"slider-min-max-container\">\n		<div class=\"slider-min-label\">");
    stack1 = depth0;
    stack2 = "view.parentView.options.sliderMin";
    stack3 = helpers.unbound;
    tmp1 = {};
    tmp1.hash = {};
    tmp1.contexts = [];
    tmp1.contexts.push(stack1);
    tmp1.data = data;
    stack1 = stack3.call(depth0, stack2, tmp1);
    data.buffer.push(escapeExpression(stack1) + "</div>\n		<div class=\"slider-max-label\">");
    stack1 = depth0;
    stack2 = "view.parentView.options.sliderMax";
    stack3 = helpers.unbound;
    tmp1 = {};
    tmp1.hash = {};
    tmp1.contexts = [];
    tmp1.contexts.push(stack1);
    tmp1.data = data;
    stack1 = stack3.call(depth0, stack2, tmp1);
    data.buffer.push(escapeExpression(stack1) + "</div>\n	</div>\n	<div class=\"slider-handle\">\n		<div class=\"slider-value-indicator\" data-adjust=\"1\">\n			<div class=\"slider-value\" data-adjust=\"1\">\n				<span data-adjust=\"1\">\n					");
    stack1 = depth0;
    stack2 = "view.parentView.value";
    stack3 = helpers.unbound;
    tmp1 = {};
    tmp1.hash = {};
    tmp1.contexts = [];
    tmp1.contexts.push(stack1);
    tmp1.data = data;
    stack1 = stack3.call(depth0, stack2, tmp1);
    data.buffer.push(escapeExpression(stack1) + "\n				</span>\n				<canvas class=\"slider-value-arrow-svg\" data-notap=\"1\"></canvas>\n				<div class=\"slider-value-arrow\"></div>\n			</div>\n		</div>\n		<div class=\"adjuster-help\" data-adjust=\"1\">\n			<div class=\"adjuster-help-hand\" data-adjust=\"1\"></div>\n		</div>\n	</div>\n</div>\n\n");
    return buffer;
});
