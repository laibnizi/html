var i=1,gentry=null,w=null;
var hl=null,le=null,de=null,ie=null;
var unv=true;
var bUpdated=false; //用于兼容可能提前注入导致DOM未解析完更新的问题
// H5 plus事件处理
function plusReady(){
	// 获取摄像头目录对象
	plus.io.resolveLocalFileSystemURL('_doc/', function(entry){
		entry.getDirectory('camera', {create:true}, function(dir){
			gentry = dir;
			updateHistory();
		}, function(e){
			outSet('Get directory "camera" failed: '+e.message);
		} );
	}, function(e){
		outSet('Resolve "_doc/" failed: '+e.message);
	});
}
if(window.plus){
	plusReady();
}else{
	document.addEventListener('plusready', plusReady, false);
}
// 监听DOMContentLoaded事件
document.addEventListener('DOMContentLoaded', function(){
	// 获取DOM元素对象
	hl=document.getElementById('history');
	le=document.getElementById('empty');
	de=document.getElementById('display');
	if(ie=document.getElementById('index')){
		ie.onchange=indexChanged;
	}
	// 判断是否支持video标签
	unv=!document.createElement('video').canPlayType;
	updateHistory();
},false );
function changeIndex(){
	outSet('选择摄像头：');
	ie.focus();
}
function indexChanged(){
	de.innerText = ie.options[ie.selectedIndex].innerText;
	i = parseInt(ie.value);
	outLine(de.innerText);
}
// 拍照
function getImage(){
	outSet('开始拍照：');
	var cmr = plus.camera.getCamera();
	cmr.captureImage(function(p){
		outLine('成功：'+p);
		plus.io.resolveLocalFileSystemURL(p, function(entry){
			createItem(entry);
		}, function(e){
			outLine('读取拍照文件错误：'+e.message);
		});
	}, function(e){
		outLine('失败：'+e.message);
	}, {filename:'_doc/camera/',index:1});
}
// 录像
function getVideo(){
	outSet('开始录像：');
	var cmr = plus.camera.getCamera();
	cmr.startVideoCapture(function(p){
		outLine('成功：'+p);
		plus.io.resolveLocalFileSystemURL(p, function(entry){
			createItem(entry);
		}, function(e){
			outLine('读取录像文件错误：'+e.message);
		} );
	}, function(e){
		outLine('失败：'+e.message);
	}, {filename:'_doc/camera/',index:i});
}
// 显示文件
function displayFile(li){
	if(w){
		outLine('重复点击！');
		return;
	}
	if(!li || !li.entry){
		ouSet('无效的媒体文件');
		return;
	}
	var name = li.entry.name;
	var suffix = name.substr(name.lastIndexOf('.'));
	var url = '';
	if(suffix=='.mov' || suffix=='.3gp' || suffix=='.mp4' || suffix=='.avi'){
		//if(unv){plus.runtime.openFile('_doc/camera/'+name);return;}
		url = '/plus/camera_video.html';
	} else {
		url = '/plus/camera_image.html';
	}
	w=plus.webview.create(url,url,{hardwareAccelerated:true,scrollIndicator:'none',scalable:true,bounce:'all'});
	w.addEventListener('loaded', function(){
		w.evalJS('loadMedia("'+li.entry.toLocalURL()+'")');
		//w.evalJS('loadMedia("'+'http://localhost:13131/_doc/camera/'+name+'")');
	}, false );
	w.addEventListener('close', function(){
		w = null;
	}, false);
	w.show('pop-in');
}

// 添加播放项
function createItem(entry){
	var li = document.createElement('li');
	li.className = 'ditem';
	li.innerHTML = '<span class="iplay"><font class="aname"></font><br/><font class="ainf"></font></span>';
	li.setAttribute('onclick', 'displayFile(this)' );
	hl.insertBefore( li, le.nextSibling );
	li.querySelector('.aname').innerText = entry.name;
	li.querySelector('.ainf').innerText = '...';
	li.entry = entry;
	updateInformation(li);
	// 设置空项不可见
	le.style.display = 'none';
}
// 获取录音文件信息
function updateInformation(li){
	if(!li || !li.entry){
		return;
	}
	var entry = li.entry;
	entry.getMetadata(function(metadata){
		li.querySelector('.ainf').innerText = dateToStr(metadata.modificationTime);
	}, function(e){
		outLine('获取文件"'+entry.name+'"信息失败：'+e.message);
	} );
}
// 获取录音历史列表
function updateHistory(){
	if(bUpdated||!gentry||!document.body){//兼容可能提前注入导致DOM未解析完更新的问题
		return;
	}
  	var reader = gentry.createReader();
  	reader.readEntries(function(entries){
  		for(var i in entries){
  			if(entries[i].isFile){
  				createItem(entries[i]);
  			}
  		}
  	}, function(e){
  		outLine('读取录音列表失败：'+e.message);
  	});
  	bUpdated = true;
}
// 清除历史记录
function cleanHistory(){
	hl.innerHTML = '<li id="empty" class="ditem-empty">无历史记录</li>';
	le = document.getElementById('empty');
	// 删除音频文件
	outSet('清空拍照录像历史记录：');
	gentry.removeRecursively(function(){
		// Success
		outLine('成功！');
	}, function(e){
		outLine('失败：'+e.message);
	});
}