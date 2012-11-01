jQuery Slider Plugin
====================

**Minimal, unobtrusive and simple to use horizontal jQuery slider plugin.**

Features
--------
* Very easy to use
* Transforms text-inputs so works without JavaScript
* Normal 'change' event of input element works
* You can always read the value from the original input that is kept updated
* Supports single and ranged slider types
* Simple to change appearance using CSS
* Provided example minimalistic stylesheet
* Supports displaying range and current value
* Supports setting step size
* Works for any range including 0..1
* Range and value can be updated at any time
* Change events can be limited to minimal interval
* It's tiny - just 8KB minified


How to use
----------
Check out [the example](https://github.com/kallaspriit/jquery-slider/blob/master/index.html).

```javascript
<div style="width: 300px">
	<p>
		<input type="text" name="slider-simple" id="slider-simple" data-step="5"/>
		<span id="value">0</span>
	</p>
	<p><input type="text" name="slider-options" id="slider-options" value="128" data-min="0" data-max="255"/></p>
	<p><input type="text" name="slider-range" id="slider-range" value="64 192" data-min="0" data-max="255"/></p>
	<p><button name="update-ranges" id="update-ranges">Update ranges</button> <button name="update-values" id="update-values">Update values</button></p>
</div>

<script>

$(document).ready(function() {
	$('#slider-simple').slider();

	$('#slider-simple').change(function() {
		$('#value').html($(this).val());
	});

	$('#slider-simple').slider('end', function(value) {
		console.log('simple stop drag value', value);
	})

	$('#slider-options').slider({
		width: '200px',
		showValue: true,
		showRange: true,
		minChangeInterval: 500, //fires change event at most every 500ms
		onStart: function(el) {
			console.log('started', el);
		},
		onChange: function(value, el) {
			console.log('progress', value, el);
		},
		onEnd: function(value, el) {
			console.log('end', value, el);
		}
	});

	$('#slider-range').slider({
		width: '200px',
		showValue: true,
		showRange: true,
		onChange: function(valueLeft, valueRight, el) {
			console.log('range progress', valueLeft, valueRight, el);
		}
	});

	$('#update-ranges').click(function() {
		$('#slider-options').slider('range', 0, 1, 0.1);
		$('#slider-range').slider('max', 1024);
	});

	$('#update-values').click(function() {
		$('#slider-options').slider('val', 192);
		$('#slider-range').slider('val', 32, 64);
	});
});

</script>
```

Options
-------
* **classPrefix** - name to prepend to every slider class, defaults to none
* **width** - width of the slider, defaults to 100%
* **showValue** - should current slider value be displayed, defaults to false
* **showRange** - should min and max labels be displayed, defaults to false
* **onStart** - callback to call when starting to change value
* **onChange** - called every time value changes at most every minChangeInterval
* **onEnd** - called when a value is selected
* **minChangeInterval** - at most how often to call the onChange callback

Functions
-------
* **init** - initializes the slider, called on $(..).slider();
* **range(min, max, [step])** - changes slider range and optionally step
* **min(value)** - set range low-value
* **max(value)** - set range high-value
* **val(value, [right])** - sets slider value, use two values for range slider
* **change(callback)** - sets callback to call on value change (sliding)
* **start(callback)** - sets callback to call when sliding is started
* **end(callback)** - sets callback to call when sliding is ended

For example
```javascript
$('#slider-options').slider('range', 0, 1, 0.1);
```