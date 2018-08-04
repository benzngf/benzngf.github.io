function moveUp() {
    var VContent = document.getElementById("VideoContent");
    var E = document.getElementById('hoverFrame');
    E.style.top = "-150%";
    document.getElementsByTagName("body")[0].classList.remove('stop-scrolling');
    document.title = "小捲 Xquid";
    nowName = "";
    setTimeout(function(){if(nowName == ""){document.getElementById("TVFrame").innerHTML = '';}}, 3000);
}
var nowName = "";
function showVid(name) {
	document.title = name+" | 小捲 Xquid";
    nowName = name;
    var E = document.getElementById('hoverFrame');
    var VContent = document.getElementById("VideoContent");
    document.getElementById("VideoName").innerHTML = name;
    var site = vidContents[name].defaultVidSite;
    console.log(site);
    VContent.innerHTML = vidContents[name].content;
    document.getElementById("overlayContainer").scrollTop = 0;
    switchVid(site);
    var labels = document.getElementsByClassName("TVLabel");
    for (var i = labels.length - 1; i >= 0; i--) {
        if (labels[i].id in vidContents[name].video) {
            labels[i].classList.remove("disable");
        } else {
            labels[i].classList.add("disable");
        }
    }
    E.style.top = "0%";
    document.getElementsByTagName("body")[0].classList.add('stop-scrolling');
}
function switchVid(site) {
    var labels = document.getElementsByClassName("TVLabel");
    var TVframe = document.getElementById("TVFrame");
    var vid = vidContents[nowName].video[site];
    switch (site) {
        case 'YT':
            TVframe.innerHTML = '<div class="videoFrame"><iframe width="100%" height="100%" src="https://www.youtube.com/embed/' + vid + '?rel=0" frameborder="0" allowfullscreen></iframe></div>';
            TVframe.style.backgroundColor = '#e62117';
            for (var i = labels.length - 1; i >= 0; i--) {
                if (labels[i].id == site) {
                    labels[i].style = 'box-shadow: inset 0px 0px 10px -5px rgba(0,0,0,0.5); background-color: #e62117; color:#ffffff;';
                } else {
                    labels[i].style = '';
                }
            }
            break;
        case 'Bili':
            TVframe.innerHTML = '<div class="videoFrame"><iframe src="//player.bilibili.com/player.html?aid='+vid+'" width="100%" height="100%" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"> </iframe></div>';
            TVframe.style.backgroundColor = '#ff709f';
            for (var i = labels.length - 1; i >= 0; i--) {
                if (labels[i].id == site) {
                    labels[i].style = 'box-shadow: inset 0px 0px 10px -5px rgba(0,0,0,0.5); background-color: #ff709f; color:#ffffff;';
                } else {
                    labels[i].style = '';
                }
            }
            break;
        case 'Nico':
            TVframe.innerHTML = '<div class="videoFrame"><iframe allowfullscreen="allowfullscreen" frameborder="0" width="100%" height="100%" src="http://embed.nicovideo.jp/watch/' + vid + '?oldScript=1&amp;allowProgrammaticFullScreen=1" style="max-width: 100%;"></iframe></div>';
            TVframe.style.backgroundColor = '#ffffff';
            for (var i = labels.length - 1; i >= 0; i--) {
                if (labels[i].id == site) {
                    labels[i].style = 'box-shadow: inset 0px 0px 10px -5px rgba(0,0,0,0.5); background-color: #ffffff;';
                } else {
                    labels[i].style = '';
                }
            }
            break;
        case 'FB':
            TVframe.innerHTML = '<div class="videoFrame"><iframe src="https://www.facebook.com/plugins/video.php?href=https%3A%2F%2Fwww.facebook.com%2F' + vid + '%2F&show_text=0&width=640" width="100%" height="100%" style="border:none;overflow:hidden;background-color:#000;" scrolling="no" frameborder="0" allowTransparency="true" allowFullScreen="true"></iframe></div>';
            TVframe.style.backgroundColor = '#3b5998';
            for (var i = labels.length - 1; i >= 0; i--) {
                if (labels[i].id == site) {
                    labels[i].style = 'box-shadow: inset 0px 0px 10px -5px rgba(0,0,0,0.5); background-color: #3b5998; color:#ffffff;';
                } else {
                    labels[i].style = '';
                }
            }
            break;
        case 'Vimeo':
            TVframe.innerHTML = '<div class="videoFrame"><iframe src="https://player.vimeo.com/video/' + vid + '" width="100%" height="100%" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe></div>';
            TVframe.style.backgroundColor = '#09adef';
            for (var i = labels.length - 1; i >= 0; i--) {
                if (labels[i].id == site) {
                    labels[i].style = 'box-shadow: inset 0px 0px 10px -5px rgba(0,0,0,0.5); background-color: #09adef; color:#ffffff;';
                } else {
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
