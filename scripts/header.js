var xmlhttp;
if (window.XMLHttpRequest) { // code for IE7+, Firefox, Chrome, Opera, Safari
    xmlhttp = new XMLHttpRequest();
}
else { // code for IE6, IE5
    xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
}
xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
        document.getElementById("start").insertAdjacentHTML('beforebegin', xmlhttp.responseText);
        var particleScript = document.createElement('script');
        particleScript.setAttribute('src', '/scripts/particle.js');
        document.body.appendChild(particleScript);
    }
}
xmlhttp.open("GET", "/header.html", true);
xmlhttp.send();

