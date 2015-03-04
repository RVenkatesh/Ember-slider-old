Ember Slider
============

Ember slider is library built using [Ember Views](http://emberjs.com/api/classes/Ember.View.html). It enables you to include different types of sliders in any Ember view in a normal way of including a view inside a Ember template.
This also supports a specific type called likert slider which shows the slider as a [likert scale](http://en.wikipedia.org/wiki/Likert_scale) with labels for each point. 

##Dependencies

Ember slider makes use of the following libraries

* Ember(v0.9.8)
* Ember touch
* Handlebars(v1.0.rc.1)
* jQuery(v1.7.2)
* Ember Click (ember-click.js - A modified version of ember-touch.js for desktop browsers only)

This uses the pretty older versions of Ember and other libraries. Support for latest libraries will be added soon.

##How to use

Include all the necessary dependencies in your html file. Include ember-touch.js for mobile devices and ember-click.js for desktop browsers.

Create options in the view you want to insert the slider

 
    App.Slider = Ember.View.extend({
    	classNames: ['Slider'],
    	templateName: 'slider',
    	didInsertElement: function() {
            var options = Ember.Object.create({
                'sliderMin': 1,
                'sliderMax': 10,
                'stepVal': 1,
                'type': 'default',
                'highlightRange': 'no-highlight'
            });
    		this.set('options', options);
    		this.set('help', true);
    	}
    });
 
Then insert a slider view binding the options of the parent view to it

 
    <script type="text/x-handlebars" data-template-name="slider">
    {{view ZoomRx.Slider optionsBinding="view.options" helpBinding="view.help"}}
    </script>
 

##Options

Following are the options which can be used in the slider

* **sliderMin** - Slider minimum value i.e., the Left most end point of the slider
* **sliderMax** - Slider maximum value i.e., the Right most end point of the slider
* **stepVal** - The slider increments. 
* **type** - "default" or "likert". Specifies the type of slider to use. If the number of slider increments is less than or equal to 10 then likert type will be used else normal slider will be used.
* **highlightRange** - "highlight" or "no-highlight" Indicating whether to highlight the selected range or not.
* **labels** - Array of likert labels to use for the slider. Each label text corresponding to a particular likert point will be shown when the value is selected.

##Credits

**Dhineshkumar Sundaram, Project lead, ZoomRx.** has been very helpful in building the very basics of this component and being the one to motivate building such component using Ember.

**Dineshkumar Arumugam, Senior engineer - mobile solutions, ZoomRx.** and **Rajeshkumar Animuthu, Engineer - mobile solutions, ZoomRx.** have contributed many core functionalities in this slider and fixing major bugs.

**Raja Kaniappa, Design team, ZoomRx.** - basic slider design and likert scale design.

**Sivakumar Kuppusamy, General manager, ZoomRx, Chennai.** and **Vasanthakumar Periaswamy, Engineering manager, Zoomrx, Chennai** have been greatly supporting and motivating in posting this in GitHub.

Thanks to the whole ZoomRx Team for the support.
