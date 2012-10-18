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
		this.startValue = 0;
		this.wrapId = null;
		this.handleId = null;
		this.valueId = null;
		this.rangeMinId = null;
		this.rangeMaxId = null;
		this.wrap = null;
		this.handle = null;
		this.value = null;
		this.rangeMin = null;
		this.rangeMax = null;

		this.setupDom = function() {
			instances++;

			var baseId = this.input.attr('id');

			if (baseId == null) {
				baseId = instances;
			}

			this.wrapId = 'slider-wrap-' + baseId;
			this.handleId = 'slider-handle-' + baseId;

			this.input.after($('<div/>', {
				'id': this.wrapId,
				'class': this.options.classPrefix + 'slider-wrap'
			}));

			this.wrap = $('#' + this.wrapId);
			this.wrap.css({
				width: this.options.width
			});

			this.wrap.append($('<div/>', {
				'id': this.handleId,
				'class': this.options.classPrefix + 'slider-handle'
			}));

			this.handle = $('#' + this.handleId);

			this.startValue = this.input.val();

			var minValue = this.input.data('min') || 0,
				maxValue = this.input.data('max') || 100,
				step = this.input.data('step') || 1,
				range = maxValue - minValue,
				value = Math.round(this.startValue / step) * step,
				normalizedValue = (value - minValue) / range,
				wrapWidth = parseInt(this.wrap.width()),
				handleLeft = wrapWidth * normalizedValue;

			this.handle.css({
				left: handleLeft
			});

			if (this.options.showValue) {
				this.valueId = 'slider-value-' + baseId;

				this.wrap.append($('<div/>', {
					'id': this.valueId,
					'class': this.options.classPrefix + 'slider-value'
				}));

				this.value = $('#' + this.valueId);
				this.value.html(this.startValue);
			}

			if (this.options.showRange) {
				this.rangeMinId = 'slider-range-min-' + baseId;
				this.rangeMaxId = 'slider-range-max-' + baseId;

				this.wrap.append($('<div/>', {
					'id': this.rangeMinId,
					'class': this.options.classPrefix + 'slider-range min'
				}));

				this.wrap.append($('<div/>', {
					'id': this.rangeMaxId,
					'class': this.options.classPrefix + 'slider-range max'
				}));

				this.rangeMin = $('#' + this.rangeMinId);
				this.rangeMax = $('#' + this.rangeMaxId);

				this.rangeMin.html(minValue);
				this.rangeMax.html(maxValue);
			}

			this.input.hide();
		};

		this.setupEvents = function() {
			var self = this;

			this.handle.mousedown(function(e) {
				self.onDragStart(e);
			});

			$(document).mousemove(function(e) {
				self.onDragProgress(e);
			});

			$(document).mouseup(function(e) {
				self.onDragEnd(e);
			});
		};

		this.onDragStart = function(e) {
			this.dragging = true;

			if (typeof(this.options.onStart) == 'function') {
				this.options.onStart(this.input[0]);
			}
		};

		this.onDragProgress = function(e) {
			if (!this.dragging) {
				return;
			}

			var wrapLeft = this.wrap.position().left,
				wrapWidth = parseInt(this.wrap.width()),
				handleLeft = Math.min(Math.max(e.clientX - wrapLeft, 0), wrapWidth),
				minValue = this.input.data('min') || 0,
				maxValue = this.input.data('max') || 100,
				step = this.input.data('step') || 1,
				range = maxValue - minValue,
				normalizedValue = handleLeft / wrapWidth,
				value = range * normalizedValue + minValue;

			value = Math.round(value / step) * step;
			normalizedValue = (value - minValue) / range;
			handleLeft = wrapWidth * normalizedValue;

			this.handle.css({
				left: handleLeft
			});

			this.input.val(value);

			if (this.options.showValue) {
				this.value.html(value);
			}

			this.input.trigger('change');

			if (typeof(this.options.onProgress) == 'function') {
				this.options.onProgress(value, normalizedValue, this.input[0]);
			}
		};

		this.onDragEnd = function(e) {
			if (this.dragging) {
				this.dragging = false;

				if (typeof(this.options.onEnd) == 'function') {
					this.options.onEnd(this.input.val(), this.input[0]);
				}
			}
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