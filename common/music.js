/* Touchop - Touchable operators
 *           Musical score setting
 *
 * Copyright(C) 2011, Stefan Dirnstorfer
 * This software may be copied, distributed and modified under the terms 
 * of the GPL (http://www.gnu.org/licenses/gpl.html)
 */

// determine the supported audio codec
var currentPlay= 0;
var codec= getCodec();

function getCodec() {
    var audio= new Audio("");
    if (audio.canPlayType('audio/ogg')) {
	codec="ogg";
    } else if (audio.canPlayType('audio/mpeg')) {
	codec="mp3";
    } else {
	alert("Your device does not support audio playback");
    }
    for (var j=1; j<=13; ++j) {
	audio= new Audio("snd/piano-"+j+"."+codec);
	audio.load();
    }
    playSample();
    return codec;
}


// play the reference sample
function playSample() {
    var obj= document.getElementById("test");
    var src= obj.getAttributeNS(topns, "src");
    var audio2= new Audio(src+"."+codec);
    audio2.play();
}

// play the notated melody
function verify(obj, isFinal) {
    currentPlay= currentPlay + 1;
    if (isFinal) {
	while (obj.getAttribute("id")!="clef") {
	    obj= obj.parentNode;
	    if (obj.nodeType!=1) return;
	}
	sound= synthesize(obj);
	soundCheck(sound);
	playSound(sound, 0, currentPlay, 20);
    }
}

// extract sound string for win verification
function soundCheck(sound) {
    var str="";
    for (var i=0; i<sound.length; ++i) {
	if (i>0) str= str+" ";
	var tunes=[];
	for (var j=0; j<sound[i].length; ++j) {
	    tunes.push(sound[i][j][4]);
	}
	str=str + tunes.sort();
    }
    var hash=0;
    for (var i=0; i<str.length; ++i) {
	hash= (hash*11311 + str.charCodeAt(i)) % 1000000;
    }
    console.log(str+" -> "+hash);
    var win= document.getElementById("test").getAttributeNS(topns,"win");
    if (str==win || hash==win)
	smile(1.0);
    else
	smile(0.0);
    return str;
}

// play a list of notes
function playSound(sound, index, cur, retry) {
    if (index>0) {
	// clear the playback marker from the last played note
	for (var j=0; j<sound[index-1].length; ++j) {
	    var audio= sound[index-1][j][2];
	    var obj= sound[index-1][j][1];
	    obj.removeAttribute("class");
	}
    }
    if (currentPlay!=cur)
	return;
    if (index==0) {
	// check if all tunes are ready to play
	var canplay= true;
	for (var j=0; j<sound.length; ++j) {
	    canplay = canplay && sound[j][sound[j].length-1][3];
	}
	if (!canplay && retry>0) {
	    setTimeout(function(){ playSound(sound,0,cur,retry-1); }, 100);
	    return;
	}
    }
    if (index<sound.length) {
	// play the next note
	var time= 1;
	for (var j=0; j<sound[index].length; ++j) {
	    var tune= sound[index][j];
	    tune[1].setAttribute("class","playback");
	    time= Math.max(tune[0], time);
	    tune[2].play();
	}
	// play sound and schedule next tune
	time= 2000/time;
	setTimeout(function() { playSound(sound, index+1, cur); }, time);
    }
}

// get a list of sound samples from the score
function synthesize(clef) {
    var sound= [];
    for (var i=0; i<clef.childNodes.length; ++i) {
	var child= clef.childNodes[i];
	if (child.nodeType==1) {
	    var name= child.getAttributeNS(topns, "name");
	    if (name=="sample") {
		var sample= synthesizeSample(child);
		if (sample.length>0)
		    sound.push(sample);
	    }
	}
    }
    return sound;
}

// get a list of notes for one sample
function synthesizeSample(obj) {
    var sound= [];
    for (var i=0; i<obj.childNodes.length; ++i) {
	var child= obj.childNodes[i];
	if (child.nodeType==1) {
	    var pitch= eval(child.getAttributeNS(topns, "pitch"));
	    if (pitch) {
		var note= getNote(child);
		if (note) {
		    var time= eval(note.getAttributeNS(topns, "time"));
		    var audio= new Audio("snd/piano-"+pitch+"."+codec);
		    var str= formatNote(pitch+1, time);
		    var tune= [time, note, audio, false, str];
		    audio.addEventListener("canplay", function () { 
			    tune[3]=true; }, false);
		    audio.preload= true;
		    audio.load();
		    sound.push(tune);
		}
	    }
	}
    }
    return sound;
}

function formatNote(pitch, time) {
    return String.fromCharCode(97 + (pitch % 7))+Math.floor((pitch+5) / 7)+"/"+time;
}

// get the note element for the sample
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

// Layout function for snapping notes to score lines
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
