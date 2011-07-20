/* Touchop - Touchable operators
 *           music domain
 *
 * Copyright(C) 2008, 2011, Stefan Dirnstorfer
 * This software may be copied, distributed and modified under the terms 
 * of the GPL (http://www.gnu.org/licenses/gpl.html)
 */

var play= null;
var playMode= null;
function verify(obj, isFinal) {
    if (isFinal) {
	var toplay= obj;
	while (obj.nodeType==1) {

	    if (obj.getAttributeNS(topns, "layout")!="")
		toplay= obj;
	    obj= obj.parentNode;
	}
	playMode= "#";
	if (play==null) {
	    play= toplay;
	    playSequence();
	} else {
	    play.setAttribute("class","");
	    play= toplay;
	}
    }
}

function playSequence() {
    while (play!=null) {
	if (play.nodeType==1) {
	    var c= play.getAttribute("class");
	    if (c=="playback") {
		play.setAttribute("class","");
	    }
	    else {
		var v= play.getAttributeNS(topns,"play");
		if (v!="") {
		    play.setAttribute("class","playback");
		    time= eval(playMode.replace("#",v));
		    setTimeout("playSequence()",time);
		    return;
		}
	    }
	    if (play.childNodes.length>0) {
		// apply a play filter
		var filter= play.getAttributeNS(topns, "filter");
		if (filter=="") filter="(#)";
		playMode= playMode.replace(/#/, "("+filter+")");

		// traverse down to the first child
		play.setAttribute("done","0");
		play= play.childNodes[0];
		continue;
	    }
	}
	// with the final sibling, traverse up
	while (play!=null && play.nextSibling == null) {
	    play= play.parentNode;
	    // repeated play
	    if (play.nodeType==1) {
		var repeat= play.getAttributeNS(topns, "repeat");
		if (repeat!="") {
		    var done= play.getAttribute("done");
		    if (done==null) done= "0";
		    done= parseInt(done)+1;
		    play.setAttribute("done",""+done);
		    if (done<parseInt(repeat)) {
			play= play.childNodes[0];
			continue;
		    }
		}
	    }
	    // unapply the play filter
	    var filter= play.getAttributeNS(topns, "filter");
	    if (filter=="") filter="(#)";
	    playMode= playMode.replace("("+filter+")", "#");
	    // stop playing
	    if (playMode=="#") play=null;
	}
	// traverse to the next node for playing
	if (play!=null) {
	    play= play.nextSibling;
	}
    }
}

function speed(factor, value) {
    return value * factor;
}

