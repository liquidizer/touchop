function update(evt) {
    // show persistent success emoticons if the page is delivered as html5
    if (document.domain!="") {
	var levels= document.getElementById("levels");
	var passed= updateStyle(levels);
	var key= window.location.pathname;
	if (passed)
	    window.localStorage.setItem(key,"PASSED");
	else
	    window.localStorage.removeItem(key,"PASSED");
    }
}

function updateStyle(obj) {
    var allTrue= true;
    if (obj.nodeName=="A") {
        var href= obj.getAttribute("href");
        var key= window.location.pathname.replace(/[^/]*$/, href);
        var state= window.localStorage.getItem(key);
        if (state!=null)
	    obj.setAttribute("class", "passed");
        else {
	    obj.setAttribute("class", "pending");
	    allTrue= false;
	}
    } else if (obj.nodeType==1) {
	for (var i=0; i<obj.childNodes.length; ++i) {
	    var child= obj.childNodes[i];
	    if (child.nodeType==1) {
		allTrue= allTrue & updateStyle(child);
	    }
	}
    }
    return allTrue;
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