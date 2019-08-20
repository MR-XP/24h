angular.module('app').directive('myimg', [function() {
//上传封面85*50
	return {
		restrict: 'AE',
		/*template: '',*/
		replace: true,
		link: function($scope, element, attrs, controller) {
			$('#avatarInput').on('change', function(e) {
                var filemaxsize = 1024 * 5;//5M
                var target = $(e.target);
                var Size = target[0].files[0].size / 1024;
                if(Size > filemaxsize) {
                    alert('图片过大，请重新选择!');
                    $(".avatar-wrapper").childre().remove;
                    return false;
                }
                if(!this.files[0].type.match(/image.*/)) {
                    alert('请选择正确的图片!')
                } else {
                    var filename = document.querySelector("#avatar-name");
                    var texts = document.querySelector("#avatarInput").value;
                    var teststr = texts; //你这里的路径写错了
                    testend = teststr.match(/[^\\]+\.[^\(]+/i); //直接完整文件名的
                    filename.innerHTML = testend;
                }
            });

            $(".avatar-save").on("click", function() {
                var img_lg = document.getElementById('imageHead');
                // 截图小的显示框内的内容
                html2canvas(img_lg, {
                    allowTaint: true,
                    taintTest: false,
                    onrendered: function(canvas) {
                        canvas.id = "mycanvas";
                        //生成base64图片数据
                        var dataUrl = canvas.toDataURL("image/jpeg",1);
                        var newImg = document.createElement("img");
                        newImg.src = dataUrl;
                        var img=canvas.toDataURL("image/jpeg",1);
                        imgName = $('#avatarInput').val().substr($('#avatarInput').val().lastIndexOf('\\') + 1);
                        data = img.substr(img.indexOf(',') + 1);
                        imagesAjax(dataUrl);
                    }
                });
            });

            function imagesAjax(src) {
                $.ajax({
                    url: window.base_url + "/index/common/uploadByString",
                    data: {
                        data: data,
                        filename: imgName,
                    },
                    type: "post",
                    dataType: 'json',
                    async: false,
                    success: function(json) {

                        if(json.code == 200) {
                            // $('.upload-img').prop('src',src);
                            $('.upload-img').prop('style',' background: url('+window.static_domain+json.data+')'+'50% 50% / cover no-repeat');
                            /*$scope.info.cover=json.data;*/
                            $scope.info.image = json.data;

                            $scope.info.cover = json.data;

                            $scope.info.avatar = json.data;
                        }
                    }
                })
            }
		}
	}

}]);

angular.module('app').directive('myimg1', [function() {
//上传详情图
    return {
        restrict: 'AE',
        /*template: '',*/
        replace: true,
        link: function($scope, element, attrs, controller) {
            $('#avatarInput1').on('change', function(e) {
                var filemaxsize = 1024 * 5;//5M
                var target = $(e.target);
                var Size = target[0].files[0].size / 1024;
                if(Size > filemaxsize) {
                    alert('图片过大，请重新选择!');
                    $(".avatar-wrapper1").childre().remove;
                    return false;
                }
                if(!this.files[0].type.match(/image.*/)) {
                    alert('请选择正确的图片!')
                } else {
                    var filename = document.querySelector("#avatar-name1");
                    var texts = document.querySelector("#avatarInput1").value;
                    var teststr = texts; //你这里的路径写错了
                    testend = teststr.match(/[^\\]+\.[^\(]+/i); //直接完整文件名的
                    filename.innerHTML = testend;
                }
            });

            $(".avatar-save1").on("click", function() {
                var img_lg = document.getElementById('imageHead1');
                // 截图小的显示框内的内容
                html2canvas(img_lg, {
                    allowTaint: true,
                    taintTest: false,
                    onrendered: function(canvas) {
                        canvas.id = "mycanvas";
                        //生成base64图片数据
                        var dataUrl = canvas.toDataURL("image/jpeg",1);
                        var newImg = document.createElement("img");
                        newImg.src = dataUrl;
                        var img=canvas.toDataURL("image/jpeg",1);
                        imgName = $('#avatarInput1').val().substr($('#avatarInput1').val().lastIndexOf('\\') + 1);
                        data = img.substr(img.indexOf(',') + 1);
                        $scope.info.imgBase = img;

                        imagesAjax(dataUrl);
                    }
                });
            });

            function imagesAjax(src) {

                $.ajax({
                    url: window.base_url + "/index/common/uploadByString",
                    data: {
                        data: data,
                        filename: imgName,
                    },
                    type: "post",
                    dataType: 'json',
                    async: false,
                    success: function(json) {

                        if(json.code == 200) {
                            // $('.img2').prop('src',src);
                            /*$scope.info.images=json.data;*/
                            /*$scope.info.images.push(json.data);*/
                            $scope.getImgs($scope.info.imgBase, json.data);
                        }
                    }
                })
            }
        }
    }

}]);

angular.module('app').directive('myimg2', [function() {
//上传封面50*50
    return {
        restrict: 'AE',
        /*template: '',*/
        replace: true,
        link: function($scope, element, attrs, controller) {
            $('#avatarInput2').on('change', function(e) {
                var filemaxsize = 1024 * 5;//5M
                var target = $(e.target);
                var Size = target[0].files[0].size / 1024;
                if(Size > filemaxsize) {
                    alert('图片过大，请重新选择!');
                    $(".avatar-wrapper2").childre().remove;
                    return false;
                }
                if(!this.files[0].type.match(/image.*/)) {
                    alert('请选择正确的图片!')
                } else {
                    var filename = document.querySelector("#avatar-name2");
                    var texts = document.querySelector("#avatarInput2").value;
                    var teststr = texts; //你这里的路径写错了
                    testend = teststr.match(/[^\\]+\.[^\(]+/i); //直接完整文件名的
                    filename.innerHTML = testend;
                }
            });

            $(".avatar-save2").on("click", function() {
                var img_lg = document.getElementById('imageHead2');
                // 截图小的显示框内的内容
                html2canvas(img_lg, {
                    allowTaint: true,
                    taintTest: false,
                    onrendered: function(canvas) {
                        canvas.id = "mycanvas";
                        //生成base64图片数据
                        var dataUrl = canvas.toDataURL("image/jpeg",1);
                        var newImg = document.createElement("img");
                        newImg.src = dataUrl;
                        var img=canvas.toDataURL("image/jpeg",1);
                        imgName = $('#avatarInput2').val().substr($('#avatarInput2').val().lastIndexOf('\\') + 1);
                        data = img.substr(img.indexOf(',') + 1);
                        imagesAjax(dataUrl);
                    }
                });
            });

            function imagesAjax(src) {
                $.ajax({
                    url: window.base_url + "/index/common/uploadByString",
                    data: {
                        data: data,
                        filename: imgName,
                    },
                    type: "post",
                    dataType: 'json',
                    async: false,
                    success: function(json) {

                        if(json.code == 200) {
                            // $('.upload-img').prop('src',src);
                            $('.upload-img').prop('style',' background: url('+window.static_domain+json.data+')'+'50% 50% / cover no-repeat');
                            /*$scope.info.cover=json.data;*/
                            /*$scope.info.image = json.data;*/

                            $scope.info.cover = json.data;

                            $scope.info.avatar = json.data;
                        }
                    }
                })
            }
        }
    }

}]);

angular.module('app').directive('repeatfinish', [function() {

	return {
		restrict: 'AE',
		replace: true,
		link: function($scope, element, attr) {

			if($('.my-ipt').length >= ($scope.sum.length - 1)) {

				setTimeout(function() {
					$scope.$eval(attr.load)
				}, 500)

			}

		}
	}

}]);

angular.module('app').directive('all', [function() {

	return {
		restrict: 'A',
		replace: true,
		link: function($scope, element, attr) {

			element.click(function() {

				if(element.prop('checked')) {

					for(var i = 0; i < element.parents('.gongneng').find('.my-ipt').length; i++) {

						element.parents('.gongneng').find('.my-ipt:eq(' + i + ')').prop('checked', true)

					}

				} else {

					for(var i = 0; i < element.parents('.gongneng').find('.my-ipt').length; i++) {

						element.parents('.gongneng').find('.my-ipt:eq(' + i + ')').prop('checked', false)

					}

				}

			});

			if($('.my-ipt2').length == ($scope.sum1.length - 1)) {

				setTimeout(function() {
					$scope.$eval(attr.load)
				}, 500)

			}

		}
	}

}]);

angular.module('app').directive('all2', [function() {

	return {
		restrict: 'A',
		replace: true,
		link: function($scope, element, attr) {

			element.click(function() {

				if(element.prop('checked')) {

					for(var i = 0; i < element.parents('.gongneng').find('.my-ipt').length; i++) {

						element.parents('.gongneng').find('.my-ipt:eq(' + i + ')').prop('checked', true)

					}

				} else {

					for(var i = 0; i < element.parents('.gongneng').find('.my-ipt').length; i++) {

						element.parents('.gongneng').find('.my-ipt:eq(' + i + ')').prop('checked', false)

					}

				}

			})

		}
	}

}]);

angular.module('app').directive('nav', [function() {

	return {
		restrict: 'A',
		replace: true,
		link: function($scope, element, attr) {

			if($scope.$first) {

				element.attr('ui-sref-active', 'active').addClass('active')

			}

		}
	}

}]);

//地图坐标拾取
angular.module('app').directive('mapMarker', function() {
	return {
		require: '?ngModel',
		restrict: 'EA',
		scope: {
			ngModel: '='
		},
		link: function(scope, element, attrs, ngModel) {
			ngModel.$render = function() {
				element.val(ngModel.$viewValue || '');
			};
			element.bind('click', function() {
				$(document).off("focusin.bs.modal");
				var AppLayerMapMarker = layer.open({
					type: 1,
					shadeClose: true,
					title: '地图坐标拾取',
					closeBtn: [0, false],
					shade: [0.8, '#000'],
					border: [0],
					offset: ['100px', ''],
					area: ['900px', '650px'],
					content: '<div id="mapmarker">' +
						'<div id="search_area" style="position:absolute; top:0; right:0; z-index:9999">' +
						'<input type="text" id="mapmarkerkeyword" name="keyword" size="40" placeholder="请输入要搜索的地名"/><input type="button" id="mapmarkersearchBtn" value="搜索" />' +
						'</div>' +
						'<div id="mapmarkersearch_result" style="display:none"></div>' +
						'<div id="mapmarkercontainer" style="height:600px;width:900px;"></div>' +
						'</div>'
				});

				//创建Map实例
				var map = new BMap.Map("mapmarkercontainer");
				map.centerAndZoom('重庆', 13); // 初始化地图,设置城市和地图级别。
				function myFun(result) {
					var cityName = result.name;
					map.centerAndZoom(cityName, 13);
				}

				var myCity = new BMap.LocalCity();
				myCity.get(myFun);
				map.enableScrollWheelZoom(); //启用滚轮放大缩小
				map.addControl(new BMap.MapTypeControl({
					anchor: BMAP_ANCHOR_TOP_LEFT
				})); //左上角，默认地图控件
				function pick(e) {

					var maker = new BMap.Marker(new BMap.Point(e.point.lng, e.point.lat)); // 创建标注
					map.addOverlay(maker); // 将标注添加到地图中
					setTimeout(function() {
						var confirmLayer = layer.confirm('保存当前位置(' + e.point.lng + ',' + e.point.lat + ')吗?', {
							title: '确认信息',
							btn: ['确定', '取消'], //按钮
							offset: ['300px', ''],
							shade: false //不显示遮罩
						}, function() {
							scope.$apply(function() {
								//scope.entity[name] = e.point.lat + ',' + e.point.lng;
								ngModel.$setViewValue(e.point.lng + ',' + e.point.lat);
								element.val(ngModel.$viewValue);
								layer.close(AppLayerMapMarker);
								layer.close(confirmLayer);
							});
						}, function() {
							map.removeOverlay(maker);
							layer.close(confirmLayer);
							return false;
						});
					}, 200);
				}

				map.addEventListener("click", pick);
				//设置地图默认的鼠标指针样式
				map.setDefaultCursor("default");
				$('#mapmarkersearchBtn').click(function() {
					var keyword = $('#mapmarkerkeyword').val();
					if(!keyword) {
						alert('请输入要搜索的地名关键字');
						return false;
					}
					// 百度地图API功能
					map.centerAndZoom(new BMap.Point(116.404, 39.915), 4);
					var local = new BMap.LocalSearch("全国", {
						renderOptions: {
							map: map,
							panel: "mapmarkersearch_result",
							autoViewport: true,
							selectFirstResult: false
						}
					});
					local.search(keyword);
				});
			});
		}
	};
});

app.directive('weekDate', ["$compile", "$filter", "formatDate", "$filter","$timeout", function($compile, $filter, formatDate, $filter, $timeout) {
	return {
		restrict: 'E',
		template: '<div class="xp-rowCourse-head"></div>',
		replace: true,
		link: function($scope, element, attr) {
			
			var dayMap = {
				0: "周日",
				1: "周一",
				2: "周二",
				3: "周三",
				4: "周四",
				5: "周五",
				6: "周六"
			}

			var cd = new Date(); //获取当前日期

			$scope.getWeek = function(num) {

				//本周日期
				weekDay = cd.getDay();

				//本月第几天
				monthDay = cd.getDate();

				//计算本周第一天
				cd.setDate((monthDay - weekDay) + 1);

				num ? cd.setDate(cd.getDate() + num) : '';

				return cd
			}

			var html = '';

			var temp = 1000 * 60 * 60 * 24;

			$scope.loadTime = function(cd) {
				
				html = '';
				$('.xp-rowCourse-head').html('');
				$scope.nowWeek=[];
				
				var cdt = cd.getTime(); //获取时间戳
	
				for(var i = 0; i < 7; i++) {

					c = cdt + temp * i; //获取近七天时间戳

					nd = new Date(c); //转换为日期

					f = formatDate.get(nd);

					format = f.y + "-" + f.m + "-" + f.d; //转换为字符串

					day = nd.getDay(); //获取星期几

					html += "<div class='xp-rowCourse-day' >" +

						"<div>" + f.m + "月" + f.d + "日 " + dayMap[day] + "</div>" +

						"<div ng-click=copy('" + f.y + "-" + $filter('zeroFill')(f.m) + "-" + $filter('zeroFill')(f.d) + "','day')>复制今日</div>"+

						"</div>";
					
					//保存一周
					$scope.nowWeek.push(f.y + "-" + $filter('zeroFill')(f.m) + "-" + $filter('zeroFill')(f.d));
					
					if(i == 0) {
						$scope.row.start_time = f.y + "-" + $filter('zeroFill')(f.m) + "-" + $filter('zeroFill')(f.d);
					}

					if(i == 6) {
						$scope.row.end_time = f.y + "-" + $filter('zeroFill')(f.m) + "-" + $filter('zeroFill')(f.d);
						
						if(attr.loadtype==1){
							$scope.loadList()
						}else{
							$scope.loadCoach();
							attr.loadtype=1
						}

					}

				}

				$('.xp-rowCourse-head').append(html);
				$('.xp-rowCourse-head').replaceWith($compile($('.xp-rowCourse-head')[0].outerHTML)($scope));		

			}

		}
	}
}]);

//选择时分秒
angular.module('app').directive('selecttime', [function() {

	return {
		restrict: 'AE',
		replace: true,
		link: function($scope, element, attr) {

			$('.clockpicker').clockpicker();
		    var input = $('#single-input').clockpicker({
		        placement: 'bottom',
		        align: 'left',
		        autoclose: true,
		        'default': 'now'
		    });

		    $('#check-minutes').click(function(e) {
		        e.stopPropagation();
		        input.clockpicker('show')
		                .clockpicker('toggleView', 'minutes');
		    });
		    if (/mobile/i.test(navigator.userAgent)) {
		        $('input').prop('readOnly', true);
		    }
		}
	}

}]);
