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

  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-100765682-1', 'auto');
  ga('send', 'pageview');