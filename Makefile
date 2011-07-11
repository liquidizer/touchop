all= arith_1.svg arith_2.svg arith_12.svg

.SUFFIXES: .xml .svg

ALL: $(all)

.xml.svg: touchop.xsl
	xsltproc touchop.xsl $< | tidy -q -i -xml -utf8 > $@

clean:
	rm $(all) *~