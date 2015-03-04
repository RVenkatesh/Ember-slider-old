App = Ember.Application.create({
	ready: function() {
		console.log("Application ready...");
	}
});

App.Slider = Ember.View.extend({
	classNames: ['Slider'],
	templateName: 'slider',
	didInsertElement: function() {
        var labels = ["test", "test2", "test3"];
        var options = Ember.Object.create({
            'sliderMin': 1,
            'sliderMax': 7,
            'stepVal': 1,
            'type': 'likert',
            'highlightRange': 'highlight',
            'labels': labels
        });
		this.set('options', options);
		this.set('help', true);
	}
});