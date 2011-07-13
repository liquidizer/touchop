<?xml version="1.0"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:xs="http://www.w3.org/2001/XMLSchema"
                xmlns:svg="http://www.w3.org/2000/svg"
		xmlns:xlink="http://www.w3.org/1999/xlink"
		xmlns:top="http://www.dadim.de/touchop"
                version="1.0">

<xsl:template match="touchop">
<svg xmlns="http://www.w3.org/2000/svg"
     xmlns:xlink="http://www.w3.org/1999/xlink"
     xmlns:top="http://www.dadim.de/touchop"
     onmousemove="msMove(evt)"
     onmouseup="msUp(evt)"
     width="100%" height="100%"
     viewBox="0 0 600 400"
     onload ="init(evt)">

  <script type="text/javascript" xlink:href="touchop.js"/>
  <style type="text/css">
    text {
    text-anchor: middle;
    font-size: 48px;
    }

    .background {
    fill: deepskyblue;
    stroke: #10D0FF;
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
  
  <xsl:comment>Winning test</xsl:comment>
  <xsl:element name="svg:text">
    <xsl:attribute name="transform">translate(100,60)</xsl:attribute>
    <xsl:attribute name="id">test</xsl:attribute>
    <xsl:attribute name="top:test"><xsl:value-of select="@win"/></xsl:attribute>
    <xsl:value-of select="@win"/>
    <xsl:text> = ?</xsl:text>
  </xsl:element>

  <xsl:comment>List of operators</xsl:comment>
  <xsl:for-each select="*">
    <xsl:element name="svg:g">
      <xsl:attribute name="transform">
	<xsl:copy-of select="concat('translate(',@xy,')')"/>
      </xsl:attribute>
      <xsl:apply-templates select="."/>
    </xsl:element>
  </xsl:for-each>

  <xsl:comment>Emoticon</xsl:comment>
  <use xlink:href="smiley.svg#frown" transform="translate(500,20)" id="top:notwin"/>
  <use xlink:href="smiley.svg#smile" transform="translate(500,20)" id="top:win"/>
</svg>

</xsl:template>

<xsl:template match="op[@name='power']">
  <xsl:comment>Power operator</xsl:comment>
  <svg:g onmousedown="msDown(evt)"
	   top:value="Math.pow(#1, #2)"
	   top:priority="91"
	   top:layout="horizontalLayout(obj)">
      
    <svg:g class="background">
      <svg:rect height="100" width="150"/>
    </svg:g>
    <svg:g onmousemove="dropOn(evt)" top:layout="snap(obj)">
      <svg:rect height="50" width="50" class="operand"/>
    </svg:g>
    <svg:g top:priority="80">
      <svg:rect y="50" width="1" height="1" class="background"/>
      <svg:g onmousemove="dropOn(evt)" top:layout="snap(obj)" 
	     transform="scale(0.6)">
	<svg:rect y="-50" height="50" width="50" class="operand"/>
      </svg:g>
    </svg:g>
  </svg:g>
</xsl:template>

<xsl:template match="op[@name='times']">
  <xsl:comment>Multiplication operator</xsl:comment>
  <svg:g onmousedown="msDown(evt)"
	 top:value="#1 * #2"
	 top:priority="100"
	 top:layout="horizontalLayout(obj)">

    <svg:g class="background">
      <svg:rect height="60" width="150"/>
    </svg:g>
    <svg:g onmousemove="dropOn(evt)" top:layout="snap(obj)">
      <svg:rect height="50" width="50" class="operand"/>
    </svg:g>
    <svg:text>&#215;</svg:text>
    <svg:g onmousemove="dropOn(evt)" top:layout="snap(obj)">
      <svg:rect height="50" width="50" class="operand"/>
    </svg:g>
  </svg:g>
</xsl:template>

<xsl:template match="op[@name='divide']">
  <xsl:comment>Division operator</xsl:comment>
  <svg:g onmousedown="msDown(evt)"
     top:value="#1 / #2"
     top:priority="1000"
     top:layout="verticalLayout(obj)">

    <svg:g class="background">
      <svg:rect height="150" width="100"/>
    </svg:g>
    <svg:g onmousemove="dropOn(evt)" transform="scale(0.8)" 
       top:layout="snap(obj)" top:priority="100">
      <svg:rect height="50" width="50" class="operand"/>
    </svg:g>
    <svg:rect width="100" height="3"/>
    <svg:g onmousemove="dropOn(evt)" transform="scale(0.8)" 
       top:layout="snap(obj)" top:priority="100">
      <svg:rect height="50" width="50" class="operand"/>
    </svg:g>
  </svg:g>
</xsl:template>

<xsl:template match="op[@name='plus']">
  <xsl:comment>Addition operator</xsl:comment>
  <svg:g onmousedown="msDown(evt)"
     top:layout="horizontalLayout(obj)"
     top:priority="120"
     top:value="#1 + #2">

    <svg:g class="background">
      <svg:rect height="60" width="100"/>
    </svg:g>
    <svg:g onmousemove="dropOn(evt)" top:layout="snap(obj)">
      <svg:rect height="50" width="50" class="operand"/>
    </svg:g>
    <svg:text>+</svg:text>
    <svg:g onmousemove="dropOn(evt)" top:layout="snap(obj)">
      <svg:rect height="50" width="50" class="operand"/>
    </svg:g>
  </svg:g>
</xsl:template>

<xsl:template match="op[@name='minus']">
  <xsl:comment>Substraction operator</xsl:comment>
  <svg:g onmousedown="msDown(evt)"
     top:layout="horizontalLayout(obj)"
     top:priority="111"
     top:value="#1 - #2">

    <svg:g class="background">
      <svg:rect height="50" width="100"/>
    </svg:g>
    <svg:g onmousemove="dropOn(evt)" top:layout="snap(obj)" top:priority="110">
      <svg:rect height="50" width="50" class="operand"/>
    </svg:g>
    <svg:text>&#8211;</svg:text>
    <svg:g onmousemove="dropOn(evt)" top:layout="snap(obj)">
      <svg:rect height="50" width="50" class="operand"/>
    </svg:g>
  </svg:g>
</xsl:template>

<xsl:template match="atom">
  <xsl:comment>Atomic element</xsl:comment>
  <svg:g onmousedown="msDown(evt)">
    <xsl:element name="svg:rect">
      <xsl:attribute name="class">background</xsl:attribute>
      <xsl:attribute name="height">60</xsl:attribute>
      <xsl:attribute name="width">
	<xsl:value-of select="30+30*count(@value)"/>
      </xsl:attribute>
    </xsl:element>
    <xsl:element name="svg:text">
      <xsl:attribute name="transform">translate(30,45)</xsl:attribute>
      <xsl:attribute name="top:value"><xsl:value-of select="@value"/></xsl:attribute>
      <xsl:value-of select="@value"/>
    </xsl:element>
  </svg:g>
</xsl:template>
</xsl:stylesheet>
