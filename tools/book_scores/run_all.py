import sys, os, json, re, traceback
sys.path.insert(0,'.')
import fitz, omr, omr3, omr4, omr5
d=fitz.open('C:/Users/gcgu/Desktop/Piano/Music Theory/MusicTheory-Sep-2025.pdf')
a,b=int(sys.argv[1]),int(sys.argv[2])
os.makedirs('../out/book',exist_ok=True)
catalog=[]
def find_caps(p):
    caps=[]
    for t in p.texts:
        if t['t'].strip() in ('Figure','Table'):
            same=sorted([u for u in p.texts if abs(u['y']-t['y'])<1.5 and u['x']>=t['x']],key=lambda u:u['x'])
            m=re.match(r'\d+\.\d+\.\d+',same[1]['t'].strip()) if len(same)>1 else None
            if not m: continue
            line=' '.join(u['t'] for u in same[2:])
            nxt=sorted([u for u in p.texts if 6<u['y']-t['y']<16 and u['x']>=t['x']-2 and u['f'].startswith('LMRoman10-Regular')],key=lambda u:u['x'])
            more=' '.join(u['t'] for u in nxt) if nxt and not any('Figure'==u['t'].strip() for u in nxt) else ''
            caps.append((t['y'],m.group(0),re.sub(r'\s+',' ',(line+' '+more)).strip()))
    return sorted(caps)
for pno in range(a,b+1):
    try:
        raw=d[pno-1].get_text('rawdict')
        if not any(s['font']=='Maestro' for bl in raw['blocks'] for l in bl.get('lines',[]) for s in l['spans']): continue
        p=omr.Page(d,pno-1)
        Ss=[S for S in omr3.read_page(p) if S['chords'] or S['rests']]
        if not Ss: continue
        syss=omr4.group_systems(Ss)
        caps=find_caps(p)
        groups={}
        for sy in syss:
            bottom=max(S['st']['bottom'] for S in sy)
            cap=next((c for c in caps if c[0]>bottom-2),None)
            key=cap[1] if cap else 'x%d'%pno
            groups.setdefault(key,dict(cap=cap,systems=[]))['systems'].append(sy)
        for key,g in groups.items():
            xml,rep=omr5.figure_xml(key,g['systems'],p)
            fn='fig-%s.musicxml'%key if not key.startswith('x') else 'ex-p%d-%d.musicxml'%(pno,len(catalog))
            open('../out/book/'+fn,'w',encoding='utf-8').write(xml)
            catalog.append(dict(file=fn,page=pno,fig=key,caption=g['cap'][2] if g['cap'] else '',systems=len(g['systems']),**rep))
    except Exception as e:
        catalog.append(dict(page=pno,error=repr(e)))
json.dump(catalog,open('../out/catalog_%d_%d.json'%(a,b),'w',encoding='utf-8'),ensure_ascii=False,indent=0)
print('done',a,b,len(catalog))
