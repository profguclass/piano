import sys, omr3, omr
from PIL import Image, ImageDraw, ImageFont
def overlay(page, staves, out, scale=0.75):
    g = omr3.gray(page); st = omr.find_staves(g < 140)
    im = Image.fromarray(g).convert('RGB'); d = ImageDraw.Draw(im)
    try: f = ImageFont.truetype('arial.ttf', 26)
    except Exception: f = None
    for si in staves:
        ev = omr3.staff_events(g, st[si]); sp = ev['sp']
        clef, kf, toks = omr3.tokens(ev)
        ya = int(st[si][0] - 3.2 * sp)
        for a in toks:
            if a[0] == 'n':
                y = ya + ev['yb3'] - (a[1]) * sp / 2
                d.text((a[4] - 8, y - 40), str(int(a[1]) - int(round(clef))) + ('.' if a[2] else '') + ('b' if a[3] else ''), fill=(255, 0, 0), font=f)
            else:
                d.line((a[2], ya + ev['yb3'] - 4 * sp, a[2], ya + ev['yb3'] + 4 * sp), fill=(0, 0, 255), width=3)
    y0 = int(st[staves[0]][0] - 5 * sp); y1 = int(st[staves[-1]][3] + 6 * sp)
    im.crop((0, y0, im.width, y1)).resize((int(im.width * scale), int((y1 - y0) * scale))).save(out)
if __name__ == '__main__':
    overlay(int(sys.argv[1]), [int(x) for x in sys.argv[2].split(',')], sys.argv[3])
