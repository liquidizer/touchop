<?xml version="1.0"?>
<!-- Touchop - Touchable operators -->
<!-- -->
<!-- Copyright(C) 2011, Stefan Dirnstorfer -->
<!-- This software may be copied, distributed and modified under the terms -->
<!-- of the GPL (http://www.gnu.org/licenses/gpl.html) -->

<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:xs="http://www.w3.org/2001/XMLSchema"
                xmlns:svg="http://www.w3.org/2000/svg"
		xmlns:html="http://www.w3.org/1999/xhtml"
		xmlns:xlink="http://www.w3.org/1999/xlink"
		xmlns:top="http://www.dadim.de/touchop"
                version="1.0">

<!-- generate the svg main file structure -->
<xsl:template match="touchop">
<svg:svg onmousemove="msMove(evt)"
	 ontouchmove="msMove(evt)"
	 onmouseup="msUp(evt)"
	 ontouchend="msUp(evt)"
	 onmousedown="msBlur(evt)"
	 ontouchstart="msBlur(evt)"
	 viewBox="0 0 60 60">
  <svg:title>Touchop</svg:title>

  <svg:style type="text/css">
text {
    font-size: 48px;
}
.atom {
    text-anchor: middle;
}
.background {
    fill: deepskyblue;
    stroke: #00B0E0;
    stroke-width: 1;
}

.playback .background {
    fill: #CC0000;
    stroke: black;
    stroke-width: 2;
}

.invalid .background {
    fill: lightgray;
    stroke: gray;
    stroke-width: 1;
}
.valid .background {
    fill: DarkSeaGreen;
}

.program .background {
    stroke: black;
    stroke-width: 1px;
}    

.program > text {
    font-size: 12pt;
}

.image > .background {
    stroke: black;
    stroke-width: 1px;
    fill: lightgray;
}    

.image text {
    font-size: 12pt;
}

.shadow {
    fill: black;
    opacity: 0.4;
}

.operand > .background {
    fill: #ffffe0;
    stroke: black;
}

#plotpath {
    fill: none;
    stroke: blue;
    stroke-width: 3px;
}

path.axes {
    fill: none;
    stroke: black;
    stroke-width: 0.5px;
}

circle.graph {
    fill: navy;
    stroke: #000000;
    opacity: 0.9;
    stroke-width: 1px;
}

rect.canvas {
    fill: none;
    stroke: #000000;
    stroke-width: 1px;
}

text.axes {
    font-size: 10pt;
    text-anchor: middle;
}

#turtle {
    fill: red;
    stroke: #000000;
    stroke-width: 1px;
}

.move {
    fill:white;
    stroke:black;
    stroke-width:2;
    opacity: 0.5;
    pointer-events:none;
}
</svg:style>

  <!-- iterate over all xml elements in the source file -->
  <xsl:comment>List of operators</xsl:comment>
  <xsl:for-each select="canvas">
    <!-- apply operator translation accoring to the xy attribute -->
    <xsl:element name="svg:g">
      <xsl:if test="@xy">
	<xsl:attribute name="transform">
	  <xsl:copy-of select="'translate(0,0)'"/>
	</xsl:attribute>
      </xsl:if>
      <!-- find the corresponding definition of that operator -->
      <xsl:apply-templates select="."/>
    </xsl:element>
  </xsl:for-each>

</svg:svg>
</xsl:template>

<!-- Create a canvas for the plotted graph -->
<xsl:template match="canvas">
  <xsl:comment>Plotting canvas</xsl:comment>
  <svg:clipPath id="canvasClip"><svg:use xlink:href="#canvasFrame"/></svg:clipPath>
  <xsl:element name="svg:rect">
    <xsl:attribute name="id">canvasFrame</xsl:attribute>
    <xsl:attribute name="class">canvas</xsl:attribute>
    <xsl:attribute name="height"><xsl:value-of select="60"/></xsl:attribute>
    <xsl:attribute name="width"><xsl:value-of select="60"/></xsl:attribute>
  </xsl:element>
  <xsl:element name="svg:g">
    <xsl:attribute name="id">canvas</xsl:attribute>
    <xsl:attribute name="clip-path">url(#canvasClip)</xsl:attribute>
    <xsl:attribute name="top:plot"><xsl:value-of select="@plot"/></xsl:attribute>
    <xsl:attribute name="top:size"><xsl:value-of select="60"/></xsl:attribute>
    <xsl:attribute name="top:xmin"><xsl:value-of select="@xmin"/></xsl:attribute>
    <xsl:attribute name="top:ymin"><xsl:value-of select="@ymin"/></xsl:attribute>
    <xsl:attribute name="top:xmax"><xsl:value-of select="@xmax"/></xsl:attribute>
    <xsl:attribute name="top:ymax"><xsl:value-of select="@ymax"/></xsl:attribute>
    <xsl:variable name="xscale" select="60 div (@xmax - @xmin)"/>
    <xsl:variable name="yscale" select="60 div (@ymax - @ymin)"/>
    <xsl:for-each select="point">
      <xsl:element name="svg:circle">
	<xsl:attribute name="class">graph</xsl:attribute>
	<xsl:attribute name="r">4</xsl:attribute>
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
    <xsl:if test="turtle">
      <xsl:element name="svg:g">
	<xsl:attribute name="transform">
	  <xsl:text>translate(</xsl:text>
	  <xsl:value-of select="(0 - @xmin) div (@xmax - @xmin) * 60"/>
	  <xsl:text>,</xsl:text>
	  <xsl:value-of select="(@ymax - 0) div (@ymax - @ymin) * 60"/>
	  <xsl:text>)</xsl:text>
	  <xsl:text> rotate(-90)</xsl:text>
	</xsl:attribute>
	<svg:path id="turtle" d="M 0,-5 l 12,5, -12,5 Z"/>
      </xsl:element>
    </xsl:if>
    <svg:path id="plotpath"/>
  </xsl:element>

  <!-- compute grid resolution -->
  <xsl:variable name="yres">
    <xsl:call-template name="resolution">
      <xsl:with-param name="span" select="@ymax - @ymin"/>
    </xsl:call-template>
  </xsl:variable>
  <!-- call grid creation -->
  <xsl:call-template name="ygrid">
    <xsl:with-param name="pos" select="ceiling(@ymin)"/>
    <xsl:with-param name="res" select="$yres"/>
  </xsl:call-template>

  <!-- compute grid resolution -->
  <xsl:variable name="xres">
    <xsl:call-template name="resolution">
      <xsl:with-param name="span" select="@xmax - @xmin"/>
    </xsl:call-template>
  </xsl:variable>
  <!-- call grid creation -->
  <xsl:call-template name="xgrid">
    <xsl:with-param name="pos" select="ceiling(@xmin)"/>
    <xsl:with-param name="res" select="$xres"/>
  </xsl:call-template>
</xsl:template>

<!-- find resolution for the canvas grid -->
<xsl:template name="resolution">
  <xsl:param name="span"/>
  <xsl:choose>
    <xsl:when test="$span &lt; 2.1">0.5</xsl:when>
    <xsl:when test="$span &lt; 11">1</xsl:when>
    <xsl:when test="$span &lt; 41">5</xsl:when>
    <xsl:otherwise>10</xsl:otherwise>
  </xsl:choose>
</xsl:template>

<!-- render horizontal grid lines -->
<xsl:template name="ygrid">
  <xsl:param name="pos"/>
  <xsl:param name="res"/>
  <xsl:if test="$pos &lt;= @ymax">
    <xsl:variable name="y" select="(@ymax - $pos) * 60 div (@ymax - @ymin)"/>
    <xsl:element name="svg:path">
      <xsl:attribute name="class">axes</xsl:attribute>
      <xsl:attribute name="d">
	<xsl:value-of select="concat('M ',60,',',$y,' L -10,',$y)"/>
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

<!-- render vertical grid lines -->
<xsl:template name="xgrid">
  <xsl:param name="pos"/>
  <xsl:param name="res"/>
  <xsl:if test="$pos &lt;= @xmax">
    <xsl:variable name="x" select="($pos - @xmin) * 60 div (@xmax - @xmin)"/>
    <xsl:element name="svg:path">
      <xsl:attribute name="class">axes</xsl:attribute>
      <xsl:attribute name="d">
	<xsl:value-of select="concat('M ',$x,',0 L ',$x,',',60+10)"/>
      </xsl:attribute>
    </xsl:element>
    <xsl:element name="svg:text">
      <xsl:attribute name="class">axes</xsl:attribute>
      <xsl:attribute name="y"><xsl:value-of select="60 + 25"/></xsl:attribute>
      <xsl:attribute name="x"><xsl:value-of select="$x"/></xsl:attribute>
      <xsl:value-of select="$pos"/>
    </xsl:element>
    <xsl:call-template name="xgrid">
      <xsl:with-param name="pos" select="$pos+$res"/>
      <xsl:with-param name="res" select="$res"/>
    </xsl:call-template>
  </xsl:if>
</xsl:template>
</xsl:stylesheet>
