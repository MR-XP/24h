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

		this.$avatarView1 = this.$container.find('.avatar-view1');
		this.$avatar1 = this.$avatarView1.find('.img2');
		this.$avatarModal1 = $("body").find('#avatar-modal1');

		this.$avatarForm1 = this.$avatarModal1.find('.avatar-form1');
		this.$avatarUpload1 = this.$avatarForm1.find('.avatar-upload1');
		this.$avatarSrc1 = this.$avatarForm1.find('.avatar-src1');
		this.$avatarData1 = this.$avatarForm1.find('.avatar-data1');
		this.$avatarInput1 = this.$avatarForm1.find('.avatar-input1');
		this.$avatarSave1 = this.$avatarForm1.find('.avatar-save1');
		this.$avatarBtns1 = this.$avatarForm1.find('.avatar-btns1');

		this.$avatarWrapper1 = this.$avatarModal1.find('.avatar-wrapper1');
		this.$avatarPreview1 = this.$avatarModal1.find('.avatar-preview1');

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
			this.$avatarView1.on('click', $.proxy(this.click, this));
			this.$avatarInput1.on('change', $.proxy(this.change, this));
			this.$avatarForm1.on('submit', $.proxy(this.submit, this));
			this.$avatarBtns1.on('click', $.proxy(this.rotate, this));
		},

		initTooltip: function() {
			this.$avatarView1.tooltip({
				placement: 'bottom'
			});
		},

		initModal: function() {
			this.$avatarModal1.modal({
				show: false
			});
		},

		initPreview: function() {
			var url = this.$avatar1.attr('src');

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
			this.$avatarForm1.attr('target', target).after($iframe.hide());
		},

		click: function() {
			this.$avatarModal1.modal('show');
			this.initPreview();
		},

		change: function() {
			var files,
				file;

			if(this.support.datauri) {
				files = this.$avatarInput1.prop('files');

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
				file = this.$avatarInput1.val();

				if(this.isImageFile(file)) {
					this.syncUpload();
				}
			}
		},

		submit: function() {
			if(!this.$avatarSrc1.val() && !this.$avatarInput1.val()) {
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
				this.$avatarWrapper1.empty().html(this.$img);
				this.$img.cropper({
					aspectRatio: 1.7,
					preview: this.$avatarPreview1.selector,
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
			this.$avatarSave1.click();
		},

		submitFail: function(msg) {
			this.alert(msg);
		},

		cropDone: function() {
			this.$avatarForm1.get(0).reset();
			this.$avatar1.attr('src', this.url);
			this.stopCropper();
			this.$avatarModal1.modal('hide');
		},

		alert: function(msg) {
			var $alert = [
				'<div class="alert alert-danger avater-alert">',
				'<button type="button" class="close" data-dismiss="alert">&times;</button>',
				msg,
				'</div>'
			].join('');

			this.$avatarUpload1.after($alert);
		}
	};

	$(function() {
		return new CropAvatar($('#crop-avatar1'));
	});

});