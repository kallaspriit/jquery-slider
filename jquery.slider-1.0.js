(function($){
	var instances = 0;

	function Slider(input, options) {
		this.defaults = {
			classPrefix: '',
			width: '100%',
			showValue: false,
			showRange: false,
			onStart: null,
			onProgress: null,
			onEnd: null
		};

		this.options = $.extend({}, this.defaults, options);
		this.input = $(input);
		this.dragging = 0;
		this.ranged = false;
		this.startValue = 0;
		this.startValueLeft = null;
		this.startValueRight = null;
		this.wrapId = null;
		this.handleLeftId = null;
		this.handleRightId = null;
		this.connectorId = null;
		this.valueId = null;
		this.rangeMinId = null;
		this.rangeMaxId = null;
		this.wrap = null;
		this.handleLeft = null;
		this.handleRight = null;
		this.connector = null;
		this.value = null;
		this.rangeMin = null;
		this.rangeMax = null;

		this.setupDom = function() {
			instances++;

			// check for range slider
			this.startValue = this.input.val();

			if (this.startValue.indexOf(' ') != -1) {
				var startValues = this.startValue.split(' ');

				this.startValueLeft = parseInt(startValues[0]);
				this.startValueRight = startValues[1];

				this.startValue = this.startValueLeft;
				this.ranged = true;
			}

			// create the main wrap
			var baseId = this.input.attr('id');

			if (baseId == null) {
				baseId = instances;
			}

			this.wrapId = 'slider-wrap-' + baseId;

			this.input.after($('<div/>', {
				'id': this.wrapId,
				'class': this.options.classPrefix + 'slider-wrap'
			}));

			this.wrap = $('#' + this.wrapId);
			this.wrap.css({
				width: this.options.width
			});

			// add connector
			this.connectorId = 'slider-connector-left-' + baseId;

			this.wrap.append($('<div/>', {
				'id': this.connectorId,
				'class': this.options.classPrefix + 'slider-connector-left'
			}));

			this.connector = $('#' + this.connectorId);

			// add left handle
			this.handleLeftId = 'slider-handle-left-' + baseId;

			this.wrap.append($('<div/>', {
				'id': this.handleLeftId,
				'class': this.options.classPrefix + 'slider-handle-left'
			}));

			this.handleLeft = $('#' + this.handleLeftId);

			if (this.ranged) {
				this.handleRightId = 'slider-handle-right-' + baseId;

				this.wrap.append($('<div/>', {
					'id': this.handleRightId,
					'class': this.options.classPrefix + 'slider-handle-right'
				}));

				this.handleRight = $('#' + this.handleRightId);
			}

			// add labels
			var minValue = this.input.data('min') || 0,
				maxValue = this.input.data('max') || 100,
				step = this.input.data('step') || 1,
				range = maxValue - minValue,
				wrapWidth = parseInt(this.wrap.width());

			if (this.ranged) {
				var valueLeft = Math.round(this.startValueLeft / step) * step,
					normalizedValueLeft = (valueLeft - minValue) / range,
					posLeft = wrapWidth * normalizedValueLeft,
					valueRight = Math.round(this.startValueRight / step) * step,
					normalizedValueRight = (valueRight - minValue) / range,
					posRight = wrapWidth * normalizedValueRight;

				this.handleLeft.css({
					left: posLeft
				});

				this.handleRight.css({
					left: posRight
				});

				this.connector.css({
					left: posLeft,
					width: posRight - posLeft
				});
			} else {
				var value = Math.round(this.startValue / step) * step,
					normalizedValue = (value - minValue) / range,
					pos = wrapWidth * normalizedValue;

				this.handleLeft.css({
					left: pos
				});

				this.connector.css({
					width: pos
				});
			}

			if (this.options.showValue) {
				this.valueId = 'slider-value-' + baseId;

				this.wrap.append($('<div/>', {
					'id': this.valueId,
					'class': this.options.classPrefix + 'slider-value'
				}));

				this.wrap.addClass('with-value');

				this.value = $('#' + this.valueId);

				if (!this.ranged) {
					this.value.html(this.startValue);
				} else {
					this.value.html(
						this.startValueLeft + ' - ' + this.startValueRight
					);
				}
			}

			if (this.options.showRange) {
				this.rangeMinId = 'slider-range-min-' + baseId;
				this.rangeMaxId = 'slider-range-max-' + baseId;

				this.wrap.append($('<div/>', {
					'id': this.rangeMinId,
					'class': this.options.classPrefix + 'slider-range-min'
				}));

				this.wrap.append($('<div/>', {
					'id': this.rangeMaxId,
					'class': this.options.classPrefix + 'slider-range-max'
				}));

				this.wrap.addClass('with-range');

				this.rangeMin = $('#' + this.rangeMinId);
				this.rangeMax = $('#' + this.rangeMaxId);

				this.rangeMin.html(minValue);
				this.rangeMax.html(maxValue);
			}

			this.input.hide();
		};

		this.setupEvents = function() {
			var self = this;

			this.handleLeft.mousedown(function(e) {
				self.onDragStart(e);
				self.onDragStartLeft(e);
			});

			if (this.ranged) {
				this.handleRight.mousedown(function(e) {
					self.onDragStart(e);
					self.onDragStartRight(e);
				});
			}

			$(document).mousemove(function(e) {
				self.onDragProgress(e);
			});

			$(document).mouseup(function(e) {
				self.onDragEnd(e);
			});
		};

		this.onDragStart = function(e) {
			$(document.body).addClass('slider-unselectable');
		};

		this.onDragStartLeft = function(e) {
			this.dragging = 1;

			if (typeof(this.options.onStart) == 'function') {
				this.options.onStart('left', this.input[0]);
			}

			if (typeof(this.options.onStartLeft) == 'function') {
				this.options.onStartLeft(this.input[0]);
			}
		};

		this.onDragStartRight = function(e) {
			this.dragging = 2;

			if (typeof(this.options.onStart) == 'function') {
				this.options.onStart('right', this.input[0]);
			}

			if (typeof(this.options.onStartRight) == 'function') {
				this.options.onStartRight(this.input[0]);
			}
		};

		this.onDragProgress = function(e) {
			if (this.dragging == 0) {
				return;
			}

			var wrapLeft = this.wrap.position().left,
				wrapWidth = parseInt(this.wrap.width()),
				pos = Math.min(Math.max(e.clientX - wrapLeft, 0), wrapWidth);

			if (this.ranged) {
				var leftPos = this.handleLeft.position().left,
					rightPos = this.handleRight.position().left;

				if (this.dragging == 1 && pos > rightPos) {
					pos = rightPos;
				} else if (this.dragging == 2 && pos < leftPos) {
					pos = leftPos;
				}
			}

			var minValue = this.input.data('min') || 0,
				maxValue = this.input.data('max') || 100,
				step = this.input.data('step') || 1,
				range = maxValue - minValue,
				normalizedValue = pos / wrapWidth,
				value = Math.round(
					(range * normalizedValue + minValue) / step
				) * step;

			normalizedValue = (value - minValue) / range;
			pos = wrapWidth * normalizedValue;

			if (!this.ranged) {
				this.handleLeft.css({
					left: pos
				});

				this.connector.css({
					width: pos
				});

				this.input.attr('value', value);

				if (this.options.showValue) {
					this.value.html(value);
				}

				if (typeof(this.options.onProgress) == 'function') {
					this.options.onProgress(value, this.input[0]);
				}
			} else {
				var handle = this.dragging == 1
						? this.handleLeft
						: this.handleRight,
					currentValues = this.input.val().split(' '),
					valueLeft = parseInt(currentValues[0]),
					valueRight = parseInt(currentValues[1]);

				handle.css({
					left: pos
				});

				var posLeft = this.handleLeft.position().left,
					posRight = this.handleRight.position().left;

				this.connector.css({
					left: posLeft,
					width: posRight - posLeft
				});

				if (this.dragging == 1) {
					valueLeft = value;
				} else {
					valueRight = value;
				}

				this.input.attr('value', valueLeft + ' ' + valueRight);

				if (this.options.showValue) {
					this.value.html(valueLeft + ' - ' + valueRight);
				}

				if (typeof(this.options.onProgress) == 'function') {
					this.options.onProgress(valueLeft, valueRight, this.input[0]);
				}
			}

			this.input.trigger('change');
		};

		this.onDragEnd = function(e) {
			if (this.dragging == 0) {
				return;
			}

			if (typeof(this.options.onEnd) == 'function') {
				this.options.onEnd(
					this.input.val(),
					this.dragging == 1 ? 'left' : 'right',
					this.input[0]
				);
			}

			this.dragging = 0;

			$(document.body).removeClass('slider-unselectable');
		};
	};

	Slider.prototype = {
		init: function() {
			this.setupDom();
			this.setupEvents();
		}
	};

	$.fn.slider = function(options) {
		var args = Array.prototype.slice.call(arguments);

		if(this.length) {
			this.each(function() {
				var slider = $(this).data('slider');

				if (slider == null) {
					slider = new Slider(this, options);

					slider.init();

					$(this).data('slider', slider);
				} else {
					if (args.length == 0) {
						return;
					}

					var method = args[0];

					if (typeof(slider[method]) == 'function') {
						slider[method].apply(slider, args.slice(1));
					}
				}
			});
		}
	};
})(jQuery);