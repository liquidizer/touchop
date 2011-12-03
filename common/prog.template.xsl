<?xml version="1.0"?>
<touchop-templates 
   xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
   xmlns:svg="http://www.w3.org/2000/svg"
   xmlns:exsl="http://exslt.org/common"
   xmlns:xs="http://www.w3.org/2001/XMLSchema"
   xmlns:html="http://www.w3.org/1999/xhtml"
   xmlns:xlink="http://www.w3.org/1999/xlink"
   xmlns:top="http://www.dadim.de/touchop"
   version="1.0">

  <root>
    <xsl:stylesheet 
       xmlns:svg="http://www.w3.org/2000/svg"
       version="1.0">
      <xsl:template match="/">
	<top:arg/>
      </xsl:template>
    </xsl:stylesheet>
  </root>

  <xml-node>
    <xsl:element name="top:arg" namespace="http://www.w3.org/2000/svg">
      <top:arg/>
    </xsl:element>
  </xml-node>

  <attribute-node>
    <xsl:attribute name="top:arg">
      <top:arg/>
    </xsl:attribute>
  </attribute-node>

  <assign>
    <xsl:variable name="top:arg">
      <top:arg/>
    </xsl:variable>
  </assign>

  <for-each>
    <xsl:if test="1=1">
      <xsl:variable name="tmp">
	<top:arg/>
      </xsl:variable>
      <xsl:for-each select="exsl:node-set($tmp)/node()" 
		    xmlns:exsl="http://exslt.org/common">
	<top:arg/>
      </xsl:for-each>
    </xsl:if>
  </for-each>
</touchop-templates>
