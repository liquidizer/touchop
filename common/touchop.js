/* Touchop - Touchable operators
 *
 * Copyright(C) 2008, 2011, Stefan Dirnstorfer
 * This software may be copied, distributed and modified under the terms 
 * of the GPL (http://www.gnu.org/licenses/gpl.html)
 */

// The namespace of additional attributes interpreted by this module
var topns="http://www.dadim.de/touchop";

// initialize the touchop framework. 
window.onload = function() {
    // Relayout all objects on the screen
    deepLayout(document.childNodes[0], true);
    // Set the smiley to frowning
    smile(0.0);
    // Stop the browser from selecting objects
    document.onselectstart = function() {return false;} // ie
    document.onmousedown = function() { return false;} // mozilla
    document.ontouchstart= function(e) { e.preventDefault(); }
    setTimeout(function(){
	// Hide the address bar!
	window.scrollTo(0, 1);
    }, 1);
}

// DnD frame work
// hand is a reference to the object currently beeing dragged.
var hand= null;

// The screen coordinates of the last drag update.
var startPos= [0,0];

// position for long click action, after which the top group is selected
var longClick=[0,0];

// translate events that come from touch devices
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
    return evt;
}
    

// msDown is called whenever the mouse button is pressed anywhere on the root document.
function msDown (evt) {
    if (hand==null && evt.target!=null) {
        // find signaling object
	evt= translateTouch(evt);
	grab(evt.target);

        // store mouse position. Will be updated when mouse moves.
	startPos= [evt.clientX, evt.clientY];

	// mark root after time out
	initLongClick();
    }
    return false;
}

function grab(obj) {
    hand= obj;
    while (hand.getAttribute("onmousedown")==null)
	hand= hand.parentNode;

    // make underlying objects receive mouse events. Will be reverted after mouse up.
    hand.setAttribute("pointer-events","none");
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

// Applys the transformation matrix m to the SVG element obj
function setTransform(obj, m) {
    var transforms= obj.transform.baseVal;
    transforms.clear();
    transforms.appendItem(transforms.createSVGTransformFromMatrix(m));
}

// Move the grabbed object "hand" with the mouse
function msMove (evt) {
    evt= translateTouch(evt);
    // late grab of objects with mouse over and empty hand
    if (evt.isTouch && hand==null && evt.target!=null) {
	var target= evt.target;
	// find the parent can receive late grab event
	while (target.nodeType==1) {
	    var action= target.getAttribute("onmousedown");
	    if (action=="msDown(evt)") {
		msDown(evt);
		break;
	    }
	    target= target.parentNode;
	}
    }
    if (hand!=null) {
        // compute relative mouse movements since last call
        var dx=evt.clientX-startPos[0];
        var dy=evt.clientY-startPos[1];
	var dist=Math.abs(dx)+Math.abs(dy);

	// long click action
	initLongClick(evt.clientX, evt.clientY);

	// check if object can be dropped
	var dropTo= evt.target;
	while (dropTo.nodeType==1 && !dropTo.classList.contains("operand"))
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
	}
        else if (dropTo != hand.parentNode) {
	    // object can not be dropped let it move
	    var isTop= hand == findRoot(hand);
	    if (isTop || !isTop && dist>30) {
		sendHome(hand);
		dropTo= hand.parentNode;
	    
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
    }
    
    // default position at the cursor
    if (y!=undefined) {
	var m= obj.getScreenCTM();
	var p= target.getScreenCTM().inverse();
	m.e= x;
	m.f= y;
	setTransform(obj, p.multiply(m));
    }
    
    // insert object to target group and layout new container
    layout(oldContainer);
    layout(target);
}

// This method is called when an object is draged on the background.
// The draged object is inserted into its home group and the transformation is adjusted
function sendHome(obj) {
    // move this object to the root element
    var target= obj.ownerDocument.childNodes[0];
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
    if (hand!= target.lastChild)
	target.appendChild(hand);
}


// This method layouts all objects on the screen according to the default layout.
function deepLayout(obj, doFloat) {
    if (obj.nodeType==1) {
        // layout children
        var isObj= obj.getAttribute("onmousedown")!=null;
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

// Transform element and all containing groups to hold new content
function layout(element) {
    var obj= element;
    var top= null;
    var ctm1= element.getCTM();
    var box1= element.getBBox();
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
	var box2= element.getBBox();
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
		    var subPrio= getPriority(child)
                    if (myPrio < subPrio) {
                        // reuse previous node for speed up, if possible
                        if (lastpar!=null) {
                            obj.insertBefore(lastpar, child);
			    var lpar= lastpar;
			    var rpar= child.nextSibling;
                        } else {
                            // create new parenthesis objects
                            var lpar= document.createElementNS(obj.namespaceURI, "text");
                            lpar.appendChild(document.createTextNode("("));
                            lpar.setAttribute("name","parenthesis");
                            obj.insertBefore(lpar, child);
                            var rpar= document.createElementNS(obj.namespaceURI, "text");
                            rpar.appendChild(document.createTextNode(")"));
                            rpar.setAttribute("name","parenthesis");
                            obj.insertBefore(rpar, child.nextSibling);
                        }
			// scale the parenthesis to full height
			var cbox= child.getBBox();
			var parbox= lpar.getBBox();
			var scale= cbox.height / parbox.height;
			lpar.setAttribute("transform","scale(1,"+scale+")");
			rpar.setAttribute("transform","scale(1,"+scale+")");
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
    obj.removeAttribute("blocked");
    for (var i=0; i<obj.childNodes.length; ++i) {
        child= obj.childNodes[i];
        if (child.nodeType==1) {
	    if (child.getAttribute("class")=="background") {
		// The first element is the reference position
		back= child;
		back.removeAttribute("opacity");
	    }
	    else if (back!=null) {
		var m= child.getTransformToElement(child.parentNode);
		var box1= back.getBBox();
		var box2= child.getBBox();
		m.e = box1.x - box2.x - 0.5*box2.width + 0.5*box1.width;
		m.f = box1.y - box2.y - 0.5*box2.height + 0.5*box1.width;
		setTransform(child, m);

		// make drop area opaque
		back.setAttribute("opacity","0.0");
		
		if (child.getAttribute("onmousedown")!=null)
		    obj.setAttribute("blocked","true");
	    }
	}
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
    var n = 0;
    for (var i=0; i<obj.childNodes.length; ++i) {
        var child= obj.childNodes[i];
        if (child.nodeType==1) {
	    var opt= child.getAttributeNS(topns, "layoutOpt");
            if (child.getAttribute("class")=="background") {
                back= child;
            } else if (back!=null && child.getAttribute("display")!="none" 
		       && child.transform!=undefined) {
                // find local coordinate system
		var m= child.getTransformToElement(obj);
		var box= child.getBBox();

                if (n==0) {
                    // use first element as reference for alignment
		    if (horizontal) {
			x0= m.e + m.a * box.x;
			x= x0;
			y= m.f + m.d * (box.y + box.height/2);
		    } else {
			x0= m.f + m.d * box.y;
			x= x0;
			y= m.e + m.a * (box.x + box.width/2) + m.c * (box.height/2);
		    }
                }
                else {
		    if (opt=="stretch") {
			m.a=1.0;
			m.d=1.0;
			stretch= child;
		    }
		    if (horizontal) {
			m.e= x - m.a * box.x;
			m.f= y - m.d * (box.y + 0.5*box.height)
			    - m.b * (box.x + 0.5*box.width);
		    } else {
			m.e= y - m.a * (box.x + 0.5*box.width) 
			    - m.c * (box.y + 0.5*box.height);
			m.f= x - m.d * box.y;
		    }
                    setTransform(child,m);
                }
                // compute position for next element
		if (horizontal) {
                    x += + m.a * box.width + padding;
                    h = Math.max(h, Math.abs(m.d)*box.height);
		} else {
                    x += + m.d * box.height + padding;
                    h = Math.max(h, Math.abs(m.a)*box.width + Math.abs(m.c)*box.height);
		}
                n++;
            }
       }
    }
    
    // strech object
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

// Set the boundaries of a rect element
function scaleRect(obj, x0, x1, y0, y1) {
    obj.setAttribute("width", x1-x0);
    obj.setAttribute("height", y1-y0);
    obj.setAttribute("x", x0);
    obj.setAttribute("y", y0);
}

// Makes or removes a little shadow below movable objects
function setFloating(obj, doFloat) {
    var canMove= obj.getAttribute("onmousedown")!=null;
    var canDrop= obj.getAttributeNS(topns, "drop")!="none";
    if (canMove && canDrop) {
	// the shadow is always the first child
	var shadow= obj.childNodes[0];
	if (shadow.nodeType==1 && shadow.getAttribute("class")=="shadow") {
	    obj.removeChild(shadow);
	}
	// find the objects background element
	var back= obj.childNodes[0];
	while (back!=null && (
	    back.nodeType!=1 || back.getAttribute("class")!="background")) {
	    back= back.nextSibling;
	}
	// create the shadow element by cloning the background
	if (doFloat && back!=null) {
	    var box= obj.getBBox();
	    shadow= back.cloneNode(false);
	    scaleRect(shadow, 
		      box.x + 3, box.x + box.width + 3, 
		      box.y + 5, box.y + box.height + 5);
	    shadow.setAttribute("class", "shadow");
	    obj.insertBefore(shadow, obj.childNodes[0]);
	}
    }
}

// select root expression after 500ms stable click on sub expression
function initLongClick(x,y) {
    longClick=[x,y];
    setTimeout("longClickAction("+x+","+y+")", 500);
}

// select the root element in case of long clicks
function longClickAction(x, y) {
    if (hand!=null && Math.abs(x- longClick[0])+Math.abs(y-longClick[1]) < 5) {
	root= findRoot(hand);
	releaseHand();
	grab(root);
    }
}

// find the largest moveable group in which obj is contained
function findRoot(obj) {
    var root= obj;
    while (obj!=null && obj.nodeType==1) {
	if (obj.getAttribute("onmousedown")!=null)
	    root= obj;
	obj= obj.parentNode;
    }
    return root;
}

// get and create an id for an element
function getId(obj) {
    var id= obj.getAttribute("id");
    if (id==null) {
	id= "autoid"+Math.random();
	obj.setAttribute("id", id);
    }
    return id;
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
