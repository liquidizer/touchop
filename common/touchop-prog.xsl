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
    <svg:path id="expand-arrow"
	      d="M 0,0 L 60,0 30,40 Z" 
	      class="move"/>
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
	 class="prog_xml"
	 top:padding="3"
	 top:run="createXmlNode(prog)"
	 top:layout="verticalLayout(obj)">

    <!-- background image -->
    <svg:rect rx="5" ry="5" class="background"/>

    <!-- xml node name -->
    <svg:g top:layout="horizontalLayout(obj)" class="prog_xml">
      <svg:rect class="background" display="none"/>
      <svg:text>&lt;XML:</svg:text>
      <xsl:call-template name="textInput">
	<xsl:with-param name="editable" select="'nodeName'"/>
      </xsl:call-template>
      <svg:text>&gt;</svg:text>
    </svg:g>

    <!-- expandable list of child elements -->
    <svg:g top:layout="expandLayout(obj);verticalLayout(obj)"
	   class="program"
	   transform="scale(0.9)">
      <svg:g display="none" top:content="true">
	<xsl:call-template name="editOperand">
	</xsl:call-template>
      </svg:g>
      <svg:rect rx="5" ry="5" class="background" display="none"/>
      <svg:use xlink:href="#expand-arrow" top:click="expand(evt)"/>
    </svg:g>
  </svg:g>
</xsl:template>

<!-- xml attribute -->
<xsl:template match="xml-attribute">
  <svg:g onmousedown="msDown(evt)"
	 top:padding="3"
	 class="prog_xml"
	 top:layout="horizontalLayout(obj)">

    <!-- background image -->
    <svg:rect class="background" rx="5" ry="5"/>

    <!-- attribute name -->
    <xsl:call-template name="textInput">
      <xsl:with-param name="editable" select="'attribute'"/>
    </xsl:call-template>
    <svg:text>:</svg:text>

    <!-- attribute value -->
    <xsl:call-template name="editOperand">
      <xsl:with-param name="editable" select="'value'"/>
    </xsl:call-template>
  </svg:g>
</xsl:template>


<xsl:template match="if-then">
  <svg:g onmousedown="msDown(evt)"
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
	 class="prog_loop"
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
