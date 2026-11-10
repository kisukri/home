import numpy as np, json
from collections import deque
sk = np.load('skel.npy'); H,W = sk.shape
ys,xs = np.nonzero(sk); pts=set(zip(xs.tolist(),ys.tolist()))
arr=np.array(list(pts))
def snap(p):
    i=np.argmin(((arr-np.array(p))**2).sum(1)); return tuple(arr[i].tolist())
def nb(p):
    x,y=p; return [(x+dx,y+dy) for dx in(-1,0,1) for dy in(-1,0,1) if (dx or dy) and (x+dx,y+dy) in pts]
def bfs(a,b):
    prev={a:None}; q=deque([a])
    while q:
        c=q.popleft()
        if c==b: break
        for n in nb(c):
            if n not in prev: prev[n]=c; q.append(n)
    path=[]; c=b
    while c is not None: path.append(c); c=prev[c]
    return path[::-1]
STRAIGHT={((560,580),(640,525),(800,300),(930,120))}
strokes = {
 "s1": [(36,674),(300,725),(560,580),(640,525),(800,300),(930,120),(969,39),(945,118),(940,300),(940,470),(983,734)],
 "s2": [(224,301),(170,400),(300,500),(480,520),(620,515),(800,485),(1100,455),(1135,455),(1150,548),(1135,455),(1150,250),(1215,55),(1265,250),(1160,530),(1145,590),(1240,720),(1340,640),(1406,516),(1365,640),(1430,715),(1505,660),(1526,528),(1515,655),(1590,715),(1700,630),(1770,515),(1830,560),(1740,662),(1820,720),(1962,590)],
}
out={}
for k,wps in strokes.items():
    full=[]
    for a,b in zip(wps,wps[1:]):
        if (a,b) in STRAIGHT:
            A,B=np.array(snap(a),float),np.array(snap(b),float); n=int(np.linalg.norm(B-A))
            seg=[tuple((A+(B-A)*t/n).tolist()) for t in range(n+1)]
        else:
            seg=bfs(snap(a),snap(b))
        full+= seg if not full else seg[1:]
    P=np.array(full,float)
    if k=='s1':
        diag=(P[:,0]>420)&(P[:,0]<880)&(P[:,1]<700)
        hole=diag&(P[:,0]>585)&(P[:,0]<715)
        fit=diag&~hole
        c=np.polyfit(P[fit,0],P[fit,1],3)
        P[hole,1]=np.polyval(c,P[hole,0])
    out[k]=P.tolist()
    print(k,len(full),'px')
json.dump(out,open('strokes.json','w'))
