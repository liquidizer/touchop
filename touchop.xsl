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
<svg xmlns="http://www.w3.org/2000/svg"
     xmlns:xlink="http://www.w3.org/1999/xlink"
     xmlns:top="http://www.dadim.de/touchop"
     onmousemove="msMove(evt)"
     onmouseup="msUp(evt)"
     width="100%" height="100%"
     viewBox="0 0 600 400">

  <!-- import the style sheet -->
  <svg:style type="text/css">@import url('style.css');</svg:style>

  <!-- Drag and drop interface -->
  <svg:script type="text/javascript" xlink:href="touchop.js"/>

  <!-- Set up the levels objective -->
  <xsl:apply-templates select="test"/>

  <!-- iterate over all xml elements in the source file -->
  <xsl:comment>List of operators</xsl:comment>
  <xsl:for-each select="op | atom | vardef | var">
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
    <use xlink:href="smiley.svg#smile" transform="translate(500,20)" id="top:win"/>
    <use xlink:href="smiley.svg#frown" transform="translate(500,20)" id="top:notwin"/>
  </svg:a>
</svg>
</xsl:template>

<!-- Generic drop area for operator arguments -->
<xsl:template name="operand">
  <xsl:comment>Drop area for operands</xsl:comment>
  <svg:g onmousemove="dropOn(evt)" top:layout="snap(obj)">
    <svg:rect height="50" width="50" class="operand"/>
  </svg:g>
</xsl:template>

<!-- Multiple drop areas for operator arguments -->
<xsl:template name="multiop">
  <xsl:param name="count" select="2"/>
  <!-- recursive call for multiple arguments -->
  <xsl:if test="$count &gt; 1">
    <xsl:call-template name="multiop">
      <xsl:with-param name="count" select="$count - 1"/>
    </xsl:call-template>
  </xsl:if>
  <!-- single argument -->
  <xsl:call-template name="operand"/>
</xsl:template>

<!-- TouchOp VARIABLE DEFINITION -->
<!-- Operators used for variable definition and use -->
<xsl:template match="vardef">
  <xsl:comment>Variable definition</xsl:comment>
  <svg:g class="fixed"
	 top:layout="horizontalLayout(obj)">
    <svg:rect class="background" height="100" width="150"/>
    <svg:text><xsl:value-of select="@name"/>=</svg:text>
    <xsl:call-template name="operand"/>
  </svg:g>
</xsl:template>

<!-- TouchOp ALGEBRA DOMAIN -->
<!-- Special operators for the algebra domain -->

<!-- construct the text element for the winning task -->
<xsl:template match="test[@domain='algebra']">
  <xsl:comment>Winning test for the algebra domain</xsl:comment>
  <svg:script type="text/javascript" xlink:href="algebra.js"/>
  <svg:g transform="translate(100,60)">
    <xsl:element name="svg:text">
      <xsl:attribute name="id">test</xsl:attribute>
      <xsl:copy-of select="@win"/>
      <xsl:value-of select="concat(@win,' = ?')"/>
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
      
    <svg:rect class="background" height="100" width="150"/>
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
  <svg:g onmousedown="msDown(evt)"
	 top:play="500">
    <xsl:element name="svg:rect">
      <xsl:variable name="len" select="string-length(@value)"/>
      <xsl:attribute name="class">background</xsl:attribute>
      <xsl:attribute name="top:value"><xsl:value-of select="@value"/></xsl:attribute>
      <xsl:attribute name="height">60</xsl:attribute>
      <xsl:attribute name="width"><xsl:value-of select="30+30*$len"/></xsl:attribute>
      <xsl:attribute name="x"><xsl:value-of select="-15*$len"/></xsl:attribute>
    </xsl:element>
    <xsl:element name="svg:text">
      <xsl:attribute name="transform">translate(15,45)</xsl:attribute>
      <xsl:value-of select="@value"/>
    </xsl:element>
  </svg:g>
</xsl:template>

<!-- TouchOp MUSIC DOMAIN -->
<!-- Special operators for the music domain -->

<!-- construct the test for the music domain -->
<xsl:template match="test[@domain='music']">
  <xsl:comment>Play the reference sound for music problem set</xsl:comment>
  <svg:script type="text/javascript" xlink:href="music.js"/>
</xsl:template>

<!-- fast play -->
<xsl:template match="op[@name='fast']">
  <xsl:comment>Fast play operator</xsl:comment>
  <svg:g onmousedown="msDown(evt)"
	 top:filter="speed(0.5,#)"
	 top:padding="10"
	 top:priority="200"
	 transform="scale(0.5,1.0)"
	 top:layout="horizontalLayout(obj)">
    
    <svg:rect class="background" height="60" width="100"/>
    <svg:text>Fast</svg:text>
    <xsl:call-template name="operand"/>
    <xsl:call-template name="operand"/>
  </svg:g>
</xsl:template>

<!-- Linked play -->
<xsl:template match="op[@name='link']">
  <xsl:comment>Linked play operator</xsl:comment>
  <svg:g onmousedown="msDown(evt)"
	 top:priority="100"
	 top:padding="10"
	 top:layout="horizontalLayout(obj)">

    <svg:rect class="background" height="60" width="100"/>
    <xsl:call-template name="multiop">
      <xsl:with-param name="count" select="@count"/>
    </xsl:call-template>
  </svg:g>
</xsl:template>

<!-- Pitch -->
<xsl:template match="op[@name='pitch']">
  <svg:g onmousedown="msDown(evt)"
	 top:padding="10"
	 top:layout="verticalLayout(obj)">

    <svg:rect class="background" height="60" width="60"/>
    <svg:text>Pitch</svg:text>
    <xsl:call-template name="operand"/>
  </svg:g>
</xsl:template>

<!-- Repeated play -->
<xsl:template match="op[@name='repeat']">
  <svg:g onmousedown="msDown(evt)"
	 top:filter="repeat(3,#)"
	 top:padding="10"
	 top:layout="verticalLayout(obj)">

    <svg:rect class="background" height="60" width="60"/>
    <svg:text><xsl:value-of select="@times"/>&#215;</svg:text>
    <xsl:call-template name="operand"/>
  </svg:g>
</xsl:template>

<!-- Reverse play -->
<xsl:template match="op[@name='reverse']">
  <svg:g onmousedown="msDown(evt)"
	 top:padding="10"
	 top:filter="reverse(#)"
	 top:layout="verticalLayout(obj)">

    <svg:rect class="background" height="60" width="60"/>
    <svg:text>Reverse</svg:text>
    <xsl:call-template name="operand"/>
  </svg:g>
</xsl:template>

</xsl:stylesheet>


