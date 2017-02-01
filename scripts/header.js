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
        var particleMinScript = document.createElement('script');
        var particleScript = document.createElement('script');
        var LogoScript = document.createElement('script');
        particleMinScript.setAttribute('src', 'scripts/particles.min.js');
        particleScript.setAttribute('src', 'scripts/particle.js');
        LogoScript.setAttribute('src', 'scripts/logo.js');
        document.body.appendChild(particleMinScript);
        document.body.appendChild(particleScript);
        document.body.appendChild(LogoScript);
    }
}
xmlhttp.open("GET", "header.html", true);
xmlhttp.send();

