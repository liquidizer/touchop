/* Touchop - Touchable operators
 *           Musical score setting
 *
 * Copyright(C) 2011, Stefan Dirnstorfer
 * This software may be copied, distributed and modified under the terms 
 * of the GPL (http://www.gnu.org/licenses/gpl.html)
 */

var ding= new Audio("ding.wav");
function verify(obj, isFinal) {
    if (isFinal) {
	sound= synthesize();
	playSound(sound, 0);
    }
}

function playSound(sound, index) {
    if (index>0) {
	for (var j=0; j<sound[index-1].length; ++j) {
	    var obj= sound[index-1][j][2];
	    obj.removeAttribute("class");
	}
    }
    if (index<sound.length) {
	var time= 0;
	for (var j=0; j<sound[index].length; ++j) {
	    var tune= sound[index][j];
	    tune[2].setAttribute("class","playback");
	    time= Math.max(tune[1], time);
	}
	if (time==0)
	    playSound(sound,index+1);
	else {
	    // play sound and schedule next tune
	    ding.play();
	    setTimeout(function () { playSound(sound, index+1); },
		       2000/time);
	}
    }
}

function synthesize() {
    var clef= document.getElementById("clef");
    var sound= [];
    for (var i=0; i<clef.childNodes.length; ++i) {
	var child= clef.childNodes[i];
	if (child.nodeType==1) {
	    var name= child.getAttributeNS(topns, "name");
	    if (name=="sample")
		sound.push(synthesizeSample(child));
	}
    }
    return sound;
}

function synthesizeSample(obj) {
    var sound= [];
    for (var i=0; i<obj.childNodes.length; ++i) {
	var child= obj.childNodes[i];
	if (child.nodeType==1) {
	    var pitch= child.getAttributeNS(topns, "pitch");
	    if (pitch!="") {
		var note= getNote(child);
		if (note) {
		    var time= note.getAttributeNS(topns, "time");
		    sound.push([eval(pitch),eval(time),note]);
		}
	    }
	}
    }
    return sound;
}

function getNote(obj) {
    for (var i=0; i<obj.childNodes.length; ++i) {
	var child= obj.childNodes[i];
	if (child.nodeType==1) {
	    var time= child.getAttributeNS(topns, "time");
	    if (time!="")
		return child;
	    var note= getNote(child);
	    if (note)
		return note;
	}
    }
    return null;
}


function snapNote(obj) {
    var back= null;
    var blocked= false;
    for (var i=0; i<obj.childNodes.length; ++i) {
        child= obj.childNodes[i];
        if (child.nodeType==1) {
	    if (child.getAttribute("class")=="background") {
		// The first element is the reference position
		back= child;
	    }
	    else if (back!=null) {
		var m= child.getTransformToElement(obj);
		var box1= back.getBBox();
		var box2= child.getBBox();

		m.e = 0.5*box1.width;
		m.f = 0.5*box1.height;
		setTransform(child, m);

		if (child.getAttribute("onmousedown")!=null)
		    blocked= true;
	    }
	}
    }
    if (blocked) {
	obj.setAttribute("blocked","true");
	obj.parentNode.parentNode.appendChild(obj.parentNode);
    } else {
	obj.removeAttribute("blocked");
    }
}
