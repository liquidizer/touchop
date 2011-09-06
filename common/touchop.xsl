<?xml version="1.0"?>
<!-- Touchop - Touchable operators -->
<!-- -->
<!-- Copyright(C) 2011, Stefan Dirnstorfer -->
<!-- This software may be copied, distributed and modified under the terms -->
<!-- of the GPL (http://www.gnu.org/licenses/gpl.html) -->

<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:xs="http://www.w3.org/2001/XMLSchema"
                xmlns:svg="http://www.w3.org/2000/svg"
		xmlns:xlink="http://www.w3.org/1999/xlink"
		xmlns:top="http://www.dadim.de/touchop"
                version="1.0">

<!-- generate the svg main file structure -->
<xsl:template match="touchop">
<svg:svg onmousemove="msMove(evt)"
	 ontouchmove="msMove(evt)"
	 onmouseup="msUp(evt)"
	 width="100%" height="100%"
	 viewBox="0 0 600 400">

  <!-- import the style sheet -->
  <svg:style type="text/css">@import url('../../common/style.css');</svg:style>

  <!-- Drag and drop interface -->
  <svg:script type="text/javascript" xlink:href="../../common/touchop.js"/>
  <svg:script type="text/javascript" xlink:href="../../common/def.js"/>

  <!-- blur effect for shadows -->
  <svg:defs>
    <svg:filter id="shadow-blur">
      <svg:feGaussianBlur stdDeviation="2"/>
    </svg:filter>
  </svg:defs>

  <!-- iterate over all xml elements in the source file -->
  <xsl:comment>List of operators</xsl:comment>
  <xsl:for-each select="*">
    <!-- apply operator translation accoring to the xy attribute -->
    <xsl:element name="svg:g">
      <xsl:if test="@xy">
	<xsl:attribute name="transform">
	  <xsl:copy-of select="concat('translate(',@xy,')')"/>
	</xsl:attribute>
      </xsl:if>
      <!-- find the corresponding definition of that operator -->
      <xsl:apply-templates select="."/>
    </xsl:element>
  </xsl:for-each>

  <!-- The emoticon indicates the winning status and links -->
  <!-- back to the index page -->
  <xsl:comment>Emoticon</xsl:comment>
  <svg:a xlink:href="index.html">
    <!-- Webkit  bug
    <use href="smiley.svg#smile" transform="translate(500,20)" id="top:win"/>
    <use href="smiley.svg#frown" transform="translate(500,20)" id="top:notwin"/>
    -->
    <svg:g transform="translate(500,20)" id="top:notwin">
      <xsl:call-template name="frown"/>
    </svg:g>
    <svg:g transform="translate(500,20)" id="top:win">
      <xsl:call-template name="smile"/>
    </svg:g>
  </svg:a>
</svg:svg>
</xsl:template>

<!-- Webkit work around: Wrap smiley.svg  -->
<xsl:include href="smiley.xsl"/>


<!-- Generic drop area for operator arguments -->
<xsl:template name="operand">
  <xsl:comment>Drop area for operands</xsl:comment>
  <svg:g onmousemove="dropOn(evt)" top:layout="snap(obj)" class="operand">
    <svg:rect height="50" width="50" rx="5" ry="5" class="background"/>
  </svg:g>
</xsl:template>

<!-- A literal placed on the screen -->
<xsl:template name="literal">
  <xsl:param name="name" select="@value"/>
  <xsl:comment>Literal</xsl:comment>
  <xsl:variable name="len" select="string-length(translate($name,' ',''))"/>
  <xsl:element name="svg:rect">
    <xsl:attribute name="class">background</xsl:attribute>
    <xsl:attribute name="height">60</xsl:attribute>
    <xsl:attribute name="width"><xsl:value-of select="30+30*$len"/></xsl:attribute>
    <xsl:attribute name="x"><xsl:value-of select="-15*$len"/></xsl:attribute>
    <xsl:attribute name="rx">5</xsl:attribute>
    <xsl:attribute name="ry">5</xsl:attribute>
  </xsl:element>
  <xsl:element name="svg:text">
    <xsl:attribute name="transform">translate(15,45)</xsl:attribute>
    <xsl:attribute name="class">atom</xsl:attribute>
    <xsl:value-of select="$name"/>
  </xsl:element>
</xsl:template>

<!-- TouchOp VARIABLE DEFINITION -->
<!-- Operators used for variable definition and use -->
<xsl:template match="def">
  <xsl:comment>Variable definition</xsl:comment>
  <!-- variable definition is identified by def-@name -->
  <xsl:element name="svg:g">
    <xsl:attribute name="class">invalid</xsl:attribute>
    <xsl:attribute name="onmousedown">msDown(evt)</xsl:attribute>
    <xsl:attribute name="id">def-<xsl:value-of select="@name"/></xsl:attribute>
    <xsl:attribute name="transform">scale(0.91)</xsl:attribute>
    <xsl:attribute name="top:def"><xsl:value-of select="@name"/></xsl:attribute>
    <xsl:attribute name="top:drop">none</xsl:attribute>
    <xsl:attribute name="top:layout">horizontalLayout(obj); validateDef(obj)</xsl:attribute>

    <!-- assignment operation -->
    <svg:rect class="background" rx="5" ry="5"/>
    <svg:text><xsl:value-of select="@name"/>=</svg:text>
    <xsl:call-template name="operand"/>
  </xsl:element>
</xsl:template>

<!-- variable usage -->
<xsl:template match="use">
    <xsl:element name="svg:g">
    <xsl:attribute name="class">invalid</xsl:attribute>
    <xsl:attribute name="onmousedown">msDown(evt)</xsl:attribute>
    <xsl:attribute name="top:use"><xsl:value-of select="@name"/></xsl:attribute>
    
    <!-- insert background and text -->
    <xsl:call-template name="literal">
      <xsl:with-param name="name" select="@name"/>
    </xsl:call-template>
  </xsl:element>
</xsl:template>

<!-- TouchOp ALGEBRA DOMAIN -->
<!-- Special operators for the algebra domain -->

<!-- construct the text element for the winning task -->
<xsl:template match="test[@domain='algebra']">
  <xsl:comment>Winning test for the algebra domain</xsl:comment>
  <svg:script type="text/javascript" xlink:href="../../common/algebra.js"/>
  <svg:g transform="translate(50,60)">
    <xsl:element name="svg:text">
      <xsl:attribute name="id">test</xsl:attribute>
      <xsl:copy-of select="@win"/>
      <!-- if no text is provided set default -->
      <xsl:if test="not(text())">
	<xsl:value-of select="concat(@win,' = ?')"/>
      </xsl:if>
      <!-- set the provided test text -->
      <xsl:if test="text()">
	<xsl:value-of select="text()"/>
      </xsl:if>
    </xsl:element>
  </svg:g>
</xsl:template>

<!-- power operator -->
<xsl:template match="op[@name='power']">
  <xsl:comment>Power operator</xsl:comment>
  <svg:g onmousedown="msDown(evt)"
	   top:value="Math.pow(#1, #2)"
	   top:priority="91"
	   top:layout="horizontalLayout(obj)">
      
    <svg:rect class="background" rx="5" ry="5"/>
    <xsl:call-template name="operand"/>
    <svg:g top:priority="80">
      <svg:rect y="50" width="1" height="1" style="opacity:0.0"/>
      <svg:g transform="scale(0.6), translate(0,-50)">
	<xsl:call-template name="operand"/>
      </svg:g>
    </svg:g>
  </svg:g>
</xsl:template>

<!-- Multiplication operator -->
<xsl:template match="op[@name='times']">
  <xsl:comment>Multiplication operator</xsl:comment>
  <svg:g onmousedown="msDown(evt)"
	 top:value="#1 * #2"
	 top:priority="100"
	 top:layout="horizontalLayout(obj)">

    <svg:rect class="background" rx="5" ry="5"/>
    <xsl:call-template name="operand"/>
    <svg:text>&#215;</svg:text>
    <xsl:call-template name="operand"/>
  </svg:g>
</xsl:template>

<!-- Division operator -->
<xsl:template match="op[@name='divide']">
  <xsl:comment>Division operator</xsl:comment>
  <svg:g onmousedown="msDown(evt)"
     top:value="#1 / #2"
     top:priority="99"
     top:layout="verticalLayout(obj)">

    <svg:rect class="background" rx="5" ry="5"/>
    <svg:g transform="scale(0.8)" top:priority="100">
      <xsl:call-template name="operand"/>
    </svg:g>
    <svg:rect width="80" height="3" top:layoutOpt="stretch"/>
    <svg:g transform="scale(0.8)" top:priority="100">
      <xsl:call-template name="operand"/>
    </svg:g>
  </svg:g>
</xsl:template>

<xsl:template match="op[@name='plus']">
  <xsl:comment>Addition operator</xsl:comment>
  <svg:g onmousedown="msDown(evt)"
     top:layout="horizontalLayout(obj)"
     top:priority="120"
     top:value="#1 + #2">

    <svg:rect class="background" rx="5" ry="5"/>
    <xsl:call-template name="operand"/>
    <svg:text>+</svg:text>
    <xsl:call-template name="operand"/>
  </svg:g>
</xsl:template>

<!-- substraction operator -->
<xsl:template match="op[@name='minus']">
  <xsl:comment>Substraction operator</xsl:comment>
  <svg:g onmousedown="msDown(evt)"
     top:layout="horizontalLayout(obj)"
     top:priority="111"
     top:value="#1 - #2">

    <svg:rect class="background" rx="5" ry="5"/>
    <svg:g top:priority="110">
      <xsl:call-template name="operand"/>
    </svg:g>
    <svg:text>&#8211;</svg:text>
    <xsl:call-template name="operand"/>
  </svg:g>
</xsl:template>

<!-- substraction operator -->
<xsl:template match="func">
  <xsl:comment>Substraction operator</xsl:comment>
  <svg:g onmousedown="msDown(evt)"
     top:layout="horizontalLayout(obj)"
     top:priority="0">

    <svg:rect class="background" rx="5" ry="5"/>
    <svg:text transform="scale(0.71,1)"><xsl:value-of select="@name"/></svg:text>
    <xsl:element name="svg:g">
      <xsl:attribute name="top:priority">10</xsl:attribute>
      <xsl:attribute name="top:value">
	<xsl:value-of select="concat('Math.',@name,'(#1)')"/>
      </xsl:attribute>
      <xsl:call-template name="operand"/>
    </xsl:element>
  </svg:g>
</xsl:template>

<xsl:template match="atom">
  <xsl:comment>Atomic element</xsl:comment>
  <xsl:element name="svg:g">
    <xsl:attribute name="onmousedown">msDown(evt)</xsl:attribute>
    <xsl:attribute name="top:value"><xsl:value-of select="@value"/></xsl:attribute>
    <xsl:attribute name="top:priority"><xsl:value-of select="@priority"/></xsl:attribute>
    <xsl:attribute name="top:play">500</xsl:attribute>
    <xsl:call-template name="literal"/>
  </xsl:element>
</xsl:template>

<!-- TouchOp FUNCTION PLOTTING -->
<!-- Special operators for the function plotting domain -->

<!-- Import the verify function for the plotting domain -->
<xsl:template match="test[@domain='plot']">
  <xsl:comment>Create formulas according to a reference plot</xsl:comment>
  <svg:script type="text/javascript" xlink:href="../../common/plot.js"/>
</xsl:template>

<!-- Create a canvas for the plotted graph -->
<xsl:template match="canvas">
  <xsl:comment>Plotting canvas</xsl:comment>
  <svg:clipPath id="canvasClip"><svg:use xlink:href="#canvasFrame"/></svg:clipPath>
  <xsl:element name="svg:rect">
    <xsl:attribute name="id">canvasFrame</xsl:attribute>
    <xsl:attribute name="class">canvas</xsl:attribute>
    <xsl:attribute name="height"><xsl:value-of select="@size"/></xsl:attribute>
    <xsl:attribute name="width"><xsl:value-of select="@size"/></xsl:attribute>
  </xsl:element>
  <xsl:element name="svg:g">
    <xsl:attribute name="id">canvas</xsl:attribute>
    <xsl:attribute name="clip-path">url(#canvasClip)</xsl:attribute>
    <xsl:attribute name="top:plot"><xsl:value-of select="@plot"/></xsl:attribute>
    <xsl:attribute name="top:size"><xsl:value-of select="@size"/></xsl:attribute>
    <xsl:attribute name="top:xmin"><xsl:value-of select="@xmin"/></xsl:attribute>
    <xsl:attribute name="top:ymin"><xsl:value-of select="@ymin"/></xsl:attribute>
    <xsl:attribute name="top:xmax"><xsl:value-of select="@xmax"/></xsl:attribute>
    <xsl:attribute name="top:ymax"><xsl:value-of select="@ymax"/></xsl:attribute>
    <xsl:variable name="xscale" select="@size div (@xmax - @xmin)"/>
    <xsl:variable name="yscale" select="@size div (@ymax - @ymin)"/>
    <xsl:for-each select="point">
      <xsl:element name="svg:circle">
	<xsl:attribute name="class">graph</xsl:attribute>
	<xsl:attribute name="r">5</xsl:attribute>
	<xsl:attribute name="cx">
	  <xsl:value-of select="(@x - ../@xmin)*$xscale"/>
	</xsl:attribute>
	<xsl:attribute name="cy">
	  <xsl:value-of select="(../@ymax - @y)*$yscale"/>
	</xsl:attribute>
	<xsl:attribute name="top:x"><xsl:value-of select="@x"/></xsl:attribute>
	<xsl:attribute name="top:y"><xsl:value-of select="@y"/></xsl:attribute>
      </xsl:element>
    </xsl:for-each>
    <xsl:for-each select="turtle">
      <xsl:element name="svg:g">
	<xsl:attribute name="transform">
	  <xsl:value-of select="concat('translate(',../@size div 2,',',../@size div 2,')')"/>
	</xsl:attribute>
	<svg:path id="turtle" d="M 0,-5 l 12,5, -12,5 Z"/>
      </xsl:element>
    </xsl:for-each>
    <svg:path id="plotpath"/>
  </xsl:element>
  <!-- compute grid resolution -->
  <xsl:variable name="res">
    <xsl:choose>
      <xsl:when test="(@xmax - @xmin)&lt;11">1</xsl:when>
      <xsl:otherwise>5</xsl:otherwise>
    </xsl:choose>
  </xsl:variable>
  <!-- call grid creation -->
  <xsl:call-template name="ygrid">
    <xsl:with-param name="pos" select="ceiling(@ymin)"/>
    <xsl:with-param name="res" select="$res"/>
  </xsl:call-template>
  <xsl:call-template name="xgrid">
    <xsl:with-param name="pos" select="ceiling(@xmin)"/>
    <xsl:with-param name="res" select="$res"/>
  </xsl:call-template>
</xsl:template>

<xsl:template name="ygrid">
  <xsl:param name="pos"/>
  <xsl:param name="res"/>
  <xsl:if test="$pos &lt;= @ymax">
    <xsl:variable name="y" select="(@ymax - $pos) * @size div (@ymax - @ymin)"/>
    <xsl:element name="svg:path">
      <xsl:attribute name="class">axes</xsl:attribute>
      <xsl:attribute name="d">
	<xsl:value-of select="concat('M ',@size,',',$y,' L -10,',$y)"/>
      </xsl:attribute>
    </xsl:element>
    <xsl:element name="svg:text">
      <xsl:attribute name="class">axes</xsl:attribute>
      <xsl:attribute name="y"><xsl:value-of select="$y + 5"/></xsl:attribute>
      <xsl:attribute name="x">-20</xsl:attribute>
      <xsl:value-of select="$pos"/>
    </xsl:element>
    <xsl:call-template name="ygrid">
      <xsl:with-param name="pos" select="$pos+$res"/>
      <xsl:with-param name="res" select="$res"/>
    </xsl:call-template>
  </xsl:if>
</xsl:template>

<xsl:template name="xgrid">
  <xsl:param name="pos"/>
  <xsl:param name="res"/>
  <xsl:if test="$pos &lt;= @xmax">
    <xsl:variable name="x" select="($pos - @xmin) * @size div (@xmax - @xmin)"/>
    <xsl:element name="svg:path">
      <xsl:attribute name="class">axes</xsl:attribute>
      <xsl:attribute name="d">
	<xsl:value-of select="concat('M ',$x,',0 L ',$x,',',@size+10)"/>
      </xsl:attribute>
    </xsl:element>
    <xsl:element name="svg:text">
      <xsl:attribute name="class">axes</xsl:attribute>
      <xsl:attribute name="y"><xsl:value-of select="@size + 25"/></xsl:attribute>
      <xsl:attribute name="x"><xsl:value-of select="$x"/></xsl:attribute>
      <xsl:value-of select="$pos"/>
    </xsl:element>
    <xsl:call-template name="xgrid">
      <xsl:with-param name="pos" select="$pos+$res"/>
      <xsl:with-param name="res" select="$res"/>
    </xsl:call-template>
  </xsl:if>
</xsl:template>

<!-- TouchOp TURTLE GRAPHICS -->
<!-- Special operators for turtle graphics -->

<!-- Import the verify function for the plotting domain -->
<xsl:template match="test[@domain='turtle']">
  <xsl:comment>Move a turtle to specified goal</xsl:comment>
  <svg:script type="text/javascript" xlink:href="../../common/turtle.js"/>
  <defs>
    <svg:path id="half-right" class="move"
	      d="m 47,32 -7,-7 c 0,0 -5,2 -6,6 -1,4 0,15 0,15 0,3 -4,6 -8,6 l -4,0 C 16,52 14,49 14,46 13,37 12,27 20,21 l 7,-5 -7,-7 c 1,0 28,0 28,0 L 47,32 z"/>
    <svg:path id="turn-left" class="move"
	      d="M 55,25 l -15,15 0,-8 c 0,0 0,0 -2,0 l -8,0 0,14 c 0,3 -3,6 -6,6 l -3,0 c -4,0 -6,-3 -6,-6 l 0,-23 c 0,-3 2,-6 6,-6 l 3,0 c 0,0 1,0 1,0 l 14,0 c 1,0 1,0 1,0 l 0,-7 15,15 z"/>
    <svg:g id="turn-right"> 
      <svg:use xlink:href="#turn-left" transform="matrix(-1,0,0,1,60,0)"/>
    </svg:g>
    <svg:g id="move-grow"> 
      <svg:use xlink:href="#move-forward" transform="matrix(0.5,0,0,0.5,15,20)"/>
      <svg:use xlink:href="#move-forward"/>
    </svg:g>
    <svg:path id="move-forward" class="move"
	      d="m 30,11 -15,15 8,0 c 0,0 0,0 0,2 0,0 -5,9 -6,14 0,1 0,3 0,3 0,4 3,6 6,6 l 15,0 c 3,0 6,-2 6,-6 0,0 0,-2 0,-3 -1,-5 -6,-15 -6,-15 0,-1 0,-1 0,-1 l 7,0 z"/>
  </defs>  
</xsl:template>

<xsl:template match="program">
  <xsl:element name="svg:g">
    <xsl:attribute name="onmousedown">msDown(evt)</xsl:attribute>
    <xsl:attribute name="class">program</xsl:attribute>
    <xsl:attribute name="top:name"><xsl:value-of select="@name"/></xsl:attribute>
    <xsl:attribute name="top:repeat"><xsl:value-of select="@repeat"/></xsl:attribute>
    <xsl:if test="not(@def)">
      <xsl:attribute name="top:layout">horizontalLayout(obj)</xsl:attribute>
    </xsl:if>
    <xsl:if test="@def">
      <xsl:attribute name="id">def-<xsl:value-of select="@name"/></xsl:attribute>
      <xsl:attribute name="transform">scale(0.91)</xsl:attribute>
      <xsl:attribute name="top:def"><xsl:value-of select="@name"/></xsl:attribute>
      <xsl:attribute name="top:drop">none</xsl:attribute>
      <xsl:attribute name="top:layout">verticalLayout(obj)</xsl:attribute>
    </xsl:if>

    <svg:rect class="background" rx="5" ry="5"/>
    <xsl:if test="@name">
      <svg:text class="filter">
	<xsl:value-of select="@name"/>
	<xsl:if test="@def">=</xsl:if>
      </svg:text>
    </xsl:if>
    <svg:g top:layout="verticalLayout(obj)">
      <svg:rect class="background" display="none"/>
      <xsl:for-each select="step">
	<xsl:call-template name="operand"/>
      </xsl:for-each>
    </svg:g>
  </xsl:element>
</xsl:template>

<xsl:template match="move">
  <xsl:element name="svg:g">
    <xsl:attribute name="onmousedown">msDown(evt)</xsl:attribute>
    <xsl:attribute name="top:value"><xsl:value-of select="@value"/></xsl:attribute>
    <svg:rect class="background" rx="5" ry="5" height="60" width="60"/>
    <xsl:element name="svg:use">
      <xsl:attribute name="xlink:href"><xsl:value-of select="@img"/></xsl:attribute>
    </xsl:element>
  </xsl:element>
</xsl:template>

<!-- TOUCHOP - IMAGE PROCESSING DOMAIN -->
<!-- Special operators for image processing and image synthesis -->
<xsl:template match="test[@domain='image']">
  <xsl:comment>Image processing</xsl:comment>
  <svg:script type="text/javascript" xlink:href="../../common/image.js"/>
  <svg:defs>
    <svg:filter id="filter-blur" x="-10" y="-10" width="70" height="70">
      <svg:feGaussianBlur stdDeviation="4"/>
    </svg:filter>
    <svg:filter id="filter-atop" x="0" y="0" width="60" height="60">
      <!-- not working. No browser supports the enable-background attribute -->
      <svg:feComposite operator="xor" in="SourceGraphic" in2="BackgroundImage"/>
    </svg:filter>
  </svg:defs>
</xsl:template>

<xsl:template name="layer">
    <svg:g transform="matrix(1, 0, 0.5 ,0.5, 0, 0)" 
	   top:role="layer" 
	   top:layout="layerLayout(obj)">
      <xsl:call-template name="operand"/>
    </svg:g>
</xsl:template>

<xsl:template match="op[@name='stack']">
  <svg:g onmousedown="msDown(evt)"
	 top:padding="10"
	 top:layout="verticalLayout(obj)">

    <svg:rect class="background" rx="5" ry="5"/>
    <xsl:for-each select="layer">
      <xsl:call-template name="layer"/>
    </xsl:for-each>
    <svg:g top:role="result" display="none">
      <svg:rect width="60" height="60" class="frame"/>
      <svg:g/>
    </svg:g>
  </svg:g>
</xsl:template>

<xsl:template match="op[@name='blur']">
  <svg:g onmousedown="msDown(evt)"
	 top:padding="10"
	 top:layout="verticalLayout(obj)">

    <svg:rect class="background" rx="5" ry="5"/>
    <svg:text class="filter" transform="translate(45,16)">Blur</svg:text>
    <xsl:call-template name="layer"/>
    <svg:g top:role="result" display="none">
      <svg:rect width="60" height="60" class="frame"/>
      <svg:g filter="url(#filter-blur)"/>
    </svg:g>
  </svg:g>
</xsl:template>

<!-- Image -->
<xsl:template match="image">
  <svg:g onmousedown="msDown(evt)" top:role="image">
    <svg:rect width="60" height="60" class="frame"/>
    <svg:g top:role="content">
      <xsl:if test="@src">
	<xsl:element name="svg:image">
	  <xsl:attribute name="width">60</xsl:attribute>
	  <xsl:attribute name="height">60</xsl:attribute>
	  <xsl:attribute name="xlink:href">
	    <xsl:value-of select="@src"/>
	  </xsl:attribute>
	</xsl:element>
      </xsl:if>
      <xsl:copy-of select="*"/>
    </svg:g>
  </svg:g>
</xsl:template>

</xsl:stylesheet>
