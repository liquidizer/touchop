/* Touchop - Touchable operators
 *           music domain
 *
 * Copyright(C) 2008, 2011, Stefan Dirnstorfer
 * This software may be copied, distributed and modified under the terms 
 * of the GPL (http://www.gnu.org/licenses/gpl.html)
 */


var play= null;
var stop= null;
function verify(obj, isFinal) {
    if (isFinal) {
	play= obj;
	while (obj.nodeType==1) {
	    if (obj.getAttributeNS(topns, "layout")!="")
		play= obj;
	    obj= obj.parentNode;
	}
	stop= play;
	playSequence();
    }
 }

function playSequence() {
    while (play!=null) {
	if (play.nodeType==1) {

	    var c= play.getAttribute("class");
	    if (c=="playback") {
		play.setAttribute("class","background");
	    }
	    else {
		if (c=="background") {
		    var v= play.getAttributeNS(topns,"play");
		    if (v!="") {
			play.setAttribute("class","playback");
			setTimeout("playSequence()",parseInt(v));
			return;
		    }
		}
	    }
	    if (play.childNodes.length>0) {
		play= play.childNodes[0];
		continue;
	    }
	}
	while (play!=null && play.nextSibling == null) {
	    play= play.parentNode;
	    if (play==stop) play=null;
	}
	if (play!=null)
	    play= play.nextSibling;
    }
}
