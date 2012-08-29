var passed= 0;
var total= 0;

function update(evt) {
    // show persistent success emoticons if the page is delivered as html5
    var levels= document.getElementById("levels");
    
    // refresh level state
    passed=0;
    total=0;
    updateStyle(levels);
    if (passed==total)
	passed="PASSED";
    else
	passed=passed+"/"+total;

    // persist level state
    var key= window.location.pathname;
    window.localStorage.setItem(key,passed);
}

function updateStyle(obj) {
    if (obj.nodeName=="A") {
        var href= obj.getAttribute("href");
        var key= window.location.pathname.replace(/[^/]*$/, href);
        var state= window.localStorage.getItem(key);
        if (state=="PASSED" || eval(state)>=1) {
	    passed= passed + 1;
	    obj.setAttribute("class", "passed");
	} else if (eval(state) >= 8/12) {
	    obj.setAttribute("class", "progress");
	} else if (eval(state) >= 4/12) {
	    obj.setAttribute("class", "started");
        } else {
	    obj.setAttribute("class", "untouched");
	}
	total= total+1;
    } else if (obj.nodeType==1) {
	for (var i=0; i<obj.childNodes.length; ++i) {
	    var child= obj.childNodes[i];
	    if (child.nodeType==1) {
		updateStyle(child);
	    }
	}
    }
}

// update the score if db changes
window.addEventListener("storage", update, false);

// update on load
window.onload= update;

// google analytics
if (/(www\.)?dadim\.de/.test(window.location.hostname)) {
    var _gaq = _gaq || [];
    _gaq.push(['_setAccount', 'UA-13269270-1']);
    _gaq.push(['_trackPageview']);

    (function() {
	var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
	ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
	var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
    })();
}
