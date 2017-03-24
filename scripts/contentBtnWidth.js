var currentSize = "33%";
function resizeContentBtn() {
	var content = document.getElementsByClassName("content");
	if(content[0].offsetWidth < 500){
		if(currentSize != "100%"){
			var elements = document.getElementsByClassName("contentBtn");
			for (var i = elements.length - 1; i >= 0; i--) {
				elements[i].style.width = "100%";
			}
			currentSize = "100%";
		}
	}else if(content[0].offsetWidth < 768){
		if(currentSize != "49%"){
			var elements = document.getElementsByClassName("contentBtn");
			for (var i = elements.length - 1; i >= 0; i--) {
				elements[i].style.width = "49%";
			}
			currentSize = "49%";
		}
	}else if(content[0].offsetWidth < 1024){
		if(currentSize != "32.5%"){
			var elements = document.getElementsByClassName("contentBtn");
			for (var i = elements.length - 1; i >= 0; i--) {
				elements[i].style.width = "32.5%";
			}
			currentSize = "32.5%";
		}
	}else{
		if(currentSize != "24%"){
			var elements = document.getElementsByClassName("contentBtn");
			for (var i = elements.length - 1; i >= 0; i--) {
				elements[i].style.width = "24%";
			}
			currentSize = "24%";
		}
	}
}
resizeContentBtn();
window.addEventListener("resize", resizeContentBtn);