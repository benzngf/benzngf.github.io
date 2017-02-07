var changeVideo = function(site, vid){
	var TVframe = document.getElementById("TVFrame");
	var labels = document.getElementsByClassName("TVLabel");
	switch(site){
		case 'YT':
		TVframe.innerHTML = '<div class="videoFrame"><iframe width="100%" height="100%" src="https://www.youtube.com/embed/'+vid+'" frameborder="0" allowfullscreen></iframe></div>';
		TVframe.style.backgroundColor = '#e62117';
		for (var i = labels.length - 1; i >= 0; i--) {
			if(labels[i].id == site){
				labels[i].style = 'box-shadow: inset 0px 0px 10px -5px rgba(0,0,0,0.5); background-color: #e62117; color:#ffffff;';
			}else{
				labels[i].style = '';
			}
		}
		break;
		case 'Bili':
		TVframe.innerHTML = '<div class="videoFrame"><embed height="370" width="100%" quality="high" allowfullscreen="true" type="application/x-shockwave-flash" src="//static.hdslb.com/miniloader.swf" flashvars="aid='+vid+'&page=1" pluginspage="//www.adobe.com/shockwave/download/download.cgi?P1_Prod_Version=ShockwaveFlash"></embed></div>';
		TVframe.style.backgroundColor = '#ff709f';
		for (var i = labels.length - 1; i >= 0; i--) {
			if(labels[i].id == site){
				labels[i].style = 'box-shadow: inset 0px 0px 10px -5px rgba(0,0,0,0.5); background-color: #ff709f; color:#ffffff;';
			}else{
				labels[i].style = '';
			}
		}
		break;
		case 'Nico':
		TVframe.innerHTML = '<div class="videoFrame"><iframe allowfullscreen="allowfullscreen" frameborder="0" width="100%" height="100%" src="http://embed.nicovideo.jp/watch/'+vid+'?oldScript=1&amp;allowProgrammaticFullScreen=1" style="max-width: 100%;"></iframe></div>';
		TVframe.style.backgroundColor = '#ffffff';
		for (var i = labels.length - 1; i >= 0; i--) {
			if(labels[i].id == site){
				labels[i].style = 'box-shadow: inset 0px 0px 10px -5px rgba(0,0,0,0.5); background-color: #ffffff;';
			}else{
				labels[i].style = '';
			}
		}
		break;
		default:
		console.log('no such site');
		TVframe.style = '';
		for (var i = labels.length - 1; i >= 0; i--) {
				labels[i].style = '';
		}
		break; 
	}
}