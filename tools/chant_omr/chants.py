# (page index, staff index, title, slug) : each chant runs to the next marker. None title = skip.
M = """
31 0 - -
32 0 Victimae Paschali|victimae-paschali
34 0 Tantum Ergo (Mode II)|tantum-ergo-mode-2
35 0 Tantum Ergo (Mode III)|tantum-ergo-mode-3
36 3 Gloria Patri (Mode IV)|gloria-patri-mode-4
37 0 Tantum Ergo (Mode V)|tantum-ergo-mode-5
38 0 Ave Verum Corpus|ave-verum-corpus
39 0 Panis Angelicus|panis-angelicus
40 0 Pacificus Vocabitur|pacificus
40 2 - -
41 0 O Filii et Filiae|o-filii-et-filiae
46 0 Ave Maria|ave-maria
47 0 Asperges Me|asperges-me
48 0 Vidi Aquam|vidi-aquam
50 0 Mass I Lux et origo: Kyrie|mass-1-kyrie
50 3 Mass I Lux et origo: Gloria|mass-1-gloria
52 0 Mass I Lux et origo: Sanctus|mass-1-sanctus
52 4 Mass I Lux et origo: Agnus Dei|mass-1-agnus-dei
53 0 Mass II Kyrie fons bonitatis: Kyrie|mass-2-kyrie
53 4 Mass II Kyrie fons bonitatis: Gloria|mass-2-gloria
55 4 Mass II Kyrie fons bonitatis: Sanctus|mass-2-sanctus
56 1 Mass II Kyrie fons bonitatis: Agnus Dei|mass-2-agnus-dei
56 6 Mass VIII De Angelis: Kyrie|mass-8-kyrie
57 3 Mass VIII De Angelis: Gloria|mass-8-gloria
59 1 Mass VIII De Angelis: Sanctus|mass-8-sanctus
59 6 Mass VIII De Angelis: Agnus Dei|mass-8-agnus-dei
60 2 Mass IX Cum jubilo: Kyrie|mass-9-kyrie
61 0 Mass IX Cum jubilo: Gloria|mass-9-gloria
62 6 Mass IX Cum jubilo: Sanctus|mass-9-sanctus
63 3 Mass IX Cum jubilo: Agnus Dei|mass-9-agnus-dei
64 0 Mass X Alme Pater: Kyrie|mass-10-kyrie
64 5 Mass X Alme Pater: Gloria|mass-10-gloria
66 2 Mass X Alme Pater: Sanctus|mass-10-sanctus
66 6 Mass X Alme Pater: Agnus Dei|mass-10-agnus-dei
67 2 Mass XI Orbis factor: Kyrie|mass-11-kyrie
67 5 Mass XI Orbis factor: Gloria|mass-11-gloria
69 4 Mass XI Orbis factor: Sanctus|mass-11-sanctus
70 0 Mass XI Orbis factor: Agnus Dei|mass-11-agnus-dei
70 4 Mass XVII: Kyrie|mass-17-kyrie
70 7 Mass XVII: Sanctus|mass-17-sanctus
71 4 Mass XVII: Agnus Dei|mass-17-agnus-dei
72 0 Credo I|credo-1
75 3 Credo III|credo-3
78 5 Responses at High Mass|responses-high-mass
79 0 At the Gospel|at-the-gospel
79 2 At the Preface (solemn tone)|preface-solemn
79 6 At the Preface (simple tone)|preface-simple
80 3 At the Pater Noster|pater-noster
80 5 Before the Agnus Dei|before-agnus-dei
81 0 At the Pontifical Blessing|pontifical-blessing
81 5 Ite missa est (Eastertide)|ite-eastertide
81 6 Ite missa est (Solemn feasts)|ite-solemn
82 0 Ite missa est (Feasts of the Blessed Virgin)|ite-blessed-virgin
82 2 Ite missa est (Sundays)|ite-sundays
82 4 Ite missa est (Simple feasts)|ite-simple
82 5 Gloria (Ambrosian)|gloria-ambrosian
84 5 Requiem Mass: Introit|requiem-introit
85 2 Requiem Mass: Kyrie|requiem-kyrie
85 4 Dies irae (Sequence)|dies-irae
88 3 Requiem Mass: Offertory (Domine Jesu Christe)|requiem-offertory
90 0 Requiem Mass: Sanctus|requiem-sanctus
90 4 Requiem Mass: Agnus Dei|requiem-agnus-dei
91 1 Requiem Mass: Communion (Lux aeterna)|requiem-communion
91 6 Absolution after Mass (Libera me)|libera-me
93 1 Rorate Caeli (Introit)|rorate-caeli-introit
95 0 Rorate Caeli (Hymn)|rorate-caeli-hymn
98 0 Puer Natus in Bethlehem|puer-natus
99 0 Puer Nobis Nascitur|puer-nobis-nascitur
100 0 Dominus Dixit ad Me|dominus-dixit
100 2 Hodie Christus Natus Est|hodie-christus
101 1 Quem Vidistis|quem-vidistis
101 4 O Admirabile Commercium|o-admirabile-commercium
103 0 Attende Domine|attende-domine
104 0 Stabat Mater|stabat-mater
105 0 Pueri Hebraeorum (antiphon)|pueri-hebraeorum-1
106 0 Pueri Hebraeorum (distribution of palms)|pueri-hebraeorum-2
107 0 Gloria, Laus et Honor|gloria-laus-et-honor
108 2 Crucem Tuam Adoramus|crucem-tuam
110 0 Vexilla Regis|vexilla-regis
112 0 O Vos Omnes|o-vos-omnes
112 2 Vespere Autem Sabbati|vespere-autem-sabbati
113 0 Pascha Nostrum|pascha-nostrum
113 4 Surrexit Dominus Vere|surrexit-dominus-vere
113 5 Regina Caeli|regina-caeli
114 2 Viri Galilaei|viri-galilaei
114 4 Repleti Sunt|repleti-sunt
115 0 Veni Sancte Spiritus|veni-sancte-spiritus
117 0 Veni Creator Spiritus|veni-creator-spiritus
119 0 O Sacrum Convivium|o-sacrum-convivium
120 0 Adoro Te Devote|adoro-te-devote
122 0 Ecce Panis Angelorum|ecce-panis-angelorum
124 0 Pange Lingua|pange-lingua
126 0 O Salutaris Hostia (1)|o-salutaris-1
126 3 O Salutaris Hostia (2)|o-salutaris-2
126 5 O Salutaris Hostia (3)|o-salutaris-3
127 2 O Salutaris Hostia (4)|o-salutaris-4
127 5 Tantum Ergo|tantum-ergo
128 3 Salva Nos|salva-nos
129 0 Sancti Angeli|sancti-angeli
129 2 Beati Mundo|beati-mundo
130 3 O Quam Gloriosum Est Regnum|o-quam-gloriosum
131 0 Creator Alme Siderum|creator-alme-siderum
132 0 Jesu Dulcis Memoria|jesu-dulcis-memoria
133 0 Te Joseph Celebrent|te-joseph-celebrent
134 0 Beata Mater|beata-mater
135 0 Alma Redemptoris|alma-redemptoris
136 1 Ave Regina Caelorum|ave-regina-caelorum
137 0 Salve Regina|salve-regina
138 0 Ave Maris Stella|ave-maris-stella
139 0 Salve Mater|salve-mater
999 0 - -
"""
def markers():
    out = []
    for line in M.strip().splitlines():
        a = line.split(' ', 2)
        pg, si, rest = int(a[0]), int(a[1]), a[2]
        if rest.strip() == '- -': out.append((pg, si, None, None))
        else:
            t, slug = rest.rsplit('|', 1); out.append((pg, si, t, slug))
    return out
