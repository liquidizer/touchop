all= arith_1.svg arith_2.svg arith_3.svg \
     arith_4.svg arith_5.svg arith_6.svg \
     arith_7.svg arith_8.svg arith_9.svg \
     arith_10.svg arith_11.svg arith_12.svg

.SUFFIXES: .xml .svg

ALL: $(all)

.xml.svg: touchop.xsl
	xsltproc touchop.xsl $< >$@
# | tidy -q -i -xml -utf8 > $@

clean:
	rm $(all) *~