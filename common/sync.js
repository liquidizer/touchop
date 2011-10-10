/* Touchop - Touchable operators
 *           DB Synchronization
 *
 * Copyright(C) 2008, 2011, Stefan Dirnstorfer
 * This software may be copied, distributed and modified under the terms 
 * of the GPL (http://www.gnu.org/licenses/gpl.html)
 */

var initSyncDB= false;

function syncToDB(obj) {
    var id= obj.getAttribute("id");
    if (initSyncDB) {
	saveToDB(id, obj);
    } else {
	initSyncDB= true;
	loadFromDB(id, obj);
    }
}

function updateSync(evt) {
    obj= document.getElementById("clipboard");
    loadFromDB("clipboard", obj);
}

function loadFromDB(key, obj) {
    // clear existing content
    var i=0;
    while (i<obj.childNodes.length) {
	var child= obj.childNodes[i];
	if (child.nodeType!=1 || child.getAttribute("class")!="background") {
	    obj.removeChild(child);
	} else {
	    ++i;
	}
    }

    // load content from db
    var text= window.localStorage.getItem("content/"+key);
    if (text!=null && text!="") {
	var parser= new DOMParser();
	var doc= parser.parseFromString(text,"text/xml");
	doc= doc.documentElement;
	var i=0;
	while (i<doc.childNodes.length) {
	    var child= doc.childNodes[i];
	    if (child.nodeType==1 && child.getAttribute("class")!="background") {
		obj.appendChild(child);
	    } else {
		++i;
	    }
	}
    }
}

function saveToDB(key, obj) {
    var serializer = new XMLSerializer ();
    var str = serializer.serializeToString(obj);
    window.localStorage.setItem("content/"+key, str);
}

window.addEventListener("storage", updateSync, false);
