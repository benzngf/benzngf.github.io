var xmlhttp2;
if (window.XMLHttpRequest) { // code for IE7+, Firefox, Chrome, Opera, Safari
    xmlhttp2 = new XMLHttpRequest();
}
else { // code for IE6, IE5
    xmlhttp2 = new ActiveXObject("Microsoft.XMLHTTP");
}
xmlhttp2.onreadystatechange = function() {
    if (xmlhttp2.readyState == 4 && xmlhttp2.status == 200) {
        document.getElementById("start").insertAdjacentHTML('afterend', xmlhttp2.responseText);
    }
}
xmlhttp2.open("GET", "/footer.html", true);
xmlhttp2.send();