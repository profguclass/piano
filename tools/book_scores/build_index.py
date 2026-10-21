import json, glob, re, shutil, os, sys
out = 'C:/Users/gcgu/AppData/Local/Temp/claude/C--Users-gcgu-Desktop-Piano/fb07b023-819a-4a26-993c-190ec42729fa/scratchpad/out/'
dest = 'C:/Users/gcgu/Desktop/Piano/harmony-book/'
os.makedirs(dest, exist_ok=True)
cat = []
for f in glob.glob(out + 'catalog_*_*.json'):
    if 'catalog_56_64' in f: continue
    cat += json.load(open(f, encoding='utf-8'))


def chapter_of(fig):
    a, b, c = [int(x) for x in fig.split('.')]
    if a == 1: return 'notation'
    if a == 2: return 'scales'
    if a == 3: return 'minor'
    if a == 4: return 'rhythm'
    if a == 5: return 'intervals'
    if a == 6: return 'triads'
    if a == 7: return 'triadsinkey' if b <= 3 else 'cadences'
    if a == 8: return 'sevenths'
    if a == 9: return 'progressions' if b <= 5 else 'popharmony'
    if a == 10: return 'nonchord'
    if a == 11: return 'melody'
    if a == 12: return 'popforms'
    if a == 13: return 'phrases'
    if a == 14: return 'textures'
    if a == 15: return 'contrast'
    if a == 16: return 'inversions'
    if a in (17, 18): return 'secondary'
    if a == 19: return 'mixture'
    if a in (20, 21): return 'neapolitan'
    if a in (22, 23): return 'modulation'
    if a == 24: return 'binaryternary'
    if a == 25: return 'sonatarondo'
    if a == 26: return 'voiceleading'
    if a in (27, 28, 29): return 'vldetails'
    if a == 30: return 'fugue' if b >= 7 else 'counterpoint'
    if a == 31: return 'jazz'
    if a == 32: return 'impressionism'
    if a == 33: return 'settheory'
    if a == 34: return 'serialism'
    if a == 35: return 'minimalism'
    return None


def clean_caption(c):
    c = re.sub(r'\s+', ' ', c.replace('\u00ad', '')).strip()
    c = c.replace('\ufb01', 'fi').replace('\ufb02', 'fl').replace('\uf0b2', '')
    if not c or c[0].islower() or c.startswith(('However', 'Notice', 'The ', 'This ', 'In ', 'Here')) and ',' not in c[:40]: return ''
    if len(c) > 110:
        c = c[:110].rsplit(' ', 1)[0] + '…'
    return c


index = []
seen = set()
for e in cat:
    if 'fig' not in e or e['fig'].startswith('x') or e['fig'] in seen: continue
    if e['notes'] == 0: continue
    ch = chapter_of(e['fig'])
    if not ch: continue
    seen.add(e['fig'])
    shutil.copyfile(out + 'book/' + e['file'], dest + e['file'])
    index.append(dict(id=e['fig'], ch=ch, cap=clean_caption(e['caption']), f=e['file'], m=e['measures'], bad=e['bad']))
index.sort(key=lambda x: tuple(int(v) for v in x['id'].split('.')))
json.dump(index, open(dest + 'index.json', 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
tm = sum(i['m'] for i in index); tb = sum(i['bad'] for i in index)
print(len(index), 'figures;', tm, 'measures,', tb, 'unverified;', len([i for i in index if i['bad'] == 0]), 'figures fully verified')
import collections
print(collections.Counter(i['ch'] for i in index))
