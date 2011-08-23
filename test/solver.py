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
                universe.append(child.attributes["value"].value)
            elif name=="op":
                op= child.attributes["name"].value
                if op=="plus":
                    universe.append("(#)+(#)")
                elif op=="minus":
                    universe.append("(#)-(#)")
                elif op=="times":
                    universe.append("(#)*(#)")
                elif op=="divide":
                    universe.append("float(#)/(#)")
                elif op=="power":
                    universe.append("pow(#,#)")
                else:
                    print "Unknown operator: "+op
            elif name=="test":
                win= eval(child.attributes["win"].value)
            else:
                print "Unknown tag: "+name


    visited= set([])
    success= set([])
    fails= set([])

    def solve(universe, current):
        if current in visited:
            return
        visited.add(current)

        if current.find("#")<0:
            try:
                if abs(eval(current)-win)<1e-8:
                    success.add(current)
                    if len(universe)>0:
                        print "trivial solution: " + str(win) + " = " + current
                else:
                    fails.add(current)
            except:
                pass
        else:
            for u in universe:
                u2= universe[:]
                u2.remove(u)
                solve(u2, current.replace("#", u, 1))

    solve(universe, "#")
    nsucc= len(success)
    nfail= len(fails)
    print "chance= "+ str(100.0 * nsucc / (nsucc + nfail))
    if nsucc==0:
        print "NO SOLUTION!"
    else:
        print success.pop()
    print ""


for filename in sys.argv[1:]:
    process(filename)

