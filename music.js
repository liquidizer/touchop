/* Touchop - Touchable operators
 *           music domain
 *
 * Copyright(C) 2008, 2011, Stefan Dirnstorfer
 * This software may be copied, distributed and modified under the terms 
 * of the GPL (http://www.gnu.org/licenses/gpl.html)
 */


var play= null;
function verify(obj, isFinal) {
    if (isFinal) {
	play= obj;
	while (obj.nodeType==1) {
	    if (obj.getAttributeNS(topns, "value")!="")
		play= obj;
	    obj= obj.parentNode;
	}
	playSequence();
    }
 }

function playSequence() {
    var stop= false;
    while (play!=null) {
	if (play.nodeType==1) {
	    var v= play.getAttributeNS(topns,"value");

	    var c= play.getAttribute("class");
	    if (c=="playback") {
		play.setAttribute("class","background");
	    }
	    else {
		stop = stop | (v!="" && v.replace(/#/,"")==v)
		if (c=="background") {
		    if (stop) {
			play.setAttribute("class","playback");
			setTimeout("playSequence()",1000);
			return;
		    }
		}
	    }
	    if (play.childNodes.length>0) {
		play= play.childNodes[0];
		continue;
	    }
	}
	while (play!=null && play.nextSibling == null)
	    play= play.parentNode;
	play= play.nextSibling;
    }
}
