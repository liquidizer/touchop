var passed= 0;
var total= 0;

function update(evt) {
    // show persistent success emoticons if the page is delivered as html5
    if (document.domain!="") {
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

function setSmiley(obj, passed) {
    if (obj.getAttribute("class")=="smiley") {
	if (obj.childNodes.length>0)
	    obj.removeChild(obj.firstChild);
	if (!passed) {
	    obj.appendChild(document.createTextNode(" ☹"));
	    obj.setAttribute("style", "color:lightgray"); 
	} else {	   
	    obj.appendChild(document.createTextNode(" ☻"));
	    obj.setAttribute("style", "color:green"); 
	}
    } else {
	for (var i=0; i<obj.childNodes.length; ++i) {
	    var child= obj.childNodes[i];
	    if (child.nodeType==1) {
		setSmiley(child, passed);
	    }
	}
    }
}

// update the score if db changes
window.addEventListener("storage", update, false);

// update on load
window.onload= update;