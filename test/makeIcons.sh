X= `find -name quest\*xhtml | xargs grep -l canvas | sed -e s/.xhtml//`
for file in $X
do
echo Level $file.xhtml
xsltproc -o $file.svg test/icon.xsl $file.xhtml
convert $file.svg $file.png
rm $file.svg
done
