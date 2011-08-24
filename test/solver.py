from xml.dom import minidom
import sys

def process(filename):
    print "processing: "+filename
    doc= minidom.parse(filename)

    universe= []
    win= ""

    parent= doc.documentElement
    for child in parent.childNodes:
        if child.nodeType==1:
            name= child.nodeName
            if name=="atom":
                value=child.attributes["value"].value
                universe.append(value+".0")
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
                win= eval(child.attributes["win"].value)
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
        # check if definition is valid
        coli= current.find(":")
        if current.find(":",coli+1)>=0:
            return
        if current.find("_",1)>0:
            return
        if coli>0 and not(current[0:coli] in universe):
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
            try:
                eval(val)
                universe= [[u, val][u==var] for u in universe]
                solve(universe, "$ #"+var[1:]+"="+val+current[endi:]);
            except:
                pass
        else:
            # check winning test
            try:
                if abs(eval(current)-win)<1e-8:
                    success.add(current)
                    if len(universe)>0:
                        print "trivial solution: " + str(win) + " = " + current
                else:
                    fails.add(current)
            except:
                pass

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
    process(filename)

