(function($){

	//jQuery powered simple slider
	function Slider(el, options) {

		//Defaults:
		this.defaults = {
			something: 'yeah'
		};

		//Extending options:
		this.opts = $.extend({}, this.defaults, options);

		//Privates:
		this.$el = $(el);
		this.other = 'bar';
	}

	// Separate functionality from object creation
	Slider.prototype = {

		init: function() {
			var _this = this;
		},

		go: function() {
			var _this = this;
		}
	};

	// The actual plugin
	$.fn.slider = function(options) {
		if(this.length) {
			this.each(function() {
				var rev = new Slider(this, options);
				rev.init();
				$(this).data('slider', rev);
			});
		}
	};
})(jQuery);