/* Touchop - Touchable operators
 *
 * Copyright(C) 2008, 2011, Stefan Dirnstorfer
 * This software may be copied, distributed and modified under the terms 
 * of the GPL (http://www.gnu.org/licenses/gpl.html)
 */

// The namespace of additional attributes interpreted by this module
var topns="http://www.dadim.de/touchop";

// DnD frame work
// hand is a reference to the object currently beeing dragged.
var hand= null;

// The screen coordinates of the last drag update.
var startPos= [0,0];
var hasMoved= false;

// position for long click action, after which the top group is selected
var longClick=[0,0];

// Initialize the touchop framework. 
window.onload = function() {
    // Relayout all objects on the screen
    deepLayout(document.childNodes[0], true);
}

// Perform an initial layout of all objects on the screen.
function deepLayout(obj, doFloat) {
    if (obj.nodeType==1 && obj.getAttribute("display")!="none") {
        // layout children
        var isObj= obj.getAttribute("onmousedown")=="msDown(evt)";
	if (isObj) {
	    obj.setAttribute("ontouchstart", obj.getAttribute("onmousedown"));
	}
        for (var i=0; i<obj.childNodes.length; ++i) {
            deepLayout(obj.childNodes[i], !isObj && doFloat);
        }
        // call layout function if available
        var command= obj.getAttributeNS(topns,"layout");
        if (command!="") {
            eval(command);
        }

	// set Floating
	setFloating(obj, doFloat);
	if (doFloat && isObj) {
	    var box= obj.getBBox();
	    var m= obj.getTransformToElement(obj.parentNode);
	    m= m.translate(-box.x, -box.y);
	    setTransform(obj, m);
	}
    }
}

// Translate events that come from touch devices
var touchOnly= false; // FF mobile bug
function translateTouch(evt) {
    if (evt.touches!=undefined) {
	var evt2= {};
	evt2.clientX= evt.touches[0].clientX;
	evt2.clientY= evt.touches[0].clientY;
	evt2.target= document.elementFromPoint(evt2.clientX, evt2.clientY);
	evt2.isTouch= true;
	evt.preventDefault();
	return evt2;
    }
    if (touchOnly) throw "nope";
    // not a touch device
    return evt;
}

// msDown is called whenever the mouse button is pressed anywhere on the root document.
function msDown (evt) {
    if (hand==null && evt.target!=null) {
        // find signaling object
	evt= translateTouch(evt);
	touchOnly= evt.isTouch;

	var grabbed= evt.target;
	while (grabbed.getAttribute("onmousedown")!="msDown(evt)") {
	    grabbed= grabbed.parentNode;
	}
	hand= grabbed;

	// store mouse position. Will be updated when mouse moves.
	startPos= [evt.clientX, evt.clientY];
	hasMoved= false;

	// mark root after time out
	initLongClick(evt.clientX, evt.clientY);
	if (document.activeElement && document.activeElement.blur)
	    document.activeElement.blur();
    }
}

// Mouse clicked on the background
function msBlur(evt) {
    evt.preventDefault();
    if (document.activeElement && document.activeElement.blur)
	document.activeElement.blur();
    return false;
}

// This function is called when the mouse button is released.
function msUp (evt) {
    if (hand!=null) {
	var root= findRoot(hand);
	releaseHand();

	// verify winning test after mouse release
	verify(root, true);
    }
}

function releaseHand() {
    // make object receive mouse events again, release grip
    hand.removeAttribute("pointer-events");
    
    // delete reference to hand object.
    hand= null;
}

// Move the grabbed object "hand" with the mouse
function msMove (evt) {
    evt= translateTouch(evt);
    if (hand!=null) {
        // compute relative mouse movements since last call
        var dx=evt.clientX-startPos[0];
        var dy=evt.clientY-startPos[1];
	var dist=Math.abs(dx)+Math.abs(dy);

	// long click action
	initLongClick(evt.clientX, evt.clientY);

	// check if object can be dropped
	var dropTo= evt.target;
	while (dropTo.nodeType==1 && dropTo.getAttribute("class")!="operand")
	    dropTo= dropTo.parentNode;
	if (dropTo.nodeType==1 && 
	    (dropTo.getAttribute("blocked")!="true" || hand.parentNode==dropTo) &&
	    hand.getAttributeNS(topns,"drop")!="none") {

	    // insert grabbed object into mouse pointer target group
	    setFloating(hand, false);
	    moveToGroup(hand, dropTo, evt.clientX, evt.clientY);

	    // verify the winning test during mouse hover
	    verify(findRoot(hand), false);
	    
	    // offset snap region
	    startPos= [evt.clientX, evt.clientY];
	    hasMoved= true;
	}
        else if (dropTo != hand.parentNode) {
	    // object can not be dropped let it move
	    var isTop= hand == findRoot(hand);
	    if (isTop || !isTop && dist>30) {
		sendHome(hand);
	    
		// switch to screen coordinate system
		var m= hand.parentNode.getScreenCTM().inverse();
		// translate by screen coordinates
		m= m.translate(dx,dy);
		// transform bock to local coordinate system
		m= m.multiply(hand.getScreenCTM());
		// apply transformation
		setTransform(hand, m);

		// offset snap region
		startPos= [evt.clientX, evt.clientY];
		hasMoved= true;
	    }
        }
    }
}

// The object obj is inserted into a new group element target. Layouts are updated
function moveToGroup(obj, target, x, y) {
    // move object from its current to the target container
    var oldContainer= obj.parentNode;
    try {
        target.appendChild(obj);
    }  catch (e) {
	// ignore circular insertion due to event race
	layout(obj);
	return;
    }
    
    // default position at the cursor
    if (target.getAttributeNS(topns,"container")=="true") {
	var m= obj.getScreenCTM();
	var p= target.getScreenCTM().inverse();
	m.e= x;
	m.f= y;
	setTransform(obj, p.multiply(m));
    }
    
    // layout old and new container
    if (oldContainer!=target) {
	setTimeout(function() {layout(oldContainer);}, 1);
	eval(obj.getAttributeNS(topns,"layout"));
	layout(target);
    }
}

// This method is called when an object is draged on the background.
// The draged object is inserted into its home group and the transformation is adjusted
function sendHome(obj) {
    // move this object to the root element
    var target= document.lastChild;
    if (obj.parentNode != target) {

	// store the current location
	var m1= target.getScreenCTM().inverse();
	var m2= obj.getScreenCTM();

	// the object is inserted into its home group
	moveToGroup(obj, target);

	// compute relative transformation matrix
	var m= obj.getScreenCTM();
	m.e= m2.e;
	m.f= m2.f;
	m= m1.multiply(m); 

	// update transformation
	setTransform(obj, m);
	layout(obj);
   	setFloating(obj, true);
    }
    // make the object float on top
    if (obj!= target.lastChild)
	target.appendChild(obj);

    // make underlying objects receive mouse events. Will be reverted after mouse up.
    obj.setAttribute("pointer-events","none");
}

// Transform element and all containing groups to hold new content
function layout(element) {
    var obj= element;
    var top= null;
    var ctm1= obj.getCTM();
    do {
        command= obj.getAttributeNS(topns,"layout");
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
	var w= top.getCTM();
	var m= top.getTransformToElement(top.parentNode);
	m= m.multiply(w.inverse());
	m= m.translate(ctm1.e-ctm2.e, ctm1.f-ctm2.f);
	m= m.multiply(w);
        setTransform(top, m);
	setFloating(top, true);
    }
}

// this function inserts parenthesis to ensure syntactic correctness
function insertParenthesis(obj) {
    // check if object has priority attribute
    var myPrio= obj.getAttributeNS(topns, "priority");
    if (myPrio!="") {
        // myPrio is the operations priority
        myPrio= parseInt(myPrio);
	if ((myPrio&1)==1)
	    myPrio= myPrio - 1;
        var child= obj.firstChild;
        // check each child if parenthesis are needed
        while (child!=null) {
            var next= child.nextSibling;
            if (child.nodeType==1) {
                // prevailing parenthesis are removed
                if (child.getAttribute("name")=="parenthesis") {
                    obj.removeChild(child);
                } else {
                    // check if child's priority requires placing parethesis
		    var subPrio= getPriority(child)
                    if (myPrio < subPrio) {
                        // create new parenthesis objects
                        var lpar= document.createElementNS(obj.namespaceURI, "text");
                        lpar.appendChild(document.createTextNode("("));
                        lpar.setAttribute("name","parenthesis");
                        obj.insertBefore(lpar, child);
                        var rpar= document.createElementNS(obj.namespaceURI, "text");
                        rpar.appendChild(document.createTextNode(")"));
                        rpar.setAttribute("name","parenthesis");
                        obj.insertBefore(rpar, child.nextSibling);

			// scale the parenthesis to full height
			var cbox= child.getBBox();
			var parbox= lpar.getBBox();
			var scale= cbox.height / parbox.height;
			lpar.setAttribute("transform","scale(1,"+scale+")");
			rpar.setAttribute("transform","scale(1,"+scale+")");
                    }
                }
            }
            // proceed to the next child
            child= next;
        }
    }
}

// get an operator's mathematical priority to determine
// whether parenthesis are required.
function getPriority(obj) {
    var prio= obj.getAttributeNS(topns, "priority");
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

// Layouts the content centered to its first child element
// Creates a snap-in like effect what dropping operands
function snap(obj) {
    var back= null;
    var blocked= false;
    for (var i=0; i<obj.childNodes.length; ++i) {
        child= obj.childNodes[i];
        if (child.nodeType==1) {
	    if (child.getAttribute("class")=="background") {
		// The first element is the reference position
		back= child;
		back.removeAttribute("opacity");
	    }
	    else if (back!=null) {
		var m= child.getTransformToElement(obj);
		var box1= back.getBBox();
		var box2= child.getBBox();

		m.e = box1.x - box2.x - 0.5*box2.width + 0.5*box1.width;
		m.f = box1.y - box2.y - 0.5*box2.height + 0.5*box1.height;
		setTransform(child, m);

		// make drop area opaque
		back.setAttribute("opacity","0.0");
		
		if (child.getAttribute("onmousedown")!=null)
		    blocked= true;
	    }
	}
    }
    if (blocked) {
	obj.setAttribute("blocked","true");
    } else {
	obj.removeAttribute("blocked");
    }
}

// Layouts all child objects horizontally.
function horizontalLayout(obj) {
    insertParenthesis(obj);
    boxLayout(obj, true);
}

// Layouts all child objects horizontally.
function verticalLayout(obj) {
    boxLayout(obj, false);
}

// Layouts all child objects sequentially in one axis,
// centered in the other axis.
function boxLayout(obj, horizontal) {
    var padding=5;
    if (obj.getAttributeNS(topns, "padding")!="")
        padding= parseInt(obj.getAttributeNS(topns, "padding"));

    var back= null;
    var stretch= null;
    var x = 0;
    var x0 = 0;
    var y = 0;
    var h = 0;
    for (var i=0; i<obj.childNodes.length; ++i) {
        var child= obj.childNodes[i];
        if (child.nodeType==1) {
	    var debug= child.nodeName=="svg:use";
	    var opt= child.getAttributeNS(topns, "layoutOpt");
            if (child.getAttribute("class")=="background") {
                back= child;
            } else if (back!=null && child.getAttribute("display")!="none" 
		       && child.transform) {
                // find local coordinate system
		var m= child.getTransformToElement(obj);
		var box= child.getBBox();

		if (opt=="stretch") {
		    // determine the objects size later
		    m.a=1.0;
		    m.d=1.0;
		    stretch= child;
		}

		// align object
		if (horizontal) {
		    m.e= x - m.a * box.x;
		    m.f= y - m.d * (box.y + 0.5*box.height)
			- m.b * (box.x + 0.5*box.width);
		} else {
		    m.e= y - m.a * (box.x + 0.5*box.width) 
			- m.c * (box.y + 0.5*box.height);
		    m.f= x - m.d * box.y - Math.min(m.d,0)*box.height;
		}
                setTransform(child,m);

                // compute position for next element
		if (horizontal) {
                    x += + m.a * box.width + padding;
                    h = Math.max(h, Math.abs(m.d)*box.height);
		} else {
                    x += m.d * box.height + padding;
                    h = Math.max(h, Math.abs(m.a)*box.width + Math.abs(m.c)*box.height);
		}
            }
       }
    }

    // strech object to span from left to right
    if (stretch!=null) {
	h= h+10;
	var box= stretch.getBBox();
	var m= stretch.getTransformToElement(obj);
	m.a= h/box.width;
	m.e= m.e + (1-m.a)*(box.x+box.width/2);
	setTransform(stretch, m);
    }

    // scale the background to cover the object's area
    h = h + 2*padding;
    if (back!=null) {
	if (horizontal)
            scaleRect(back, x0-padding, x, y-h/2, y+h/2);
	else
	    scaleRect(back, y-h/2, y+h/2, x0-padding, x); 
    }
}

// Set the boundaries for the background rectangular element
function scaleRect(obj, x0, x1, y0, y1) {
    obj.setAttribute("width", x1-x0);
    obj.setAttribute("height", y1-y0);
    obj.setAttribute("x", x0);
    obj.setAttribute("y", y0);
}

// Makes or removes a shadow below movable objects
function setFloating(obj, doFloat) {
    var canMove= obj.getAttribute("onmousedown")!=null;
    if (canMove) {
	// the shadow is always the first child
	var oldShadow= obj.childNodes[0];
	if (oldShadow.nodeType==1 && oldShadow.getAttribute("class")=="shadow") {
	    obj.removeChild(oldShadow);
	}
	// find the objects background element
	var back= obj.childNodes[0];
	while (back!=null && (
	    back.nodeType!=1 || back.getAttribute("class")!="background")) {
	    back= back.nextSibling;
	}
	// create the shadow element by cloning the background
	if (doFloat && back!=null) {
	    var shadow= back.cloneNode(false);
	    obj.insertBefore(shadow, obj.childNodes[0]);
	    shadow.setAttribute("class", "shadow");
	    shadow.setAttribute("transform", "translate(3,5)");
	}
    }
}

// select root expression after 500ms stable click on sub expression
function initLongClick(x,y) {
    longClick=[x,y];
    setTimeout(function() { longClickAction(x,y) }, 500);
}

// select the root element in case of long clicks
function longClickAction(x, y) {
    if (hand!=null && Math.abs(x- longClick[0])+Math.abs(y-longClick[1]) < 5) {
	root= findRoot(hand);
	releaseHand();
	hand= root;
    }
}

// find the largest moveable group in which obj is contained
function findRoot(obj) {
    var root= obj;
    while (obj!=null && obj.nodeType==1) {
	if (obj.getAttribute("onmousedown")=="msDown(evt)")
	    root= obj;
	obj= obj.parentNode;
    }
    return root;
}

// Applys the transformation matrix m to the SVG element obj
function setTransform(obj, m) {
    // For some very strange reasons conversion to string is 2x faster.
    obj.setAttribute("transform","matrix("+m.a+","+m.b+","+m.c+","+m.d+","+m.e+","+m.f+")");
}

// sets the oppacitiy to show either of the two similies
function smile(value) {
    document.getElementById("top:win").setAttribute("opacity",value);
    document.getElementById("top:notwin").setAttribute("opacity",1.0-value);
    if (value==1.0) {
	// store the success persitently
	window.localStorage.setItem(window.location.pathname,"PASSED");
    }
}
