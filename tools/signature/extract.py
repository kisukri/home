import sys
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen
f = TTFont(sys.argv[1])
gs = f.getGlyphSet(); cmap = f.getBestCmap(); hmtx = f['hmtx']
upm = f['head'].unitsPerEm
print('upm', upm, 'has GPOS', 'GPOS' in f, file=sys.stderr)
x = 0; parts=[]
pen = SVGPathPen(gs)
bp = BoundsPen(gs)
for ch in "Alue":
    g = cmap[ord(ch)]
    tp = TransformPen(pen, (1,0,0,-1,x,0))
    gs[g].draw(tp)
    tb = TransformPen(bp, (1,0,0,-1,x,0)); gs[g].draw(tb)
    print(ch, g, hmtx[g], file=sys.stderr)
    x += hmtx[g][0]
d = pen.getCommands()
x0,y0,x1,y1 = bp.bounds
pad=40
vb=f"{x0-pad} {y0-pad} {x1-x0+2*pad} {y1-y0+2*pad}"
open('alue.svg','w').write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}"><path d="{d}" fill="#000"/></svg>')
open('alue-d.txt','w').write(d)
open('vb.txt','w').write(vb)
print(vb, file=sys.stderr)
