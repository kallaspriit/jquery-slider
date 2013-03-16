(function($){
	var instances = 0;

	function Slider(input, options) {
		this.defaults = {
			classPrefix: '',
			width: '100%',
			showValue: false,
			showRange: false,
			onStart: null,
			onChange: null,
			onEnd: null,
			minChangeInterval: 0,
			decimals: 1
		};

		var step = $('input').data('step') || 1;

		this.defaults['decimals'] = step < 1 ? ((1 / step) + '').length - 1 : 0;

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
		this.trackId = null;
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
		this.lastChangeTime = null;
		this.activeHandle = 0;
		this.document = null;

		this.setupDom = function() {
			
			this.document = $(document);
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
			
			this.wrap = $('<div/>', {
				'id': 'slider-wrap-' + baseId,
				'class': this.options.classPrefix + 'slider-wrap jquery-slider'
			}).css({
				'width': this.options.width
			});

			// add track
			this.track = $('<div/>', {
				'id': 'slider-track-' + baseId,
				'class': this.options.classPrefix + 'slider-track'
			}).appendTo(this.wrap);
			
			// add connector
			this.connector = $('<div/>', {
				'id': 'slider-connector-left-' + baseId,
				'class': this.options.classPrefix + 'slider-connector-left'
			}).appendTo(this.wrap);

			// add left handle
			this.handleLeft = $('<div/>', {
				'id': 'slider-handle-left-' + baseId,
				'class': this.options.classPrefix + 'slider-handle ' + this.options.classPrefix + 'slider-handle-left'
			}).appendTo(this.wrap);
			
			//add right handle
			if (this.ranged) {
				this.handleRight = $('<div/>', {
					'id': 'slider-handle-right-' + baseId,
					'class': this.options.classPrefix + 'slider-handle ' + this.options.classPrefix + 'slider-handle-right'
				}).appendTo(this.wrap);
			}

			// add labels
			if (this.options.showValue) {
				this.valueId = 'slider-value-' + baseId;

				this.value = $('<div/>', {
					'id': this.valueId,
					'class': this.options.classPrefix + 'slider-value'
				}).appendTo(this.wrap);

				this.wrap.addClass('with-value');

				if (!this.ranged) {
					this.value.text(this.round(this.startValue, this.options.decimals));
				} else {
					this.value.text(
						this.round(this.startValueLeft, this.options.decimals) + ' - ' +
						this.round(this.startValueRight, this.options.decimals)
					);
				}
			}

			if (this.options.showRange) {
				var minValue = this.input.data('min') || 0,
					maxValue = this.input.data('max') || 100;

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

			// set default value
			this.setValue(this.input.val());

			this.input.hide();
			this.input.after(this.wrap);
			
		};

		this.setupEvents = function() {
			var self = this;
			
			this.handleLeft.on('mousedown touchstart', function(e) {
				self.onDragStartLeft(e);
				self.activeHandle = 1;
				self.bindEventsTo(self.handleLeft, e);
			});

			if (this.ranged) {
				this.handleRight.on('mousedown touchstart', function(e) {
					self.onDragStartRight(e);
					self.activeHandle = 2;
					self.bindEventsTo(self.handleRight, e);
				});
			}

			$(document).keydown(function(e) {
				self.onKeyDown(e);
			});

			this.wrap.on('click tap' ,function(e) {
				self.jumpTo(self.getClientX(e));
			});
		};
		
		this.bindEventsTo = function(handle, e) {
			var self = this;
			
			handle.addClass('slider-handle-active');
			this.onDragStart(e);
				
			this.document.on('mousemove touchmove' ,function(e) {
				self.onDragProgress(e);
			});

			handle.one('mouseup touchend', function(e) {
				self.document.off('mousemove touchmove');
				handle.removeClass('slider-handle-active');
				self.onDragEnd(e);
			});

			for (var i = 0; i < window._jQsliders.length; i++) {
				window._jQsliders[i].activeHandle = 0;
			}

			e.preventDefault();

			return false;
		};

		this.onDragStart = function() {
			this.disableTextSelect();
		};

		this.onDragStartLeft = function() {
			this.dragging = 1;

			if (typeof(this.options.onStart) == 'function') {
				this.options.onStart('left', this.input[0]);
			}

			if (typeof(this.options.onStartLeft) == 'function') {
				this.options.onStartLeft(this.input[0]);
			}
		};

		this.onDragStartRight = function() {
			this.dragging = 2;

			if (typeof(this.options.onStart) == 'function') {
				this.options.onStart('right', this.input[0]);
			}

			if (typeof(this.options.onStartRight) == 'function') {
				this.options.onStartRight(this.input[0]);
			}
		};
		
		this.getClientX = function(e) {
			//check if user is using touch device
			if (typeof(e.clientX) === 'undefined') {
				return e.originalEvent.touches[0].pageX;
			} else {
				return e.clientX;
			}
		};
		
		this.onDragProgress = function(e) {
			if (this.dragging == 0) {
				return;
			}
			
			var wrapLeft = this.wrap.offset().left,
				wrapWidth = parseInt(this.wrap.width()),
				pos = Math.min(Math.max(this.getClientX(e) - wrapLeft, 0), wrapWidth);

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
				) * step,
				currentTime,
				sinceLast;

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
					this.value.html(this.round(value, this.options.decimals));
				}

				if (typeof(this.options.onChange) == 'function') {
					if (this.options.minChangeInterval == 0) {
						this.options.onChange(value, this.input[0]);
					} else {
						currentTime = this.getMillitime();
						sinceLast = currentTime - this.lastChangeTime;

						if (
							this.options.minChangeInterval == null
							|| sinceLast >= this.options.minChangeInterval
						) {
							this.options.onChange(value, this.input[0]);
							this.lastChangeTime = currentTime;
						}
					}
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
					this.value.html(
						this.round(valueLeft, this.options.decimals) + ' - ' +
						this.round(valueRight, this.options.decimals)
					);
				}

				if (typeof(this.options.onChange) == 'function') {
					this.options.onChange(
						valueLeft,
						valueRight,
						this.input[0]
					);
				}

				if (typeof(this.options.onChange) == 'function') {
					if (this.options.minChangeInterval == 0) {
						this.options.onChange(
							valueLeft,
							valueRight,
							this.input[0]
						);
					} else {
						currentTime = this.getMillitime();
						sinceLast = currentTime - this.lastChangeTime;

						if (
							this.options.minChangeInterval == null
							|| sinceLast >= this.options.minChangeInterval
						) {
							this.options.onChange(
								valueLeft,
								valueRight,
								this.input[0]
							);
							this.lastChangeTime = currentTime;
						}
					}
				}
			}

			this.input.trigger('change');
		};

		this.onDragEnd = function() {
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

			this.enableTextSelect();
		};

		this.onKeyDown = function(e) {
			if (
				this.activeHandle == 0
				|| (e.keyCode != 37 && e.keyCode != 39)
			) {
				return;
			}

			var rawValue = this.input.val(),
				leftValue,
				rightValue,
				changeValue;

			if (this.ranged) {
				leftValue = parseInt(rawValue.split(' ')[0]);
				rightValue = parseInt(rawValue.split(' ')[1]);

				if (this.activeHandle == 1) {
					changeValue = leftValue;
				} else {
					changeValue = rightValue;
				}
			} else {
				leftValue = parseInt(rawValue);
				changeValue = leftValue;
			}

			var	minValue = parseInt(this.input.data('min')) || 0,
				maxValue = parseInt(this.input.data('max')) || 100,
				step = parseInt(this.input.data('step')) || 1;

			if (e.shiftKey) {
				step *= 10;
			}

			if (e.keyCode == 37) {
				changeValue = Math.max(changeValue - step, minValue);
			} else {
				changeValue = Math.min(changeValue + step, maxValue);
			}

			if (this.ranged) {
				if (this.activeHandle == 1) {
					if (changeValue > rightValue) {
						changeValue = rightValue;
					}

					this.setValue(changeValue + ' ' + rightValue);
				} else {
					if (changeValue < leftValue) {
						changeValue = leftValue;
					}

					this.setValue(leftValue + ' ' + changeValue);
				}
			} else {
				this.setValue(changeValue);
			}
		};

		this.jumpTo = function(clientX) {
			if (this.dragging != 0) {
				return;
			}

			var wrapLeft = this.wrap.offset().left,
				wrapWidth = parseInt(this.wrap.width()),
				pos = Math.min(Math.max(clientX - wrapLeft, 0), wrapWidth),
				event = {
					clientX: clientX
				};

			for (var i = 0; i < window._jQsliders.length; i++) {
				window._jQsliders[i].activeHandle = 0;
			}

			this.dragging = !this.ranged || pos < wrapWidth / 2 ? 1 : 2;
			this.activeHandle = this.dragging;
			this.onDragProgress(event);
			this.dragging = 0;
		};

		this.setValue = function(value) {
			this.startValue = value;

			if (typeof(value) == 'string' && value.indexOf(' ') != -1) {
				var startValues = value.split(' ');

				this.startValueLeft = parseInt(startValues[0]);
				this.startValueRight = startValues[1];

				this.startValue = this.startValueLeft;
				this.ranged = true;
			}

			var minValue = this.input.data('min') || 0,
				maxValue = this.input.data('max') || 100,
				step = this.input.data('step') || 1,
				range = maxValue - minValue,
				wrapWidth = parseInt(this.wrap.width());

			if (this.ranged) {
				if (this.startValueLeft < minValue) {
					this.startValueLeft = minValue;
				}

				if (this.startValueRight < minValue) {
					this.startValueRight = minValue;
				}

				if (this.startValueLeft > maxValue) {
					this.startValueLeft = maxValue;
				}

				if (this.startValueRight > maxValue) {
					this.startValueRight = maxValue;
				}

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

				this.input.attr('value', valueLeft + ' ' + valueRight);

				if (this.options.showValue) {
					this.value.html(
						this.round(valueLeft, this.options.decimals) + ' - ' +
						this.round(valueRight, this.options.decimals)
					);
				}

				if (typeof(this.options.onChange) == 'function') {
					this.options.onChange(
						valueLeft,
						valueRight,
						this.input[0]
					);
				}
			} else {
				if (this.startValue < minValue) {
					this.startValue = minValue;
				} else if (this.startValue > maxValue) {
					this.startValue = maxValue;
				}

				var singleValue = Math.round(this.startValue / step) * step,
					normalizedValue = (singleValue - minValue) / range,
					pos = wrapWidth * normalizedValue;

				this.handleLeft.css({
					left: pos
				});

				this.connector.css({
					width: pos
				});

				this.input.attr('value', value);

				if (this.options.showValue) {
					this.value.html(this.round(singleValue, this.options.decimals));
				}

				if (typeof(this.options.onChange) == 'function') {
					this.options.onChange(
						singleValue,
						this.input[0]
					);
				}
			}

			this.input.trigger('change');
		};

		this.disableTextSelect = function() {
//			$('*')
//				.attr('unselectable', 'on')
//				.css('user-select', 'none')
//				.on('selectstart', false)
//				.addClass('slider-unselectable');
		};

		this.enableTextSelect = function() {
//			$('*')
//				.removeAttr('unselectable')
//				.css('user-select', '')
//				.unbind('selectstart')
//				.removeClass('slider-unselectable');
		};

		this.getMillitime = function() {
			return (new Date()).getTime();
		};

		this.round = function(number, decimals) {
			if (typeof(number) !== 'number') {
				return number;
			}

			return number.toFixed(decimals);
		};
	}

	Slider.prototype = {
		init: function() {
			if (typeof(window._jQsliders) == 'undefined') {
				window._jQsliders = [];
			}

			window._jQsliders.push(this);

			this.setupDom();
			this.setupEvents();
		},

		range: function(min, max, step) {
			this.input.data('min', min);
			this.input.data('max', max);

			if (typeof(step) == 'number') {
				this.input.data('step', step);
			}

			if (this.options.showRange) {
				this.rangeMin.html(min);
				this.rangeMax.html(max);
			}

			this.setValue(this.input.val());
		},

		min: function(min) {
			this.range(min, this.input.data('max'));
		},

		max: function(max) {
			this.range(this.input.data('min'), max);
		},

		val: function(value, right) {
			if (typeof(right) != 'undefined') {
				value = parseInt(value) + ' ' + parseInt(right);
			} else if (parseInt(value) == value) {
				value = parseInt(value);
			}

			this.setValue(value);
		},

		change: function(callback) {
			this.options.onChange = callback;
		},

		start: function(callback) {
			this.options.onStart = callback;
		},

		end: function(callback) {
			this.options.onEnd = callback;
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

		return this;
	};
})(jQuery);