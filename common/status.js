
var statusNo= 0;
var statusLen= 12;

function status(msg) {
    var root= document.firstChild;
    var old= document.getElementById("status-"+(statusNo-statusLen));
    if (old!=null)
	root.removeChild(old);
    for (var i=statusNo-statusLen; i<=statusNo; ++i) {
	var elt= document.getElementById("status-"+i);
	if (elt!=null) {
	    var y= elt.getAttribute("y");
	    elt.setAttribute("y", eval(y)-20);
	}
    }
    var txt= document.createElementNS(root.namespaceURI, "text");
    txt.appendChild(document.createTextNode(msg));
    txt.setAttribute("x", "20");
    txt.setAttribute("y", "350");
    txt.setAttribute("id", "status-"+statusNo);
    txt.setAttribute("style", "font-size:10pt;");
    //root.appendChild(txt);
    root.insertBefore(txt, root.firstChild);
    statusNo= statusNo+1;

}

function pathstr(obj) {
    if (obj==null || obj.nodeType!=1) {
	return "";
    } else {
	var str= obj.nodeName;
	str= str.replace(/^svg:/,"");
	if (obj.getAttribute("class"))
	    str=str+"."+obj.getAttribute("class");
	var v= obj.getAttributeNS(topns,'value');
	if (v)
	    str= str+"="+v;
	return pathstr(obj.parentNode)+"/"+str;
    }
}

function serializeXML(obj) {
    var serializer = new XMLSerializer ();
    var str = serializer.serializeToString (obj);
    console.log(str);
    return str;
}
