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

<!-- TOUCHOP - PROGRAMMING DOMAIN -->
<!-- Special operators for programming -->
<xsl:template match="test[@domain='prog']">
  <xsl:comment>Programming domain</xsl:comment>
  <svg:script type="text/javascript" xlink:href="../../common/prog.ui.js"/>
  <svg:script type="text/javascript" xlink:href="../../common/prog.run.js"/>
  <defs>
    <svg:g id="expand-minus">
      <svg:rect width="40" height="40" opacity="0.01" fill="white"/>
      <svg:path class="move"
		d="M 20,0 C 8.96,0 0,8.96 0,20 C 0,31.04 8.96,40 20,40 C 31,40 40,31 40,20 C 40,9 31,0 20,0 z M 7,17 L 33,17 L 33,23 L 7,23 L 7,17 z"/>
    </svg:g>
    <svg:g id="expand-plus">
      <svg:rect width="40" height="40" opacity="0.01" fill="white"/>
      <svg:path	class="move"
		d="M 20 0 C 9 0 0 9 0 20 C 0 31 9 40 20 40 C 31.04 40 40 31.04 40 20 C 40 9 31 0 20 0 z M 17 7 L 23 7 L 23 17 L 33 17 L 33 23 L 23 23 L 23 33 L 17 33 L 17 23 L 7 23 L 7 17 L 17 17 L 17 7 z"/>
    </svg:g>
  </defs>
</xsl:template>

<!-- text input field -->
<xsl:template name="textInput">
  <xsl:param name="editable" select="@editable"/>
  <svg:foreignObject width="100" height="35">
    <xsl:element name="html:input">
      <xsl:attribute name="type">text</xsl:attribute>
      <xsl:attribute name="style">width:95px;height:28px</xsl:attribute>
      <xsl:attribute name="onkeypress">navigation(event)</xsl:attribute>
      <xsl:attribute name="placeholder">
	<xsl:value-of select="$editable"/>
      </xsl:attribute>
    </xsl:element>
  </svg:foreignObject>
</xsl:template>

<!-- XSL language operands -->
<xsl:template name="editOperand">
  <xsl:param name="editable" select="@editable"/>
  <svg:g top:layout="snap(obj)" class="operand">
    <xsl:if test="$editable">
      <svg:g class="background">
	<xsl:call-template name="textInput">
	  <xsl:with-param name="editable" select="$editable"/>
	</xsl:call-template>
      </svg:g>
    </xsl:if>
    <xsl:if test="not($editable)">
      <svg:rect height="30" width="60" rx="5" ry="5" class="background"/>
    </xsl:if>
    <xsl:apply-templates/>
  </svg:g>
</xsl:template>

<!-- xml node -->
<xsl:template match="xml-node">
  <svg:g onmousedown="msDown(evt)"
	 class="prog xml"
	 top:padding="3"
	 top:run="createXmlNode(prog)"
	 top:layout="verticalLayout(obj)">

    <!-- background image -->
    <svg:rect rx="5" ry="5" class="background"/>

    <!-- xml node name -->
    <svg:g top:layout="horizontalLayout(obj)" class="prog xml">
      <svg:rect class="background" display="none"/>
      <svg:text>&lt;XML:</svg:text>
      <xsl:call-template name="textInput">
	<xsl:with-param name="editable" select="'nodeName'"/>
      </xsl:call-template>
      <svg:text>&gt;</svg:text>
    </svg:g>

    <!-- child node hook -->
    <svg:g transform="scale(0.81)">
      <xsl:call-template name="editOperand">
	<xsl:with-param name="editable" select="'value'"/>
      </xsl:call-template>
    </svg:g>
  </svg:g>
</xsl:template>

<!-- buttons for expandable content -->
<xsl:template name="expand-button">
  <svg:g>
    <svg:use xlink:href="#expand-plus" 
	     top:click="expand_add(evt)"/>
    <svg:use transform="translate(60,0)"
	     xlink:href="#expand-minus" 
	     top:click="expand_remove(evt)"/>
  </svg:g>
</xsl:template>

<!-- xml node sequence -->
<xsl:template match="list">
  <svg:g onmousedown="msDown(evt)"
	 class="prog list"
	 top:padding="3"
	 top:run="createXmlNode(prog)"
	 top:layout="verticalLayout(obj)">

    <!-- child element prototype -->
    <svg:g display="none" top:content="true">
      <xsl:call-template name="editOperand">
	<xsl:with-param name="editable" select="'value'"/>
      </xsl:call-template>
    </svg:g>

    <!-- content -->
    <svg:rect rx="5" ry="5" class="background"/>
    <svg:text>List</svg:text>
    <xsl:call-template name="expand-button"/>
  </svg:g>
</xsl:template>

<!-- xml attribute -->
<xsl:template match="xml-attribute">
  <svg:g onmousedown="msDown(evt)"
	 class="prog attrs"
	 top:padding="3"
	 top:layout="verticalLayout(obj)">

    <!-- background image -->
    <svg:rect class="background" rx="5" ry="5"/>
    <svg:text>Attributes</svg:text>

    <!-- attribute prototype -->
    <svg:g display="none" top:content="true">
      <svg:g top:layout="horizontalLayout(obj)" class="program">
	<svg:rect class="background" display="none"/>
	<xsl:call-template name="textInput">
	  <xsl:with-param name="editable" select="'attribute'"/>
	</xsl:call-template>
	<svg:text>:</svg:text>
	<xsl:call-template name="editOperand">
	  <xsl:with-param name="editable" select="'value'"/>
	</xsl:call-template>
      </svg:g>
    </svg:g>

    <!-- expand arrow -->
    <xsl:call-template name="expand-button"/>
  </svg:g>
</xsl:template>


<xsl:template match="if-then">
  <svg:g onmousedown="msDown(evt)"
	 class="prog if"
	 top:padding="3"
	 top:layout="verticalLayout(obj)">

    <!-- background image -->
    <svg:rect class="background" rx="5" ry="5"/>

    <!-- condition -->
    <svg:g top:layout="horizontalLayout(obj)" class="program">
      <svg:rect class="background" display="none"/>
      <svg:text>if</svg:text>
      <xsl:call-template name="editOperand">
	<xsl:with-param name="editable" select="'condition'"/>
      </xsl:call-template>
    </svg:g>

    <!-- true and false paths -->
    <svg:g top:layout="horizontalLayout(obj)" class="program">
      <svg:rect class="background" display="none"/>
      <xsl:call-template name="editOperand">
	<xsl:with-param name="editable" select="'true'"/>
      </xsl:call-template>
      <svg:text>else</svg:text>
      <xsl:call-template name="editOperand">
	<xsl:with-param name="editable" select="'false'"/>
      </xsl:call-template>
    </svg:g>
  </svg:g>    
</xsl:template>

<xsl:template match="assign-var">
  <svg:g onmousedown="msDown(evt)"
	 class="prog assign"
	 top:padding="3"
	 top:layout="verticalLayout(obj)">

    <!-- background image -->
    <svg:rect class="background" rx="5" ry="5"/>

    <!-- variable definition -->
    <svg:g top:layout="horizontalLayout(obj)" class="program">
      <svg:rect class="background" display="none"/>
      <xsl:call-template name="textInput">
	<xsl:with-param name="editable" select="'variable'"/>
      </xsl:call-template>
      <svg:text>=</svg:text>
      <xsl:call-template name="editOperand">
	<xsl:with-param name="editable" select="'value'"/>
      </xsl:call-template>
    </svg:g>    

    <!-- expression with the variable scope -->
    <xsl:call-template name="editOperand">
      <xsl:with-param name="editable" select="'result'"/>
    </xsl:call-template>
  </svg:g>
</xsl:template>

<xsl:template match="for-each">
  <svg:g onmousedown="msDown(evt)"
	 top:padding="3"
	 class="prog loop"
	 top:layout="verticalLayout(obj)">

    <!-- background image -->
    <svg:rect class="background" rx="5" ry="5"/>

    <!-- loop variable and list -->
    <svg:g top:layout="horizontalLayout(obj)" class="program">
      <svg:rect class="background" display="none"/>
      <svg:text>for</svg:text>
      <xsl:call-template name="textInput">
	<xsl:with-param name="editable" select="'variable'"/>
      </xsl:call-template>
      <svg:text>in</svg:text>
      <xsl:call-template name="editOperand">
	<xsl:with-param name="editable" select="'list'"/>
      </xsl:call-template>
      <svg:text>get</svg:text>
    </svg:g>    

    <!-- repeated execution -->
    <svg:g class="program">
      <xsl:call-template name="editOperand">
	<xsl:with-param name="editable" select="'result'"/>
      </xsl:call-template>
    </svg:g>
  </svg:g>
</xsl:template>

<!-- convert xml result to on canvas SVG -->
<xsl:template match="to-svg">
  <svg:g onmousedown="msDown(evt)"
	 class="image"
	 top:padding="10"
	 top:layout="verticalLayout(obj)">

    <!-- background image -->
    <svg:rect class="background" rx="5" ry="5"/>
    <svg:text>Render</svg:text>

    <svg:g top:layout="compileToSVG(obj); horizontalLayout(obj)">
      <svg:rect class="background" display="none"/>
      <!-- program -->
      <svg:g class="program">
	<xsl:call-template name="editOperand"/>
      </svg:g>    
      
      <!-- result area -->
      <svg:g class="canvas">
      </svg:g>
    </svg:g>
  </svg:g>
</xsl:template>

<!-- Clipboard window -->
<xsl:template match="clipboard">
  <svg:g transform="matrix(0.5,0,0,0.5,10,250)"
	 onmousedown="msDown(evt)"
	 top:drop="none">
    <svg:defs>
      <svg:clipPath id="clipboard-frame">
	<svg:use xlink:href="#clipboard-frame-background"/>
      </svg:clipPath>
    </svg:defs>
    <svg:rect width="320" height="220" 
	      x="-10" y="-10" 
	      rx="10" ry="10"
	      class="background"/>

    <svg:g top:onrelease="syncToDB(obj)"
	   id="clipboard"
	   class="container operand"
	   clip-path="url(#clipboard-frame)">
	<svg:rect id="clipboard-frame-background"
		  width="300" height="200" class="background"/>
    </svg:g>
  </svg:g>
</xsl:template>

</xsl:stylesheet>
