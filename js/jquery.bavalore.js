(function ($) {
	$.fn.Bavalore = function(config) {
		var defaults={
			bgColor:"#b81c22",
			minHeight: 30,
			bottomLimit:150,
			btn: $(".drawer_btn")
		}
		
		var options = $.extend(defaults, config);
		var container = this;
		var bottomLimit = container.height();
		var minHeight = defaults.minHeight;
		var isOpen = false;
		var rectangle = {x:0, y:0, width:0, height:0, cx:0, cy:0, cx1:0, cy1:0, vx:0, vy:0};
		var bgColor = defaults.bgColor;
		var timer, cvs, ctx;
		var mouseX, mouseY, mouseOX, mouseOY;
		var spring = 0.9, friction = 0.65, targetHeight = 0;
		var touchEnabled = true;
		var borderImg = new Image();
		var btnClickLimitter = true;
		return this.each(init);
		
		function init () {
			var sh = screen.height;
			timer = null;
			var childContent = $(container).contents();
			$(container).empty().append('<div class="wrapper"><div class="drawer_menu"></div></div>')
			var drawer_menu = $(container).find(".drawer_menu").append(childContent);
			var drawer_menu_rect = drawer_menu[0].getBoundingClientRect();
    	var drawer_menu_top = drawer_menu_rect.top - drawer_menu[0].clientTop;
			//$(container).find(".drawer_menu").css({height: bottomLimit*.95})
			cvs = $("<canvas id='cvs'></canvas>").prependTo(container).get(0);
			ctx = cvs.getContext("2d");
			cvs.height = minHeight+10;
			cvs.width = window.innerWidth;
			rectangle.width = cvs.width;
			rectangle.cx = rectangle.width*.25
			rectangle.cx1 = rectangle.width*.75;
			rectangle.cy = rectangle.cy1 = rectangle.height = minHeight;
			drawDrawer();
			addMouseEvent();
			/*borderImg.src = "/img/drawer_bg.png?"+new Date().getTime();
			borderImg.onload = setBorder;*/
			$(cvs).on("scroll", function (e) {
				e.preventDefault();
			})
		};
		
		function addMouseEvent () {
			$(cvs).bind("touchstart", touchStartHandler);
			$(cvs).bind("touchend", touchEndHandler);
			defaults.btn.on("touchend", btnClicked);
		}
		
		function removeMouseEvent () {
			$(cvs).unbind("touchstart", touchStartHandler);
			$(cvs).unbind("touchend", touchEndHandler);
			defaults.btn.off("touchend", btnClicked);
		}
		
		function btnClicked (e) {
			if(btnClickLimitter) {
				btnClickLimitter = false;
				removeMouseEvent ();
				e.preventDefault();
				clearTimeout(timer);
				if(!isOpen) {
					targetHeight = bottomLimit;
					isOpen = true;
					cvs.width = window.innerWidth;
					$("body").addClass("drawer_active");
				} else {
					isOpen = false;
					targetHeight = minHeight;
					$("body").removeClass("drawer_active");
				}
					timerStart();
			}
		}
		
		function touchStartHandler (e) {
				e.preventDefault();
			if(touchEnabled) {
				$(cvs).css("opacity", .9)
				touchEnabled = false;
				clearTimeout(timer);
				var touch = e.originalEvent.touches[0];
				mouseOX = touch.pageX;
				mouseOY = touch.pageY;
				$(cvs).bind("touchmove", touchMoveHandler);
				if(!isOpen) {
					cvs.width = rectangle.width = window.innerWidth;
					cvs.height =  window.innerHeight;
					drawDrawer();
					isOpen = true;
				}
			}
		}
		
		function touchEndHandler (e) {
				e.preventDefault();
				$(cvs).css("opacity",1)
				$(cvs).unbind("touchmove", touchMoveHandler);
				//タイマーを使い、もとの座標に戻す処理
				timerStart();
				//右の限界点を超えたか判定
				if(isOpen && mouseOY < 100) {
					//引き出さなかったからそのままドロアーはOFFに処理する
					isOpen = false;
					targetHeight = minHeight;
					$("body").removeClass("drawer_active");
				} else {
					targetHeight = bottomLimit;//
					//cvs.width = window.innerWidth;
					cvs.height = window.innerHeight;
					$("body").addClass("drawer_active");
				}
				removeMouseEvent ();
				drawDrawer();
		}
		
		function drawDrawer() {
			ctx.clearRect(0, 0, cvs.width, cvs.height);
			ctx.beginPath();
			ctx.moveTo(0, 0);
			var cx0 = rectangle.width * .25;
			ctx.lineTo(rectangle.width, 0);
			ctx.lineTo(rectangle.width, rectangle.height);
			ctx.quadraticCurveTo(rectangle.cx1, rectangle.cy1, rectangle.cx, rectangle.cy);
			ctx.quadraticCurveTo(cx0, rectangle.cy1, 0, rectangle.height);
			ctx.lineTo(0, rectangle.height);
			ctx.fillStyle = bgColor;
			/* STROKE */
			/*ctx.strokeStyle="#300";
			ctx.lineWidth = 1;
			ctx.stroke();*/
			/* STROKE */
			ctx.fill();
			ctx.closePath();
			ctx.fillStyle="#300";
			//ctx.fillRect(cx0, rectangle.cy, 10, 10)
		}
		
		function updateFrame () {
			var totalDistance = 0;
			var r = rectangle;
			r.height += (targetHeight - r.height) * 0.2;
			r.cy += (targetHeight - r.cy) * 0.1;
			totalDistance = Math.abs(targetHeight - r.height) + Math.abs(targetHeight - r.cy) + Math.abs(targetHeight - r.cy1);
			var dy = targetHeight - r.cy1;
			var ay = dy * spring;
			r.vy += ay;
			r.vy *= friction;
			r.cy1 += r.vy;
			drawDrawer();
			if(totalDistance < 5) {
				clearTimeout(timer);
				if(!isOpen) {
					cvs.height = minHeight;
					rectangle.cy = rectangle.cy1 = minHeight;
					drawDrawer();
					setBorder ();
				}
				touchEnabled = true;
				btnClickLimitter = true;
				addMouseEvent ();
			} else {
				timerStart();
			}
		}
		
		function touchMoveHandler (e) { // 移動中
			e.preventDefault();
			var touch = e.originalEvent.touches[0];
			mouseX = touch.pageX;
			mouseY = touch.pageY - container.offset().top;
			checkMeshDistance();
			mouseOX = mouseX;
			mouseOY = mouseY;
		}
		
		function checkMeshDistance () {
			rectangle.cx = mouseX;
			rectangle.cy = mouseY;
			drawDrawer();
		}
		
		function setBorder () {
			//縦線をつける（デザイン用）
			var _x = Math.floor(minHeight/2 - borderImg.width/4);
			var h = window.innerHeight / 2;
			ctx.save();
			for(var i=0; i<50; i++) {
				ctx.setTransform(.5, 0, 0, .5, _x, i+h);
				ctx.drawImage(borderImg, 0, 0);
			}
			ctx.restore();
		}
		
		function timerStart () {
			timer = setTimeout(updateFrame, 30);
		}
		
	}
})(jQuery);