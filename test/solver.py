from xml.dom import minidom
import sys

class SolverException(Exception): pass

def process(filename):
    print "processing: "+filename
    doc= minidom.parse(filename)

    universe= []
    points= []
    win= lambda x: false
    istrivial= lambda u: len(u)>0

    parent= doc.documentElement
    # root element must be <touchop>
    if parent.nodeName!="touchop":
        raise SolverException("Not a touchop file")
    # process all file contents
    for child in parent.childNodes:
        if child.nodeType==1:
            name= child.nodeName
            if name=="atom":
                value=child.attributes["value"].value
                try:
                    value= str(float(value))
                except:
                    pass
                universe.append(value)
            elif name=="op":
                op= child.attributes["name"].value
                if op=="plus":
                    universe.append("($)+($)")
                elif op=="minus":
                    universe.append("($)-($)")
                elif op=="times":
                    universe.append("($)*($)")
                elif op=="divide":
                    universe.append("($)/($)")
                elif op=="power":
                    universe.append("pow($,$)")
                else:
                    print "Unknown operator: "+op
            elif name=="def":
                var="_"+child.attributes["name"].value
                universe.append(var+":($)");
            elif name=="use":
                var="_"+child.attributes["name"].value
                universe.append(var)
            elif name=="test":
                domain= child.attributes["domain"].value
                if domain=="algebra":
                    val= eval(child.attributes["win"].value)
                    win= lambda x: abs(eval(x)-val)<1e-8
                elif domain=="plot":
                    testp= lambda x, p: \
                        abs(eval(x.replace("x",str(p[0])))-p[1])<1e-3
                    win= lambda x: len([p for p in points\
                                       if not testp(x, p)])==0
                    istrivial= lambda u: len(u)>2
                else:
                    raise SolverException("unknown domain: "+domain)
            elif name=="canvas":
                for point in child.childNodes:
                    if point.nodeName=="point":
                        x= eval(point.attributes["x"].value)
                        y= eval(point.attributes["y"].value)
                        points.append([x,y])
            else:
                print "Unknown tag: "+name


    visited= set([])
    success= set([])
    fails= set([])

    def solve(universe, current):
        # check if already visited
        if current in visited:
            return
        visited.add(current)
        # check if undefined variables are used
        if current.find("_",1)>0:
            return
        # check if definition affects any remaining elements
        coli= current.find(":")
        if coli>0 and not(current[0:coli] in universe):
            return
        # check if definition has been dropped into current element
        if current.find(":",coli+1)>=0:
            return
        # check if definition is complete, recurse otherwise
        if current.find("$")>=0:
            for u in universe:
                u2= universe[:]
                u2.remove(u)
                solve(u2, current.replace("$", u, 1))
        elif coli>0:
            # apply variable definition
            endi= (current+"#").find("#")
            var= current[0:coli]
            val= current[coli+1:endi]
            universe= [[u, val][u==var] for u in universe]
            solve(universe, "$ #"+var[1:]+"="+val+current[endi:]);
        else:
            # check winning test
            try:
                iswin= win(current)
            except:
                iswin= 0
            if iswin:
                success.add(current)
                if istrivial(universe):
                    msg= "trivial solution: " + current
                    raise SolverException(msg)
            else:
                fails.add(current)

    solve(universe, "$")
    nsucc= len(success)
    nfail= len(fails)
    if nsucc==0:
        print "NO SOLUTION!"
    else:
        print "chance= "+ str(100.0 * nsucc / (nsucc + nfail))
        print success.pop()
    print ""


for filename in sys.argv[1:]:
    try:
        process(filename)
    except SolverException, err:
        print str(err)+"\n"


