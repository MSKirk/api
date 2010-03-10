/*!
* jquery.qtip.modal. The jQuery tooltip plugin - Modal component
*
* Allows you to specify any tooltip as 'modal' e.g. dims document background on tooltip show.
* To enable this on your qTips, simply specify show.modal as true:
*
*  show: { modal: true }
*
* Copyright (c) 2009 Craig Thompson
* http://craigsworks.com
*
* Licensed under MIT
* http://www.opensource.org/licenses/mit-license.php
*
* Launch: August 2009
* Version: UNSTABLE REVISION CODE! Visit http://craigsworks.com/projects/qtip/ for stable code
*
* FOR STABLE VERSIONS VISIT: http://craigsworks.com/projects/qtip/download/
*/

"use strict"; // Enable ECMAScript "strict" operation for this function. See more: http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more/
/*jslint onevar: true, browser: true, forin: true, undef: true, nomen: true, bitwise: true, regexp: true, newcap: true, maxerr: 300 */
/*global window: false, jQuery: false */
(function($)
{
	// Munge the primitives - Paul Irish
	var TRUE = true,
		FALSE = false;

	// Check qTip library is present
	if(!$.fn.qtip) {
		if(window.console){ window.console.error('This plugin requires the qTip library.',''); }
		return FALSE;
	}

	function Modal(qTip, options)
	{
		var self = this;

		self.blanket = $('#qtip-blanket');
		self.options = options;
		self.prepend = '.qtipmodal';

		$.extend(self, {

			init: function()
			{
				// Merge defaults with options
				options = $.extend(TRUE, $.fn.qtip.plugins.modal.defaults, options);

				// Check if the tooltip is modal
				qTip.elements.tooltip
					.bind('tooltipshow'+self.prepend, function(event, api, duration) {
						if($.isFunction(options.show)) {
							options.show.call(self.blanket, duration, api);
						}
						else {
							self.show(duration);
						}
					})
					.bind('tooltiphide.modal'+self.prepend, function(event, api, duration) {
						if($.isFunction(options.hide)) {
							options.hide.call(self.blanket, duration, api);
						}
						else {
							self.hide(duration);
						}
					});

				// Create the blanket if needed
				if(!self.blanket.length) {
					self.create();
				}

				// Hide tooltip on blanket click if enabled
				if(options.blur === TRUE) {
					self.blanket.bind('click'+self.prepend+qTip.id, function(){ qTip.hide.call(qTip); });
				}
			},

			create: function()
			{
				// Create document blanket
				self.blanket = $('<div />')
					.attr('id', 'qtip-blanket')
					.css({
						position: 'absolute',
						top: 0,
						left: 0,
						width: '100%',
						height: '100%'
					})
					.appendTo(document.body);

				// Update position on window resize or scroll
				$(window).bind('resize'+self.prepend+' scroll'+self.prepend, function() {
					self.blanket.css({ paddingBottom: $(document).scrollTop() });
				});
			},

			show: function(duration)
			{
				self.blanket.fadeIn(duration);
			},

			hide: function(duration)
			{
				self.blanket.fadeOut(duration);
			},

			destroy: function()
			{
				var delBlanket = TRUE;

				// Check if any other modal tooltips are present
				$('*').each(function() {
					var api = $(this).data('qtip');
					if(api && api.id !== qTip.id && api.options.show.modal) {
						// Another modal tooltip was present, leave blanket
						delBlanket = FALSE;
						return FALSE;
					}
				});

				// Remove blanket if needed
				if(delBlanket) {
					self.blanket.remove();
					$(window).unbind('scroll'+self.prepend+' resize'+self.prepend);
				}
				else {
					self.blanket.unbind('click'+self.prepend+qTip.id);
				}

				// Remove bound events
				qTip.elements.tooltip.unbind('tooltipshow'+self.prepend+' tooltiphide'+self.prepend);
			}
		});

		self.init();
	}

	$.fn.qtip.plugins.modal = function(qTip)
	{
		var api = qTip.plugins.modal,
			opts = qTip.options.show.modal;

		// An API is already present,
		if(api) {
			return api;
		}
		// No API was found, create new instance
		else if(typeof opts === 'object') {
			qTip.plugins.modal = new Modal(qTip, opts);
			return qTip.plugins.modal;
		}
	};

	// Plugin needs to be initialized on render
	$.fn.qtip.plugins.modal.initialize = 'render';
	$.fn.qtip.plugins.modal.sanitize = function(opts)
	{
		if(opts.show && opts.show.modal !== undefined) {
			if(typeof opts.show.modal !== 'object'){ opts.show.modal = { }; }
		}
	};

	// Setup plugin defaults
	$.fn.qtip.plugins.modal.defaults = {
		effects: {
			show: TRUE,
			hide: TRUE
		},
		blur: TRUE
	};
}(jQuery));