function update(evt) {
    // show persistent success emoticons if the page is delivered as html5
    if (document.domain!="") {
	var scores= document.getElementsByName("score");
	for (var i=0; i<scores.length; ++i) {
            var href= scores[i].getAttribute("href");
            var key= window.location.pathname.replace(/[^/]*$/,href);
            var state= window.localStorage.getItem(key);
            var span= document.createElement("span");
            if (state==null) {
		span.appendChild(document.createTextNode(" ☹"));
		span.setAttribute("style", "color:lightgray"); 
            } else {	   
		span.appendChild(document.createTextNode(" ☻"));
		span.setAttribute("style", "color:green"); 
            }
            scores[i].parentNode.replaceChild(span, scores[i].nextSibling);
        }
    }
}

// update the score if db changes
window.addEventListener("storage", update, false);

// update on load
window.onload= update;