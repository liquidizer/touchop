<?xml version="1.0"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:xs="http://www.w3.org/2001/XMLSchema"
                xmlns:svg="http://www.w3.org/2000/svg"
		xmlns:xlink="http://www.w3.org/1999/xlink"
		xmlns:top="http://www.dadim.de/touchop"
                version="1.0">

<!-- generate the svg main file structure -->
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
  <svg:style type="text/css">
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
  </svg:style>
  
  <!-- construct the text element for the winning task -->
  <xsl:comment>Winning test</xsl:comment>
  <svg:g transform="translate(100,60)">
    <xsl:element name="svg:text">
      <xsl:attribute name="id">test</xsl:attribute>
      <xsl:copy-of select="@*"/>
      <xsl:value-of select="concat(@win,' = ?')"/>
    </xsl:element>
  </svg:g>

  <!-- iterate over all xml elements in the source file -->
  <xsl:comment>List of operators</xsl:comment>
  <xsl:for-each select="*">
    <!-- apply operator translation accoring to the xy attribute -->
    <xsl:element name="svg:g">
      <xsl:attribute name="transform">
	<xsl:copy-of select="concat('translate(',@xy,')')"/>
      </xsl:attribute>
      <!-- find the corresponding definition of that operator -->
      <xsl:apply-templates select="."/>
    </xsl:element>
  </xsl:for-each>

  <!-- The emoticon indicates the winning status and links -->
  <!-- back to the index page -->
  <xsl:comment>Emoticon</xsl:comment>
  <svg:a xlink:href="index.html#levels">
    <use xlink:href="smiley.svg#frown" transform="translate(500,20)" id="top:notwin"/>
    <use xlink:href="smiley.svg#smile" transform="translate(500,20)" id="top:win"/>
  </svg:a>
</svg>
</xsl:template>

<!-- power operator -->
<xsl:template match="op[@name='power']">
  <xsl:comment>Power operator</xsl:comment>
  <svg:g onmousedown="msDown(evt)"
	   top:value="Math.pow(#1, #2)"
	   top:priority="91"
	   top:layout="horizontalLayout(obj)">
      
    <svg:rect class="background" height="100" width="150"/>
    <xsl:call-template name="operand"/>
    <svg:g top:priority="80">
      <svg:rect y="50" width="1" height="1" class="background"/>
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

    <svg:rect class="background" height="60" width="150"/>
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

    <svg:rect class="background" height="150" width="100"/>
    <svg:g transform="scale(0.8)" top:priority="100">
      <xsl:call-template name="operand"/>
    </svg:g>
    <svg:rect width="100" height="3"/>
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

    <svg:rect class="background" height="60" width="100"/>
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

    <svg:rect class="background" height="50" width="100"/>
    <svg:g top:priority="110">
      <xsl:call-template name="operand"/>
    </svg:g>
    <svg:text>&#8211;</svg:text>
    <xsl:call-template name="operand"/>
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


<xsl:template name="operand">
  <xsl:comment>Drop area for operands</xsl:comment>
  <svg:g onmousemove="dropOn(evt)" top:layout="snap(obj)">
    <svg:rect height="50" width="50" class="operand"/>
  </svg:g>
</xsl:template>
</xsl:stylesheet>
