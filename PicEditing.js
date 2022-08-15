
// 1.拖拽拉入图片，显示出来	
//记录点击时候当前图片
var selectPicture = null;
function addPictrueDiv(src,filename,filetype){
	let temDiv;
	temDiv = createImgTag(src,filename.substr(filename.lastIndexOf('.')),filetype);
	let regionBox_div = document.createElement("div");
	regionBox_div.className = "regionBox";
	let edit_div = document.createElement("div");
	edit_div.className = "imgInfo";
	let edit_p = document.createElement("p");
	edit_p.className = "infoP";
	edit_p.innerHTML = "点击编辑";
	edit_p.addEventListener("click",textEditImg);
	let edit_span = document.createElement("span");
	edit_span.addEventListener("click",deleteImg);
	edit_div.appendChild(edit_p);
	edit_div.appendChild(edit_span);
	regionBox_div.appendChild(temDiv);
	regionBox_div.appendChild(edit_div);
	document.getElementById('regionShow').append(regionBox_div);
}
//创建图片标签，添加canvas工作台
function createImgTag(img_src,img_suffix,img_type){
	var img_div = document.createElement("img");
	img_div.src = img_src;
	img_div.alt = '';
	img_div.setAttribute("pic_suffix",img_suffix);
	img_div.setAttribute("pic_type",img_type);
	img_div.addEventListener("click",function(e){
		$("#pictureOperation").css({"display" : "block"});
		let canvasBox = document.getElementById("canvasBox");
		selectPicture = this;
		inputImg(this.src,canvasBox.offsetWidth-10,canvasBox.offsetHeight-10);
	})
	return img_div
}
//画框距离page的高和左边距
var sliceWidth,sliceHeight,canvas_img_width,canvas_img_height;
function inputImg(img_src,width,height){
	let canvas = document.getElementById("canvas");
	let canvasRm = document.getElementById("canvas_rm");
	let ctx = canvas.getContext("2d");
	let image = new Image();
	image.src = img_src;
	image.onload = function(event) {
		let imgHeight = height;
		let imgWidth = imgHeight * (image.width / image.height);
		if(imgWidth > width){
			imgWidth = width;
			imgHeight = imgWidth * (image.height / image.width);
		}
		canvasRm.style.width = imgWidth + "px";
		canvasRm.style.height = imgHeight + "px";
		canvas.width = imgWidth;
		canvas.height = imgHeight;
		ctx.drawImage(image, 0, 0,dw=imgWidth,dh=imgHeight);
		canvas_img_width = imgWidth;
		canvas_img_height = imgHeight;
		let canvas_rm_offset = $("#canvas_rm").offset();
		sliceHeight = canvas_rm_offset['top'];
		sliceWidth = canvas_rm_offset['left'];
	}
}
//随时监控浏览器窗口变化，修改相对高度和宽度
window.onresize=function(){  
	let canvas_rm_offset = $("#canvas_rm").offset();
	sliceHeight = canvas_rm_offset['top'];
	sliceWidth = canvas_rm_offset['left'];
}
//删除编辑图片
function deleteImg(){
	controlDivWidth($("#regionShow img").length - 1);
	this.parentNode.parentNode.remove();
}
//控制图片编辑区域宽度
function controlDivWidth(i){
	document.getElementById('regionShow').style.width = i*10+'rem';
}
//编辑按钮触发点击图片函数，这里为了获取编辑的是哪副图片，为了回显
function textEditImg(){
	$(this).parent().prev().trigger('click');
}
// 2.在图片区域绘制红色矩形，并能随鼠标拖拽控制大小
// 点击的x,y坐标,截图框当前距离父级高度和左边距
var startX,startY,cur_box_top,cur_box_left;
// 当前框的宽度和高度,根据点击事件判断是否是手机
var screen_box_width,screen_box_height,is_phone=false;
// 通过点击打开移动画框的开关，通过点击拖拽已有框开关
var begin_draw_flag=false,begin_move_flag = false;
function crlMove(e){
	if(begin_draw_flag){
		let screen_box_top,screen_box_left;
		const screen_box = document.getElementById("screenshotbox");
		screen_box.style.display = "block";
		if(is_phone){
			type_X = e.originalEvent.changedTouches[0].clientX;
			type_Y = e.originalEvent.changedTouches[0].clientY;
		}
		else{
			type_X = e.pageX;
			type_Y = e.pageY;
		}
		screen_box_left = startX>type_X?type_X:startX;
		screen_box_top = startY>type_Y?type_Y:startY;
		cur_box_top = screen_box_top - sliceHeight;
		screen_box_height = Math.abs(startY-type_Y);
		// 判断不超过下边框
		if(screen_box_height>canvas_img_height - cur_box_top){
			screen_box_height = canvas_img_height - cur_box_top;
		}
		// 判断不超过上边框
		if(cur_box_top<0){
			cur_box_top = 0;
			screen_box_height = startY - sliceHeight;
		}
		screen_box.style.top = cur_box_top + 'px';
		screen_box.style.height = screen_box_height+'px';
		cur_box_left = screen_box_left - sliceWidth;
		screen_box_width = Math.abs(startX-type_X);
		// 判断不超过右边框
		if(screen_box_width > canvas_img_width - cur_box_left){
			screen_box_width = canvas_img_width - cur_box_left;
		}
		// 判断不超过左边框,给定值就是防止滑动过快,值跟不上变化,超过限定值直接复制
		if(cur_box_left < 0){
			cur_box_left = 0;
			screen_box_width = startX - sliceWidth;
		}
		screen_box.style.left = cur_box_left + 'px';
		screen_box.style.width = screen_box_width+'px';
		changeCurtain(1);
	}
}
// 3.当鼠标点击截图区域框时，按住可以进行拖拽
// 已经画好的框进行拖拽，需要记录点击点的x,y,裁剪框最后的左边距和顶边距
var mov_start_x,mov_start_y,mov_end_box_left,mov_end_box_top;
function screen_box_move(e){
	const screen_box = document.getElementById("screenshotbox");
	if(is_phone){
		type_X = e.originalEvent.changedTouches[0].pageX;
		type_Y = e.originalEvent.changedTouches[0].pageY;
	}
	else{
		type_X = e.pageX;
		type_Y = e.pageY;
	}
	if(begin_move_flag){
		cur_box_top = mov_end_box_top+(type_Y - mov_start_y)
		if(cur_box_top<0){
			cur_box_top = 0
		}
		if(cur_box_top>canvas_img_height-screen_box_height){
			cur_box_top = canvas_img_height-screen_box_height;
		}
		screen_box.style.top = cur_box_top + 'px';
		cur_box_left = mov_end_box_left+(type_X - mov_start_x)
		if(cur_box_left<0){
			cur_box_left = 0;
		}
		if(cur_box_left>canvas_img_width-screen_box_width){
			cur_box_left = canvas_img_width-screen_box_width;
		}
		screen_box.style.left = cur_box_left + 'px';
		changeCurtain(1);
	}
}
// 4.截图框周边8个div再次控制大小选择截图区域
// 修改截图框宽度,修改截图框高度
var width_zoomFlag = false;
var	height_zoomFlag = false;
function crlWidthZoom(e){
	if(width_zoomFlag){
		const screen_box = document.getElementById("screenshotbox");
		if(is_phone){
			type_X = e.originalEvent.changedTouches[0].pageX;
			type_Y = e.originalEvent.changedTouches[0].pageY;
		}
		else{
			type_X = e.pageX;
			type_Y = e.pageY;
		}
		let screen_box_left = startX>type_X?type_X:startX;
		cur_box_left = screen_box_left - sliceWidth;
		screen_box_width = Math.abs(startX-type_X);
		if(screen_box_width > canvas_img_width - cur_box_left){
			screen_box_width = canvas_img_width - cur_box_left;
		}
		// 给定值就是防止滑动过快,值跟不上变化,超过限定值直接复制
		if(cur_box_left < 0){
			cur_box_left = 0;
			screen_box_width = startX - sliceWidth;
		}
		screen_box.style.left = cur_box_left + 'px';
		screen_box.style.width = screen_box_width+'px';
		changeCurtain(1);
	}
}
function crlHeightZoom(e){
	if(height_zoomFlag){
		const screen_box = document.getElementById("screenshotbox");
		if(is_phone){
			type_X = e.originalEvent.changedTouches[0].pageX;
			type_Y = e.originalEvent.changedTouches[0].pageY;
		}
		else{
			type_X = e.pageX;
			type_Y = e.pageY;
		}
		screen_box_top = startY>type_Y?type_Y:startY;
		cur_box_top = screen_box_top - sliceHeight;
		screen_box_height = Math.abs(startY-type_Y);
		if(screen_box_height>canvas_img_height - cur_box_top){
			screen_box_height = canvas_img_height - cur_box_top;
		}
		if(cur_box_top<0){
			cur_box_top = 0;
			screen_box_height = startY - sliceHeight;
		}
		screen_box.style.top = cur_box_top + 'px';
		screen_box.style.height = screen_box_height+'px';
		changeCurtain(1);
	}
}
// 5.图片其他区域添加遮罩
function changeCurtain(type){
	let curtainLeft = document.getElementById("curtainLeft");
	let curtainRight = document.getElementById("curtainRight");
	let curtainTop = document.getElementById("curtainTop");
	let curtainBottom = document.getElementById("curtainBottom");
	if(type == 1){
		curtainLeft.style.width = cur_box_left + 'px';
		curtainRight.style.width = (canvas_img_width - cur_box_left - screen_box_width) + 'px';
		curtainTop.style.width = screen_box_width + 'px';
		curtainTop.style.height = cur_box_top + 'px';
		curtainBottom.style.width = screen_box_width + 'px';
		curtainBottom.style.height = (canvas_img_height - cur_box_top - screen_box_height) + 'px';
		curtainTop.style.left = cur_box_left + 'px';
		curtainBottom.style.left = cur_box_left + 'px';
	}else{
		curtainLeft.style.width = '0px';
		curtainRight.style.width = '0px';
		curtainTop.style.width = '0px';
		curtainTop.style.height = '0px';
		curtainBottom.style.width = '0px';
		curtainBottom.style.height = '0px';
		curtainTop.style.left = '0px';
		curtainBottom.style.left = '0px';
	}
}
// 6.利用canvas截图保存到img中
//创建修改圆形截图框控制变量
var ellipse_flag = false;
function confirmScreen(e){
	$("#pictureOperation").css({"display" : "none"});
	if(cur_box_left==null||cur_box_top==null||screen_box_width==null||screen_box_height==null)
	{
		changeCurtain(0);
		return;
	}
	let canv = document.getElementById('canvas');
	let ctx = canv.getContext('2d');
	let image = new Image();
	image.src = selectPicture.src;
	image.onload = function(event) {
		canvas.width = image.width;
		canvas.height = image.height;
		let proportion_width = image.width/canvas_img_width;
		let proportion_height = image.height/canvas_img_height;
		if(ellipse_flag){
			let oval_x = cur_box_left*proportion_width + screen_box_width*proportion_width/2;
			let oval_y = cur_box_top*proportion_height +screen_box_height*proportion_height/2;
			ctx.ellipse(oval_x,oval_y,screen_box_width*proportion_width/2,screen_box_height*proportion_height/2,0,0,2*Math.PI); 
			ctx.clip();
		}
		ctx.drawImage(image, 0, 0);
		imageData = ctx.getImageData(cur_box_left*proportion_width,cur_box_top*proportion_height,screen_box_width*proportion_width, screen_box_height*proportion_height);
		canv.width = screen_box_width*proportion_width;
		canv.height = screen_box_height*proportion_height;
		ctx.putImageData(imageData, 0, 0);
		selectPicture.src = canvas.toDataURL(selectPicture.getAttribute('pic_type'));
		cur_box_left=null,cur_box_top=null,screen_box_width=null, screen_box_height=null;
		$("#screenshotbox")[0].style.height = 0;
		$("#screenshotbox")[0].style.width = 0;
		changeCurtain(0);
		// 删除截图框
		screen_box_width = null;
		// 使得截图框不显示
		document.getElementById("screenshotbox").style.display = "none";
	}
}
// 调用百度接口，鉴别图片是否涉黄
function identifyPic(app_id,app_sign,base64_code,type){
	res_code = $.ajax({
		type: 'post',
		url: 'http://route.showapi.com/1201-1',
		dataType: 'json',
		data: {
			"showapi_timestamp": formatterDateTime(),
			"showapi_appid": app_id, //这里需要改成自己的appid
			"showapi_sign": app_sign,  //这里需要改成自己的应用的密钥secret
			"imgUrl":"",
			"type":type,
			"base64":base64_code,
			"imgFile":""
		},
		error: function(XmlHttpRequest, textStatus, errorThrown) {
		alert("操作失败!");
		},
		success: function(result) {
		console.log(result) //console变量在ie低版本下不能用
		//alert(result.showapi_res_code)
			return result.showapi_res_code;
		}
	})
}
function formatterDateTime() {
	var date=new Date()
	var month=date.getMonth() + 1
	var datetime = date.getFullYear()
	+ ""// "年"
	+ (month >= 10 ? month : "0"+ month)
	+ ""// "月"
	+ (date.getDate() < 10 ? "0" + date.getDate() : date.getDate())
	+ ""
	+ (date.getHours() < 10 ? "0" + date.getHours() : date.getHours())
	+ ""
	+ (date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes())
	+ ""
	+ (date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds());
	return datetime;
}
// 网易网盾图片检测接口
function NetEasyidentifyPic(secretId,businessId,nonce,dataId){
	res_code = $.ajax({
		type: 'post',
		url: 'http://as.dun.163.com/v5/image/check',
		dataType: 'json',
		data: {
			"name": "test",
			"type": 1,  
			"dataId":dataId,
			"secretId":secretId,
			"businessId":businessId,
			"timestamp":formatterDateTime(),
			"nonce":nonce,
			"signatureMethod":signatureMethod,
			"signature":signature
		},
		error: function(XmlHttpRequest, textStatus, errorThrown) {
			alert("操作失败!");
		},
		success: function(result) {
		console.log(result) //console变量在ie低版本下不能用
		//alert(result.showapi_res_code)
			return result.msg;
		}
	})
}
window.onload = function(){
	// 1.拖拽拉入图片，显示出来
	document.addEventListener("drop",preventDe);        //该事件在拖动元素放置在目标区域时触发
	document.addEventListener("dragleave",preventDe);   //该事件在拖动元素离开放置目标时触发
	document.addEventListener("dragover",preventDe);    //该事件在拖动元素在放置目标上时触发
	document.addEventListener("dragenter",preventDe);   //该事件在拖动的元素进入放置目标时触发
	function preventDe(e){
		e.preventDefault();
	}
	var boxDiv = document.getElementById('picEditRegion');
	boxDiv.addEventListener("drop",function(e){
		e.preventDefault();
		//file.type; 文件类型
		//file.name;文件名
		//file.size; 文件大小 btye
		var file,dataURL;
		let limitType = ["jpg","png","gif","jpeg","webp"];
		let img_file_type = ['image/gif','image/jpeg','image/jpg',
						'image/pjpeg','image/x-png','image/png']
		file_len = e.dataTransfer.files.length;
		for(var i=0;i<file_len;i++){
			file = e.dataTransfer.files[i];
			dataURL = URL.createObjectURL(file);
			// .jpg,.png,.gif,.jpeg,.webp该尾缀名才为图片
			console.log(file['type']);
			for(let i=0;i<5;i++){
				if(limitType[i] == file['name'].substr(file['name'].lastIndexOf('.'))){
					break;
				}
			}
			for(let j=0;j<6;j++){
				if(img_file_type[j] == file['type']){
					break;
				}
			}
			if(i == 5 || j==6){
				return;
			}
			addPictrueDiv(dataURL,file['name'],file['type']);
		}
		controlDivWidth($("#regionShow img").length + file_len);
	})
	$('.regionShading').on('click', function() {
		$('#file-input').trigger('click');
	});
	$('.picEditAdd').on('click', function() {
		$('#file-input').trigger('click');
	});
	$('#file-input').on('change',function(e){
		for (var i = 0; i < this.files.length; i++) {
			var reader = new FileReader();
			reader.readAsDataURL(this.files[i]);
			filename = this.files[i].name;
			filetype = this.files[i].type;
			reader.onload = function(e){
				addPictrueDiv(this.result,filename,filetype)
			}
		}
		controlDivWidth($("#regionShow img").length + this.files.length);
	})
	$(".topClose").click(function () {
		document.getElementById('pictureOperation').style.display="none";
		// 删除截图框
		screen_box_width = null;
		// 使得截图框不显示
		document.getElementById("screenshotbox").style.display = "none";
		changeCurtain(0);
	});
	// 2.在图片区域绘制红色矩形，并能随鼠标拖拽控制大小
	$("#canvas_rm").on("mousedown",function(e) {
		if(is_phone){
			return;
		}
		startX = e.pageX;
		startY = e.pageY;
		// 删除截图框
		screen_box_width = null;
		document.getElementById("screenshotbox").style.display = "none";
		changeCurtain(0);
		let curtainLeft = document.getElementById("curtainLeft");
		curtainLeft.style.width = canvas_img_width + 'px';
		begin_draw_flag = true;
	})
	$("#canvas_rm").on("touchstart",function(e) {
		e.stopPropagation();
		is_phone = true;
		startX = e.originalEvent.changedTouches[0].pageX;
		startY = e.originalEvent.changedTouches[0].pageY;
		// 删除截图框
		screen_box_width = null;
		document.getElementById("screenshotbox").style.display = "none";
		changeCurtain(0);
		let curtainLeft = document.getElementById("curtainLeft");
		curtainLeft.style.width = canvas_img_width + 'px';
		begin_draw_flag = true;
	})
	$(".operationMain").on("mousemove touchmove",function(e){
		e.stopPropagation();
		crlMove(e);
		screen_box_move(e);
		crlWidthZoom(e);
		crlHeightZoom(e);
	})
	$(".operationMain").on("touchend mouseup mouseleave",function(e){
		begin_draw_flag = false;
		begin_move_flag = false;
		width_zoomFlag = false;
		height_zoomFlag = false;
		is_phone = false;
	})
	// 3.当鼠标点击截图区域框时，按住可以进行拖拽
	$("#screenshotbox").on("mousedown",function(e){
		e.stopPropagation();
		mov_start_x = e.pageX;
		mov_start_y = e.pageY;
		mov_end_box_left = cur_box_left;
		mov_end_box_top = cur_box_top;
		begin_move_flag = true;
	})
	$("#screenshotbox").on("touchstart",function(e){
		e.stopPropagation();
		is_phone = true;
		mov_start_x = e.originalEvent.changedTouches[0].clientX;
		mov_start_y = e.originalEvent.changedTouches[0].clientY;
		mov_end_box_left = cur_box_left;
		mov_end_box_top = cur_box_top;
		begin_move_flag = true;
	})
	//可直接加在上面的移动事件中
	// $("#screenshotbox").on("touchmove mousemove",function(e){
	// 	e.stopPropagation();
	// 	screen_box_move(e);
	// })
	// 4.截图框周边8个div再次控制大小选择截图区域
	// 8个div控制框大小
	$('.plugin-up-left').on("mousedown",function(e){
		e.stopPropagation();
		startX = cur_box_left + screen_box_width+sliceWidth;
		startY = cur_box_top + screen_box_height+sliceHeight;
		begin_draw_flag = true;
	})
	$('.plugin-up-left').on("touchstart",function(e){
		e.stopPropagation();
		is_phone = true;
		startX = cur_box_left + screen_box_width +sliceWidth;
		startY = cur_box_top + screen_box_height +sliceHeight;
		begin_draw_flag = true;
	})
	$('.plugin-up-right').on("mousedown",function(e){
		e.stopPropagation();
		startX = cur_box_left+sliceWidth;
		startY = cur_box_top + screen_box_height+sliceHeight;
		begin_draw_flag = true;
	})
	$('.plugin-up-right').on("touchstart",function(e){
		e.stopPropagation();
		is_phone = true;
		startX = cur_box_left+sliceWidth;
		startY = cur_box_top + screen_box_height +sliceHeight;
		begin_draw_flag = true;
	})
	$('.plugin-right-down').on("mousedown",function(e){
		e.stopPropagation();
		startX = cur_box_left + sliceWidth;
		startY = cur_box_top + sliceHeight;
		begin_draw_flag = true;
	})
	$('.plugin-right-down').on("touchstart",function(e){
		e.stopPropagation();
		is_phone = true;
		startX = cur_box_left + sliceWidth;
		startY = cur_box_top + sliceHeight;
		begin_draw_flag = true;
	})
	$('.plugin-left-down').on("mousedown",function(e){
		e.stopPropagation();
		startX = cur_box_left + screen_box_width + sliceWidth;
		startY = cur_box_top+sliceHeight;
		begin_draw_flag = true;
	})
	$('.plugin-left-down').on("touchstart",function(e){
		e.stopPropagation();
		is_phone = true;
		startX = cur_box_left + screen_box_width + sliceWidth;
		startY = cur_box_top+sliceHeight;
		begin_draw_flag = true;
	})
	$('.plugin-up').on("mousedown",function(e){
		e.stopPropagation();
		startY = cur_box_top + screen_box_height+sliceHeight;
		height_zoomFlag = true;
	})
	$('.plugin-up').on("touchstart",function(e){
		e.stopPropagation();
		is_phone = true;
		startY = cur_box_top + screen_box_height + sliceHeight;
		height_zoomFlag = true;
	})
	$('.plugin-down').on("mousedown",function(e){
		e.stopPropagation();
		startY = cur_box_top + sliceHeight;
		height_zoomFlag = true;
	})
	$('.plugin-down').on("touchstart",function(e){
		e.stopPropagation();
		is_phone = true;
		startY = cur_box_top + sliceHeight;
		height_zoomFlag = true;
	})
	$('.plugin-right').on("mousedown",function(e){
		e.stopPropagation();
		startX = cur_box_left + sliceWidth;
		width_zoomFlag = true;
	})
	$('.plugin-right').on("touchstart",function(e){
		e.stopPropagation();
		is_phone = true;
		startX = cur_box_left + sliceWidth;
		width_zoomFlag = true;
	})
	$('.plugin-left').on("mousedown",function(e){
		e.stopPropagation();
		startX = cur_box_left + screen_box_width + sliceWidth;
		width_zoomFlag = true;
	})
	$('.plugin-left').on("touchstart",function(e){
		e.stopPropagation();
		is_phone = true;
		startX = cur_box_left + screen_box_width + sliceWidth;
		width_zoomFlag = true;
	})
	// 6.利用canvas截图保存到img中
	$("#screenBtn").on("click",confirmScreen);
	//7.添加圆形和矩形两种方式截图
	$("#rect_screenBtn").on("click",function(){
		$("#screenshotbox").css("border-radius","0%");
		ellipse_flag = false;
	});
	$("#round_screenBtn").on("click",function(){
		$("#screenshotbox").css("border-radius","50%");
		ellipse_flag = true;
	});
}