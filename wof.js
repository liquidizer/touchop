/* World of Formula
 *
 * Copyright(C) 2008, Stefan Dirnstorfer
 * This software may be copied, distributed and modified under the terms of the GPL (http://www.gnu.org/licenses/gpl.html)
 */

// The namespace of additional attributes interpreted by this module
var wofns="http://www.dadim.de/wof";

// initialize is called on load of the document. It layouts all elements and stores a reference to the winning test
var winningTest;
var doc;

function init(evt) {
    doc= evt.target.ownerDocument;
    deepLayout(doc.rootElement, true);
    winningTest= doc.getElementById("test").getAttributeNS(wofns,"test");
    doc.getElementById("wof:win").setAttribute("opacity","0.0");
    window.onload = function() {
	document.onselectstart = function() {return false;} // ie
	document.onmousedown = function() {return false;} // mozilla
    }
}

// DnD frame work
// hand is a reference to the object currently beeing dragged.
// The screen coordinates of the last drag update is stored in startx and starty.
// startCTM is the objects initial screen position, so it can snap back if needed.
// tresh is a mouse movement treshold, that is set when the draged object snaps onto a new drop area.
var hand= null;
var startx, starty;
var startCTM;
var tresh=0;

// msDown is called whenever the mouse button is pressed anywhere on the root document.
function msDown (evt) {
    if (hand!=null)
        msUp(evt);
    if (evt.target!=null) {
        // find signaling object
        hand= evt.target;
        while (hand.getAttribute("onmousedown")==null)
            hand= hand.parentNode;
        
        // bring object to front
        parent= hand.parentNode;
        parent.appendChild(hand);
        
        // make underlying objects receive mouse events. Will be reverted after mouse up.
        hand.setAttribute("style","pointer-events:none");
        
        // store mouse position. Will be updated when mouse moves.
        startx= evt.clientX;
        starty= evt.clientY;
        
        // store initial position
        startCTM= hand.getAttribute("transform");
    }
}

// This function is called when the mouse button is released.
function msUp (evt) {
    if (hand!=null) {
        // make object receive mouse events again, release grip
        hand.removeAttribute("style");
        
        // snap back if object was not dropped on a new place
        if (startCTM!=null) {
            hand.setAttribute("transform",startCTM);
        }
        
        // delete reference to hand object.
        hand= null;
    }
}

// Applys the transformation matrix m to the SVG element obj
function setTransform(obj, m) {
    var value="matrix("+m.a+","+m.b+","+m.c+","+m.d+","+m.e+","+m.f+")";
    obj.setAttribute("transform", value);
}

// Move the grabbed object "hand" with the mouse
function msMove (evt) {
    if (hand!=null) {
        // compute relative mouse movements since last call
        var dx=evt.clientX-startx;
        var dy=evt.clientY-starty;
        
        // if the mouse has moved more than a snap treshold "tresh"
        if (Math.abs(dx)+Math.abs(dy) > tresh) {
	    sendHome(evt.target);
            tresh=0;

            // switch to screen coordinate system
            var m= hand.parentNode.getScreenCTM().inverse();
            // translate by screen coordinates
            m= m.translate(dx,dy);
            // transform bock to local coordinate system
            m= m.multiply(hand.getScreenCTM());
            // apply transformation
            setTransform(hand, m);
            
            // store current coordinates
            startx= evt.clientX;
            starty= evt.clientY;
        }
    }
}

// The object obj is inserted into a new group element target. Layouts are updated
function moveToGroup(obj, target) {
    if (target!=obj.parentNode) {
        // move object from its current to the target container
        var oldContainer= obj.parentNode;
        oldContainer.removeChild(obj);
        target.appendChild(obj);

        // insert object to target group and layout new container
        layout(oldContainer);
        layout(target);

        // if previous container was blocked, it will accept drops again
        oldContainer.setAttribute("blocked",null);
    }
}

// this method is called when the mouse is moved over a region on which object can be dropped.
function dropOn(evt) {
    // check if an object is beeing dragged
    var target= evt.target;
    if (target!=null && hand!=null) {
        // find signaling object
        while (target.getAttribute("onmousemove")==null)
            target= target.parentNode;
        
        // if target is not blocked
        if (hand.parentNode!=target && target.getAttribute("blocked")!="true") {
            startCTM=null;

            // insert grabbed object into mouse pointer target group
	    setFloating(hand, false);
            moveToGroup(hand, target);
            hand.parentNode.setAttribute("blocked","true");
            
            // set snap treshold. Further mouse movements are ignored until distance treshold is hit.
	    startCTM= hand.getAttribute("transform");
            tresh= 30;
        }
	startx= evt.clientX;
	starty= evt.clientY;
    }
}

// This method is called when an object is draged on the background.
// The draged object is inserted into its home group and the transformation is adjusted
function sendHome() {
    startCTM=null;
    if (hand!=null) {
	
        // move this object to the root element
        var target= hand.ownerDocument.rootElement;
	if (hand.parentNode != target) {

	    // store the current location
	    var m1= target.getScreenCTM().inverse();
	    var m2= hand.getScreenCTM();

	    // the object is inserted into its home group
	    moveToGroup(hand, target);

	    // compute relative transformation matrix
	    var m= hand.getScreenCTM();
	    m.e= m2.e;
	    m.f= m2.f;
	    m= m1.multiply(m); 

	    // update transformation
	    setTransform(hand, m);
   	    setFloating(hand, true);
	}
    }
}


// This method layouts all objects on the screen according to the default layout.
function deepLayout(obj, doFloat) {
    if (obj.nodeType==1) {
        // layout children
        for (var i=0; i<obj.childNodes.length; ++i) {
            deepLayout(obj.childNodes[i], !isObj && doFloat);
        }
        // call layout function if available
        var command= obj.getAttributeNS(wofns,"layout");
        if (command!="") {
            eval(command);
        }

	// set Floating
        var isObj= obj.getAttribute("onmousedown")!=null;
	if (isObj) {
	    setFloating(obj, doFloat);
	}
    }
}

// Transform element and all containing groups to hold new content
function layout(element) {
    var obj= element;
    var top= null;
    var ctm1= element.getCTM();
    do {
        command= obj.getAttributeNS(wofns,"layout");
        if (command!="") {
            top= obj;
            eval(command);
        }
        obj= obj.parentNode;
    } while(obj.nodeType==1);
    
    // The the topmost element is assumed to be freely placeable on the screen
    if (top!=null) {
        // make sure original element does not move on the screen
        var ctm2= element.getCTM();
        var m0= top.getTransformToElement(element);
        var m= m0.translate(ctm1.e-ctm2.e, ctm1.f-ctm2.f);
        m= element.getTransformToElement(top.parentNode).multiply(m);
        setTransform(top, m);
	setFloating(top, true);
        
        // verify whether the new object satisfies the winning test
        verify(top);
    }
}

// this function inserts parenthesis to ensure syntactic correctness
function insertParenthesis(obj) {
    // check if object has priority attribute
    var myPrio= obj.getAttributeNS(wofns, "priority");
    if (myPrio!="") {
        // myPrio is the operations priority
        myPrio= parseInt(myPrio);
        var lastpar= null;
        var i=0;
        // check each child if parenthesis are needed
        while (i<obj.childNodes.length) {
            var child= obj.childNodes[i];
            if (child.nodeType==1) {
                // prevailing parenthesis are removed
                if (child.getAttribute("name")=="parenthesis") {
                    lastpar= child;
                    obj.removeChild(child);
                    --i;
                } else {
                    // check if child's priority requires placing parethesis
                    if (myPrio < getPriority(child)) {
                        // reuse previous node for speed up, if possible
                        if (lastpar!=null) {
                            obj.insertBefore(lastpar, child);
                        } else {
                            // create new parenthesis objects
                            var lpar= doc.createElementNS(obj.namespaceURI, "text");
                            lpar.appendChild(doc.createTextNode("("));
                            lpar.setAttribute("name","parenthesis");
                            obj.insertBefore(lpar, child);
                            var rpar= doc.createElementNS(obj.namespaceURI, "text");
                            rpar.appendChild(doc.createTextNode(")"));
                            rpar.setAttribute("name","parenthesis");
                            obj.insertBefore(rpar, child.nextSibling);
                        }
                        i+=2;
                    }
                    lastpar=null;
                }
            }
            // proceed to the next child
            i++;
        }
    }
}

// get an operators mathematical priority to determine whether parenthesis are required.
function getPriority(obj) {
    var prio= obj.getAttributeNS(wofns, "priority");
    if (prio!="") {
        return parseInt(prio);
    } else {
        for (var i=0; i<obj.childNodes.length; ++i) {
            var child= obj.childNodes[i];
            if (child.nodeType==1) {
		var prio= getPriority(child);
                if (prio!=0)
                    return prio;
            }
        }
    }
    return 0;
}

// Layout that snaps the content centered to first element
function snap(obj) {
    var box1= null;
    for (i=0; i<obj.childNodes.length; ++i) {
        child= obj.childNodes[i];
        if (child.nodeType==1) {
	    if (box1==null) {
		// The first element is the reference position
		box1= child.getBBox();
	    } else {
		var m= child.getTransformToElement(child.parentNode);
		var box2= child.getBBox();
		m.e = box1.x - box2.x - 0.5*box2.width + 0.5*box1.width;
		m.f = box1.y - box2.y - 0.5*box2.height + 0.5*box1.width;
		setTransform(child, m);
	    }
	}
    }
}

// Layout all children objects horizontally
function horizontalLayout(obj) {
    insertParenthesis(obj);
    
    var padding=5;
    if (obj.getAttribute("padding")!=null)
        padding= parseInt(obj.getAttribute("padding"));

    var back= null;
    var x = 0;
    var x0 = 0;
    var y = 0;
    var h = 0;
    var n = 0;
    for (i=0; i<obj.childNodes.length; ++i) {
        child= obj.childNodes[i];
        if (child.nodeType==1) {
            if (child.getAttribute("class")=="background") {
                back= child;
            } else if (back!=null) {
                // find local coordinate system
                m= child.getTransformToElement(obj);
                box= child.getBBox();

                if (n==0) {
                    // use first element as reference for alignment
                    x0= m.e + m.a * box.x;
                    x= x0;
                    y= m.f + m.d * (box.y + box.height/2);
                }
                else {
                    m.e= x - m.a * box.x;
                    m.f= y - m.d * (box.y + 0.5*box.height);
                    setTransform(child,m);
                }
                // compute position for next element
                x += + m.a * box.width + padding;
                h = Math.max(h, m.d*box.height);
                n++;
            }
        }
    }
    h = h + 2*padding;
    
    // scale the background to cover the object's area
    if (back!=null) {
        scaleElement(back, x0-padding, x, y-h/2, y+h/2);
    }
}

// transform the object, such that it fits into a box spanned
// by x0,x1,y0,y1 in the parents coordinate system 
function scaleElement(obj, x0, x1, y0, y1) {

    // determine current bounding box relative to the parent node's coordinate system
    var m= obj.getTransformToElement(obj.parentNode);
    var box= obj.getBBox();
    box.x = m.a * box.x + m.e;
    box.y = m.d * box.y + m.f;
    box.width= m.a * box.width;
    box.height= m.d * box.height;

    // scale
    var sx= (x1-x0)/box.width;
    var sy= (y1-y0)/box.height;
    m=m.scaleNonUniform(sx,sy);
    
    // translate
    m.e=x0-(box.x*sx) + m.e*sx;
    m.f=y0-(box.y*sy) + m.f*sy;
    setTransform(obj, m);
}


// Exactract the value of obj.
// the object is expected to define the wof:value attribute
function computeValue(obj) {
    var value= obj.getAttributeNS(wofns, "value");
    var args= [];

    for (var i=0; i<obj.childNodes.length; ++i) {
	if (obj.childNodes[i].nodeType==1) {
	    // if the child node has a value, compute it and store as argument.
	    var sub= computeValue(obj.childNodes[i]);
	    if (sub!="") {
		args[args.length]= sub;
	    }
	}
    }

    // if value is a formula of child values
    if (value.indexOf("#")>=0) {
        // replace #n substrings with appropriate sub values
        for (var i=0; i<args.length; ++i) {
            var myex= new RegExp("#"+(i+1));
            value= value.replace(myex, args[i]);
        }
    } else {
        // By default return the one input argument
        if (args.length == 1)
            value= "("+args[0]+")";
    }
    return value;
}

function verify(obj) {
    var value= computeValue(obj);
    var test= winningTest.replace(/\?/, value);
    //winningTest.firstChild.data=test;
    try {
        var win= eval(test);
        if (win) {
	    smile(1.0);
            return;
        }
    } catch(e) {
    }
    smile(0.0);
}

function setFloating(obj, doFloat) {
    var shadow= obj.childNodes[0];
    if (shadow.nodeType==1 && shadow.getAttribute("class")=="shadow") {
	obj.removeChild(shadow);
    }
    if (doFloat) {
	var box= obj.getBBox();
	var node= doc.createElementNS(obj.namespaceURI, "rect");
	node.setAttribute("width", box.width);
	node.setAttribute("height", box.height);
	node.setAttribute("x",box.x+3);
	node.setAttribute("y",box.y+5);
	node.setAttribute("class", "shadow");
	obj.insertBefore(node, obj.childNodes[0]);
    }
}

function smile(value) {
    doc.getElementById("wof:win").setAttribute("opacity",value);
    doc.getElementById("wof:notwin").setAttribute("opacity",1.0-value);
}
