"""Read a MusicXML file (.mxl or .musicxml) written by notation software and make it fit the course:
a plain two-staff piano score with a proper title, composer and licence note.

- Scores with more than two staves (some exports keep empty staves) are reduced to the two that hold notes.
- Titles, credits and page layout from the original are replaced; fingering, ties, slurs and dynamics are kept.
"""
import re, zipfile
import xml.etree.ElementTree as ET


def read_root(path):
    if path.lower().endswith('.mxl'):
        z = zipfile.ZipFile(path)
        inner = re.search(r'full-path="([^"]+)"', z.read('META-INF/container.xml').decode('utf-8'))[1]
        return ET.fromstring(z.read(inner))
    return ET.parse(path).getroot()


def reduce_staves(root):
    """Keep two staves (treble, bass) when the score has more; the music moves to staves 1 and 2."""
    declared = max([int(s.text) for s in root.iter('staves')] + [1])
    used = sorted({int(n.findtext('staff') or 1) for n in root.iter('note') if n.find('pitch') is not None})
    if declared <= 2:
        return
    keep = used[:2]
    new = {old: i + 1 for i, old in enumerate(keep)}
    for part in root.findall('part'):
        for m in part.findall('measure'):
            t, items = 0, []                     # absolute start of every note, following <backup> and <forward>
            for el in list(m):
                if el.tag == 'note':
                    d = int(el.findtext('duration') or 0)
                    chord = el.find('chord') is not None
                    start = items[-1][1] if chord and items else t
                    items.append((el, start, d))
                    if not chord: t += d
                elif el.tag == 'backup': t -= int(el.findtext('duration'))
                elif el.tag == 'forward': t += int(el.findtext('duration'))
            other = [el for el in m if el.tag not in ('note', 'backup', 'forward')]
            for el in list(m): m.remove(el)
            for el in other:
                st = el.find('staff')
                if el.tag == 'direction' and st is not None:
                    if int(st.text) not in new: continue
                    st.text = str(new[int(st.text)])
                if el.tag == 'attributes':
                    for c in el.findall('clef'):
                        n = int(c.get('number', 1))
                        if n in new: c.set('number', str(new[n]))
                        else: el.remove(c)
                    for s in el.findall('staves'): s.text = '2'
                m.append(el)
            groups = {}
            for el, start, d in items:
                s = int(el.findtext('staff') or 1)
                if s in new: groups.setdefault((new[s], el.findtext('voice') or '1'), []).append((el, start, d))
            end = None
            for (s, v), g in sorted(groups.items()):
                if end is not None:
                    b = ET.SubElement(m, 'backup'); ET.SubElement(b, 'duration').text = str(end)
                t = 0
                for el, start, d in g:
                    chord = el.find('chord') is not None
                    if not chord and start > t:
                        f = ET.SubElement(m, 'forward'); ET.SubElement(f, 'duration').text = str(start - t); t = start
                    st = el.find('staff')
                    if st is not None: st.text = str(s)
                    m.append(el)
                    if not chord: t = start + d
                end = t


def tidy(root, title, composer, rights):
    for tag in ('credit', 'defaults', 'movement-title', 'movement-number'):
        for el in root.findall(tag): root.remove(el)
    work = root.find('work')
    if work is None:
        work = ET.Element('work'); root.insert(0, work)
    wt = work.find('work-title')
    if wt is None: wt = ET.SubElement(work, 'work-title')
    wt.text = title
    ident = root.find('identification')
    if ident is None:
        ident = ET.Element('identification'); root.insert(list(root).index(work) + 1, ident)
    for c in ident.findall('creator'): ident.remove(c)
    cr = ET.Element('creator', {'type': 'composer'}); cr.text = composer
    ident.insert(0, cr)
    for r in ident.findall('rights'): ident.remove(r)
    ri = ET.Element('rights'); ri.text = rights
    ident.insert(1, ri)


def convert_mxl(path, title, composer, rights):
    root = read_root(path)
    reduce_staves(root)
    tidy(root, title, composer, rights)
    return '<?xml version="1.0" encoding="UTF-8"?>\n' + ET.tostring(root, encoding='unicode') + '\n'
