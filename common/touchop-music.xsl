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

<xsl:import href="touchop.xsl"/>

<!-- TOUCHOP - MUSICAL SCORE DOMAIN -->
<!-- Special musical score setting -->
<xsl:template match="test">
  <svg:script type="text/javascript" xlink:href="../../common/music.js"/>
</xsl:template>

<xsl:template match="note">
  <xsl:element name="svg:g">
    <xsl:attribute name="onmousedown">msDown(evt, true)</xsl:attribute>
    <svg:circle cx="0" cy="0" r="20" 
		opacity="0.01"
		class="background"/>
    <svg:text y="5" x="-7" transform="scale(2)"
	      pointer-events="none">&#x266A;</svg:text>
  </xsl:element>
</xsl:template>

<!-- Drop area for musical notes -->
<xsl:template match="treble-clef">
  <svg:g id="treble-clef">
    <xsl:call-template name="note-line">
      <xsl:with-param name="y" select="15"/>
      <xsl:with-param name="count" select="3"/>
    </xsl:call-template>
    <xsl:call-template name="v-notes">
      <xsl:with-param name="x" select="0"/>
      <xsl:with-param name="count" select="@len"/>
    </xsl:call-template>
  </svg:g>
</xsl:template>

<xsl:template name="v-notes">
  <xsl:param name="x"/>
  <xsl:param name="count"/>
  <xsl:if test="$count>0">
    <svg:g top:name="sample">
      <xsl:call-template name="h-notes">
	<xsl:with-param name="x" select="$x"/>
	<xsl:with-param name="y" select="0"/>
	<xsl:with-param name="count" select="7"/>
      </xsl:call-template>
    </svg:g>
    <xsl:call-template name="v-notes">
      <xsl:with-param name="x" select="$x+50"/>
      <xsl:with-param name="count" select="$count - 1"/>
    </xsl:call-template>
  </xsl:if>
</xsl:template>

<xsl:template name="h-notes">
  <xsl:param name="x"/>
  <xsl:param name="y"/>
  <xsl:param name="count"/>
  <xsl:if test="$count>0">
    <xsl:element name="svg:g">
      <xsl:attribute name="transform">
	<xsl:value-of select="concat('translate(',$x,',',$y,')')"/>
      </xsl:attribute>
      <svg:g top:layout="snapNote(obj)" class="operand">
	<svg:rect height="10" width="50" rx="5" ry="5" 
		  class="background"
		  opacity="0.1"/>
      </svg:g>
    </xsl:element>
    <xsl:call-template name="h-notes">
      <xsl:with-param name="x" select="$x"/>
      <xsl:with-param name="y" select="$y+10"/>
      <xsl:with-param name="count" select="$count - 1"/>
    </xsl:call-template>
  </xsl:if>
</xsl:template>

<xsl:template name="note-line">
  <xsl:param name="count"/>
  <xsl:param name="y"/>
  <xsl:if test="$count>0">
    <xsl:element name="svg:rect">
      <xsl:attribute name="class">canvas</xsl:attribute>
      <xsl:attribute name="width"><xsl:value-of select="@len * 50"/></xsl:attribute>
      <xsl:attribute name="height">1</xsl:attribute>
      <xsl:attribute name="y"><xsl:value-of select="$y"/></xsl:attribute>
    </xsl:element>
    <xsl:call-template name="note-line">
      <xsl:with-param name="y" select="$y+20"/>
      <xsl:with-param name="count" select="$count - 1"/>
    </xsl:call-template>
  </xsl:if>
</xsl:template>
</xsl:stylesheet>
