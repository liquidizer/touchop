/* Touchop - Touchable operators
 *           Musical score setting
 *
 * Copyright(C) 2011, Stefan Dirnstorfer
 * This software may be copied, distributed and modified under the terms 
 * of the GPL (http://www.gnu.org/licenses/gpl.html)
 */

function verify(obj, isFinal) {
    if (isFinal) {
	while (obj.getAttribute("id")!="clef") {
	    obj= obj.parentNode;
	    if (obj.nodeType!=1) return;
	}
	sound= synthesize(obj);
	playSound(sound, 0, 0);
    }
}

function playSound(sound, index) {
    if (index>0) {
	for (var j=0; j<sound[index-1].length; ++j) {
	    var audio= sound[index-1][j][2];
	    audio.pause();
	    var obj= sound[index-1][j][1];
	    obj.removeAttribute("class");
	}
    }
    if (index<sound.length) {
	var time= 0;
	for (var j=0; j<sound[index].length; ++j) {
	    var tune= sound[index][j];
	    tune[1].setAttribute("class","playback");
	    time= Math.max(tune[0], time);
	    tune[2].play();
	}
	if (time==0)
	    playSound(sound,index+1);
	else {
	    // play sound and schedule next tune
	    time= 2000/time;
	    sound[index][0][2].onplay= function() {
		setTimeout(function() {
		    playSound(sound, index+1); }, time);
	    };
	}
    }
}

function synthesize(clef) {
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
		    var audio= new Audio("ding.wav");
		    audio.load();
		    sound.push([eval(time),note,audio]);
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
