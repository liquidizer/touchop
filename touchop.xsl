<?xml version="1.0"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:xs="http://www.w3.org/2001/XMLSchema"
                xmlns:svg="http://www.w3.org/2000/svg"
		xmlns:xlink="http://www.w3.org/1999/xlink"
		xmlns:wof="http://www.dadim.de/wof"
                version="1.0">

<xsl:template match="touchop">
<svg xmlns="http://www.w3.org/2000/svg"
     xmlns:xlink="http://www.w3.org/1999/xlink"
     xmlns:wof="http://www.dadim.de/wof"
     onmousemove="msMove(evt)"
     onmouseup="msUp(evt)"
     width="100%" height="100%"
     viewBox="0 0 600 400"
     onload ="init(evt)">

  <script type="text/javascript" xlink:href="wof.js"/>
  <style type="text/css">
    text {
    text-anchor: middle;
    font-size: 48px;
    }

    .background {
    fill: deepskyblue;
    stroke: turquoise;
    stroke-width: 1;
    }

    .shadow {
    fill: black;
    opacity: 0.2;
    }

    .operand {
    fill: #ffffe0;
    }
  </style>
  
  <xsl:element name="svg:text">
    <xsl:attribute name="transform">translate(100,45)</xsl:attribute>
    <xsl:attribute name="id">test</xsl:attribute>
    <xsl:attribute name="wof:test"><xsl:value-of select="concat(@win8,'==?')"/></xsl:attribute>
    <xsl:value-of select="@win"/>
    <xsl:text> = ?</xsl:text>
  </xsl:element>

  <xsl:for-each select="*">
    <xsl:element name="svg:g">
      <xsl:attribute name="transform">
	<xsl:copy-of select="concat('translate(',@xy,')')"/>
      </xsl:attribute>
      <xsl:apply-templates select="."/>
    </xsl:element>
  </xsl:for-each>

  <use xlink:href="smiley.svg#frown" transform="translate(500,20)" id="wof:notwin"/>
  <use xlink:href="smiley.svg#smile" transform="translate(500,20)" id="wof:win"/>
</svg>

</xsl:template>

<xsl:template match="pow">
  <svg:g onmousedown="msDown(evt)"
	   wof:value="Math.pow(#1, #2)"
	   wof:priority="80"
	   wof:layout="horizontalLayout(obj)">
      
    <svg:g class="background">
      <svg:rect height="100" width="150"/>
    </svg:g>
    <svg:g onmousemove="dropOn(evt)" wof:layout="snap(obj)">
      <svg:rect height="50" width="50" class="operand"/>
    </svg:g>
    <svg:g wof:priority="80">
      <svg:rect y="50" width="1" height="1" class="background"/>
      <svg:g onmousemove="dropOn(evt)" wof:layout="snap(obj)" 
	     transform="scale(0.6)">
	<svg:rect y="-50" height="50" width="50" class="operand"/>
      </svg:g>
    </svg:g>
  </svg:g>
</xsl:template>

<xsl:template match="times">
  <svg:g onmousedown="msDown(evt)"
	 wof:value="#1 * #2"
	 wof:priority="100"
	 wof:layout="horizontalLayout(obj)">

    <svg:g class="background">
      <svg:rect height="100" width="150"/>
    </svg:g>
    <svg:g onmousemove="dropOn(evt)" wof:layout="snap(obj)">
      <svg:rect height="50" width="50" class="operand"/>
    </svg:g>
    <svg:text>&#215;</svg:text>
    <svg:g onmousemove="dropOn(evt)" wof:layout="snap(obj)">
      <svg:rect height="50" width="50" class="operand"/>
    </svg:g>
  </svg:g>
</xsl:template>

<xsl:template match="divide">
  <svg:g onmousedown="msDown(evt)"
     wof:value="#1 / #2"
     wof:priority="100"
     wof:layout="verticalLayout(obj)">

    <svg:g class="background">
      <svg:rect height="150" width="100"/>
    </svg:g>
    <svg:g onmousemove="dropOn(evt)" transform="scale(0.8)" 
       wof:layout="snap(obj)" wof:priority="100">
      <svg:rect height="50" width="50" class="operand"/>
    </svg:g>
    <svg:rect width="100" height="3"/>
    <svg:g onmousemove="dropOn(evt)" transform="scale(0.8)" 
       wof:layout="snap(obj)" wof:priority="100">
      <svg:rect height="50" width="50" class="operand"/>
    </svg:g>
  </svg:g>
</xsl:template>

<xsl:template match="plus">
  <svg:g onmousedown="msDown(evt)"
     wof:layout="horizontalLayout(obj)"
     wof:priority="120"
     wof:value="#1 + #2">

    <svg:g class="background">
      <svg:rect height="50" width="100"/>
    </svg:g>
    <svg:g onmousemove="dropOn(evt)" wof:layout="snap(obj)">
      <svg:rect height="50" width="50" class="operand"/>
    </svg:g>
    <svg:text>+</svg:text>
    <svg:g onmousemove="dropOn(evt)" wof:layout="snap(obj)">
      <svg:rect height="50" width="50" class="operand"/>
    </svg:g>
  </svg:g>
</xsl:template>

<xsl:template match="atom">
  <svg:g onmousedown="msDown(evt)">
    <svg:rect height="60" width="60" class="background"/>
    <xsl:element name="svg:text">
      <xsl:attribute name="transform">translate(30,45)</xsl:attribute>
      <xsl:attribute name="wof:value"><xsl:value-of select="@value"/></xsl:attribute>
      <xsl:value-of select="@value"/>
    </xsl:element>
  </svg:g>
</xsl:template>
</xsl:stylesheet>
