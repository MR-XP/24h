(function(factory) {
	if(typeof define === 'function' && define.amd) {
		define(['jquery'], factory);
	} else if(typeof exports === 'object') {
		// Node / CommonJS
		factory(require('jquery'));
	} else {
		factory(jQuery);
	}
})(function($) {

	'use strict';

	var console = window.console || {
		log: function() {}
	};

	function CropAvatar($element) {
		this.$container = $element;

		this.$avatarView2 = this.$container.find('.avatar-view2');
		this.$avatar2 = this.$avatarView2.find('img');
		this.$avatarModal2 = $("body").find('#avatar-modal2');

		this.$avatarForm2 = this.$avatarModal2.find('.avatar-form2');
		this.$avatarUpload2 = this.$avatarForm2.find('.avatar-upload2');
		this.$avatarSrc2 = this.$avatarForm2.find('.avatar-src2');
		this.$avatarData2 = this.$avatarForm2.find('.avatar-data2');
		this.$avatarInput2 = this.$avatarForm2.find('.avatar-input2');
		this.$avatarSave2 = this.$avatarForm2.find('.avatar-save2');
		this.$avatarBtns2 = this.$avatarForm2.find('.avatar-btns2');

		this.$avatarWrapper2 = this.$avatarModal2.find('.avatar-wrapper2');
		this.$avatarPreview2 = this.$avatarModal2.find('.avatar-preview2');

		this.init();
	}

	CropAvatar.prototype = {
		constructor: CropAvatar,
		support: {
			fileList: !!$('<input type="file">').prop('files'),
			blobURLs: !!window.URL && URL.createObjectURL,
			formData: !!window.FormData
		},

		init: function() {
			this.support.datauri = this.support.fileList && this.support.blobURLs;

			if(!this.support.formData) {
				this.initIframe();
			}

			this.initTooltip();
			this.initModal();
			this.addListener();
		},

		addListener: function() {
			this.$avatarView2.on('click', $.proxy(this.click, this));
			this.$avatarInput2.on('change', $.proxy(this.change, this));
			this.$avatarForm2.on('submit', $.proxy(this.submit, this));
			this.$avatarBtns2.on('click', $.proxy(this.rotate, this));
		},

		initTooltip: function() {
			this.$avatarView2.tooltip({
				placement: 'bottom'
			});
		},

		initModal: function() {
			this.$avatarModal2.modal({
				show: false
			});
		},

		initPreview: function() {
			var url = this.$avatar2.attr('src');

//			this.$avatarPreview1.empty().html('<img src="' + url + '">');
		},

		initIframe: function() {
			var target = 'upload-iframe-' + (new Date()).getTime(),
				$iframe = $('<iframe>').attr({
					name: target,
					src: ''
				}),
				_this = this;

			// Ready ifrmae
			$iframe.one('load', function() {

				// respond response
				$iframe.on('load', function() {
					var data;

					try {
						data = $(this).contents().find('body').text();
					} catch(e) {
						console.log(e.message);
					}

					if(data) {
						try {
							data = $.parseJSON(data);
						} catch(e) {
							console.log(e.message);
						}

						_this.submitDone(data);
					} else {
						_this.submitFail('Image upload failed!');
					}

					_this.submitEnd();

				});
			});

			this.$iframe = $iframe;
			this.$avatarForm2.attr('target', target).after($iframe.hide());
		},

		click: function() {
			this.$avatarModal2.modal('show');
			this.initPreview();
		},

		change: function() {
			var files,
				file;

			if(this.support.datauri) {
				files = this.$avatarInput2.prop('files');

				if(files.length > 0) {
					file = files[0];

					if(this.isImageFile(file)) {
						if(this.url) {
							URL.revokeObjectURL(this.url); // Revoke the old one
						}

						this.url = URL.createObjectURL(file);
						this.startCropper();
					}
				}
			} else {
				file = this.$avatarInput2.val();

				if(this.isImageFile(file)) {
					this.syncUpload();
				}
			}
		},

		submit: function() {
			if(!this.$avatarSrc2.val() && !this.$avatarInput2.val()) {
				return false;
			}

			if(this.support.formData) {
				this.ajaxUpload();
				return false;
			}
		},

		rotate: function(e) {
			var data;

			if(this.active) {
				data = $(e.target).data();

				if(data.method) {
					this.$img.cropper(data.method, data.option);
				}
			}
		},

		isImageFile: function(file) {
			if(file.type) {
				return /^image\/\w+$/.test(file.type);
			} else {
				return /\.(jpg|jpeg|png|gif)$/.test(file);
			}
		},

		startCropper: function() {
			var _this = this;

			if(this.active) {
				this.$img.cropper('replace', this.url);
			} else {
				this.$img = $('<img src="' + this.url + '">');
				this.$avatarWrapper2.empty().html(this.$img);
				this.$img.cropper({
					aspectRatio: 1,
					preview: this.$avatarPreview2.selector,
					strict: false,
				});

				this.active = true;
			}
		},

		stopCropper: function() {
			if(this.active) {
				this.$img.cropper('destroy');
				this.$img.remove();
				this.active = false;
			}
		},
		syncUpload: function() {
			this.$avatarSave2.click();
		},

		submitFail: function(msg) {
			this.alert(msg);
		},

		cropDone: function() {
			this.$avatarForm2.get(0).reset();
			this.$avatar1.attr('src', this.url);
			this.stopCropper();
			this.$avatarModal2.modal('hide');
		},

		alert: function(msg) {
			var $alert = [
				'<div class="alert alert-danger avater-alert">',
				'<button type="button" class="close" data-dismiss="alert">&times;</button>',
				msg,
				'</div>'
			].join('');

			this.$avatarUpload2.after($alert);
		}
	};

	$(function() {
		return new CropAvatar($('#crop-avatar2'));
	});

});