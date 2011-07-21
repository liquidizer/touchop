/* Touchop - Touchable operators
 *           music domain
 *
 * Copyright(C) 2008, 2011, Stefan Dirnstorfer
 * This software may be copied, distributed and modified under the terms 
 * of the GPL (http://www.gnu.org/licenses/gpl.html)
 */

var playQueue= [];
function verify(obj, isFinal) {
    if (isFinal) {
	var toplay= obj;
	// find the top most group for playing
	while (obj.nodeType==1) {
	    if (obj.getAttributeNS(topns, "layout")!="")
		toplay= obj;
	    obj= obj.parentNode;
	}
	// check, if something is already playing
	if (playQueue.length>0) {
	    playQueue[0][0].setAttribute("class","");
	    playQueue= playSequence(toplay);
	} else {
	    playQueue= playSequence(toplay);
	    playNext()
	}
    }
}

// play the next tune and highlight the sound element
function playNext() {
    if (playQueue.length>0) {
	if (playQueue[0][0].getAttribute("class")=="playback") {
	    // a tune finished playing, unmark and dequeue
	    playQueue[0][0].setAttribute("class","")
	    var seq=[];
	    for (var j=0; j<playQueue.length-1; ++j)
		seq[j]= playQueue[j+1];
	    playQueue= seq;
	    setTimeout("playNext()", 50);
	} else {
	    // nothing is playing, mark next tune and play
	    playQueue[0][0].setAttribute("class","playback");
	    setTimeout("playNext()", playQueue[0][1]-50);
	}
    }
}

// extract the sequence of playable tunes
function playSequence(obj) {
    var seq=[];
    if (obj.nodeType==1) {
	// check if object is playable
	var play= obj.getAttributeNS(topns, "play");
	if (play!="") {
	    seq[seq.length]= [obj, parseInt(play)];
	}
	// recurse over child elements
	for (var i=0; i<obj.childNodes.length; ++i) {
	    var subSeq= playSequence(obj.childNodes[i]);
	    for (var j=0; j<subSeq.length; ++j)
		seq[seq.length]= subSeq[j];
        }
	// apply sound filters, if present
	var filter= obj.getAttributeNS(topns, "filter");
	if (filter!="")
	    seq= eval(filter.replace("#","seq"));
    }
    return seq;
}

// speed filter for time adjusted play
function speed(factor, seq) {
    for (var j=0; j<seq.length; ++j)
	seq[j][1]= factor * seq[j][1];
    return seq;
}

// repeat filter
function repeat(count, seq) {
    var len= seq.length;
    for (var i=1; i<count; ++i) {
	for (var j=0; j<len; ++j) {
	    seq[seq.length]= [seq[j][0],seq[j][1]];
	}
    }
    return seq;
}

// reverse filter
function reverse(seq) {
    for (var j=0; j<seq.length/2; ++j) {
	var tmp= seq[j];
	seq[j]= seq[seq.length-1-j];
	seq[seq.length-1-j]= tmp;
    }
    return seq;
}