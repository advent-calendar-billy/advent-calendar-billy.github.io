// ============================================================
// PROPOSAL DATA — 30 destinations sourced from research
// ============================================================
const PROPOSALS = [
  {
    id: 1,
    name: "Saxon Switzerland",
    country: "Germany",
    days: [3, 4],
    dist: "germany",
    vibes: ["nature", "adventure", "hiking", "spa"],
    subVibes: ["mountains", "hiking", "forests"],
    budget: "comfortable",
    easter: false,
    pitch: "Germany\u2019s most dramatic landscape is just two hours from your door. Towering sandstone pillars, deep gorges, and a historic bridge hovering 194 meters above the Elbe create a hiking experience that feels more like Utah than Saxony.",
    transport: "Direct EC train from Berlin Hbf \u2192 Bad Schandau: ~2 hours. Covered entirely by DB pass.",
    highlights: [
      { icon: "\ud83c\udf09", text: "Bastei Bridge & Schwedenl\u00f6cher Trail \u2014 iconic stone bridge spanning sandstone pillars, 3\u20134h round trip", img: { file: "images/1-saxon-switzerland/inline-bastei-bridge.webp", caption: "Bastei Bridge in Saxon Switzerland", credit: "Flukes69 — CC BY-SA 4.0" } },
      { icon: "\u26f0\ufe0f", text: "Schrammsteine Ridge Hike \u2014 dramatic ridge-top with steel ladder climbs, 4\u20136h", img: { file: "images/1-saxon-switzerland/inline-schrammsteine.webp", caption: "Schrammsteine ridge at sunset", credit: "Jakub Fryš — CC BY-SA 4.0" } },
      { icon: "\ud83e\uddf1", text: "Kuhstall & Himmelsleiter \u2014 largest natural rock arch via the \u201cStairway to Heaven\u201d", img: { file: "images/1-saxon-switzerland/inline-kuhstall.webp", caption: "Kuhstall natural rock arch", credit: "Dirk Schmidt (Celsius auf Wikivoyage) — CC BY-SA 3.0" } },
      { icon: "\ud83d\uddbc\ufe0f", text: "Malerweg Stage 4 \u2014 Germany\u2019s most famous hiking trail through Schrammsteine (~14 km)" },
      { icon: "🚋", text: "Kirnitzschtalbahn — the world's only tram that enters a national park, running since 1898, 8 km of electric rails drifting through sandstone gorges to Lichtenhainer Waterfall", hidden: true, img: { file: "images/1-saxon-switzerland/inline-kirnitzschtalbahn.webp", caption: "The Kirnitzschtalbahn tram in Saxon Switzerland", credit: "Rigorius — CC BY-SA 4.0" } },
      { icon: "⛰️", text: "Pfaffenstein & the Barbarine — 'Saxon Switzerland in miniature' table mountain crowned by a 43 m free-standing rock pinnacle, the park's actual emblem", hidden: true, img: { file: "images/1-saxon-switzerland/inline-barbarine.webp", caption: "The Barbarine rock pinnacle on Pfaffenstein", credit: "Norbert Kaiser — CC BY-SA 3.0" } },
      { icon: "🛶", text: "Obere Schleuse punt boats at Hinterhermsdorf — 20-minute gondola trip through the Kirnitzschklamm gorge, running since 1879, Easter to Oct 31 only", hidden: true }
    ],
    hotel: "Parkhotel Bad Schandau \u2014 historic Elbe-side hotel with spa & river views. ~\u20ac107\u2013168/night",
    pastry: "B\u00e4ckerei Caf\u00e9 Schurz for Baumkuchenspitzen; Caf\u00e9 Drehscheibe for \u201cbest coffee in Bad Schandau\u201d",
    japanese: "Dresden (30 min by S-Bahn): Hiroshi Sushi & Ramen \u2014 rated 4.7/5, tonkotsu ramen \u20ac14.90\u201317.90",
    bestTime: "Himmelfahrt weekend, May 14\u201317. Perfect hiking weather (15\u201322\u00b0C), trails are green.",
    budgetTable: [
      ["Hotel (3 nights)", "\u20ac320\u2013500"],
      ["Food & coffee", "\u20ac105\u2013180"],
      ["Activities", "\u20ac30\u201350"],
      ["Dresden day trip", "\u20ac40\u201360"],
      ["Total", "\u20ac500\u2013620"]
    ],
    vibeTags: ["\ud83e\uddf3 nature", "\ud83c\udfd4\ufe0f adventure", "\ud83c\udf3f hiking", "\ud83e\uddd8 spa"]
  },
  {
    id: 2,
    name: "Bamberg",
    country: "Germany",
    days: [3, 4],
    dist: "germany",
    vibes: ["cozy", "foodie", "culture", "history"],
    subVibes: ["medieval", "drinks", "foodie", "cozy"],
    budget: "comfortable",
    easter: false,
    pitch: "A UNESCO-listed medieval city built on seven hills, where the town hall sits on an island in the river, fishermen\u2019s houses line the water like a Franconian Venice, and the local obsession is a smoky beer you can\u2019t get anywhere else on Earth.",
    transport: "Direct ICE from Berlin Hbf \u2192 Bamberg: ~2.5\u20133 hours. Covered by DB pass.",
    highlights: [
      { icon: "\ud83c\udf7a", text: "Schlenkerla \u2014 legendary Rauchbier brewpub since 1405 with beechwood-smoked malt beer", img: { file: "images/2-bamberg/inline-schlenkerla.webp", caption: "Schlenkerla Rauchbier brewpub", credit: "ermell — CC BY-SA 4.0" } },
      { icon: "\ud83c\udfe4", text: "Altes Rathaus \u2014 baroque town hall on a bridge with 3D trompe-l\u2019oeil frescoes", img: { file: "images/2-bamberg/inline-altes-rathaus.webp", caption: "Altes Rathaus on the Regnitz", credit: "Berthold Werner — Public domain" } },
      { icon: "\u26ea", text: "Bamberg Cathedral & Rose Garden \u2014 Romanesque-Gothic cathedral with panoramic rooftop views", img: { file: "images/2-bamberg/inline-bamberg-cathedral.webp", caption: "Bamberg Cathedral", credit: "Berthold Werner — Public domain" } },
      { icon: "\ud83c\udfe0", text: "Klein-Venedig \u2014 picture-perfect half-timbered houses along the Regnitz at sunset", img: { file: "images/2-bamberg/inline-klein-venedig.webp", caption: "Klein-Venedig (Little Venice) on the Regnitz", credit: "MaxEmanuel — CC0" } },
      { icon: "🍺", text: "Brauerei Spezial — Bamberg's other Rauchbier brewery, malting its own beechwood-smoked grain since 1536, subtler and more drinkable than Schlenkerla's assertive smoke", hidden: true, img: { file: "images/2-bamberg/inline-brauerei-spezial.webp", caption: "Brauerei Spezial in Bamberg", credit: "calflier001 — CC BY-SA 2.0" } },
      { icon: "📖", text: "E.T.A. Hoffmann Haus — the tiny house where the fantasist wrote The Sandman (1808–13), preserved with his writing desk, manuscripts and pop-culture ghost-lore", hidden: true },
      { icon: "🌳", text: "Spezial-Keller beer garden on the Stephansberg — maple-shaded terrace 23 m above its cellar, with the postcard skyline view of Altes Rathaus locals actually use", hidden: true }
    ],
    hotel: "Hotel Nepomuk \u2014 boutique hotel in converted mill on the Regnitz. ~\u20ac100\u2013140/night",
    pastry: "B\u00e4ckerei Seel (since 1427!) for Bamberger H\u00f6rnla; Graupner for macarons; Caf\u00e9 Zuckerst\u00fcck for specialty coffee",
    japanese: "Misako \u2014 fresh sushi, ramen & Japanese desserts. Also KADO-YA and ichi-san.",
    bestTime: "Labour Day weekend, May 1\u20133. Beer gardens opening, calm before school holidays.",
    budgetTable: [
      ["Hotel (3 nights)", "\u20ac190\u2013420"],
      ["Food & beer & coffee", "\u20ac90\u2013160"],
      ["Activities", "\u20ac20\u201340"],
      ["Total", "\u20ac400\u2013590"]
    ],
    vibeTags: ["\ud83c\udfe0 cozy", "\ud83c\udf7a foodie", "\ud83c\udfdb\ufe0f culture", "\ud83d\udcdc history"]
  },
  {
    id: 3,
    name: "T\u00fcbingen",
    country: "Germany",
    days: [4],
    dist: "germany",
    vibes: ["cozy", "nature", "culture", "history"],
    subVibes: ["literary", "university", "lakeside", "cozy"],
    budget: "comfortable",
    easter: true,
    pitch: "Germany\u2019s most charming university town \u2014 where the Neckar River winds beneath candy-colored houses, students punt flat-bottomed boats, and one museum holds the oldest figurative art ever created by humans (40,000-year-old ivory carvings).",
    transport: "ICE to Stuttgart, then regional train: ~6\u20136.5 hours total. Covered by DB pass.",
    highlights: [
      { icon: "\ud83d\udea3", text: "Stocherkahn punting on the Neckar \u2014 glide past the iconic Neckarfront", img: { file: "images/3-tubingen/inline-stocherkahn.webp", caption: "Stocherkahn punting boats on the Neckar", credit: "User:MBe57 — CC BY-SA 4.0" } },
      { icon: "\ud83c\udfdb\ufe0f", text: "Museum Alte Kulturen \u2014 40,000-year-old ivory figurines, oldest art in human history" },
      { icon: "\ud83d\udcda", text: "H\u00f6lderlinturm \u2014 the medieval tower where the poet spent his last 36 years", img: { file: "images/3-tubingen/inline-hoelderlinturm.webp", caption: "Hölderlinturm on the Neckar", credit: "Roman Eisele — CC BY-SA 4.0" } },
      { icon: "\u26f0\ufe0f", text: "Wurmlinger Chapel Hike \u2014 hilltop chapel with panoramic Neckar valley views" },
      { icon: "📚", text: "Hesse-Kabinett at Antiquariat Heckenhauer — the Holzmarkt bookshop where Hermann Hesse apprenticed 1895–99, preserved as a mini-museum inside a working antiquarian", hidden: true },
      { icon: "⛪", text: "Kloster Bebenhausen — a near-perfectly preserved 1183 Cistercian monastery + Württemberg royal hunting palace, 7 km north in the Schönbuch forest (€2.30 bus, 15 min)", hidden: true, img: { file: "images/3-tubingen/inline-bebenhausen.webp", caption: "Kloster Bebenhausen monastery", credit: "Roman Eisele — CC BY-SA 4.0" } },
      { icon: "🌅", text: "Österberg vineyard path — 10-minute climb through old vines to a silent terrace view of the Stiftskirche spire and red roofs, the locals' sunset alternative to Schloss Hohentübingen", hidden: true }
    ],
    hotel: "Hotel Domizil \u2014 Neckar riverbank, rated 9.4 on Expedia. ~\u20ac110\u2013150/night",
    pastry: "SUEDHANG Kaffee \u2014 specialty roastery, \u201cbest coffee in T\u00fcbingen\u201d; Kaffeehaus Ranitzky for cakes on the market square",
    japanese: "KADO-YA for sushi & live cooking; Tatami Restaurant & Caf\u00e9 for daily ramen (vegan + meat)",
    bestTime: "Pfingsten weekend, May 23\u201325. Warm days, perfect for punting.",
    budgetTable: [
      ["Hotel (3 nights)", "\u20ac330\u2013480"],
      ["Food & coffee", "\u20ac90\u2013160"],
      ["Activities", "\u20ac25\u201345"],
      ["Total", "\u20ac475\u2013625"]
    ],
    vibeTags: ["\ud83c\udf93 university town", "\ud83d\udcda literary", "\ud83c\udf3f nature", "\ud83c\udfe0 cozy"]
  },
  {
    id: 4,
    name: "Erfurt",
    country: "Germany",
    days: [3, 4],
    dist: "germany",
    vibes: ["culture", "history", "foodie", "cozy"],
    subVibes: ["medieval", "history", "sweets", "chocolate"],
    budget: "lean",
    easter: false,
    pitch: "Germany\u2019s best-kept medieval secret \u2014 a compact old town with Europe\u2019s longest inhabited bridge, a recently UNESCO-listed Jewish heritage site, and a bean-to-bar chocolatier so good it\u2019ll ruin you for supermarket chocolate. 90 minutes from Berlin.",
    transport: "Direct ICE from Berlin Hbf \u2192 Erfurt: ~1.5 hours. Fastest getaway on the list. Covered by DB pass.",
    highlights: [
      { icon: "\u2721\ufe0f", text: "Alte Synagoge & Mikveh (UNESCO 2023) \u2014 oldest preserved synagogue in Europe with gold treasure", img: { file: "images/4-erfurt/inline-alte-synagoge.webp", caption: "Alte Synagoge Erfurt — oldest in Europe", credit: "Heinrich Stürzl — CC BY-SA 4.0" } },
      { icon: "\ud83c\udf09", text: "Kr\u00e4merbr\u00fccke \u2014 longest inhabited bridge in Europe since 1325, lined with artisan shops", img: { file: "images/4-erfurt/inline-kraemerbruecke.webp", caption: "Krämerbrücke inhabited medieval bridge", credit: "H. Zell — CC BY-SA 3.0" } },
      { icon: "\ud83c\udf6b", text: "Goldhelm Schokoladenmanufaktur \u2014 bean-to-bar chocolate with tasting events" },
      { icon: "\ud83d\ude82", text: "Day trip to Weimar (15 min!) \u2014 Bauhaus Museum, Goethe\u2019s house, Duchess Anna Amalia Library", img: { file: "images/4-erfurt/inline-weimar-library.webp", caption: "Duchess Anna Amalia Library, Weimar", credit: "Steffen Schmitz (more photos) — CC BY-SA 4.0" } },
      { icon: "🔦", text: "Petersberg Citadel listening tunnels — torchlight tour down 40 stone steps into baroque counter-mine passages where soldiers once listened for enemy digging", hidden: true, img: { file: "images/4-erfurt/inline-petersberg.webp", caption: "Petersberg Citadel — Bastion Leonhard, Erfurt", credit: "H. Zell — CC BY-SA 3.0" } },
      { icon: "🙏", text: "Augustinerkloster — Martin Luther's preserved 1505 monastic cell + 60,000-volume Reformation library, quiet working Lutheran cloister with café", hidden: true, img: { file: "images/4-erfurt/inline-augustinerkloster.webp", caption: "Augustinerkloster, Erfurt", credit: "H. Zell — CC BY-SA 3.0" } },
      { icon: "🌸", text: "egapark — 36-hectare garden park with one of Europe's largest ornamental flowerbeds, Japanese garden, butterfly house, and 1961 GDR-era plant-sculpture heritage", hidden: true }
    ],
    hotel: "Hotel Kr\u00e4merbr\u00fccke \u2014 4-star, adjacent to the bridge. Medieval + modern. ~\u20ac85\u2013130/night",
    pastry: "Goldhelm chocolate & hot chocolate with cardamom; Epitome Coffee Co \u2014 \u201cprobably the best coffee in Germany\u201d",
    japanese: "NASHI Dining \u2014 Japanese fine dining next to Kr\u00e4merbr\u00fccke. \u201cOne of the best sushi restaurants.\u201d",
    bestTime: "A weekend in mid-to-late April. Spring, uncrowded, all shops open.",
    budgetTable: [
      ["Hotel (3 nights)", "\u20ac255\u2013390"],
      ["Food, coffee & chocolate", "\u20ac160"],
      ["Activities", "\u20ac50\u201360"],
      ["Total", "\u20ac465\u2013610"]
    ],
    vibeTags: ["\ud83c\udfdb\ufe0f culture", "\ud83d\udcdc history", "\ud83c\udf6b sweets", "\ud83c\udfe0 cozy"]
  },
  {
    id: 5,
    name: "L\u00fcbeck",
    country: "Germany",
    days: [3, 4],
    dist: "germany",
    vibes: ["cozy", "culture", "coastal"],
    subVibes: ["coastal", "medieval"],
    budget: "comfortable",
    easter: false,
    pitch: "A Hanseatic UNESCO jewel on the Baltic — seven spires over brick-Gothic streets, the old-town framed by the twin-towered Holstentor, and a 4 km cliff walk on the coast ten minutes away. The coziest long weekend, wrapped in maritime history.",
    transport: "IC/ICE via Hamburg: ~2.5\u20133.5 hours. Covered by DB pass.",
    highlights: [
      { icon: "\ud83c\udfdb\ufe0f", text: "Europ\u00e4isches Hansemuseum \u2014 Europe\u2019s largest Hanseatic League museum (2015)", img: { file: "images/5-lubeck/inline-hansemuseum.webp", caption: "Europäisches Hansemuseum, Lübeck", credit: "Dietmar Rabich — CC BY-SA 4.0" } },
      { icon: "\ud83c\udf0a", text: "Brodtener Steilufer \u2014 4 km Baltic cliff walk, part of E9 European coastal trail", img: { file: "images/5-lubeck/inline-brodtener-steilufer.webp", caption: "Brodtener Steilufer, Baltic cliff coast", credit: "Holger.Ellgaard — CC BY-SA 4.0" } },
      { icon: "\u26ea", text: "Marienkirche \u2014 brick Gothic with astronomical clock & WWII memorial bells", img: { file: "images/5-lubeck/inline-marienkirche.webp", caption: "Marienkirche (St. Mary's), Lübeck", credit: "Carsten Steger — CC BY-SA 4.0" } },
      { icon: "\ud83c\udff0", text: "Holstentor \u2014 the medieval twin-towered gate, the icon of L\u00fcbeck for eight centuries", img: { file: "images/5-lubeck/inline-holstentor.webp", caption: "Holstentor, the medieval twin-towered gate", credit: "Christian Wolf (www.c-w-design.de) — CC BY-SA 3.0 de" } },
      { icon: "🏚️", text: "Füchtingshof on Glockengießerstraße — 1639 almshouse courtyard with low gabled widows' cottages, doubled as a Nosferatu (1922) filming location", hidden: true },
      { icon: "✍️", text: "Günter Grass-Haus — the Nobel laureate's studio-museum with his Olivetti typewriter and his own drawings and sculptures (he was a visual artist too)", hidden: true, img: { file: "images/5-lubeck/inline-grass-haus.webp", caption: "Günter Grass-Haus, Lübeck", credit: "Garitzko — Public domain" } },
      { icon: "🎭", text: "TheaterFigurenMuseum & Figurentheater — Germany's oldest continuously operating puppet theatre with a museum of 1,500 rod-and-shadow figures from Asia and Europe", hidden: true }
    ],
    hotel: "Klassik Altstadt Hotel \u2014 family-run since 1978 in a 700-year-old building. ~\u20ac80\u2013120/night",
    pastry: "Kaffeehaus L\u00fcbeck \u2014 award-winning in-house roastery and cakes; Cycle Roasters for barista courses.",
    japanese: "Nui Sushi & Ramenbar \u2014 chef trained in Tokyo, counter seating for solo diners. Ars\u00e9n Sushi Art rated 4.9.",
    bestTime: "A weekend in June. Baltic at its best \u2014 long daylight, warm evenings, beach-ready.",
    budgetTable: [
      ["Hotel (3 nights)", "\u20ac240\u2013360"],
      ["Food & coffee", "\u20ac140"],
      ["Activities", "\u20ac55\u2013135"],
      ["Total", "\u20ac435\u2013635"]
    ],
    vibeTags: ["\ud83c\udfe0 cozy", "\ud83c\udfdb\ufe0f culture", "\ud83c\udf0a coastal", "\ud83c\udff0 Hanseatic"]
  },
  {
    id: 6,
    name: "Wroc\u0142aw",
    country: "Poland",
    days: [3, 4],
    dist: "neighbor",
    vibes: ["culture", "quirky", "coffee"],
    subVibes: ["architecture", "coffee", "markets", "art"],
    budget: "lean",
    easter: false,
    pitch: "A city of 100 bridges, 12 islands, and 300+ tiny bronze dwarfs hiding on every corner. The specialty coffee scene rivals Berlin\u2019s, the prices are a fraction of Germany\u2019s, and the 360\u00b0 Panorama painting will leave you speechless. Central Europe\u2019s most underrated cultural city.",
    transport: "Direct EC train Berlin \u2192 Wroc\u0142aw: ~4\u20135 hours. DB pass covers German leg; Polish portion ~\u20ac15\u201330.",
    highlights: [
      { icon: "\ud83d\uddbc\ufe0f", text: "Panorama of the Battle of Rac\u0142awice \u2014 jaw-dropping 360\u00b0 painting (15m \u00d7 114m) from 1894", img: { file: "images/6-wroclaw/inline-panorama-raclawicka.webp", caption: "Panorama of the Battle of Racławice", credit: "Marta Wojtuś — CC BY-SA 4.0" } },
      { icon: "\ud83e\uddd9", text: "Dwarf Hunt \u2014 300+ bronze gnome statues citywide, download the app for a treasure hunt", img: { file: "images/6-wroclaw/inline-wroclaw-dwarf.webp", caption: "Shopper dwarf (Epiki Zakupek), Wrocław", credit: "Wikivoyage — Public Domain" } },
      { icon: "\u2728", text: "Aula Leopoldina \u2014 one of the most breathtaking baroque interiors in Europe", img: { file: "images/6-wroclaw/inline-aula-leopoldina.webp", caption: "Aula Leopoldina baroque hall", credit: "Wrocław Official from Wrocław — CC0" } },
      { icon: "\ud83c\udf03", text: "Ostr\u00f3w Tumski at dusk \u2014 the lamplighter manually ignites gas street lamps each evening", img: { file: "images/6-wroclaw/inline-ostrow-tumski.webp", caption: "Ostrów Tumski, Cathedral Island", credit: "Jar.ciurus — CC BY-SA 3.0 pl" } },
      { icon: "🎨", text: "Nadodrze district — post-industrial quarter north of the Odra with neon museum, courtyard murals, artist studios and three-table café-patios (the Kazimierz of Wrocław)", hidden: true },
      { icon: "💧", text: "Hydropolis — interactive water-science museum inside a 19th-century underground reservoir, 4,000 m² of exhibits including a giant bathyscaphe replica", hidden: true, img: { file: "images/6-wroclaw/inline-hydropolis.webp", caption: "Hydropolis, Wrocław's water museum", credit: "Jacek Halicki — CC BY-SA 4.0" } },
      { icon: "🏗️", text: "WUWA Bauhaus estate — 1929 modernist model housing exhibition (terraced villas, gallery flats, an actual kindergarten) walkable around Szczytnicki Park after the Japanese Garden", hidden: true }
    ],
    hotel: "PURO Wroc\u0142aw Stare Miasto \u2014 4-star design hotel, complimentary espresso. ~\u20ac65\u201395/night",
    pastry: "Paloma Coffee & Roasters \u2014 in-house roasting, featured by European Coffee Trip. Nanan for elaborate cakes.",
    japanese: "WSHOKU Sushi & Ramen Bar \u2014 excellent tonkotsu ramen. Sushi Corner offers sushi workshops!",
    bestTime: "Labour Day weekend, May 1\u20133 or a weekend in September. Warm, uncrowded.",
    budgetTable: [
      ["Train (Polish portion)", "\u20ac30\u201370"],
      ["Hotel (3 nights)", "\u20ac195\u2013285"],
      ["Food & coffee", "\u20ac60\u201380"],
      ["Activities", "\u20ac15\u201325"],
      ["Total", "\u20ac370\u2013400"]
    ],
    vibeTags: ["\ud83c\udfdb\ufe0f culture", "\ud83c\udfa8 quirky", "\u2615 coffee", "\ud83d\udcb0 affordable"]
  },
  {
    id: 7,
    name: "Karlovy Vary",
    country: "Czech Republic",
    days: [4],
    dist: "neighbor",
    vibes: ["spa", "indulgence", "cozy"],
    subVibes: ["thermal", "spa", "indulgence", "cozy"],
    budget: "comfortable",
    easter: false,
    pitch: "The ultimate introvert spa fantasy \u2014 grand colonnaded promenades, thermal springs you drink from porcelain cups, and spa hotels with the elegance of a Wes Anderson film. Buy traditional wafer cookies warm off the iron, sip Becherovka at the museum, and melt into a mineral bath.",
    transport: "FlixBus Berlin \u2192 Prague (~4h), then RegioJet Prague \u2192 Karlovy Vary (~2h). Total ~6h, \u20ac20\u201330 each way.",
    highlights: [
      { icon: "\u2668\ufe0f", text: "Colonnade Walk & Thermal Water Tasting \u2014 sample mineral waters from traditional porcelain cups", img: { file: "images/7-karlovy-vary/inline-mill-colonnade.webp", caption: "Mill Colonnade detail (column + arcade), Karlovy Vary", credit: "VitVit — CC BY-SA 4.0" } },
      { icon: "\ud83c\udf78", text: "Jan Becher Museum \u2014 tour Becherovka cellars since 1807 with structured tasting", img: { file: "images/7-karlovy-vary/inline-becherovka.webp", caption: "Becherovka — Karlovy Vary's herbal liqueur", credit: "CC BY-SA 3.0" } },
      { icon: "\ud83d\uddfc", text: "Diana Lookout Tower & Funicular \u2014 panoramic views + forest walking trails", img: { file: "images/7-karlovy-vary/inline-diana-tower.webp", caption: "Diana Lookout Tower, Karlovy Vary", credit: "I would appreciate being notified if you use my work outside Wikimedia. More of my work can be found in my personal gallery. — CC BY-SA 3.0" } },
      { icon: "\ud83e\uddca", text: "Moser Glass Museum & Factory \u2014 watch master glassblowers create Bohemian crystal", img: { file: "images/7-karlovy-vary/inline-bohemian-crystal.webp", caption: "Bohemian crystal glassware — representative image", credit: "Dora — CC BY-SA 3.0" } },
      { icon: "🍪", text: "Café Elefant on Stará Louka — Karlovarské oplatky baked fresh on traditional irons while you wait, a 250-year-old recipe using thermal spring water in the batter", hidden: true, img: { file: "images/7-karlovy-vary/inline-oplatky.webp", caption: "Café Elefant, Karlovy Vary (Stará Louka)", credit: "Kürschner — Public Domain" } },
      { icon: "⛪", text: "Church of Saints Peter & Paul — five gilded onion domes on a Byzantine-cross floor plan, the Czech Republic's largest Orthodox church (1897), built for Russian spa aristocrats", hidden: true, img: { file: "images/7-karlovy-vary/inline-peter-paul-church.webp", caption: "Orthodox Church of Saints Peter & Paul", credit: "Txllxt TxllxT — CC BY-SA 4.0" } },
      { icon: "🪨", text: "Svatošské skály — 'Rock Wedding' granite pillar formations along a flat 7 km Ohře riverside trail from Doubí, admired by Goethe and Freud on their own spa walks", hidden: true, img: { file: "images/7-karlovy-vary/inline-svatosske-skaly.webp", caption: "Svatošské skály — granite pillar formations", credit: "Lubor Ferenc — CC BY-SA 4.0" } }
    ],
    hotel: "Dvorak Spa & Wellness \u2014 Art Nouveau on the main promenade, pool + saunas. ~\u20ac80\u2013120/night",
    pastry: "Caf\u00e9 Elefant for Karlovarske oplatky (fresh warm spa wafers!); Caf\u00e9 Respirum for thermal-spring-water coffee with Becherovka",
    japanese: "FoggyYami Sushi (rated 4.5/5); KAZOKU for ramen, sushi & Asian cooking workshops",
    bestTime: "Late September or early October. Fall foliage, thin crowds, thermal baths in cool air.",
    budgetTable: [
      ["Transport (return)", "\u20ac40\u201360"],
      ["Hotel (3 nights)", "\u20ac240\u2013360"],
      ["Food & coffee", "\u20ac60\u201390"],
      ["Spa treatments", "\u20ac40\u201380"],
      ["Activities", "\u20ac20\u201330"],
      ["Total", "\u20ac430\u2013530"]
    ],
    vibeTags: ["\ud83e\uddd6 spa", "\ud83c\udfe0 cozy", "\ud83c\udf6c indulgence", "\u2728 luxury-for-less"]
  },
  {
    id: 8,
    name: "Gda\u0144sk",
    country: "Poland",
    days: [4],
    dist: "neighbor",
    vibes: ["history", "coastal", "foodie"],
    subVibes: ["history", "coastal", "foodie", "memorial"],
    budget: "lean",
    easter: false,
    pitch: "Where the Baltic Sea meets one of Europe\u2019s most powerful stories. The WWII museum is widely considered the best ever built. Then step outside into glowing amber merchant houses, cross to Sopot for Europe\u2019s longest wooden pier, and eat some of the best ramen in Poland.",
    transport: "Direct EC train Berlin \u2192 Gda\u0144sk: ~5\u20135.5 hours. Polish ticket ~\u20ac15\u201340 each way.",
    highlights: [
      { icon: "\ud83c\udfdb\ufe0f", text: "Museum of the Second World War \u2014 one of Europe\u2019s most important modern museums", img: { file: "images/8-gdansk/inline-wwii-museum.webp", caption: "Museum of the Second World War, Gdańsk", credit: "Scotch Mist — CC BY-SA 4.0" } },
      { icon: "\u270a", text: "European Solidarity Centre \u2014 at the historic Solidarity shipyard", img: { file: "images/8-gdansk/inline-solidarity-centre.webp", caption: "European Solidarity Centre, Gdańsk", credit: "Fallaner — CC BY-SA 4.0" } },
      { icon: "\ud83c\udfe0", text: "Mariacka Street & St. Mary\u2019s Tower \u2014 400+ steps, largest brick church in the world", img: { file: "images/8-gdansk/inline-mariacka.webp", caption: "Mariacka Street with St. Mary's tower", credit: "1bumer — CC BY-SA 3.0 pl" } },
      { icon: "\ud83c\udf0a", text: "Sopot Pier \u2014 Europe\u2019s longest wooden pier (511.5m) + Baltic beach walk", img: { file: "images/8-gdansk/inline-sopot-pier.webp", caption: "Sopot Pier on the Baltic Sea", credit: "Diego Delso — CC BY-SA 3.0" } },
      { icon: "🎹", text: "Oliwa Cathedral organ recital — 20-minute daily concert on a 7,896-pipe 1780s Baroque organ with moving cherubs and trumpeting angels, 20 min tram north of the old town", hidden: true, img: { file: "images/8-gdansk/inline-oliwa-organ.webp", caption: "Baroque organ of Oliwa Cathedral", credit: "Airwolf — CC BY 3.0" } },
      { icon: "🏘️", text: "Zaspa Monumental Art Collection — 60+ large-format murals painted across Solidarity-era concrete tower blocks, one SKM stop from the center", hidden: true },
      { icon: "🏠", text: "Uphagen's House on Długa — a single 1780 merchant's house preserved top-to-bottom with original furnishings, silk wallpapers and a trompe-l'oeil staircase", hidden: true }
    ],
    hotel: "Hotel Gda\u0144sk Boutique \u2014 restored 18th-century granary on Mot\u0142awa River. ~\u20ac80\u2013110/night",
    pastry: "Drukarnia Caf\u00e9 on Mariacka \u2014 V60, Chemex, Syphon + cakes. Kawiarnia Publiczna for cinnamon rolls.",
    japanese: "Gyozilla Ramen for excellent ramen & gyoza. Dom Sushi on the old Fish Market. Meso Ramen rated 4.7.",
    bestTime: "A weekend in June. Baltic warmest and sunniest, long evenings for waterfront strolls.",
    budgetTable: [
      ["Train (Polish portion)", "\u20ac30\u201380"],
      ["Hotel (3 nights)", "\u20ac240\u2013330"],
      ["Food & coffee", "\u20ac60\u201380"],
      ["Activities", "\u20ac20\u201330"],
      ["Sopot day trip", "\u20ac5"],
      ["Total", "\u20ac425\u2013475"]
    ],
    vibeTags: ["\ud83c\udfdb\ufe0f history", "\ud83c\udf0a coastal", "\ud83c\udf5c foodie", "\ud83d\udcb0 affordable"]
  },
  {
    id: 9,
    name: "Bologna",
    country: "Italy",
    days: [4],
    dist: "flight",
    vibes: ["foodie", "hiking", "culture"],
    subVibes: ["markets", "foodie", "hiking", "art"],
    budget: "splurge",
    easter: false,
    pitch: "Italy\u2019s undisputed food capital \u2014 called \u201cLa Grassa\u201d (The Fat One) by Italians. A 3.8 km covered walkway of 666 arches climbs to a hilltop sanctuary, the world\u2019s oldest university hides a wood-carved anatomical theatre, and a tiny Japanese restaurant serves the most authentic washoku in Emilia-Romagna.",
    transport: "Direct flight BER \u2192 Bologna: ~1h40 (Ryanair). Round-trip from \u20ac65\u2013150.",
    highlights: [
      { icon: "\ud83c\udfdb\ufe0f", text: "Portico di San Luca \u2014 3.8 km, 666 arches to a hilltop sanctuary. The best hike-introvert activity.", img: { file: "images/9-bologna/inline-portico-san-luca.webp", caption: "Portico di San Luca arched walkway", credit: "Vanni Lazzari — CC BY-SA 4.0" } },
      { icon: "\ud83c\udf5d", text: "Food tour through the Quadrilatero \u2014 mortadella, fresh pasta, Parmigiano, balsamic", img: { file: "images/9-bologna/inline-mortadella.webp", caption: "Mortadella Bologna IGP — Quadrilatero specialty", credit: "Stefano Brush Parisi — CC BY-SA 4.0" } },
      { icon: "\ud83d\udc80", text: "Teatro Anatomico \u2014 17th-century wood-carved lecture hall in world\u2019s oldest university", img: { file: "images/9-bologna/inline-teatro-anatomico.webp", caption: "Teatro Anatomico of the Archiginnasio", credit: "Palickap — CC BY-SA 4.0" } },
      { icon: "\ud83c\udf3f", text: "Colli Bolognesi hiking \u2014 vineyards, chestnut groves & medieval villages" },
      { icon: "⛪", text: "Basilica di Santo Stefano (Sette Chiese) — seven interconnected medieval churches, a Benedictine cloister and Pilate's Courtyard staged as a mini-Jerusalem pilgrimage site", hidden: true, img: { file: "images/9-bologna/inline-santo-stefano.webp", caption: "Basilica di Santo Stefano (Sette Chiese)", credit: "MenkinAlRire — CC BY-SA 4.0" } },
      { icon: "🪟", text: "Finestrella di Via Piella — tiny wooden shutter in a portico wall that opens onto the Canale delle Moline, a surviving sliver of Bologna's hidden 37-mile canal network", hidden: true, img: { file: "images/9-bologna/inline-finestrella-piella.webp", caption: "Finestrella di Via Piella canal window", credit: "DONATELLA BAJO — CC BY-SA 4.0" } },
      { icon: "📚", text: "Biblioteca Salaborsa — public library on Piazza Maggiore built over Bononia's 189 BC Roman forum, viewable through a glass-floor atrium (free)", hidden: true }
    ],
    hotel: "Art Hotel Orologio \u2014 4-star on Piazza Maggiore, free bike rental. ~\u20ac90\u2013140/night",
    pastry: "Forno Brisa \u2014 pistachio cornetti & specialty coffee. Caff\u00e8 Zanarini for fruit custard tarts. Pasticceria Regina di Quadri for haute patisserie.",
    japanese: "Yuzuya \u2014 first authentic Japanese restaurant in Bologna, Japanese chefs since 2016. Sentaku Ramen Bar for solo bar seating.",
    bestTime: "Mid-to-late April or early October. 15\u201320\u00b0C, perfect for hiking & walking.",
    budgetTable: [
      ["Flights (round-trip)", "\u20ac65\u2013150"],
      ["Hotel (3 nights)", "\u20ac270\u2013420"],
      ["Food & coffee", "\u20ac120\u2013180"],
      ["Food tour", "\u20ac60\u201380"],
      ["Museums", "\u20ac20\u201330"],
      ["Total", "\u20ac575\u2013760"]
    ],
    vibeTags: ["\ud83c\udf5d foodie", "\ud83e\uddf3 hiking", "\ud83c\udfdb\ufe0f culture", "\ud83c\udf93 intellectual"]
  },
  {
    id: 10,
    name: "Porto",
    country: "Portugal",
    days: [4],
    dist: "flight",
    vibes: ["coffee", "foodie", "coastal", "culture"],
    subVibes: ["coffee", "pastries", "coastal", "drinks"],
    budget: "splurge",
    easter: false,
    pitch: "Specialty coffee roasters facing the Atlantic, warm past\u00e9is de nata every few minutes, and structured port wine tastings in centuries-old cellars. Porto\u2019s coffee scene is arguably the best in Southern Europe, and the 7 km coastal walk from the Douro to Matosinhos is stunning.",
    transport: "Direct flight BER \u2192 Porto: ~3h20 (Ryanair, easyJet). Round-trip from \u20ac78\u2013160.",
    highlights: [
      { icon: "\ud83c\udf77", text: "Port wine tasting in Vila Nova de Gaia \u2014 Taylor\u2019s for views + structured tasting", img: { file: "images/10-porto/inline-gaia-cellars.webp", caption: "Port wine cellars in Vila Nova de Gaia", credit: "Diego Delso — CC BY-SA 3.0" } },
      { icon: "\ud83c\udfdb\ufe0f", text: "Serralves Museum + Gardens \u2014 18-hectare art park with treetop walkway", img: { file: "images/10-porto/inline-serralves.webp", caption: "Serralves Museum of Contemporary Art", credit: "Leon from Taipei, Taiwan — CC BY 2.0" } },
      { icon: "\ud83c\udf0a", text: "Foz do Douro coastal walk \u2014 7 km Atlantic promenade, return via vintage Tram 1", img: { file: "images/10-porto/inline-foz-do-douro.webp", caption: "Foz do Douro coastal promenade, Porto", credit: "Bex Walton from London, England — CC BY 2.0" } },
      { icon: "\ud83c\udfa8", text: "S\u00e3o Bento Station \u2014 ~20,000 hand-painted azulejo tiles depicting Portuguese history", img: { file: "images/10-porto/inline-sao-bento.webp", caption: "São Bento Station exterior, Porto", credit: "Krzysztof Golik — CC BY-SA 4.0" } },
      { icon: "🌇", text: "Miradouro da Vitória — a ruined synagogue-wall terrace in the old Jewish quarter with a sweeping free view over Ribeira, Dom Luís I and the Gaia cellars", hidden: true },
      { icon: "🎨", text: "Rua Miguel Bombarda gallery district — Portugal's densest contemporary-art street with simultaneous opening nights every 6 weeks and a vintage-shop mall inside Centro Comercial Bombarda", hidden: true },
      { icon: "☕", text: "Combi Coffee at Agrafo florist (Cedofeita) — the Porto roastery's hidden outpost tucked inside a flower shop, bench-seats at the window with single-origin espresso", hidden: true }
    ],
    hotel: "Exmo Hotel by Olivia \u2014 4-star in Ribeira, welcome glass of port. ~\u20ac80\u2013130/night",
    pastry: "F\u00e1brica Coffee Roasters \u2014 Portugal\u2019s first specialty roastery. Manteigaria for the best past\u00e9is de nata. Castro for chic artisan nata.",
    japanese: "Shiko izakaya \u2014 25 seats, \u201cgreat for solo diners.\u201d Restaurante G\u00f3sh\u00f3 for set lunches. RO for ramen.",
    bestTime: "Pfingsten weekend, May 23\u201325. Warm (20\u201324\u00b0C), sunny, ideal for coastal walks.",
    budgetTable: [
      ["Flights (round-trip)", "\u20ac78\u2013160"],
      ["Hotel (3 nights)", "\u20ac240\u2013390"],
      ["Food & coffee", "\u20ac100\u2013160"],
      ["Port wine tastings", "\u20ac25\u201340"],
      ["Museums", "\u20ac30\u201340"],
      ["Total", "\u20ac520\u2013690"]
    ],
    vibeTags: ["\u2615 coffee", "\ud83c\udf6e pastries", "\ud83c\udf0a coastal", "\ud83c\udfdb\ufe0f culture", "\ud83c\udf77 tastings"]
  },
  // ---- NEW PROPOSALS 11\u201330 ----
  {
    id: 11,
    name: "Konstanz & Lake Constance",
    country: "Germany",
    days: [4],
    dist: "germany",
    vibes: ["nature", "culture", "hiking"],
    subVibes: ["lakeside", "gardens", "hiking"],
    budget: "comfortable",
    easter: false,
    pitch: "Where Germany, Switzerland, and Austria meet at a lake so clear it looks photoshopped. Konstanz survived WWII completely unscathed, leaving you an intact medieval old town, a flower-covered island designed by a Swedish count, and a UNESCO-listed monastic island where monks have grown vegetables since the 8th century.",
    transport: "ICE/IC with 1 change (usually Stuttgart): ~7.5\u20138 hours. One of Europe\u2019s most scenic rail journeys. Covered by DB pass.",
    highlights: [
      { icon: "\ud83c\udf38", text: "Insel Mainau (Flower Island) \u2014 45-hectare botanical garden, butterfly house, tree canopy walk. ~\u20ac24", img: { file: "images/11-konstanz/inline-mainau.webp", caption: "Mainau flower island", credit: "Mummelgrummel — CC BY-SA 3.0" } },
      { icon: "\u26ea", text: "Reichenau Island (UNESCO) \u2014 three Romanesque churches, 9th\u201311th century frescoes, herb gardens", img: { file: "images/11-konstanz/inline-reichenau.webp", caption: "Reichenau Island abbey", credit: "JoachimKohlerBremen — CC BY-SA 4.0" } },
      { icon: "\ud83e\udd7e", text: "Bodensee Lakeside Trail \u2014 15 km from Konstanz to Meersburg through vineyards & fishing villages", img: { file: "images/11-konstanz/inline-bodensee-trail.webp", caption: "Bodensee lakeside near Meersburg", credit: "Roland.h.bueb — CC BY-SA 3.0" } },
      { icon: "\ud83c\udfdb\ufe0f", text: "Arch\u00e4ologisches Landesmuseum \u2014 prehistoric pile-dwelling reconstructions from UNESCO lake settlements", img: { file: "images/11-konstanz/inline-archaeological-museum.webp", caption: "Archäologisches Landesmuseum Konstanz", credit: "Andreas F. Borchert — CC BY-SA 4.0" } },
      { icon: "🕯️", text: "Hus-Haus Museum — tiny medieval house where Bohemian reformer Jan Hus lodged before being burned in 1415, with a quiet exhibit on courage to think", hidden: true, img: { file: "images/11-konstanz/inline-hus-haus.webp", caption: "Hus-Haus in Konstanz", credit: "Renardo la vulpo — CC0" } },
      { icon: "🍷", text: "Staatsweingut Meersburg tasting — ferry across the lake to Germany's oldest state winery (founded 1802), cellar flights from ~€12 with vineyard views", hidden: true, img: { file: "images/11-konstanz/inline-staatsweingut.webp", caption: "Staatsweingut Meersburg winery", credit: "JoachimKohler-HB — CC BY-SA 4.0" } },
      { icon: "🏘️", text: "Niederburg quarter — Konstanz's oldest district, a labyrinth of cobbled alleys, wine caves, and independent ateliers tucked between cathedral and Rhine", hidden: true, img: { file: "images/11-konstanz/inline-niederburg.webp", caption: "Niederburg quarter, Konstanz", credit: "Rizzo — CC BY 3.0" } }
    ],
    hotel: "Viva Sky Hotel \u2014 modern 4-star with rooftop terrace overlooking the lake and Alps. ~\u20ac110\u2013150/night",
    pastry: "Caf\u00e9 Zeitlos \u2014 homemade Schwarzw\u00e4lder Kirschtorte & excellent espresso. Kaffeehaus am M\u00fcnsterplatz for single-origin beans.",
    japanese: "Miko Sushi \u2014 small, well-reviewed sushi in the old town. Hinata for ramen and donburi.",
    bestTime: "Late May or June (Pfingsten weekend). Flower gardens on Mainau peak, lake warm enough for promenades.",
    budgetTable: [
      ["Hotel (3 nights)", "\u20ac330\u2013510"],
      ["Food & coffee", "\u20ac100\u2013160"],
      ["Activities (Mainau \u20ac24, museum, bike)", "\u20ac40\u201360"],
      ["Total", "\u20ac470\u2013730"]
    ],
    vibeTags: ["\ud83c\udf38 gardens", "\ud83c\udf0a lakeside", "\ud83e\udd7e hiking", "\ud83c\udfdb\ufe0f culture"]
  },
  {
    id: 12,
    name: "Freiburg im Breisgau",
    country: "Germany",
    days: [3, 4],
    dist: "germany",
    vibes: ["nature", "hiking", "foodie", "cozy"],
    subVibes: ["forests", "hiking", "pastries", "cozy"],
    budget: "comfortable",
    easter: false,
    pitch: "Germany\u2019s sunniest city, nestled at the foot of the Black Forest. Medieval B\u00e4chle (tiny canals) run through cobblestone streets, a cable car whisks you to 1,284-meter Schauinsland, and the local caf\u00e9 culture revolves around incredible cakes and single-origin coffee.",
    transport: "ICE Berlin \u2192 Freiburg: ~5.5\u20136.5 hours (1 change). Covered by DB pass.",
    highlights: [
      { icon: "\ud83d\udea0", text: "Schauinslandbahn \u2014 Germany\u2019s longest cable car (3.6 km) to a 1,284m summit with 360\u00b0 views", img: { file: "images/12-freiburg/inline-schauinslandbahn.webp", caption: "Schauinslandbahn cable car", credit: "Ipab — CC BY-SA 3.0" } },
      { icon: "\u26ea", text: "Freiburger M\u00fcnster & Market \u2014 Gothic cathedral with daily morning farmers\u2019 market", img: { file: "images/12-freiburg/inline-munster.webp", caption: "Freiburg Münster cathedral", credit: "Uoaei1 — CC BY-SA 4.0" } },
      { icon: "\ud83e\udd7e", text: "Schlossberg Hike \u2014 walk from city center up through vineyards to aerial views, 2\u20133h", img: { file: "images/12-freiburg/inline-schlossberg.webp", caption: "View from Freiburg Schlossberg", credit: "Datsofelija — CC BY 4.0" } },
      { icon: "\ud83d\uddbc\ufe0f", text: "Augustinermuseum \u2014 medieval art & expressionist works in a converted Augustinian monastery", img: { file: "images/12-freiburg/inline-augustinermuseum.webp", caption: "Augustinermuseum Freiburg", credit: "Daderot — CC0" } },
      { icon: "💦", text: "Ravennaschlucht gorge hike — 4 km trail past 16m Großer Ravennafall, under the 1927 nine-arch stone railway viaduct, ending at Hofgut Sternen where Goethe slept in 1779", hidden: true, img: { file: "images/12-freiburg/inline-ravennaschlucht.webp", caption: "Ravenna viaduct & gorge", credit: "Ralf Wimmer — CC BY-SA 3.0" } },
      { icon: "📚", text: "Kloster St. Peter Rococo Library — 1727 Baroque monastery with a gilded library that rivals Wiblingen, panoramic ridge walks to St. Märgen (8 km)", hidden: true, img: { file: "images/12-freiburg/inline-kloster-st-peter.webp", caption: "Kloster St. Peter, Black Forest", credit: "Thomas Berwing — CC BY-SA 3.0" } },
      { icon: "☕", text: "Café Norso — minimalist Nordic roastery near the Altstadt, exceptional cinnamon buns and single-origin filter; quiet alternative to tourist-packed Café Schmidt", hidden: true, img: { file: "images/12-freiburg/inline-cafe-norso.webp", caption: "Cinnamon bun — representative", credit: "Andy Li — CC0" } }
    ],
    hotel: "Hotel Oberkirch \u2014 family-run since 1738, on the M\u00fcnsterplatz with cathedral views. ~\u20ac100\u2013150/night",
    pastry: "Caf\u00e9 Schmidt \u2014 legendary K\u00e4sekuchen in a cozy half-timbered house. Schwarzwild Coffee for own-roasted beans & flat whites.",
    japanese: "Japanisches Restaurant Taumi \u2014 authentic sushi, tempura & donburi. Izumi for ramen & gyoza.",
    bestTime: "Himmelfahrt weekend, May 14\u201317 or early June. Most sun hours in Germany, ideal hiking temps.",
    budgetTable: [
      ["Hotel (3 nights)", "\u20ac240\u2013450"],
      ["Food & coffee", "\u20ac100\u2013160"],
      ["Activities (Schauinsland \u20ac14, museum \u20ac7)", "\u20ac25\u201340"],
      ["Total", "\u20ac365\u2013650"]
    ],
    vibeTags: ["\u2600\ufe0f sunny", "\ud83e\udd7e hiking", "\ud83c\udfe0 cozy", "\ud83c\udf70 pastries"]
  },
  {
    id: 13,
    name: "G\u00f6rlitz",
    country: "Germany",
    days: [3, 4],
    dist: "germany",
    vibes: ["culture", "history", "cozy"],
    subVibes: ["architecture", "cinematic", "medieval", "cozy"],
    budget: "lean",
    easter: false,
    pitch: "Germany\u2019s easternmost city and its single best-preserved collection of historic architecture \u2014 4,000 listed buildings spanning Gothic to Art Nouveau, all unscathed by WWII. Hollywood uses it as a stand-in for The Grand Budapest Hotel. Walk across a bridge and you\u2019re in Poland for cheap, excellent food.",
    transport: "Regional train via Cottbus: ~2.5\u20133 hours. Covered by DB pass.",
    highlights: [
      { icon: "\ud83c\udfdb\ufe0f", text: "Altstadt walking tour \u2014 Renaissance, Baroque & Art Nouveau across 4,000 listed buildings", img: { file: "images/13-gorlitz/inline-altstadt.webp", caption: "Görlitz Altstadt", credit: "Wolfgang Pehlemann Wiesbaden Germany — CC BY-SA 3.0 de" } },
      { icon: "\ud83c\udfac", text: "Schlesisches Museum \u2014 cultural history of Silesia in a beautifully curated mansion. ~\u20ac5", img: { file: "images/13-gorlitz/inline-schlesisches-museum.webp", caption: "Schlesisches Museum Görlitz", credit: "This image is a work by Wikipedia and Wikimedia Commons user KKDAII. When reusin — CC BY-SA 4.0" } },
      { icon: "\ud83c\udfb5", text: "Peterskirche Organ Concerts \u2014 15th-century church with famous Sonnenorgel (Sun Organ)", img: { file: "images/13-gorlitz/inline-peterskirche.webp", caption: "Peterskirche Sonnenorgel", credit: "Till Krech from Berlin, Germany — CC BY 2.0" } },
      { icon: "\ud83c\uddf5\ud83c\uddf1", text: "Walk into Zgorzelec (Poland) \u2014 cross the bridge for meals at a fraction of German prices", img: { file: "images/13-gorlitz/inline-zgorzelec.webp", caption: "Bridge to Zgorzelec", credit: "Martin Kraft — CC BY-SA 4.0" } },
      { icon: "🎬", text: "Görlitzer Warenhaus — the 1913 Jugendstil department store that was literally The Grand Budapest Hotel lobby, stained-glass ceiling and brass railings all original", hidden: true, img: { file: "images/13-gorlitz/inline-warenhaus.webp", caption: "Görlitzer Warenhaus interior", credit: "Herlie_(Görlitz).jpg: Manecke derivative work: Pilettes (talk) — CC BY-SA 3.0" } },
      { icon: "⛪", text: "Heiliges Grab — Germany's only full-scale 1504 replica of Jerusalem's Holy Sepulchre, commissioned by a Görlitz mayor after a penitential pilgrimage", hidden: true, img: { file: "images/13-gorlitz/inline-heiliges-grab.webp", caption: "Heiliges Grab, Görlitz", credit: "User ProfessorX on de.wikipedia — Public domain" } },
      { icon: "🍺", text: "Landskron Braumanufaktur tour — 1869 brewery with open fermentation and 12m-deep lagering cellars, tasting flight in the Kulturbrauerei courtyard ~€15", hidden: true, img: { file: "images/13-gorlitz/inline-landskron.webp", caption: "Landskron Brauerei Görlitz", credit: "Dguendel — CC BY 3.0" } }
    ],
    hotel: "Romantik Hotel Tuchmacher \u2014 4-star boutique in a restored 16th-century cloth-maker\u2019s house. ~\u20ac90\u2013130/night",
    pastry: "Schwerdtner\u2019s \u201cDas S\u00fc\u00dfe Leben\u201d \u2014 Art Nouveau caf\u00e9 with Silesian poppy seed cake. Espresso-Bar Caf\u00e9 Kr\u00e4nzel for specialty coffee.",
    japanese: "Limited in G\u00f6rlitz. Shiki in nearby Dresden (1.5h) is exceptional.",
    bestTime: "Mid-April or early October. Spring light on pastel facades, organ concerts in full swing.",
    budgetTable: [
      ["Hotel (3 nights)", "\u20ac270\u2013390"],
      ["Food & coffee (partly in Poland)", "\u20ac70\u2013100"],
      ["Activities", "\u20ac15\u201325"],
      ["Total", "\u20ac355\u2013515"]
    ],
    vibeTags: ["\ud83c\udfdb\ufe0f architecture", "\ud83c\udfac cinematic", "\ud83c\udfe0 cozy", "\ud83d\udcb0 affordable"]
  },
  {
    id: 14,
    name: "Regensburg",
    country: "Germany",
    days: [3, 4],
    dist: "germany",
    vibes: ["culture", "history", "foodie"],
    subVibes: ["medieval", "foodie", "lakeside", "history"],
    budget: "comfortable",
    easter: false,
    pitch: "The best-preserved large medieval city in Germany \u2014 a UNESCO World Heritage Site with one of Europe\u2019s oldest stone bridges (from 1146) and the oldest sausage kitchen in the world (900+ years). The Danube flows through the center, and the coffee scene is quietly outstanding.",
    transport: "ICE Berlin \u2192 N\u00fcrnberg, then RE to Regensburg: ~4\u20134.5 hours (1 change). Covered by DB pass.",
    highlights: [
      { icon: "\ud83c\udf09", text: "Steinerne Br\u00fccke \u2014 12th-century Romanesque bridge spanning the Danube. Cross at sunset.", img: { file: "images/14-regensburg/inline-steinerne-brucke.webp", caption: "Steinerne Brücke Regensburg", credit: "Unknown — CC BY-SA 3.0" } },
      { icon: "\ud83c\udf2d", text: "Historische Wurstkuchl \u2014 world\u2019s oldest sausage kitchen (since ~1135), counter-style solo dining", img: { file: "images/14-regensburg/inline-wurstkuchl.webp", caption: "Historische Wurstkuchl", credit: "Ekrem Canli — CC BY-SA 4.0" } },
      { icon: "\ud83c\udff0", text: "Thurn und Taxis Schloss & Brewery \u2014 royal grounds with fresh beer in the courtyard", img: { file: "images/14-regensburg/inline-thurn-und-taxis.webp", caption: "Schloss St. Emmeram (Thurn & Taxis)", credit: "PeterBraun74 — CC BY-SA 3.0" } },
      { icon: "\u26cf\ufe0f", text: "Document Neupfarrplatz \u2014 underground Roman & medieval Jewish quarter. Guided tours. ~\u20ac5", img: { file: "images/14-regensburg/inline-neupfarrplatz.webp", caption: "Neupfarrplatz Regensburg", credit: "John Samuel — CC BY-SA 4.0" } },
      { icon: "🏛️", text: "Walhalla at Donaustauf — Leo von Klenze's marble Parthenon-replica (1842) above the Danube, 130 busts of famous Germans, reach it via scenic river cruise (~€15)", hidden: true },
      { icon: "🔭", text: "Document Kepler — reconstructed 17th-century house where astronomer Johannes Kepler died in 1630, original instruments, laws of planetary motion exhibits. ~€2.50", hidden: true, img: { file: "images/14-regensburg/inline-kepler-haus.webp", caption: "Keplerhaus Regensburg", credit: "Johanning — CC BY-SA 3.0" } },
      { icon: "⛏️", text: "Document Niedermünster — 5m-deep archaeological basement under the church showing Legio III Italica Roman camp walls + Carolingian burials + ducal graves", hidden: true, img: { file: "images/14-regensburg/inline-niedermunster.webp", caption: "Niedermünster Regensburg", credit: "Steffen Schmitz — CC BY-SA 4.0" } }
    ],
    hotel: "Hotel Goliath am Dom \u2014 design boutique facing the cathedral with rooftop terrace. ~\u20ac110\u2013160/night",
    pastry: "Caf\u00e9 Goldenes Kreuz \u2014 vaulted Gothic hall where Emperor Charles V once stayed. Kaffemik for third-wave pour-overs.",
    japanese: "Aska Sushi \u2014 fresh sushi & ramen in the old town. Takumi for ramen bowls.",
    bestTime: "Labour Day weekend, May 1\u20133 or September (Herbstdult festival).",
    budgetTable: [
      ["Hotel (3 nights)", "\u20ac240\u2013480"],
      ["Food & coffee", "\u20ac90\u2013150"],
      ["Activities", "\u20ac15\u201325"],
      ["Total", "\u20ac345\u2013655"]
    ],
    vibeTags: ["\ud83c\udfdb\ufe0f history", "\ud83c\udf2d foodie", "\ud83c\udfe0 medieval", "\ud83c\udf0a riverside"]
  },
  {
    id: 15,
    name: "R\u00fcgen Island",
    country: "Germany",
    days: [3, 4],
    dist: "germany",
    vibes: ["nature", "coastal", "history"],
    subVibes: ["coastal", "mountains", "hiking"],
    budget: "comfortable",
    easter: false,
    pitch: "Germany\u2019s largest island \u2014 where 118-meter white chalk cliffs plunge into the Baltic, ancient beech forests (UNESCO) carpet the hills, and a 130-year-old steam train chugs between seaside towns. The kind of nature Germany\u2019s inland destinations can\u2019t match.",
    transport: "Direct ICE/IC from Berlin Hbf \u2192 Binz: ~3.5\u20134 hours (direct). Covered by DB pass.",
    highlights: [
      { icon: "\ud83c\udfde\ufe0f", text: "K\u00f6nigsstuhl & Chalk Cliff Trail \u2014 118m cliffs via 7 km hike through UNESCO beech forest. ~\u20ac9.50", img: { file: "images/15-rugen/inline-konigsstuhl.webp", caption: "Königsstuhl chalk cliffs", credit: "Felix König — CC BY 3.0" } },
      { icon: "\ud83d\ude82", text: "Rasender Roland Steam Train \u2014 narrow-gauge railway since 1895, day pass ~\u20ac18", img: { file: "images/15-rugen/inline-rasender-roland.webp", caption: "Rasender Roland steam train", credit: "Derzno — CC BY-SA 3.0" } },
      { icon: "\ud83c\udf05", text: "Sellin Seebr\u00fccke \u2014 most beautiful pier in Germany: Art Nouveau extending into the Baltic", img: { file: "images/15-rugen/inline-sellin-pier.webp", caption: "Sellin Seebrücke", credit: "Herbert Weber, Hildesheim — CC BY-SA 4.0" } },
      { icon: "\ud83c\udfdb\ufe0f", text: "Prora Documentation Centre \u2014 4.5 km Nazi-era KdF resort ruins. Fascinating history. ~\u20ac6", img: { file: "images/15-rugen/inline-prora.webp", caption: "Prora KdF complex", credit: "Matti Blume — CC BY-SA" } },
      { icon: "🏯", text: "Jagdschloss Granitz — 1851 neo-Gothic hunting castle on the 107m Tempelberg, climb the cast-iron spiral staircase for 360° island views", hidden: true, img: { file: "images/15-rugen/inline-jagdschloss-granitz.webp", caption: "Jagdschloss Granitz", credit: "T meltzer — CC BY-SA 4.0" } },
      { icon: "🐟", text: "Vitt fishing village — 13 thatched-roof houses in a hidden chalk-cliff cove near Kap Arkona, smoked herring pulled from barrel ovens right at the harbour", hidden: true, img: { file: "images/15-rugen/inline-vitt.webp", caption: "Vitt fishing village, Kap Arkona", credit: "Jörg Blobelt — CC BY-SA 4.0" } },
      { icon: "🪨", text: "Kreidemuseum Gummanz — Europe's only chalk museum, set in a 1962-closed factory with outdoor chalk pit and 45m 'Kleiner Königsstuhl' viewing platform. ~€5", hidden: true, img: { file: "images/15-rugen/inline-kreidemuseum.webp", caption: "Chalk quarry at Gummanz", credit: "Sabine Funke — CC BY-SA 4.0" } }
    ],
    hotel: "Strandhotel Binz \u2014 B\u00e4derarchitektur hotel on the promenade, spa & indoor pool. ~\u20ac100\u2013150/night",
    pastry: "Caf\u00e9 Wei\u00df \u2014 sea buckthorn torte & fresh Berliner. Kaffeer\u00f6sterei R\u00fcgen in Sellin for small-batch single-origin.",
    japanese: "Limited on the island. Fresh R\u00fcgen fish & smoked herring are the stars here.",
    bestTime: "Late May or early June. Chalk cliffs + blue sky, beech forest fully green, Baltic warming up.",
    budgetTable: [
      ["Hotel (3 nights)", "\u20ac210\u2013450"],
      ["Food & coffee", "\u20ac100\u2013150"],
      ["Activities (K\u00f6nigsstuhl, Roland, Prora)", "\u20ac35\u201355"],
      ["Total", "\u20ac345\u2013655"]
    ],
    vibeTags: ["\ud83c\udf0a coastal", "\ud83e\udd7e hiking", "\ud83d\ude82 train", "\ud83c\udfdb\ufe0f history"]
  },
  {
    id: 16,
    name: "Berchtesgaden & K\u00f6nigssee",
    country: "Germany",
    days: [4],
    dist: "germany",
    vibes: ["nature", "adventure", "hiking"],
    subVibes: ["mountains", "alpine", "hiking", "memorial"],
    budget: "comfortable",
    easter: false,
    pitch: "Germany at its most dramatically Alpine \u2014 a fjord-like emerald lake enclosed by 2,000-meter rock walls, electric boats crossing in silence as the captain plays trumpet mid-lake to demonstrate the seven-fold echo. Germany\u2019s only Alpine national park.",
    transport: "ICE Berlin \u2192 M\u00fcnchen (~4h), then BRB to Berchtesgaden (~2.5h): ~6\u20136.5h total. DB pass.",
    highlights: [
      { icon: "\ud83d\udea3", text: "K\u00f6nigssee Electric Boat + St. Bartholom\u00e4 \u2014 mirror-still lake to iconic onion-domed church. ~\u20ac22", img: { file: "images/16-berchtesgaden/inline-st-bartholoma.webp", caption: "St. Bartholomä on the Königssee", credit: "Martin Falbisoner — CC BY-SA 4.0" } },
      { icon: "\ud83c\udfd4\ufe0f", text: "Jenner Cable Car + Summit Hike \u2014 1,800m views over K\u00f6nigssee and Watzmann. ~\u20ac30", img: { file: "images/16-berchtesgaden/inline-jenner.webp", caption: "View from Jenner summit", credit: "Anil Öztas — CC BY 4.0" } },
      { icon: "\ud83c\udfdb\ufe0f", text: "Dokumentationszentrum Obersalzberg \u2014 deeply important museum with excavated bunker tunnels. ~\u20ac5", img: { file: "images/16-berchtesgaden/inline-obersalzberg.webp", caption: "Dokumentation Obersalzberg", credit: "Kritzolina — CC BY-SA 4.0" } },
      { icon: "\ud83c\udf3f", text: "Wimbachklamm Gorge \u2014 narrow gorge hike through mossy rock walls. ~\u20ac3", img: { file: "images/16-berchtesgaden/inline-wimbachklamm.webp", caption: "Wimbachklamm gorge", credit: "Mkummerer — CC BY-SA 3.0" } },
      { icon: "🧊", text: "Eiskapelle ice chapel — 1-hour trail from St. Bartholomä to Germany's lowest-lying permanent ice field, a natural ice cave wind-carved beneath the Watzmann east face", hidden: true, img: { file: "images/16-berchtesgaden/inline-eiskapelle.webp", caption: "Eiskapelle at Watzmann", credit: "Michael Fiegle at German Wikipedia — CC BY-SA 3.0" } },
      { icon: "🌲", text: "Zauberwald & Hintersee — 'Magic Forest' formed by a 3,500-year-old rockfall, mossy boulders and a glacial lake painted by 19th-century Romantics; 2-hour loop", hidden: true, img: { file: "images/16-berchtesgaden/inline-hintersee.webp", caption: "Hintersee & Zauberwald", credit: "Anil Öztas — CC BY 4.0" } },
      { icon: "⚪", text: "Almbachklamm & Kugelmühle — 3 km gorge trail ending at Germany's oldest still-working marble-ball mill (since 1683), buy a hand-polished sphere for ~€3", hidden: true, img: { file: "images/16-berchtesgaden/inline-almbachklamm.webp", caption: "Almbachklamm Kugelmühle", credit: "Geolina163 — CC BY-SA 3.0" } }
    ],
    hotel: "Hotel Bavaria \u2014 family-run 3-star Superior, mountain-view balconies, sauna. ~\u20ac90\u2013130/night",
    pastry: "Caf\u00e9 Forstner \u2014 outstanding Apfelstrudel & Kaiserschmarrn. Gasthof Windbeut\u0065lbaron for giant cream puffs with forest views.",
    japanese: "None in Berchtesgaden. Wabi Sabi in Salzburg (30 min by bus) for Japanese dining.",
    bestTime: "Late September (fall foliage) or Himmelfahrt weekend May 14\u201317 (spring wildflowers).",
    budgetTable: [
      ["Hotel (3 nights)", "\u20ac270\u2013600"],
      ["Food & coffee", "\u20ac100\u2013160"],
      ["Activities (boat, Jenner, museum, gorge)", "\u20ac60\u201380"],
      ["Total", "\u20ac430\u2013840"]
    ],
    vibeTags: ["\ud83c\udfd4\ufe0f alpine", "\ud83e\udd7e hiking", "\ud83c\udf3f nature", "\ud83c\udfdb\ufe0f history"]
  },
  {
    id: 17,
    name: "Quedlinburg & Harz",
    country: "Germany",
    days: [3, 4],
    dist: "germany",
    vibes: ["nature", "culture", "history"],
    subVibes: ["forests", "medieval", "hiking"],
    budget: "comfortable",
    easter: false,
    pitch: "A UNESCO World Heritage town with over 2,000 half-timbered houses spanning six centuries, perched at the edge of Germany\u2019s most mystical hiking region: granite peaks, deep gorges, the narrow-gauge Brockenbahn steam railway, and trails that inspired the Brothers Grimm.",
    transport: "ICE to Magdeburg or Halberstadt, then RE: ~2.5\u20133 hours (1 change). Covered by DB pass.",
    highlights: [
      { icon: "\ud83c\udfe0", text: "Quedlinburg Altstadt \u2014 UNESCO old town, oldest half-timbered house in Germany (1310)", img: { file: "images/17-quedlinburg/inline-altstadt.webp", caption: "Quedlinburg Altstadt", credit: "Toksave — CC BY-SA 3.0" } },
      { icon: "\ud83d\ude82", text: "Brockenbahn Steam Railway \u2014 climb to 1,141m Brocken summit (Goethe\u2019s Faust witch-mountain). ~\u20ac47", img: { file: "images/17-quedlinburg/inline-brockenbahn.webp", caption: "Brockenbahn steam train", credit: "Markus Trienke — CC BY-SA 2.0" } },
      { icon: "\ud83c\udfde\ufe0f", text: "Bodetal Gorge \u2014 10 km through Germany\u2019s \u201cGrand Canyon\u201d, 250m sheer granite cliffs", img: { file: "images/17-quedlinburg/inline-bodetal.webp", caption: "Bodetal gorge, Harz", credit: "Michael Fiegle — CC BY-SA 3.0" } },
      { icon: "\u26ea", text: "Stiftskirche St. Servatius \u2014 1,000-year-old treasury with rare Ottonian gold relics. ~\u20ac6", img: { file: "images/17-quedlinburg/inline-stiftskirche.webp", caption: "Stiftskirche St. Servatius", credit: "Jörg Blobelt — CC BY-SA 4.0" } },
      { icon: "🎨", text: "Museum Lyonel Feininger — Europe's largest print collection of the Bauhaus master, saved from Nazi 'degenerate art' destruction by a friend who hid them in Quedlinburg", hidden: true, img: { file: "images/17-quedlinburg/inline-feininger-museum.webp", caption: "Lyonel Feininger Galerie", credit: "© Kulturstiftung Sachsen-Anhalt, Christoph Jann — CC BY-SA 3.0" } },
      { icon: "🪨", text: "Teufelsmauer Trail — 20 km of jagged sandstone 'Devil's Wall' outcrops, folk-tale origin, best short section from Weddersleben (2-hour loop with castle ruin views)", hidden: true, img: { file: "images/17-quedlinburg/inline-teufelsmauer.webp", caption: "Teufelsmauer, Harz", credit: "Matthias Süßen — CC BY-SA 4.0" } },
      { icon: "🕳️", text: "Baumannshöhle in Rübeland — Germany's oldest publicly accessible stalactite cave (since 1646), Goethe Hall used for concerts deep underground. ~€12", hidden: true, img: { file: "images/17-quedlinburg/inline-baumannshohle.webp", caption: "Baumannshöhle cave", credit: "Goldmull — CC BY-SA 4.0" } }
    ],
    hotel: "Hotel Schlossm\u00fchle \u2014 converted watermill with spa, pool, sauna, garden terrace. ~\u20ac100\u2013140/night",
    pastry: "Kaffeer\u00f6sterei Quedlinburg \u2014 single-origin pour-overs + homemade cakes. Schokoladen-Kontor for bean-to-bar chocolate tastings.",
    japanese: "None in Quedlinburg. Lean into local Harzer Schmorbraten and wild game cuisine instead.",
    bestTime: "Himmelfahrt weekend, May 14\u201317 or late April. Harz forests magical in spring.",
    budgetTable: [
      ["Hotel (3 nights)", "\u20ac300\u2013420"],
      ["Food & coffee", "\u20ac80\u2013130"],
      ["Activities (Brockenbahn, museum, tour)", "\u20ac60\u201375"],
      ["Total", "\u20ac440\u2013625"]
    ],
    vibeTags: ["\ud83c\udfe0 fairy-tale", "\ud83e\udd7e hiking", "\ud83d\ude82 steam train", "\ud83d\udcdc history"]
  },
  {
    id: 18,
    name: "Passau",
    country: "Germany",
    days: [4],
    dist: "germany",
    vibes: ["culture", "cozy"],
    subVibes: ["lakeside", "architecture", "art", "cozy"],
    budget: "lean",
    easter: false,
    pitch: "The \u201cCity of Three Rivers\u201d \u2014 where the Danube, Inn, and Ilz meet in a visible triple confluence of blue, green, and black waters. The old town crowds onto a narrow peninsula, crowned by the largest cathedral organ in the world (17,974 pipes). An Italian hill town accidentally dropped into Bavaria.",
    transport: "ICE Berlin \u2192 M\u00fcnchen (~4h), then regional to Passau (~2h): ~6h total. DB pass.",
    highlights: [
      { icon: "\ud83c\udf0a", text: "Dreifl\u00fcsseeck \u2014 the dramatic triple confluence where blue, green, and dark waters visibly merge", img: { file: "images/18-passau/inline-dreiflusseck.webp", caption: "Dreiflüsseeck confluence", credit: "Flocci Nivis — CC BY 4.0" } },
      { icon: "\ud83c\udfb5", text: "Stephansdom Organ Concert \u2014 world\u2019s largest cathedral organ (17,974 pipes). Daily noon concerts May\u2013Oct. ~\u20ac5", img: { file: "images/18-passau/inline-stephansdom.webp", caption: "Passau Stephansdom", credit: "Tobi 87 — CC BY-SA 4.0" } },
      { icon: "\ud83c\udff0", text: "Veste Oberhaus \u2014 13th-century hilltop fortress with panoramic views. ~\u20ac5", img: { file: "images/18-passau/inline-veste-oberhaus.webp", caption: "Veste Oberhaus, Passau", credit: "High Contrast — CC BY 3.0 de" } },
      { icon: "\ud83d\udeb6", text: "Old Town Passageways \u2014 medieval covered Durchh\u00e4user connecting streets (free map at tourist office)", img: { file: "images/18-passau/inline-altstadt.webp", caption: "Passau old town alley", credit: "Rosa-Maria Rinkl — CC BY-SA 4.0" } },
      { icon: "🪜", text: "Mariahilf Wallfahrtsstiege — covered 321-step pilgrimage staircase climbing to a 1627 Baroque monastery, walls lined with centuries of thank-you plaques and rosaries", hidden: true, img: { file: "images/18-passau/inline-mariahilf.webp", caption: "Wallfahrtskirche Mariahilf", credit: "Flocci Nivis — CC BY 4.0" } },
      { icon: "🥃", text: "Glasmuseum Passau — world's largest European glass collection (30,000 pieces, Baroque to Art Deco) inside Hotel Wilder Mann, where Empress Sisi stayed", hidden: true, img: { file: "images/18-passau/inline-glasmuseum.webp", caption: "Glasmuseum Passau", credit: "Konrad Lackerbeck — CC BY-SA 3.0" } },
      { icon: "🎭", text: "Scharfrichterhaus — former 1200–1400 executioner's house turned cult cabaret/comedy stage, launched the career of Bavaria's best satirists", hidden: true }
    ],
    hotel: "Hotel Wilder Mann \u2014 historic hotel on the main square, Danube views. Empress Sisi once stayed. ~\u20ac90\u2013130/night",
    pastry: "Caf\u00e9 Simon \u2014 exquisite handmade pralines & Nussstangerl. Kaffeehaus Kowalski for specialty coffee by the river.",
    japanese: "Sushi Passau \u2014 small sushi bar near the Dom. Kokoro for ramen and Japanese comfort food.",
    bestTime: "Late May through June. Three rivers most dramatic with spring melt. Organ concerts daily from May.",
    budgetTable: [
      ["Hotel (3 nights)", "\u20ac270\u2013390"],
      ["Food & coffee", "\u20ac90\u2013140"],
      ["Activities", "\u20ac20\u201335"],
      ["Total", "\u20ac380\u2013565"]
    ],
    vibeTags: ["\ud83c\udf0a riverside", "\ud83c\udfb5 music", "\ud83c\udfe0 Italian-vibes", "\ud83c\udfdb\ufe0f culture"]
  },
  {
    id: 19,
    name: "Heidelberg",
    country: "Germany",
    days: [3, 4],
    dist: "germany",
    vibes: ["culture", "nature", "hiking"],
    subVibes: ["literary", "hiking", "lakeside", "art"],
    budget: "comfortable",
    easter: false,
    pitch: "Forget the castle. Heidelberg without it is still one of Germany\u2019s most beautiful cities: the Philosophenweg made Goethe lose his mind, the university\u2019s student prison is covered in 150 years of inmate graffiti, and the Kurpf\u00e4lzisches Museum holds a 500,000-year-old jawbone.",
    transport: "ICE Berlin \u2192 Mannheim, then S-Bahn: ~4.5\u20135 hours (1 change). DB pass.",
    highlights: [
      { icon: "\ud83d\udeb6", text: "Philosophenweg \u2014 hillside path beloved by Hegel, H\u00f6lderlin & Mark Twain. 6 km loop through Celtic ruins.", img: { file: "images/19-heidelberg/inline-philosophenweg.webp", caption: "View from Philosophenweg", credit: "R. J. Mathar — CC BY-SA 4.0" } },
      { icon: "\ud83d\udd12", text: "Studentenkarzer \u2014 student prison (1778\u20131914) with 150 years of graffiti & rebellion. ~\u20ac3", img: { file: "images/19-heidelberg/inline-studentenkarzer.webp", caption: "Studentenkarzer graffiti", credit: "Stefan Kühn — CC BY 3.0" } },
      { icon: "\ud83c\udfdb\ufe0f", text: "Kurpf\u00e4lzisches Museum \u2014 500,000-year-old Homo heidelbergensis jawbone & Riemenschneider altarpiece", img: { file: "images/19-heidelberg/inline-kurpfalzisches-museum.webp", caption: "Kurpfälzisches Museum", credit: "4028mdk09 — CC BY-SA 3.0" } },
      { icon: "\u2615", text: "Neuenheim Riverside Walk & Brunch \u2014 leafy promenade lined with independent caf\u00e9s", img: { file: "images/19-heidelberg/inline-neuenheim.webp", caption: "Neuenheim riverside, Heidelberg", credit: "Stephan van Helden — CC BY-SA 4.0" } },
      { icon: "🏟️", text: "Thingstätte amphitheatre — 1935 Nazi propaganda amphitheatre on Heiligenberg, 8,000 red-sandstone seats slowly reclaimed by forest, medieval St. Michael ruins next door", hidden: true, img: { file: "images/19-heidelberg/inline-thingstatte.webp", caption: "Thingstätte, Heiligenberg", credit: "BishkekRocks — CC BY-SA 3.0" } },
      { icon: "🐍", text: "Schlangenweg — 18th-century 'Snake Path' stone stairway winding up from the Old Bridge to the Philosophenweg, sandstone pulpits and lizard-inhabited dry walls", hidden: true, img: { file: "images/19-heidelberg/inline-schlangenweg.webp", caption: "Schlangenweg stairway", credit: "Stephan van Helden — CC BY-SA 4.0" } },
      { icon: "🏰", text: "Festung Dilsberg — tiny 14th-century hilltop village-ruin above the Neckar, reached via a section of the Neckarsteig hiking trail (10 km from Heidelberg)", hidden: true, img: { file: "images/19-heidelberg/inline-dilsberg.webp", caption: "Festung Dilsberg", credit: "Defisch — CC BY-SA 3.0" } }
    ],
    hotel: "Hotel Holl\u00e4nder Hof \u2014 on the Neckar riverbank with old town views. ~\u20ac100\u2013150/night",
    pastry: "Caf\u00e9 Rossi \u2014 outstanding cakes & specialty coffee. Caf\u00e9 Nomad for third-wave micro-roastery near the Old Bridge.",
    japanese: "Yumi Japanese Restaurant \u2014 authentic sushi, udon & tempura by the bridge. Ramen-Ya for tonkotsu.",
    bestTime: "Mid-April (cherry blossoms on Philosophenweg) or late September (golden Neckar valley light).",
    budgetTable: [
      ["Hotel (3 nights)", "\u20ac300\u2013450"],
      ["Food & coffee", "\u20ac100\u2013160"],
      ["Activities", "\u20ac15\u201325"],
      ["Total", "\u20ac415\u2013635"]
    ],
    vibeTags: ["\ud83d\udcda literary", "\ud83e\udd7e hiking", "\ud83c\udfdb\ufe0f culture", "\ud83c\udf38 scenic"]
  },
  {
    id: 20,
    name: "W\u00fcrzburg",
    country: "Germany",
    days: [3, 4],
    dist: "germany",
    vibes: ["culture", "foodie"],
    subVibes: ["drinks", "wine", "baroque", "art"],
    budget: "comfortable",
    easter: false,
    pitch: "The capital of Franconian wine, anchored by a UNESCO Baroque palace with the largest ceiling fresco ever painted, a 12th-century fortress overlooking vineyards, and Germany\u2019s most walkable wine culture. The structured tastings at medieval wine estates are perfect for solo travelers.",
    transport: "ICE Berlin \u2192 W\u00fcrzburg: ~3.5\u20134 hours (1 change in Erfurt or N\u00fcrnberg). DB pass.",
    highlights: [
      { icon: "\ud83c\udfdb\ufe0f", text: "Residenz W\u00fcrzburg (UNESCO) \u2014 Tiepolo\u2019s 677m\u00b2 ceiling fresco, largest in the world. ~\u20ac9", img: { file: "images/20-wurzburg/inline-residenz.webp", caption: "Residenz Würzburg", credit: "Unknown — CC0" } },
      { icon: "\ud83c\udf77", text: "B\u00fcrgerspital Wine Tasting \u2014 estate founded 1316, structured tastings in medieval cellars. ~\u20ac15\u201330", img: { file: "images/20-wurzburg/inline-burgerspital.webp", caption: "Bürgerspital, Würzburg", credit: "DXR — CC BY-SA 4.0" } },
      { icon: "\ud83c\udf09", text: "Alte Mainbr\u00fccke \u2014 Baroque bridge with wine stands, drink Br\u00fcckenschoppen at sunset", img: { file: "images/20-wurzburg/inline-alte-mainbrucke.webp", caption: "Alte Mainbrücke at sunset", credit: "Flocci Nivis — CC BY 4.0" } },
      { icon: "\ud83c\udff0", text: "Festung Marienberg \u2014 hilltop fortress with Riemenschneider sculpture collection", img: { file: "images/20-wurzburg/inline-marienberg.webp", caption: "Festung Marienberg", credit: "Rainer Lippert This image was created with Hugin. — CC0" } },
      { icon: "🗾", text: "Siebold-Museum — Europe's only museum of Edo-period Japan, dedicated to the Würzburg doctor who introduced Western medicine to Japan in 1823; Fauna Japonica originals", hidden: true, img: { file: "images/20-wurzburg/inline-siebold.webp", caption: "Siebold-Museum Würzburg", credit: "Parklife — CC BY-SA 3.0" } },
      { icon: "🏛️", text: "Martin von Wagner Museum — free university museum hidden in the Residenz south wing; Germany's 3rd-largest Greek ceramics collection plus Etruscan and Egyptian antiquities", hidden: true, img: { file: "images/20-wurzburg/inline-wagner-museum.webp", caption: "Martin von Wagner Museum", credit: "Mattes — Public domain" } },
      { icon: "📿", text: "Käppele Rococo pilgrimage church — Balthasar Neumann's 1750 hilltop chapel with 77 life-size sculpted stations climbing from the Main, onion-dome views over the vineyards", hidden: true, img: { file: "images/20-wurzburg/inline-kappele.webp", caption: "Käppele Würzburg", credit: "Ermell — CC BY-SA 4.0" } }
    ],
    hotel: "Hotel Rebstock \u2014 4-star in a Rococo townhouse in the pedestrian zone. ~\u20ac100\u2013150/night",
    pastry: "Caf\u00e9 Michel (since 1896) \u2014 Franconian Apfelkuchen with cream. Barista Caf\u00e9 W\u00fcrzburg for third-wave coffee.",
    japanese: "Sakura Sushi Bar \u2014 near Marktplatz with nigiri, maki & Japanese tea. Miso Ramen Bar for broth bowls.",
    bestTime: "Late September / early October (wine harvest, golden Main valley light). Or May Labour Day weekend.",
    budgetTable: [
      ["Hotel (3 nights)", "\u20ac300\u2013450"],
      ["Food, coffee & wine", "\u20ac100\u2013170"],
      ["Activities (Residenz, wine tasting, museum)", "\u20ac40\u201355"],
      ["Total", "\u20ac440\u2013675"]
    ],
    vibeTags: ["\ud83c\udf77 wine", "\ud83c\udfdb\ufe0f baroque", "\ud83c\udfa8 art", "\ud83c\udfe0 cozy"]
  },
  {
    id: 21,
    name: "Weimar",
    country: "Germany",
    days: [3, 4],
    dist: "germany",
    vibes: ["culture", "history"],
    subVibes: ["literary", "art", "memorial"],
    budget: "lean",
    easter: false,
    pitch: "Where Goethe and Schiller wrote, the Bauhaus was born, and Germany\u2019s first democratic constitution was drafted \u2014 all in a walkable town of 65,000. Then 10 km outside, the Buchenwald memorial delivers one of the most important museum experiences in Europe.",
    transport: "ICE Berlin \u2192 Weimar: ~2.5 hours (direct or 1 change in Erfurt). DB pass.",
    highlights: [
      { icon: "\ud83c\udfdb\ufe0f", text: "Bauhaus Museum Weimar (2019) \u2014 world\u2019s oldest Bauhaus collection. Interactive, solo-friendly. ~\u20ac11", img: { file: "images/21-weimar/inline-highlight-0.webp", caption: "Bauhaus Museum Weimar (2019)", credit: "Geolina163 — CC BY-SA 4.0" } },
      { icon: "\ud83d\udcda", text: "Goethe\u2019s Wohnhaus \u2014 preserved exactly as he left it: study, art collection, mineral cabinet. ~\u20ac14", img: { file: "images/21-weimar/inline-highlight-1.webp", caption: "Goethe's Wohnhaus, Weimar", credit: "Yair-haklai — CC BY-SA 4.0" } },
      { icon: "\ud83d\udcda", text: "Herzogin Anna Amalia Bibliothek \u2014 one of the most beautiful library interiors in the world. ~\u20ac8", img: { file: "images/21-weimar/inline-highlight-2.webp", caption: "Duchess Anna Amalia Library Rococo Hall", credit: "Samael Schröder (Senfex) — CC BY-SA 4.0" } },
      { icon: "\ud83d\udd4a\ufe0f", text: "Buchenwald Memorial \u2014 10 km from center (bus 6). 3\u20134 hours. Free. Essential.", img: { file: "images/21-weimar/inline-highlight-3.webp", caption: "Buchenwald concentration camp entrance gate ('Jedem das Seine')", credit: "Clemens Vasters — CC BY 2.0" } },
      { icon: "🏛️", text: "Nietzsche-Archiv — Henry van de Velde's 1903 Jugendstil interior at Villa Silberblick; manuscripts gained UNESCO Memory of the World status in 2025.", hidden: true, img: { file: "images/21-weimar/inline-highlight-4.webp", caption: "Villa Silberblick (Nietzsche-Archiv), Weimar", credit: "Carl Novator — CC BY-SA 4.0" } },
      { icon: "🌳", text: "Park an der Ilm artificial-ruin walk — UNESCO 58-ha landscape garden with 1786 fake Tempelherrenhaus ruin, Goethe's Gartenhaus and the Doric Römisches Haus.", hidden: true, img: { file: "images/21-weimar/inline-highlight-5.webp", caption: "Tempelherrenhaus artificial ruin in Park an der Ilm", credit: "Obikin — CC BY-SA 3.0" } },
      { icon: "🎹", text: "Liszt-Haus on park's western edge — Franz Liszt's 1869–86 residence with his original Bechstein, sheet music and a piano he taught students on.", hidden: true, img: { file: "images/21-weimar/inline-highlight-6.webp", caption: "Liszt-Haus, Weimar", credit: "Yair-haklai — CC BY-SA 4.0" } }
    ],
    hotel: "Hotel Amalienhof \u2014 boutique in 1826 townhouse near market square, inner courtyard. ~\u20ac90\u2013130/night",
    pastry: "ACC Galerie & Caf\u00e9 \u2014 art gallery + caf\u00e9 with cakes in vaulted cellar. Kaffeer\u00f6sterei Weimar for single-origin beans.",
    japanese: "Sushi Weimar \u2014 small sushi bar with fresh nigiri. Toshi for Japanese-inspired bowls and ramen.",
    bestTime: "Mid-April or combine with Erfurt (15 min apart by ICE) for a 4-day trip.",
    budgetTable: [
      ["Hotel (3 nights)", "\u20ac270\u2013390"],
      ["Food & coffee", "\u20ac80\u2013130"],
      ["Activities (Bauhaus, Goethe, library)", "\u20ac35\u201350"],
      ["Total", "\u20ac385\u2013570"]
    ],
    vibeTags: ["\ud83c\udfdb\ufe0f culture", "\ud83d\udcda literary", "\ud83c\udfa8 Bauhaus", "\ud83d\udd4a\ufe0f memorial"]
  },
  {
    id: 22,
    name: "Mainz",
    country: "Germany",
    days: [3, 4],
    dist: "germany",
    vibes: ["culture", "foodie"],
    subVibes: ["history", "wine", "art", "drinks"],
    budget: "comfortable",
    easter: false,
    pitch: "The birthplace of printing \u2014 where Gutenberg invented movable type. A wine city on the Rhine that out-charms Frankfurt: the Chagall stained-glass windows in St. Stephan\u2019s are among Europe\u2019s most beautiful, and the food market culture is excellent. Often overlooked, almost entirely yours.",
    transport: "ICE Berlin \u2192 Mainz: ~3.5\u20134 hours (1 change in Frankfurt). DB pass.",
    highlights: [
      { icon: "\ud83d\udcda", text: "Gutenberg Museum \u2014 two original Gutenberg Bibles (1450s) + live printing demos. ~\u20ac5", img: { file: "images/22-mainz/inline-highlight-0.webp", caption: "Gutenberg Museum, Mainz", credit: "dronepicr — CC BY 2.0" } },
      { icon: "\u2728", text: "St. Stephan\u2019s Chagall Windows \u2014 nine luminous blue windows, his final major work. Free.", img: { file: "images/22-mainz/inline-highlight-1.webp", caption: "Nave of St. Stephan, Mainz (home of Chagall windows)", credit: "Kandschwar — CC BY-SA 3.0" } },
      { icon: "\ud83c\udf77", text: "Rhine Promenade & Wine Walk \u2014 riverfront stroll + Augustinerstra\u00dfe Weinstuben for local Riesling", img: { file: "images/22-mainz/inline-highlight-2.webp", caption: "Rheinufer (Rhine promenade), Mainz", credit: "Oliver Abels (SBT) — CC BY-SA 4.0" } },
      { icon: "\ud83c\udfdb\ufe0f", text: "R\u00f6misch-Germanisches Zentralmuseum \u2014 Roman & early medieval archaeology. Free.", img: { file: "images/22-mainz/inline-highlight-3.webp", caption: "Kurfürstliches Schloss Mainz (houses the RGZM)", credit: "Moguntiner — CC BY-SA 3.0 / GFDL" } },
      { icon: "🍾", text: "Kupferberg Sektkellerei — world's deepest sparkling-wine cellar, 60 cellars on 7 levels + Otto von Bismarck's restored office. 90-min guided tour with tasting.", hidden: true, img: { file: "images/22-mainz/inline-highlight-4.webp", caption: "Kupferberg-Sektkellerei signage, Mainz", credit: "Justus Blümer — CC BY-SA 3.0" } },
      { icon: "🏛️", text: "Drususstein inside Zitadelle — 20 BC Roman cenotaph to Augustus's stepson, tucked in the far corner of a 1660 star fortress on Jakobsberg hill.", hidden: true, img: { file: "images/22-mainz/inline-highlight-5.webp", caption: "Drususstein in the Mainz Zitadelle", credit: "Barnos — CC BY-SA 4.0" } },
      { icon: "☕", text: "dicke lilli, gutes kind — tiny Neustadt café in a former dairy, third-wave filter, vegan cakes; pair with a walk along the quiet Zollhafen harbour.", hidden: true }
    ],
    hotel: "Hyatt Regency Mainz \u2014 Rhine-view rooms, pool, surprisingly affordable. ~\u20ac110\u2013160/night",
    pastry: "Caf\u00e9 Wacker \u2014 Fastnachtskrapfen & elaborate tortes. R\u00f6sterei Four Handfilter for own-roasted beans & cold brew.",
    japanese: "Kurose \u2014 authentic Japanese izakaya run by a Japanese chef. Momiji for sushi & bento.",
    bestTime: "June or September. Rhine promenade culture at its best in warm weather.",
    budgetTable: [
      ["Hotel (3 nights)", "\u20ac255\u2013480"],
      ["Food, coffee & wine", "\u20ac100\u2013160"],
      ["Activities (Gutenberg Museum)", "\u20ac10\u201315"],
      ["Total", "\u20ac365\u2013655"]
    ],
    vibeTags: ["\ud83d\udcd6 printing", "\ud83c\udf77 wine", "\ud83c\udfdb\ufe0f culture", "\ud83c\udfa8 art"]
  },
  // ---- INTERNATIONAL: TRAIN ----
  {
    id: 23,
    name: "Pozna\u0144",
    country: "Poland",
    days: [3, 4],
    dist: "neighbor",
    vibes: ["foodie", "culture", "quirky"],
    subVibes: ["pastries", "markets", "architecture", "medieval"],
    budget: "lean",
    easter: false,
    pitch: "The croissant capital of Europe \u2014 and no, that\u2019s not a joke. Pozna\u0144 has an EU-protected pastry (rogal \u015bwi\u0119tomarci\u0144ski), a museum with live baking shows, and at noon every day, two mechanical goats butt heads on the Town Hall clock. A 2.5-hour trip that feels like another universe.",
    transport: "Direct EC train Berlin \u2192 Pozna\u0144 G\u0142\u00f3wny: ~2.5\u20133 hours. Polish portion ~\u20ac15\u201325 each way.",
    highlights: [
      { icon: "\ud83e\udd50", text: "Croissant Museum \u2014 interactive baking show + taste the EU-protected rogal. English weekends at 14:00. ~\u20ac9", img: { file: "images/23-poznan/inline-highlight-0.webp", caption: "Rogal świętomarciński (EU-protected St. Martin's croissant)", credit: "Kasia Kronenberger (Polonist) — CC BY 2.0" } },
      { icon: "\ud83c\udfe0", text: "Stary Rynek & Goats \u2014 pastel Renaissance square with mechanical goats at noon", img: { file: "images/23-poznan/inline-highlight-1.webp", caption: "Stary Rynek with Renaissance Town Hall, Poznań", credit: "Subjectiveart — CC BY-SA 4.0" } },
      { icon: "\u26ea", text: "Cathedral Island (Ostr\u00f3w Tumski) \u2014 10th-century cathedral + Porta Posnania multimedia museum. ~\u20ac5", img: { file: "images/23-poznan/inline-highlight-2.webp", caption: "Poznań Cathedral on Ostrów Tumski", credit: "Magda Felis — CC BY-SA 3.0 PL" } },
      { icon: "\ud83c\udfed", text: "Stary Browar \u2014 former brewery, won \u201cBest Medium Shopping Centre in the World\u201d (2005)", img: { file: "images/23-poznan/inline-highlight-3.webp", caption: "Stary Browar (Old Brewery), Poznań", credit: "A.Savin — CC BY-SA 3.0 / FAL" } },
      { icon: "🔐", text: "Enigma Cipher Centre (Centrum Szyfrów Enigma, opened 2021) — immersive museum on the three Poznań mathematicians who first cracked the Enigma in 1932.", hidden: true, img: { file: "images/23-poznan/inline-highlight-4.webp", caption: "Main entrance of the Enigma Cipher Centre, Poznań", credit: "Łukasz Gdak — CC0" } },
      { icon: "🌴", text: "Palmiarnia in Wilson Park — 9 interconnected pavilions, 17,000 plants across 1,100 species; one of Europe's largest palm houses, begun 1910.", hidden: true, img: { file: "images/23-poznan/inline-highlight-5.webp", caption: "Palmiarnia Poznańska (palm house)", credit: "Fidelio — CC BY-SA 3.0 PL" } },
      { icon: "🎨", text: "Śródka mural + district — the 'Śródka Tale' trompe-l'œil mural (2015) named by National Geographic one of Poland's 7 New Wonders; hipster coffee around it.", hidden: true, img: { file: "images/23-poznan/inline-highlight-6.webp", caption: "'Opowieść śródecka' trompe-l'œil mural, Śródka, Poznań", credit: "Аимаина хикари — CC0" } }
    ],
    hotel: "PURO Hotel Pozna\u0144 \u2014 modern design hotel, 3 min from market square, complimentary lobby coffee. ~\u20ac60\u201390/night",
    pastry: "Rogal Pastry Shop \u2014 award-winning fresh rogal with coffee. Piece of Cake Coffee for specialty roastery. Brisman Coffee for single-origin filter.",
    japanese: "Oishii Sushi \u2014 fresh nigiri & creative rolls. Manekineko for ramen, yakitori & matcha desserts.",
    bestTime: "Labour Day weekend May 1\u20133 or any spring weekend. Square caf\u00e9s buzzing, Poland\u2019s May weather ideal.",
    budgetTable: [
      ["Train (return, Polish portion)", "\u20ac30\u201350"],
      ["Hotel (3 nights)", "\u20ac180\u2013300"],
      ["Food & coffee (Poland prices!)", "\u20ac50\u201370"],
      ["Activities", "\u20ac15\u201320"],
      ["Total", "\u20ac275\u2013440"]
    ],
    vibeTags: ["\ud83e\udd50 pastries", "\ud83c\udfdb\ufe0f culture", "\ud83d\udcb0 affordable", "\ud83c\udfad quirky"]
  },
  {
    id: 24,
    name: "Olomouc",
    country: "Czech Republic",
    days: [4],
    dist: "neighbor",
    vibes: ["culture", "foodie"],
    subVibes: ["baroque", "medieval", "university", "foodie"],
    budget: "lean",
    easter: false,
    pitch: "Often called \u201cCzech Republic\u2019s hidden gem\u201d \u2014 a university city with a UNESCO Baroque plague column (largest in Central Europe), more fountains than any Czech city outside Prague, and a cheese so pungent it has EU protected status. Prague\u2019s beauty at 10% of the tourists and 30% of the prices.",
    transport: "EC train Berlin \u2192 Prague (~4.5h), Czech rail to Olomouc (~2h): ~6.5\u20137h total. Or FlixBus direct (~6h, \u20ac25\u201340).",
    highlights: [
      { icon: "\u26ea", text: "Holy Trinity Column (UNESCO) \u2014 largest Baroque plague column in Central Europe (35m). Chapel inside the base.", img: { file: "images/24-olomouc/inline-highlight-0.webp", caption: "Holy Trinity Column, Olomouc", credit: "Michal Maňas — CC BY 4.0" } },
      { icon: "\u231a", text: "Olomouc Astronomical Clock \u2014 Soviet-era mosaic clock with workers instead of saints. Activates at noon.", img: { file: "images/24-olomouc/inline-highlight-1.webp", caption: "Olomouc Astronomical Clock", credit: "Michal Maňas — CC BY 4.0" } },
      { icon: "\ud83c\udfdb\ufe0f", text: "Archdiocesan Museum \u2014 finest religious art in Central Europe in the oldest building in Moravia", img: { file: "images/24-olomouc/inline-highlight-2.webp", caption: "Archdiocesan Museum Olomouc", credit: "Muzeum umění Olomouc (Markéta Ondrušková) — CC BY-SA 4.0" } },
      { icon: "\ud83e\uddc0", text: "Tvaru\u017eky Tasting \u2014 Olomouc\u2019s famous EU-protected stinky cheese. Try it fried at any traditional restaurant.", img: { file: "images/24-olomouc/inline-highlight-3.webp", caption: "Olomoucké tvarůžky (EU-protected stinky cheese)", credit: "Dezidor — CC BY 3.0" } },
      { icon: "⛪", text: "Svatý Kopeček Basilica — Baroque pilgrimage church on a wooded hill 7 km NE; 2h walk or tram 4 + short climb, panoramic views over Haná plain.", hidden: true, img: { file: "images/24-olomouc/inline-highlight-4.webp", caption: "Basilica of the Visitation of the Virgin Mary, Svatý Kopeček", credit: "Pudelek — CC BY-SA 4.0" } },
      { icon: "🏰", text: "Fort Radíkov (Fort XVII) — only completed 1871–82 'fest' of the Imperial Olomouc Fortress, reachable via a 30 km forts-ring trail suitable on foot or bike.", hidden: true, img: { file: "images/24-olomouc/inline-highlight-5.webp", caption: "Fort Radíkov (Fort XVII), Olomouc", credit: "Arciol24 — CC BY-SA 4.0" } },
      { icon: "☕", text: "Long Story Short Eatery & Bakery — Bib Gourmand listing combining specialty coffee, sourdough and small plates in a minimalist café-workshop.", hidden: true }
    ],
    hotel: "Hotel Arigone \u2014 4-star boutique in restored Baroque building, vaulted ceilings, wellness center. ~\u20ac70\u2013100/night",
    pastry: "Caf\u00e9 Mahler \u2014 elegant Viennese-style coffeehouse with strudel & kol\u00e1\u010de. Kafe Patriot for specialty V60 & AeroPress.",
    japanese: "Sushi Time Olomouc for sushi. Ramen Olomouc for tonkotsu bowls. Prague (2h) has excellent options too.",
    bestTime: "Pfingsten weekend May 23\u201325 or early October. University gives the city its buzz.",
    budgetTable: [
      ["Transport (return)", "\u20ac40\u201370"],
      ["Hotel (3 nights)", "\u20ac210\u2013300"],
      ["Food & coffee (Czech prices)", "\u20ac50\u201375"],
      ["Activities & museums", "\u20ac15\u201320"],
      ["Total", "\u20ac315\u2013465"]
    ],
    vibeTags: ["\ud83c\udfdb\ufe0f baroque", "\ud83c\udf93 university", "\ud83d\udcb0 affordable", "\ud83e\uddc0 foodie"]
  },
  {
    id: 25,
    name: "Malm\u00f6",
    country: "Sweden",
    days: [4],
    dist: "neighbor",
    vibes: ["coffee", "spa", "culture"],
    subVibes: ["coffee", "seaside", "coastal", "art"],
    budget: "splurge",
    easter: false,
    pitch: "Scandinavia\u2019s most accessible city from Berlin \u2014 take the night train and wake up in Sweden. Compact, bike-friendly, with one of Europe\u2019s best food scenes for its size, a Michelin-starred ramen bar, the best kanelbullar in Southern Sweden, and a waterfront promenade designed by Calatrava.",
    transport: "Sn\u00e4llt\u00e5get Night Train Berlin \u2192 Malm\u00f6: ~9h overnight, ~\u20ac55\u201380 one-way in private compartment.",
    highlights: [
      { icon: "\ud83d\uddbc\ufe0f", text: "Moderna Museet Malm\u00f6 \u2014 modern art in a converted 1901 power station. Free permanent collection.", img: { file: "images/25-malmo/inline-highlight-0.webp", caption: "Moderna Museet Malmö (converted 1901 power station)", credit: "Åsa Lundén — CC BY-SA 3.0" } },
      { icon: "\ud83e\uddd1\u200d\ud83c\udf73", text: "Malm\u00f6 Saluhall \u2014 covered market hall: Swedish meatballs, seafood, specialty coffee", img: { file: "images/25-malmo/inline-highlight-1.webp", caption: "Malmö Saluhall interior — market stalls & seafood counters", credit: "Jenny Andersson / News Øresund — CC BY 2.0" } },
      { icon: "\ud83c\udfd6\ufe0f", text: "Ribersborgsstranden & Kallbadhuset \u2014 historic bathhouse: cold-water swimming, sauna, sea views. ~\u20ac8", img: { file: "images/25-malmo/inline-highlight-2.webp", caption: "Ribersborgs kallbadhus pier, Malmö", credit: "Susanne Nilsson (Infomastern) — CC BY-SA 3.0" } },
      { icon: "\ud83c\udfd7\ufe0f", text: "V\u00e4stra Hamnen Walk \u2014 self-guided architecture tour around Turning Torso (tallest in Scandinavia)", img: { file: "images/25-malmo/inline-highlight-3.webp", caption: "Turning Torso, Västra Hamnen, Malmö", credit: "Väsk — CC BY-SA 3.0" } },
      { icon: "🤢", text: "Disgusting Food Museum (Södra Förstadsgatan 2) — 80 'delicacies' you can smell & taste: surströmming, casu marzu, Peruvian cuy. Ticket doubles as a barf bag.", hidden: true },
      { icon: "🥐", text: "Hollandia (since 1933) — Södra Förstadsgatan 8, beloved for traditional pearl-sugar kanelbullar made to century-old recipe; order one warm, eat on the bench.", hidden: true, img: { file: "images/25-malmo/inline-highlight-5.webp", caption: "Kanelbulle (Swedish cinnamon bun) — representative image", credit: "Bengt Olof Åradsson — Public Domain" } },
      { icon: "🏖️", text: "Ribersborgs Kallbadhuset — 1898 pier-end bathhouse with wood-fired sauna + Öresund cold-plunge, sex-segregated nude bathing, sea view to Denmark. ~€8.", hidden: true, img: { file: "images/25-malmo/inline-highlight-6.webp", caption: "Ribersborgs kallbadhus entrance doors", credit: "Susanne Nilsson (Infomastern) — CC BY-SA 3.0" } }
    ],
    hotel: "Story Hotel Studio Malm\u00f6 \u2014 Nordic design in a 1930s building, caf\u00e9, library. ~\u20ac100\u2013140/night",
    pastry: "Lilla Kafferosteriet \u2014 legendary specialty roastery since 2006. Hollandia (since 1933) for the best kanelbullar.",
    japanese: "Izakaya Koi \u2014 rated one of Sweden\u2019s best Japanese restaurants. Totemo Ramen for acclaimed tonkotsu.",
    bestTime: "June weekend. Swedish summer: light until 22:00, waterfront alive, sauna-swim perfect.",
    budgetTable: [
      ["Night train (return)", "\u20ac110\u2013160"],
      ["Hotel (3 nights)", "\u20ac210\u2013420"],
      ["Food & coffee (Sweden prices)", "\u20ac150\u2013220"],
      ["Activities", "\u20ac10\u201320"],
      ["Total", "\u20ac480\u2013820"]
    ],
    vibeTags: ["\ud83c\uddf8\ud83c\uddea Nordic", "\u2615 coffee", "\ud83e\uddd6 sauna", "\ud83c\udfa8 design"]
  },
  {
    id: 26,
    name: "Ghent",
    country: "Belgium",
    days: [4],
    dist: "neighbor",
    vibes: ["culture", "foodie", "coffee"],
    subVibes: ["art", "chocolate", "medieval", "coffee"],
    budget: "comfortable",
    easter: false,
    pitch: "The medieval Flemish city hiding one of the most important paintings in Western art history \u2014 the Van Eyck Altarpiece (1432). Beyond the Van Eyck: waterfront guild houses, Belgium\u2019s best chocolate, and specialty coffee rivaling any Scandinavian city. It\u2019s Bruges without the crowds, with better food.",
    transport: "ICE Berlin \u2192 Cologne (~4.5h), Thalys to Brussels (~1.5h), IC to Ghent (~30 min): ~6.5\u20137h total.",
    highlights: [
      { icon: "\ud83d\uddbc\ufe0f", text: "Ghent Altarpiece (Van Eyck, 1432) \u2014 AR visitor center + the real panels at St. Bavo\u2019s Cathedral. ~\u20ac16", img: { file: "images/26-ghent/inline-highlight-0.webp", caption: "Ghent Altarpiece by Jan van Eyck (1432)", credit: "Jan van Eyck — Public Domain" } },
      { icon: "\ud83c\udff0", text: "Gravensteen \u2014 12th-century castle with a darkly funny comedian-written audio guide. ~\u20ac12" },
      { icon: "\ud83c\udf1f", text: "Patershol \u2014 medieval neighborhood of narrow lanes, Ghent\u2019s best restaurants. Solo dinner territory.", img: { file: "images/26-ghent/inline-highlight-2.webp", caption: "Patershol medieval quarter, Ghent", credit: "Paul Hermans — CC BY-SA 3.0 / GFDL" } },
      { icon: "\ud83c\udf05", text: "St. Michael\u2019s Bridge at Sunset \u2014 three medieval towers reflected in the Leie river", img: { file: "images/26-ghent/inline-highlight-3.webp", caption: "Sint-Michielsbrug, Ghent", credit: "Edison McCullen — CC BY-SA 4.0" } },
      { icon: "🏛️", text: "STAM City Museum in the 14th-century Bijloke Abbey — giant aerial photo of Ghent on the floor you walk across; ~€12.", hidden: true, img: { file: "images/26-ghent/inline-highlight-4.webp", caption: "STAM — Ghent City Museum (Bijloke Abbey)", credit: "Phile Deprez — CC BY-SA 4.0" } },
      { icon: "🎨", text: "Werregarenstraatje Graffiti Alley — since 1995, the only street in Ghent where painting over is legal; the walls repaint weekly.", hidden: true, img: { file: "images/26-ghent/inline-highlight-5.webp", caption: "Werregarenstraatje graffiti alley, Ghent", credit: "Steven Lek (Tukka) — CC BY-SA 4.0" } },
      { icon: "🍬", text: "Cuberdon / neuzekes noses — cone-shaped raspberry jelly sweets invented c.1873 by Ghent pharmacist De Vynck; shelf-life 3 weeks, buy fresh at Groentenmarkt stall.", hidden: true, img: { file: "images/26-ghent/inline-highlight-6.webp", caption: "Cuberdons (neuzekes), Ghent", credit: "DimiTalen — CC0" } }
    ],
    hotel: "1898 The Post \u2014 boutique in the former post office on the Graslei waterfront. ~\u20ac120\u2013170/night",
    pastry: "Mokabon \u2014 legendary roastery since 1937 with homemade pralines. Max Chocolatier for artisan pastries. Caf\u00e9 Labath for specialty coffee.",
    japanese: "Takumi \u2014 authentic ramen, gyoza & bento. Umami by Han for creative Japanese-Belgian fusion sushi.",
    bestTime: "Labour Day weekend May 1\u20133 or late September. Waterfront terraces open, medieval glow.",
    budgetTable: [
      ["Transport (Belgian portion return)", "\u20ac30\u201350"],
      ["Hotel (3 nights)", "\u20ac150\u2013510"],
      ["Food, coffee & chocolate", "\u20ac120\u2013180"],
      ["Activities (Van Eyck, Gravensteen)", "\u20ac30\u201340"],
      ["Total", "\u20ac330\u2013780"]
    ],
    vibeTags: ["\ud83c\udfa8 art", "\ud83c\udf6b chocolate", "\ud83c\udfdb\ufe0f medieval", "\u2615 coffee"]
  },
  // ---- INTERNATIONAL: FLIGHTS ----
  {
    id: 27,
    name: "Ljubljana",
    country: "Slovenia",
    days: [4],
    dist: "flight",
    vibes: ["nature", "coffee", "culture"],
    subVibes: ["mountains", "coffee", "architecture", "markets"],
    budget: "comfortable",
    easter: false,
    pitch: "Europe\u2019s greenest capital (2016 European Green Capital) \u2014 a car-free old town wrapping around a hilltop castle, the Ljubljanica river lined with willow trees and caf\u00e9 terraces by Plecnik. A 30-minute bus reaches Lake Bled. Small enough to master, beautiful enough to haunt you.",
    transport: "Direct flight BER \u2192 Ljubljana: ~1h40. Round-trip from \u20ac90\u2013180.",
    highlights: [
      { icon: "\ud83c\udfdb\ufe0f", text: "Ple\u010dnik\u2019s Ljubljana \u2014 self-guided architectural walk: Triple Bridge, Central Market, National Library", img: { file: "images/27-ljubljana/inline-highlight-0.webp", caption: "Tromostovje (Plečnik's Triple Bridge), Ljubljana", credit: "Fred Romero — CC BY 2.0" } },
      { icon: "\ud83c\udfd4\ufe0f", text: "Day trip to Lake Bled \u2014 6 km lake loop, pletna boat to island church, famous krem\u0161nita. Bus 1h, \u20ac7", img: { file: "images/27-ljubljana/inline-highlight-1.webp", caption: "Lake Bled with island church", credit: "Furkan Akkurt — CC BY-SA 4.0" } },
      { icon: "\ud83c\udfa8", text: "Metelkova Mesto \u2014 former military barracks turned autonomous art district (daytime for murals & galleries)", img: { file: "images/27-ljubljana/inline-highlight-2.webp", caption: "Metelkova Mesto autonomous art district", credit: "Zairon — CC BY-SA 4.0" } },
      { icon: "\ud83c\udf3d", text: "Central Market Saturday Morning \u2014 Ple\u010dnik\u2019s riverside colonnade: local cheeses, honey, \u0161truklji", img: { file: "images/27-ljubljana/inline-highlight-3.webp", caption: "Plečnik's Central Market colonnade, Ljubljana", credit: "Tiia Monto (Kulmalukko) — CC BY-SA 3.0" } },
      { icon: "🏛️", text: "Plečnik House (Trnovo) — architect's preserved 1921–1957 home + garden + workshop with original tools & models. €6, guided tours only.", hidden: true, img: { file: "images/27-ljubljana/inline-highlight-4.webp", caption: "Interior of Plečnikova hiša (Plečnik House), Ljubljana", credit: "Matevz1400 — CC BY-SA 4.0" } },
      { icon: "⛰️", text: "Velika Planina day trip — 1666m herders' plateau of wooden huts (one of Europe's largest), 1h by bus to Kamnik then cable car + chairlift, ~€18.", hidden: true, img: { file: "images/27-ljubljana/inline-highlight-5.webp", caption: "Pastoral settlement on Velika Planina", credit: "David Osolin — CC BY-SA 4.0" } },
      { icon: "☕", text: "Čokl Roastery tasting — single-origin cupping sessions with Aleš Primožič, 3rd-gen roaster (family since 1962), Krekov trg 8.", hidden: true }
    ],
    hotel: "Vander Urbani Resort \u2014 boutique on the Ljubljanica with rooftop pool. ~\u20ac100\u2013150/night",
    pastry: "\u010cokl \u2014 standout specialty roastery. Sla\u0161\u010di\u010darna Zvezda (since 1928) for krem\u0161nita & tortes. TOZD for coffee in a converted factory.",
    japanese: "Sushimama \u2014 Ljubljana\u2019s best sushi with omakase-style options. Ramen & Izakaya Osaka for authentic ramen & gyoza.",
    bestTime: "Late April or Labour Day weekend. Willows green, terraces opening, Lake Bled with snow-capped Alps behind.",
    budgetTable: [
      ["Flights (round-trip)", "\u20ac90\u2013180"],
      ["Hotel (3 nights)", "\u20ac210\u2013450"],
      ["Food & coffee", "\u20ac80\u2013120"],
      ["Lake Bled day trip", "\u20ac30\u201340"],
      ["Total", "\u20ac410\u2013790"]
    ],
    vibeTags: ["\ud83c\udf3f green", "\ud83c\udfd4\ufe0f alpine", "\u2615 coffee", "\ud83c\udfdb\ufe0f architecture"]
  },
  {
    id: 28,
    name: "Thessaloniki",
    country: "Greece",
    days: [3, 4],
    dist: "flight",
    vibes: ["foodie", "history", "coffee"],
    subVibes: ["pastries", "history", "markets", "coffee"],
    budget: "comfortable",
    easter: false,
    pitch: "Greece without the islands \u2014 2,300 years of layered history, a food scene locals argue is Greece\u2019s best, and a specialty coffee obsession that puts most of Europe to shame. The bougatsa (warm custard pastry) is life-changing, and the 5 km waterfront promenade is stunning.",
    transport: "Direct flight BER \u2192 Thessaloniki: ~2h30. Round-trip from \u20ac60\u2013150.",
    highlights: [
      { icon: "\ud83c\udfdb\ufe0f", text: "White Tower & 5 km Seafront Promenade \u2014 Umbrella sculptures, exercise gardens, sea views. ~\u20ac4", img: { file: "images/28-thessaloniki/inline-highlight-0.webp", caption: "White Tower, Thessaloniki", credit: "Hermann Hammer (Haneburger) — CC BY-SA 4.0" } },
      { icon: "\ud83c\udfe0", text: "Ano Poli (Upper Town) \u2014 Ottoman-era quarter with Byzantine walls & Trigoniou Tower panoramic views", img: { file: "images/28-thessaloniki/inline-highlight-1.webp", caption: "Byzantine baths of Ano Poli, Thessaloniki", credit: "Ymblanter — CC BY-SA 4.0" } },
      { icon: "\ud83c\udfdb\ufe0f", text: "Archaeological Museum \u2014 gold treasures from Philip II\u2019s tomb (Alexander the Great\u2019s father). ~\u20ac8", img: { file: "images/28-thessaloniki/inline-highlight-2.webp", caption: "Frescoed sarcophagus, Archaeological Museum of Thessaloniki", credit: "Carole Raddato — CC BY-SA 2.0" } },
      { icon: "\ud83c\udfed", text: "Modiano Market \u2014 renovated 1922 indoor market: koulouri, loukoumades, souvlaki", img: { file: "images/28-thessaloniki/inline-highlight-3.webp", caption: "Modiano Market, Thessaloniki", credit: "JFKennedy — Public Domain" } },
      { icon: "🕌", text: "Atatürk Museum (Apostolou Pavlou 17) — three-storey pink house where Mustafa Kemal was born in 1881; rare Ottoman-era domestic interior, free, passport required.", hidden: true, img: { file: "images/28-thessaloniki/inline-highlight-4.webp", caption: "Atatürk's House Museum, Thessaloniki", credit: "Ymblanter — CC BY-SA 4.0" } },
      { icon: "⛪", text: "Rotunda mosaics (4th century) — surviving gold-tessera dome fragments are the oldest Early Christian wall mosaics in Europe, predating Ravenna; ~€6.", hidden: true, img: { file: "images/28-thessaloniki/inline-highlight-5.webp", caption: "Dome mosaics, Rotunda of Galerius, Thessaloniki", credit: "Ymblanter — CC BY-SA 4.0" } },
      { icon: "🥐", text: "Terkenlis (since 1948, Tsimiski & Aristotelous corner) — the tsoureki temple; warm chocolate-filled braids in the original shop, often with a queue of locals.", hidden: true, img: { file: "images/28-thessaloniki/inline-highlight-6.webp", caption: "Tsoureki (Greek sweet braided bread) — representative image", credit: "Z thomas — CC BY-SA 4.0" } }
    ],
    hotel: "Colors Urban Hotel \u2014 4-star boutique near Aristotelous Square, rooftop terrace with Gulf views. ~\u20ac70\u2013110/night",
    pastry: "Trigona Elenidi \u2014 world-famous phyllo cones with patisserie cream (\u20ac2 each, life-altering). Bougatsa Bantis (since 1969). Chaboo for specialty roastery.",
    japanese: "Issei \u2014 upscale Japanese with omakase & sashimi. Nikkei Bar for Japanese-Peruvian fusion. Umami for ramen.",
    bestTime: "Late April or early May. 18\u201325\u00b0C, sea is blue, terraces open, before summer heat.",
    budgetTable: [
      ["Flights (round-trip)", "\u20ac60\u2013150"],
      ["Hotel (3 nights)", "\u20ac210\u2013450"],
      ["Food & coffee (Greece is affordable)", "\u20ac60\u2013100"],
      ["Activities & museums", "\u20ac15\u201325"],
      ["Total", "\u20ac345\u2013725"]
    ],
    vibeTags: ["\ud83c\udf6e pastries", "\u2600\ufe0f Mediterranean", "\ud83c\udfdb\ufe0f history", "\u2615 coffee"]
  },
  {
    id: 29,
    name: "Lyon",
    country: "France",
    days: [3, 4],
    dist: "flight",
    vibes: ["foodie", "culture"],
    subVibes: ["markets", "foodie", "art", "literary"],
    budget: "splurge",
    easter: false,
    pitch: "France\u2019s gastronomic capital \u2014 UNESCO-listed for both its Renaissance old town and food culture. The magic for a solo introvert is the bouchon: traditional 3-course menus for \u20ac15\u201325. The traboules (secret Renaissance passageways) let you play urban explorer. Plus exceptional Japanese food from a Franco-Japanese community.",
    transport: "Direct flight BER \u2192 Lyon: ~1h50. Round-trip from \u20ac70\u2013160.",
    highlights: [
      { icon: "\ud83e\uddd1\u200d\ud83c\udf73", text: "Les Halles de Paul Bocuse \u2014 legendary covered food market, 60+ artisan vendors. Budget \u20ac20\u201330 for a feast.", img: { file: "images/29-lyon/inline-highlight-0.webp", caption: "Les Halles de Lyon Paul Bocuse", credit: "Lantus — CC BY-SA 3.0" } },
      { icon: "\ud83d\udeb6", text: "Traboules of Vieux Lyon \u2014 40+ secret Renaissance passageways, self-guided treasure hunt", img: { file: "images/29-lyon/inline-highlight-1.webp", caption: "Traboule interior, Vieux Lyon", credit: "Matt Neale — CC BY-SA 2.0" } },
      { icon: "\ud83c\udfdb\ufe0f", text: "Mus\u00e9e des Confluences \u2014 jaw-dropping deconstructivist science museum at the two rivers\u2019 meeting point. \u20ac9", img: { file: "images/29-lyon/inline-highlight-2.webp", caption: "Musée des Confluences, Lyon", credit: "Fred Romero — CC BY 2.0" } },
      { icon: "\u26f0\ufe0f", text: "Fourvi\u00e8re Hill \u2014 funicular to basilica + Gallo-Roman amphitheatres (oldest in France, 15 BC). \u20ac4", img: { file: "images/29-lyon/inline-highlight-3.webp", caption: "Basilica of Notre-Dame de Fourvière", credit: "Kent Wang — CC BY-SA 2.0" } },
      { icon: "🎨", text: "Mur des Canuts (Bd des Canuts, Croix-Rousse) — 1,200 m² trompe-l'œil silk-weavers mural (1987, repainted 1997 & 2013), Europe's largest painted wall. Free.", hidden: true, img: { file: "images/29-lyon/inline-highlight-4.webp", caption: "Mur des Canuts, Croix-Rousse, Lyon", credit: "Davide Mauro (Codas) — CC BY-SA 4.0" } },
      { icon: "🎬", text: "Musée Cinéma et Miniature (Vieux Lyon) — 400 Hollywood props (Alien xenomorph, Gremlins, ET) + hyper-realist miniature dioramas in a 16th-c mansion. ~€15.", hidden: true, img: { file: "images/29-lyon/inline-highlight-5.webp", caption: "Musée Miniature et Cinéma, Vieux Lyon", credit: "Benoît Prieur — CC0" } },
      { icon: "🌳", text: "Parc de la Tête d'Or — 117 ha with free zoo (300 animals), botanical glasshouses and a rose garden with 30,000 plants; Lyon's introvert recharge space.", hidden: true, img: { file: "images/29-lyon/inline-highlight-6.webp", caption: "La grande serre, Parc de la Tête d'Or, Lyon", credit: "Phinou — CC BY-SA 3.0" } }
    ],
    hotel: "H\u00f4tel Le Boulevardier \u2014 charming boutique in Presqu\u2019\u00eele with exposed stone walls. ~\u20ac90\u2013140/night",
    pastry: "Boulangerie du Palais \u2014 award-winning praline tart (Lyon\u2019s signature sweet). Mokxa for pioneering specialty roastery.",
    japanese: "Takao Takano \u2014 Michelin-starred French-Japanese (lunch \u20ac38\u201355). Imouto for lively izakaya. Domo for handmade soba.",
    bestTime: "Late April or late September. Avoids summer heat (35\u00b0C+), food markets at peak.",
    budgetTable: [
      ["Flights (round-trip)", "\u20ac70\u2013160"],
      ["Hotel (3 nights)", "\u20ac270\u2013420"],
      ["Food, coffee & market tastings", "\u20ac120\u2013200"],
      ["Activities", "\u20ac15\u201325"],
      ["Total", "\u20ac475\u2013805"]
    ],
    vibeTags: ["\ud83c\udf5d foodie", "\ud83c\udfdb\ufe0f culture", "\ud83c\udfad literary", "\ud83c\uddef\ud83c\uddf5 Japanese food"]
  },
  {
    id: 30,
    name: "Tallinn",
    country: "Estonia",
    days: [3, 4],
    dist: "flight",
    vibes: ["culture", "coffee", "foodie"],
    subVibes: ["medieval", "coffee", "art"],
    budget: "lean",
    easter: false,
    pitch: "A medieval fairy-tale wrapped in a digital-first nation. The Old Town is a UNESCO Gothic jewel \u2014 but step outside the walls and you\u2019re in Kalamaja, one of Europe\u2019s coolest creative neighborhoods. Shockingly affordable, and the design-hotel scene punches way above its weight.",
    transport: "Direct flight BER \u2192 Tallinn: ~1h45. Round-trip from \u20ac60\u2013120. One of the cheapest flights on the list.",
    highlights: [
      { icon: "\ud83c\udff0", text: "Tallinn Old Town (UNESCO) \u2014 intact medieval walls, Gothic Town Hall (1404), wall walkway ~\u20ac3", img: { file: "images/30-tallinn/inline-highlight-0.webp", caption: "Raekoja plats (Town Hall Square), Tallinn", credit: "Holger Vaga — CC BY 2.0" } },
      { icon: "\ud83c\udfed", text: "Balti Jaama Turg \u2014 modern market in converted railway building: food, artisan goods, coffee", img: { file: "images/30-tallinn/inline-highlight-1.webp", caption: "Balti Jaama Turg, Tallinn", credit: "Liilia Moroz — CC BY-SA 4.0" } },
      { icon: "\ud83c\udfa8", text: "Kalamaja & Telliskivi Creative City \u2014 converted Soviet factories: design studios, galleries, EKKM", img: { file: "images/30-tallinn/inline-highlight-2.webp", caption: "Telliskivi Creative City, Tallinn", credit: "Relkmsaiia — CC BY-SA 4.0" } },
      { icon: "\u2615", text: "Vaba Lava \u2014 coffee and craft ateliers in a converted warehouse, Kalamaja\u2019s core" },
      { icon: "🏚️", text: "Pirita Convent ruins — roofless 1436 Bridgettine church with a 35m Gothic gable, sacked 1575; 5 km coastal ride from Old Town via tram 1 + bus 1A.", hidden: true, img: { file: "images/30-tallinn/inline-highlight-4.webp", caption: "Ruins of Pirita Convent, Tallinn", credit: "Abraxasss — CC BY-SA 3.0 / GFDL" } },
      { icon: "🕵️", text: "Hotel Viru KGB Museum (23rd floor) — Soviet-era bugging equipment in sealed radio rooms 'discovered' in 1991 when agents fled. Guided tour only, ~€13.", hidden: true, img: { file: "images/30-tallinn/inline-highlight-5.webp", caption: "KGB Museum surveillance equipment, Hotel Viru", credit: "Marion Golsteijn (Ilonamay) — CC BY-SA 4.0" } },
      { icon: "🥐", text: "Røst Bakery (Rotermanni) — cardamom-bun destination in the converted 1829 salt-storage Rotermann Quarter; single-origin brews alongside.", hidden: true, img: { file: "images/30-tallinn/inline-highlight-6.webp", caption: "Cardamom buns — representative image", credit: "W.carter — CC0" } }
    ],
    hotel: "Hotel Telegraaf \u2014 5-star in a converted telegraph office in Old Town. Spa + pool. ~\u20ac100\u2013140/night (Estonian pricing!).",
    pastry: "R\u00f8st Bakery \u2014 spectacular cardamom buns & single-origin coffee. Gourmet Coffee for AeroPress. Pierre Chocolaterie for hand-made chocolates.",
    japanese: "Kampai \u2014 sushi, sashimi & sake pairings in Old Town. Tokumaru for authentic tonkotsu ramen. Kiwami for omakase.",
    bestTime: "Late May or June. White Nights begin (sun barely sets), warm, Old Town courtyards open.",
    budgetTable: [
      ["Flights (round-trip)", "\u20ac60\u2013120"],
      ["Hotel (3 nights)", "\u20ac120\u2013420"],
      ["Food & coffee (Estonia is affordable)", "\u20ac60\u201390"],
      ["Activities (museums, wall walk, Pirita)", "\u20ac15\u201330"],
      ["Total", "\u20ac255\u2013660"]
    ],
    vibeTags: ["\ud83c\udff0 medieval", "\u2615 coffee", "\ud83d\udcb0 affordable", "\ud83c\udfa8 design", "\ud83c\udfad creative"]
  }
];

// ============================================================
// QUESTIONS (with conditional branching for Q3b)
// ============================================================
const QUESTIONS = [
  {
    id: 1,
    text: "How many days can you escape?",
    options: [
      { label: "3 days (Fri \u2192 Sun)", value: 3, cat: "idle" },
      { label: "4 days (skip Monday Deutschkurs!)", value: 4, cat: "excited" }
    ]
  },
  {
    id: 2,
    text: "How far do you want to go?",
    options: [
      { label: "Stay in Germany (free with DB!)", value: "germany", cat: "happy" },
      { label: "A train ride to a neighboring country", value: "neighbor", cat: "thinking" },
      { label: "Put me on a plane", value: "flight", cat: "dreamy" }
    ]
  },
  {
    id: 3,
    text: "What\u2019s calling you most right now?",
    options: [
      { label: "Mountains, trails & fresh air", value: "nature", cat: "excited" },
      { label: "Museums, history & wandering old streets", value: "culture", cat: "thinking" },
      { label: "Incredible caf\u00e9s, pastries & food", value: "food", cat: "happy" },
      { label: "A spa day and doing absolutely nothing", value: "spa", cat: "sleepy" }
    ]
  },
  // --- Q3b: conditional sub-questions based on Q3 answer ---
  {
    id: "3b",
    text: "What kind of nature calls you?",
    condition: { questionId: 3, value: "nature" },
    options: [
      { label: "Dramatic peaks & mountain trails", value: "mountains", cat: "excited" },
      { label: "Cliffs, coastline & salty air", value: "coastal", cat: "dreamy" },
      { label: "Deep forests & quiet paths", value: "forests", cat: "thinking" },
      { label: "A calm lake & morning mist", value: "lakeside", cat: "happy" }
    ]
  },
  {
    id: "3b",
    text: "What draws you most?",
    condition: { questionId: 3, value: "culture" },
    options: [
      { label: "Medieval old towns & cobblestones", value: "medieval", cat: "thinking" },
      { label: "Literary history & bookish vibes", value: "literary", cat: "thinking" },
      { label: "World-class art & galleries", value: "art", cat: "dreamy" },
      { label: "Powerful stories & deep history", value: "history_deep", cat: "excited" }
    ]
  },
  {
    id: "3b",
    text: "What\u2019s your food weakness?",
    condition: { questionId: 3, value: "food" },
    options: [
      { label: "Chocolate, pastries & cakes", value: "sweets_sub", cat: "happy" },
      { label: "Specialty coffee \u2014 I\u2019m very serious", value: "coffee_sub", cat: "excited" },
      { label: "Food markets & local street food", value: "markets", cat: "happy" },
      { label: "Cocktail bars & weird mixology", value: "drinks", cat: "dreamy" }
    ]
  },
  {
    id: "3b",
    text: "How do you want to unwind?",
    condition: { questionId: 3, value: "spa" },
    options: [
      { label: "Hot springs & thermal baths", value: "thermal", cat: "sleepy" },
      { label: "Proper massages & bodywork", value: "massage_sub", cat: "dreamy" },
      { label: "Cozy hotel, slow walks & good caf\u00e9s", value: "cozy_sub", cat: "happy" },
      { label: "Seaside fresh air & sauna", value: "seaside", cat: "dreamy" }
    ]
  },
  // --- Back to unconditional questions ---
  {
    id: 4,
    text: "Pick your ideal morning:",
    options: [
      { label: "Early hike, coffee from a thermos", value: "hike_morning", cat: "excited" },
      { label: "Sleep in, long brunch at a cute caf\u00e9", value: "brunch_morning", cat: "happy" },
      { label: "Museum opens at 10, you\u2019re first in line", value: "museum_morning", cat: "thinking" },
      { label: "Room service and a bathrobe", value: "roomservice_morning", cat: "sleepy" }
    ]
  },
  {
    id: 5,
    text: "What\u2019s the budget for the trip?",
    options: [
      { label: "Under \u20ac500 \u2014 the adventure is the point", value: "lean", cat: "idle" },
      { label: "Around \u20ac450\u2013650 \u2014 nice hotel, good meals", value: "comfortable", cat: "happy" },
      { label: "\u20ac550\u2013750+ \u2014 treat yourself, you deserve it", value: "splurge", cat: "excited" }
    ]
  },
  {
    id: 6,
    text: "Famous highlights or hidden gems?",
    options: [
      { label: "The greatest hits \u2014 give me the classics", value: "normal", cat: "idle" },
      { label: "Surprise me \u2014 I want the hidden gems", value: "easter", cat: "shocked" }
    ]
  }
];

// ============================================================
// VIBE MAPPINGS
// ============================================================

// Q3 answer -> vibes matched against proposal.vibes (+3 pts)
const Q3_VIBE_MAP = {
  nature: ["nature", "adventure", "hiking", "coastal"],
  culture: ["culture", "history", "quirky"],
  food: ["foodie", "coffee", "quirky"],
  spa: ["spa", "indulgence", "cozy"]
};

// Q3b answer -> sub-vibes matched against proposal.subVibes (+3 pts)
const Q3B_VIBE_MAP = {
  // nature sub-vibes
  mountains: ["mountains", "alpine", "hiking"],
  coastal: ["coastal", "seaside"],
  forests: ["forests", "hiking"],
  lakeside: ["lakeside", "gardens"],
  // culture sub-vibes
  medieval: ["medieval", "architecture", "cinematic"],
  literary: ["literary", "university"],
  art: ["art", "baroque"],
  history_deep: ["history", "memorial"],
  // food sub-vibes
  sweets_sub: ["sweets", "pastries", "chocolate", "cakes"],
  coffee_sub: ["coffee"],
  markets: ["foodie", "markets"],
  drinks: ["cocktails", "weird-bars", "mixology"],
  // spa sub-vibes
  thermal: ["thermal", "spa", "indulgence"],
  cozy_sub: ["cozy"],
  seaside: ["seaside", "coastal"],
  // V2-F: new spa sub-vibe — massages
  massage_sub: ["massage", "spa", "indulgence", "bodywork"]
};

// Q4 morning -> vibes matched against proposal.vibes (+2 pts)
const Q4_VIBE_MAP = {
  hike_morning: ["nature", "adventure"],
  brunch_morning: ["foodie", "coffee", "cozy"],
  museum_morning: ["culture", "history"],
  roomservice_morning: ["spa", "indulgence"]
};

// ============================================================
// ENRICHMENT DATA — from deep research (verified venues, 2026 dates)
// ============================================================

// All dates fall in Apr 24–May 12 OR Jun 2026 onwards (Billy's allowed windows).
// Picked for seasonal fit per destination.
const BEST_WEEKENDS_2026 = {
  1:  { dates: "Sep 11\u201313", why: "Cooler hiking air, fewer summer crowds on the Bastei trails" },
  2:  { dates: "May 8\u201310", why: "Bamberg\u2019s beer gardens just opening, before peak crowds" },
  3:  { dates: "Jun 12\u201314", why: "Comfortable weather for river-town loops and Stocherkahn season" },
  4:  { dates: "May 1\u20133", why: "Labour Day long weekend, central Germany at its most walkable" },
  5:  { dates: "Jun 19\u201321", why: "Baltic summer opens up \u2014 long daylight, beach-ready temperatures" },
  6:  { dates: "Apr 24\u201326", why: "Shoulder season for museum pacing and caf\u00e9 hopping" },
  7:  { dates: "Oct 9\u201311", why: "Classic spa-town weather \u2014 cool air, thermal baths shine" },
  8:  { dates: "Aug 28\u201330", why: "Baltic coast right after peak holiday pressure eases" },
  9:  { dates: "Sep 11\u201313", why: "Bologna in shoulder season \u2014 heat done, food markets lively" },
  10: { dates: "Sep 25\u201327", why: "Porto coastal weather still mild, peak-season density gone" },
  11: { dates: "Jun 26\u201328", why: "Lake Constance summer opens \u2014 walkable, swimmable, before Berlin holidays" },
  12: { dates: "May 8\u201310", why: "Freiburg\u2019s spring peak \u2014 Black Forest green, M\u00fcnster market in full flow" },
  13: { dates: "Apr 24\u201326", why: "Architecture-heavy shoulder weekend, very walkable streets" },
  14: { dates: "Sep 4\u20136", why: "Regensburg after summer \u2014 lower tourist pressure, cooler café pacing" },
  15: { dates: "Jul 3\u20135", why: "R\u00fcgen summer \u2014 Baltic at its warmest, chalk cliffs in full light" },
  16: { dates: "Sep 18\u201320", why: "Alpine cool, K\u00f6nigssee clearer, fewer peak-season bottlenecks" },
  17: { dates: "Jun 5\u20137", why: "Harz hiking season starts \u2014 forests green, no holiday overlap" },
  18: { dates: "May 1\u20133", why: "Passau\u2019s three rivers at spring flow, long Labour Day weekend" },
  19: { dates: "Jun 12\u201314", why: "Heidelberg walkable long-weekend pace before midsummer density" },
  20: { dates: "Sep 18\u201320", why: "W\u00fcrzburg in autumn light \u2014 fortress and Residenz at their most golden" },
  21: { dates: "Sep 25\u201327", why: "Weimar museum pacing without summer booking pressure" },
  22: { dates: "Apr 24\u201326", why: "Mainz shoulder weekend \u2014 Rhine walkable, markets lively" },
  23: { dates: "Nov 6\u20138", why: "Rogal \u015bwi\u0119tomarci\u0144ski is protected for Nov 11 St. Martin\u2019s Day \u2014 catch the lead-up" },
  24: { dates: "Oct 2\u20134", why: "Olomouc quiet after peak season, predictable pacing" },
  25: { dates: "Aug 21\u201323", why: "Malm\u00f6 late summer \u2014 waterfront warm, outdoor design scene peaks" },
  26: { dates: "Jun 19\u201321", why: "Ghent pre-summer \u2014 canals and guild houses without July crowds" },
  27: { dates: "Jun 5\u20137", why: "Ljubljana\u2019s green capital shines, Velika Planina hut season opens" },
  28: { dates: "Oct 9\u201311", why: "Thessaloniki heat fades \u2014 pastry and waterfront walks become comfortable" },
  29: { dates: "Oct 16\u201318", why: "Lyon autumn \u2014 bouchon season, Fourvi\u00e8re golden light" },
  30: { dates: "Jun 26\u201328", why: "Tallinn White Nights begin \u2014 sun barely sets, Old Town courtyards open" }
};

const VERIFIED_COFFEE = {
  2:  { name: "Seven Hills Coffee Roasters", order: "Espresso + filter", note: "Check opening schedule — limited days" },
  3:  { name: "Suedhang Kaffee", address: "Jakobsgasse 4", order: "Espresso + filter; buy beans if the roast profile matches" },
  4:  { name: "Epitome Coffee Co.", order: "Espresso + filter", note: "\"Probably the best coffee in Germany\"" },
  9:  { name: "Forno Brisa Galliera", order: "Espresso + pistachio cornetto", note: "Bakery + open roastery combo — two-in-one anchor" },
  11: { name: "N° elf – Spezialitätenkaffeerösterei", order: "Espresso + filter; sit near the bar if solo" },
  12: { name: "Günter Coffee Roasters", address: "Merianstraße 8", order: "Espresso + filter; buy a bag for home" },
  14: { name: "Torreo", order: "Specialty coffee", note: "Small-town roastery gem" },
  15: { name: "Springer Kaffeerösterei Rügen", order: "Single-origin coffee" },
  17: { name: "Fairista Quedlinburg", order: "Single-origin pour-over", note: "Rebranded from Samocca, roastery with tradition" },
  18: { name: "LIEVIE Coffee & Ceramics", address: "Theresienstraße 34", order: "Cappuccino; buy beans for home" },
  19: { name: "Südseite – Specialty Coffee Roasters", address: "Untere Neckarstraße 24", order: "Espresso + filter; roastery with a view of the Neckar" },
  20: { name: "Kaffeemanufaktur Würzburg", order: "In-house roastery coffee bar", note: "Valid bean stop with roastery framing" },
  22: { name: "Kaffeekommune", order: "Specialty coffee" },
  26: { name: "WAY Specialty Coffee Roasters", order: "Specialty coffee" },
  27: { name: "R&B Cafe Roasters", address: "Slovenska cesta 47", order: "Espresso + filter; schedule a tasting session", note: "Offers 'roast your own coffee' experience — unusually giftable" },
  29: { name: "Celsius Roasters", order: "Espresso + filter; buy beans" }
};

const VERIFIED_PASTRY = {
  3:  { name: "Hofkonditorei Röcker", item: "Classic cakes in a quiet setting" },
  5:  { name: "Kaffeehaus Lübeck", item: "In-house roastery + classic German torte selection in a 13th-century building" },
  9:  { name: "Forno Brisa Galliera", item: "Torta di tagliatelle — local specialty with documented recipe" },
  12: { name: "Schmidt Café", item: "Schwarzwälder Kirschtorte (Black Forest cake)" },
  15: { name: "Konditorei & Café Torteneck Binz", item: "Hand-made Baumkuchen with sea-buckthorn variants" },
  18: { name: "Confiserie & Café Simon", item: "23-carat gold leaf chocolate — properly absurd souvenir energy" },
  19: { name: "Heidelberger Studentenkuß", item: "Historic love-note confection — buy 2, one now, one later" },
  23: { name: "Rogalove", address: "Święty Marcin 51", item: "Warm rogal świętomarciński — EU-protected recipe (PGI)" },
  24: { name: "Long Story Short Eatery & Bakery", item: "Bib Gourmand listed — order one main and one pastry" },
  27: { name: "Butik lePotica", address: "Stari trg 10", item: "Walnut mini potica — protected recipe; buy a gift box" },
  29: { name: "Maison Victoire", address: "Halles de Lyon, 102 Cours Lafayette", item: "Tarte à la praline — Lyon's iconic pink praline tart" }
};

const VERIFIED_JAPANESE = {
  2:  { name: "Ichi-san", order: "Ramen or bento-style set", solo: true },
  3:  { name: "KUMO Restaurant", address: "Neckarhalde 2", order: "Ramen + one side", solo: true },
  4:  { name: "JEN Erfurt Ramen Küche", order: "Ramen", solo: true },
  7:  { name: "Kazoku Restaurant", order: "Ramen — surprising for a spa town", solo: true },
  11: { name: "Ramen Tatsumi-Tei", order: "Ramen — arrive early", note: "No reservations possible!", solo: true },
  12: { name: "Umami Ramen Freiburg", order: "Tonkotsu or signature ramen; arrive early", solo: true },
  14: { name: "RamenCado Regensburg", order: "Ramen", note: "Rare ramen shop in a small historic town", solo: true },
  19: { name: "Min Ramen Bar", address: "Neugasse 17", order: "Ramen", note: "Solo-friendly by default; pay attention to peak times", solo: true },
  20: { name: "SHIJŌ - Sushi & Ramen", order: "Sushi or ramen", solo: true },
  22: { name: "Sori Ramen", order: "Ramen", solo: true },
  23: { name: "Zen On", order: "Ramen (Michelin-covered)", altName: "Madara Ramen", altNote: "Dedicated ramen framing", solo: true },
  24: { name: "FISHI SUSHI", order: "Ramen if available + one side; minimalist interior", solo: true },
  26: { name: "Noedelbar Ramen", order: "Ramen", note: "~20 seats, no booking — plan timing carefully", solo: true },
  27: { name: "Ramen by Maru", address: "Gosposka ulica 4", order: "Shoyu or miso ramen; small space, arrive early", solo: true },
  29: { name: "Fujiyama 55", order: "Ramen formule with gyoza", solo: true }
};

const VERIFIED_HOTELS = {
  1:  { treat: "Hotel Elbresidenz an der Therme, Bad Schandau" },
  2:  { treat: "HOY bamberg boutique hotel — old town, design-forward", smart: "Le Baldinger Boutique Hotel" },
  3:  { treat: "Boutiquehotel La Casa Tübingen — spa positioning", smart: "Hotel Domizil Tübingen" },
  4:  { treat: "Dorint Hotel am Dom Erfurt" },
  7:  { treat: null, smart: null },
  11: { treat: "Hotel 47° Konstanz — rooftop spa with lake & Alpine views" },
  12: { treat: "Designhotel am Stadtgarten", smart: "Motel One Freiburg" },
  14: { treat: "Hotel Orphée — old town" },
  15: { treat: "nixe Boutiquehotel & Spa, Binz" },
  17: { treat: "Romantik Hotel am Brühl" },
  18: { treat: "Boutique Hotel Morgentau — listed building", smart: "Rotel Inn — design-led budget" },
  19: { treat: "Boutique Suites Heidelberg Alte Zigarrenmanufaktur — former tobacco factory" },
  22: { treat: "Brunfels Hotel" },
  23: { treat: "PURO Poznań Stare Miasto — design-forward, tech-y room controls", smart: "Śródka Boutique Hotel" },
  24: { treat: "Miss Sophie's Olomouc — historic house, boutique scale", smart: "Smarthotel Nezvalova Archa — self-service, central" },
  26: { treat: "1898 The Post — former post office on Graslei waterfront" },
  27: { treat: "Hotel Cubo — old town", smart: "Hotel Emonec — card accepted, breakfast purchasable" },
  29: { treat: "Fourvière Hôtel — pool & wellness", smart: "Mercure Lyon Centre Saxe Lafayette" }
};

const SURPRISE_FACTS = {
  1:  "The name was coined in the 18th century by two homesick Swiss painters, Adrian Zingg and Anton Graff, who taught at Dresden's art academy and decided the Elbe sandstone ridges reminded them of the Jura back home — so the 'Switzerland' is a branding decision by two expats, not a geological resemblance.",
  2:  "Between 1626 and 1631 Prince-Bishop Johann Georg II Fuchs von Dornheim burned roughly 1,000 citizens as witches — nearly a tenth of Bamberg's population — in a purpose-built 'Drudenhaus' prison, making it one of the largest witch hunts in European history, ended only when the Swedish army arrived.",
  3:  "Hölderlin spent the last 36 years of his life — over half his adult existence — upstairs in a carpenter's tower on the Neckar, diagnosed as incurably mad, signing poems 'Scardanelli' and inventing fake dates like 1748 or 1940. The carpenter's family kept him essentially as a lodger until his death in 1843.",
  4:  "In 1998 construction workers renovating a house near Erfurt's Alte Synagoge found the 'Erfurt Treasure' hidden in a wall — 28 kg of 14th-century coins, ingots and a unique Jewish wedding ring — buried by its owner during the 1349 pogrom, and rediscovered almost exactly 650 years later.",
  5:  "Thomas Mann's 1901 novel 'Buddenbrooks', which won him the Nobel Prize, was such a thinly veiled portrait of Lübeck's merchant class that scandalised citizens circulated a printed key matching each character to a real family — and Mann was effectively run out of his hometown for decades.",
  6:  "Wrocław's bronze dwarfs are a memorial to the Orange Alternative, a 1980s anti-communist movement that painted thousands of cartoon dwarfs over the government's hastily whitewashed anti-regime graffiti — the authorities looked ridiculous arresting people for 'spreading dwarfism', which was exactly the point.",
  7:  "The town's hottest spring, the Vřídlo, shoots mineral water 12 metres into the air at 73 °C and pumps about 2,000 litres per minute — and the local souvenir industry literally petrifies roses by dangling them in the spring, where dissolved minerals coat them in stone within weeks.",
  8:  "World War II began at 4:45 a.m. on 1 September 1939 when the German battleship Schleswig-Holstein, moored in Gdańsk on a supposed 'courtesy visit', opened fire on the Polish garrison at Westerplatte — the 182 defenders were expected to last 12 hours and held out for seven days.",
  9:  "The University of Bologna, founded in 1088, is the oldest continuously operating university in the world — older than the Aztec Empire, the Magna Carta, and the Gothic cathedral of Notre-Dame — and it coined the word 'universitas' to mean a guild of students who hired (and fired) their professors.",
  10:  "Port wine is English by accident: the 1703 Methuen Treaty slashed tariffs on Portuguese wine after England's wars with France cut off Bordeaux, so British merchants fortified Douro reds with brandy to survive the sea journey — which is why most historic Porto lodges (Taylor's, Graham's, Sandeman, Cockburn's) still have British names.",
  11:  "Konstanz survived WWII bombing-free by leaving its lights on every night — Allied pilots couldn't tell where the German city ended and neutral Swiss Kreuzlingen began, so they refused to drop bombs. The rotating Imperia statue at the harbour holds a miniature naked pope and emperor in her hands, mocking the 1414 Council of Constance.",
  12:  "Local legend says if you accidentally step into one of Freiburg's Bächle water channels, you're fated to marry a Freiburger — and the Münster tower, completed around 1330, is the only major Gothic spire in Germany to have been finished in the Middle Ages itself.",
  13:  "Since 1995 an anonymous benefactor — known only as 'Altstadtmillionär' — has donated 511,500 Deutschmarks and then 511,500 euros every year for restoring the Old Town; their identity has never been revealed, despite decades of local speculation.",
  14:  "Regensburg's Steinerne Brücke (1135–1146) was the model for Prague's Charles Bridge and London Bridge, and was considered such a marvel that medieval chronicles credited its construction to a pact with the Devil. The city also houses the Thurn und Taxis family, who ran Europe's postal monopoly for 350 years and whose palace has more rooms than Buckingham Palace.",
  15:  "Rügen hosts Prora, a 4.5-kilometre-long Nazi beach resort built 1936–1939 to house 20,000 Strength-Through-Joy holidaymakers simultaneously — it was never used as intended, and today parts have been converted into luxury condos and Europe's longest youth hostel.",
  16:  "The Königssee is so acoustically perfect that boatmen have played a flugelhorn across its cliffs since the 19th century to demonstrate a seven-fold echo — and the lake is Germany's deepest at 190 metres, fed by water clean enough to drink directly.",
  17:  "In 1945 an American lieutenant looted medieval treasures from Quedlinburg's cathedral and mailed them home to Texas; they resurfaced in 1990 when his heirs tried to sell a 9th-century gospel for $9 million, triggering one of the largest art-restitution cases in postwar history.",
  18:  "St. Stephan's Cathedral houses the largest cathedral organ in the world outside the United States — 17,974 pipes across five organs played from a single console — and the Inn river actually carries more water than the Danube at their confluence, meaning 'the Danube' downstream of Passau is technically mostly Inn.",
  19:  "Mark Twain devoted three chapters of 'A Tramp Abroad' (1880) to Heidelberg and invented the tourist trope of the ruined castle in English — and Heidelberg University's 'Studentenkarzer', a student jail used 1778–1914, locked up students for duelling or drunkenness while still letting them attend lectures.",
  20:  "The Residenz's Tiepolo ceiling fresco (1752–1753) is the largest in the world at 677 square metres, and it miraculously survived the 16 March 1945 air raid that destroyed 90% of Würzburg in 17 minutes — saved because American art officer John Davis Skilton rigged a tarpaulin over the roofless hall through the rainy spring of 1945.",
  21:  "In 2004 a fire tore through the Duchess Anna Amalia Library and destroyed around 50,000 books, but librarians and volunteers formed a human chain and rescued 28,000 volumes by hand in a single night — including Luther's Bible and Goethe's personal copies — before the roof collapsed.",
  22:  "Marc Chagall designed nine cobalt-blue windows for St. Stephan's church in Mainz between 1978 and 1985 — the only Chagall windows in any German church — as an explicit gesture of Jewish-Christian reconciliation after the Holocaust. He finished the last one at age 97, months before his death.",
  23:  "Poznań's mechanical billy goats have been head-butting each other on the town hall at noon since 1551, but the clockwork has survived being dismantled by the Nazis in 1939 and being caught in the 1945 Battle of Poznań — the current goats are postwar replacements carved in 1954 from the original 16th-century blueprints.",
  24:  "Olomouc's 35-metre Holy Trinity Column (1754) is the only Baroque monument in the world built entirely by local artisans using only local materials, and its tiny chapel inside can legally hold exactly 18 people — a capacity the UNESCO listing actually specifies.",
  25:  "The Turning Torso rotates a full 90 degrees from base to top across its 54 floors, and since 2015 every kilowatt-hour of electricity, heat and water used in the building has come from 100% renewable local sources — sewage heat, wind and food-waste biogas — making it the first fully climate-neutral skyscraper in the Nordics.",
  26:  "Ghent has been vegetarian on Thursdays since 2009 — it was the first city in the world to officially declare a weekly meat-free day, with municipal canteens, schools and a city-issued veggie street map. The campaign was launched partly to hit climate targets and partly because locals already ate stoverij six days a week.",
  27:  "Jože Plečnik rebuilt large parts of Ljubljana almost single-handedly between the wars without ever holding an official city-architect post, designing everything from bridges to lampposts to cemetery urns — his entire urban œuvre was added to UNESCO in 2021 as the first heritage listing ever for a 20th-century single-architect cityscape.",
  28:  "The Rotunda of Galerius (c. 306 AD) has served, in order, as a Roman mausoleum, an early Christian church, an Ottoman mosque (its minaret is the only one left standing in Greece), and a Greek Orthodox church again — making it arguably the longest continuously used religious building in Europe, at roughly 1,700 years.",
  29:  "The world's first moving-image film was shot in Lyon, not Paris: the Lumière brothers filmed 'La Sortie de l'Usine Lumière' outside their family factory on 19 March 1895, and you can still stand on the exact spot — the factory gate is now the Institut Lumière museum, and the street is called Rue du Premier-Film.",
  30:  "Tallinn's Old Town Pharmacy (Raeapteek) has been operating continuously on the same Town Hall Square spot since at least 1422 — making it Europe's oldest still-functioning pharmacy. Until the 19th century it sold genuinely deranged remedies including powdered unicorn horn, mummy juice, and burnt hedgehog, and the original 17th-century ledgers are still on display."
};

const ITINERARIES = {
  12: { // Freiburg
    name: "Freiburg im Breisgau",
    days: [
      {
        label: "Day 1",
        blocks: [
          { time: "12:30", plan: "Check-in, unpack, align itinerary blocks", note: "Keep the room as a 'reset zone' between outings" },
          { time: "13:30", plan: "Coffee at Günter Coffee Roasters (Merianstraße 8)", note: "Order: espresso + filter; buy a bag for home" },
          { time: "15:00", plan: "Old town orientation walk (loop with frequent bench pauses)", note: "Short stops, no 'must-see sprint'" },
          { time: "17:00", plan: "Pastry break at Schmidt Café", note: "Order: Schwarzwälder Kirschtorte (Black Forest cake)" },
          { time: "19:00", plan: "Dinner at Umami Ramen Freiburg", note: "Order: tonkotsu or signature ramen; arrive early" },
          { time: "20:30", plan: "Wind-down", note: "Hotel-room ritual: shower, next-day route review, set alarms" }
        ]
      },
      {
        label: "Day 2",
        blocks: [
          { time: "08:30", plan: "Coffee repeat at Günter", note: "Same order; consistency is the point" },
          { time: "10:00", plan: "Structured solo walk: 2 hours, zero detours", note: "Use a strict loop format to reduce decision load" },
          { time: "13:00", plan: "Light lunch", note: "Keep it simple, then recharge" },
          { time: "15:30", plan: "Second pastry window", note: "Black Forest cake again if you want 'one sweet only'" },
          { time: "19:00", plan: "Japanese dinner (repeatable)", note: "Second ramen night is allowed; it's a long-weekend gift" },
          { time: "21:00", plan: "Early night", note: "Pack and stage the departure kit" }
        ]
      },
      {
        label: "Day 3",
        blocks: [
          { time: "08:30", plan: "Final coffee and bean pickup", note: "One bag for home, one for Vicky or Jonas" },
          { time: "10:00", plan: "Checkout + one last slow loop in the center", note: "Keep the last block low effort" }
        ]
      }
    ]
  },
  11: { // Konstanz
    name: "Konstanz & Lake Constance",
    days: [
      {
        label: "Day 1",
        blocks: [
          { time: "13:00", plan: "Check-in + 45-minute decompression buffer", note: "No sightseeing until the buffer is complete" },
          { time: "14:15", plan: "Coffee at N° elf – Spezialitätenkaffeerösterei", note: "Order: espresso + filter; sit near the bar if solo" },
          { time: "16:00", plan: "Lakefront walk, slow pace", note: "Make this the 'aesthetic' half-day" },
          { time: "18:30", plan: "Early ramen dinner at Ramen Tatsumi-Tei", note: "'Keine Reservierung möglich.' Go early!" },
          { time: "20:00", plan: "Wind-down", note: "Rooftop spa session if staying at Hotel 47°" }
        ]
      },
      {
        label: "Day 2",
        blocks: [
          { time: "09:00", plan: "Coffee repeat at N° elf", note: "Repeat order; buy beans if the roast is right" },
          { time: "10:30", plan: "Long single walk block", note: "One loop, no branching" },
          { time: "13:00", plan: "Lunch", note: "Keep it light" },
          { time: "16:30", plan: "Second relaxed shoreline block", note: "Phone on silent except navigation" },
          { time: "18:30", plan: "Second Japanese slot", note: "Ramen again? Do it" },
          { time: "20:30", plan: "Wind-down", note: "Sauna, then early sleep" }
        ]
      },
      {
        label: "Day 3",
        blocks: [
          { time: "09:00", plan: "Final coffee", note: "One espresso, then depart" }
        ]
      }
    ]
  },
  18: { // Passau
    name: "Passau",
    days: [
      {
        label: "Day 1",
        blocks: [
          { time: "12:30", plan: "Check-in + nap-lite", note: "30 minutes eyes-closed" },
          { time: "14:00", plan: "Coffee at LIEVIE Passau (Theresienstraße 34)", note: "Order: cappuccino; buy beans for home" },
          { time: "16:00", plan: "Slow 'three rivers' walk block", note: "Camera-walk, not a checklist" },
          { time: "18:30", plan: "Japanese dinner", note: "EssKultur Umami Bar or Sasikaya for Japanese" },
          { time: "20:00", plan: "Souvenir ritual at Confiserie Simon", note: "Order: the 23-carat gold leaf chocolate" }
        ]
      },
      {
        label: "Day 2",
        blocks: [
          { time: "09:00", plan: "LIEVIE repeat", note: "Same order; sit near a window" },
          { time: "10:30", plan: "Museum-lite day", note: "Keep it outdoor-heavy and low interaction" },
          { time: "13:00", plan: "Light lunch", note: "Preserve appetite for sweets and dinner" },
          { time: "16:00", plan: "Return to Simon for a single pastry + coffee", note: "Keep it controlled: one sweet" },
          { time: "19:00", plan: "Second dinner slot", note: "Repeat Japanese if it worked" },
          { time: "20:30", plan: "Wind-down", note: "Hotel-room reset and packing" }
        ]
      },
      {
        label: "Day 3",
        blocks: [
          { time: "09:00", plan: "Checkout coffee", note: "One final espresso, then go" }
        ]
      }
    ]
  },
  19: { // Heidelberg
    name: "Heidelberg",
    days: [
      {
        label: "Day 1",
        blocks: [
          { time: "13:00", plan: "Check-in + route review", note: "Make the plan the calming activity" },
          { time: "14:30", plan: "Coffee at Südseite (Untere Neckarstraße 24)", note: "Roastery with a view of the Neckar — solo ritual" },
          { time: "16:30", plan: "Sweet history stop: Heidelberger Studentenkuß", note: "Buy 2. One now, one later" },
          { time: "19:00", plan: "Ramen dinner at Min Ramen Bar (Neugasse 17)", note: "Solo friendly; pay attention to peak times" },
          { time: "20:30", plan: "Wind-down", note: "Room reset + quiet reading" }
        ]
      },
      {
        label: "Day 2",
        blocks: [
          { time: "09:00", plan: "Coffee repeat at Südseite", note: "Buy beans if you didn't yesterday" },
          { time: "10:30", plan: "Structured walk block", note: "One loop, no detours" },
          { time: "13:00", plan: "Lunch", note: "Keep it light" },
          { time: "16:00", plan: "Second Studentenkuß moment", note: "The 'later' one" },
          { time: "19:00", plan: "Japanese dinner (repeat if needed)", note: "Second ramen night is valid" },
          { time: "21:00", plan: "Early night", note: "Pack and stage" }
        ]
      },
      {
        label: "Day 3",
        blocks: [
          { time: "09:00", plan: "Final espresso", note: "Depart" }
        ]
      }
    ]
  },
  3: { // Tübingen
    name: "Tübingen",
    days: [
      {
        label: "Day 1",
        blocks: [
          { time: "13:00", plan: "Check-in + 1-hour reset", note: "No errands inside the hour" },
          { time: "14:30", plan: "Coffee at Suedhang Kaffee (Jakobsgasse 4)", note: "Order: espresso + filter; buy a bag if roast matches" },
          { time: "16:30", plan: "Cake stop at Hofkonditorei Röcker", note: "Quiet table, no decisions block" },
          { time: "19:00", plan: "Dinner at KUMO (Neckarhalde 2)", note: "Order: ramen + one side if hungry" },
          { time: "20:30", plan: "Wind-down", note: "Hotel spa if staying at La Casa" }
        ]
      },
      {
        label: "Day 2",
        blocks: [
          { time: "09:00", plan: "Suedhang repeat", note: "Same order" },
          { time: "10:30", plan: "Compact town loop walk", note: "Keep it structured and finite" },
          { time: "13:00", plan: "Lunch", note: "Low-interaction meal" },
          { time: "15:30", plan: "Second pastry window", note: "Choose one cake, then stop" },
          { time: "19:00", plan: "Dinner", note: "Japanese repeat if it hit" },
          { time: "21:00", plan: "Early night", note: "Pack" }
        ]
      },
      {
        label: "Day 3",
        blocks: [
          { time: "09:00", plan: "Checkout coffee", note: "Done" }
        ]
      }
    ]
  },
  2: { // Bamberg
    name: "Bamberg",
    days: [
      {
        label: "Day 1",
        blocks: [
          { time: "13:00", plan: "Check-in + buffer", note: "Keep day one gentle" },
          { time: "15:00", plan: "Coffee at Seven Hills Coffee Roasters", note: "Note opening schedule; espresso + filter" },
          { time: "16:30", plan: "Pastry hunt: Bamberger Hörnla", note: "Target the croissant-like Hörnla concept" },
          { time: "19:00", plan: "Dinner at Ichi-san", note: "Order: ramen or bento-style set" },
          { time: "20:30", plan: "Wind-down", note: "Quiet room night, itinerary review" }
        ]
      },
      {
        label: "Day 2",
        blocks: [
          { time: "09:30", plan: "Coffee repeat window", note: "If Seven Hills is closed, keep it simple" },
          { time: "11:00", plan: "Slow old-town circuit", note: "Architecture walk, minimal decisions" },
          { time: "13:00", plan: "Lunch", note: "Low-stimulation meal" },
          { time: "15:30", plan: "Second pastry", note: "Hörnla again or stop" },
          { time: "19:00", plan: "Japanese repeat", note: "Repeat Ichi-san if it worked" }
        ]
      },
      {
        label: "Day 3",
        blocks: [
          { time: "09:00", plan: "Coffee + beans", note: "Buy beans for Berlin" }
        ]
      }
    ]
  },
  23: { // Poznań
    name: "Poznań",
    days: [
      {
        label: "Day 1",
        blocks: [
          { time: "13:00", plan: "Check-in", note: "30 minutes off-phone" },
          { time: "14:30", plan: "Specialty cafe stop", note: "Use the city coffee guide list" },
          { time: "16:00", plan: "Rogal mission at Rogalove (Święty Marcin 51)", note: "Order: warm rogal. Take one to-go" },
          { time: "19:00", plan: "Ramen dinner", note: "Zen On (serious ramen) or Madara Ramen (dedicated ramen framing)" },
          { time: "20:30", plan: "Wind-down", note: "Hotel room, low-light, plan the museum slot" }
        ]
      },
      {
        label: "Day 2",
        blocks: [
          { time: "10:30", plan: "Rogalowe Muzeum Poznania show slot", note: "Book tickets and follow museum timing" },
          { time: "13:00", plan: "Lunch", note: "Keep it simple" },
          { time: "15:30", plan: "Second rogal or coffee", note: "One more rogal only if you want" },
          { time: "19:00", plan: "Second dinner", note: "Repeat ramen" }
        ]
      },
      {
        label: "Day 3",
        blocks: [
          { time: "09:00", plan: "Coffee + checkout", note: "Done" }
        ]
      }
    ]
  },
  24: { // Olomouc
    name: "Olomouc",
    days: [
      {
        label: "Day 1",
        blocks: [
          { time: "13:00", plan: "Check-in at a small hotel", note: "Small scale reduces social noise" },
          { time: "15:00", plan: "Coffee block", note: "Pick one café from the Olomouc guide; 90-minute read and reset" },
          { time: "18:30", plan: "Dinner at Long Story Short Eatery & Bakery", note: "Go early; order one main and one pastry" },
          { time: "20:30", plan: "Wind-down", note: "Hotel room reset" }
        ]
      },
      {
        label: "Day 2",
        blocks: [
          { time: "09:30", plan: "Coffee repeat", note: "Same place, same order" },
          { time: "11:30", plan: "Local specialty dare: tvarůžky", note: "For the full Olomouc stamp, do it once" },
          { time: "13:00", plan: "Light lunch", note: "Keep appetite for ramen" },
          { time: "19:00", plan: "Japanese dinner at FISHI SUSHI", note: "Order: ramen if available + one side; minimalist interior" },
          { time: "20:30", plan: "Wind-down", note: "Early night" }
        ]
      },
      {
        label: "Day 3",
        blocks: [
          { time: "09:00", plan: "Checkout", note: "Done" }
        ]
      }
    ]
  },
  27: { // Ljubljana
    name: "Ljubljana",
    days: [
      {
        label: "Day 1",
        blocks: [
          { time: "14:00", plan: "Check-in + 60-minute reset", note: "Mandatory buffer" },
          { time: "15:30", plan: "Coffee at R&B Cafe Roasters (Slovenska cesta 47)", note: "Espresso + filter; optional: schedule a tasting" },
          { time: "17:00", plan: "Pastry stop at Butik lePotica (Stari trg 10)", note: "Order: walnut mini potica; buy a gift box" },
          { time: "19:00", plan: "Dinner at Ramen by Maru (Gosposka ulica 4)", note: "Shoyu or miso ramen; small space, arrive early" },
          { time: "20:30", plan: "Wind-down", note: "Quiet room, plan tomorrow" }
        ]
      },
      {
        label: "Day 2",
        blocks: [
          { time: "09:00", plan: "Coffee repeat", note: "Add one bag of beans for Berlin" },
          { time: "11:00", plan: "Structured city walk loop", note: "Keep it discrete and finite" },
          { time: "15:00", plan: "Second potica window", note: "One mini only" },
          { time: "19:00", plan: "Second ramen", note: "Repeat, no guilt" }
        ]
      },
      {
        label: "Day 3",
        blocks: [
          { time: "09:00", plan: "Optional design-café: .raw Specialty Coffee", note: "Use it as an 'aesthetic reset'" },
          { time: "12:00", plan: "Slow midday", note: "Keep it low-load" },
          { time: "19:00", plan: "Final chosen dinner", note: "Either ramen again or a simple hotel meal" }
        ]
      },
      {
        label: "Day 4",
        blocks: [
          { time: "09:00", plan: "Checkout", note: "Done" }
        ]
      }
    ]
  },
  29: { // Lyon
    name: "Lyon",
    days: [
      {
        label: "Day 1",
        blocks: [
          { time: "14:00", plan: "Check-in + buffer", note: "Reduce cognitive load" },
          { time: "16:00", plan: "Coffee at Celsius Roasters", note: "Espresso + filter; buy beans" },
          { time: "18:00", plan: "Praline tart at Maison Victoire (Halles de Lyon)", note: "Order: tarte à la praline" },
          { time: "19:30", plan: "Ramen at Fujiyama 55", note: "Ramen formule with gyoza" },
          { time: "21:00", plan: "Wind-down", note: "Quiet room, early night" }
        ]
      },
      {
        label: "Day 2",
        blocks: [
          { time: "09:00", plan: "Coffee repeat", note: "Same order, no experimentation" },
          { time: "12:00", plan: "Long structured walk block", note: "One loop, no detours" },
          { time: "16:00", plan: "Second praline tart slot (optional)", note: "Only if you want it" },
          { time: "19:00", plan: "Second ramen slot", note: "Repeat Fujiyama 55 or keep dinner quiet" }
        ]
      },
      {
        label: "Day 3",
        blocks: [
          { time: "09:00", plan: "Checkout", note: "Done" }
        ]
      }
    ]
  }
};

const COMBO_TRIPS = [
  {
    ids: [24, 23],
    theme: "Central Europe Pastry & Ramen Audit",
    description: "Weekend 1: Poznań for rogale and ramen. Weekend 2: Olomouc for tvarůžky novelty plus ramen-capable Japanese."
  },
  {
    ids: [11, 12],
    theme: "Southern Germany Calm Pacing",
    description: "Two cities with repeatable loop structure: coffee, long walk, ramen, sauna, early night. Konstanz + Freiburg."
  },
  {
    ids: [29, 26],
    theme: "Food Cities with Iconic Sweets",
    description: "Lyon for praline tart, Ghent for cuberdons — both with ramen hooks."
  },
  {
    ids: [4, 21],
    theme: "Thuringia Double (15 min apart!)",
    description: "Erfurt for Krämerbrücke and chocolate, Weimar for Bauhaus and Goethe. Connected by a 15-minute ICE ride."
  },
  {
    ids: [27, 9],
    theme: "Alpine to Mediterranean",
    description: "Fly to Ljubljana, train to Bologna. Green capital meets food capital — coffee roasting + portico hiking."
  }
];

// ============================================================
// V2 ADDITIONS — richer scoring, spotlight tagging, new questions
// ============================================================

// --- HIDDEN_GEMS: Q6 "hidden gems" now boosts 8 lesser-known picks across
//     multiple days/distance buckets (V1 only flagged Tübingen, making the
//     answer a no-op on most paths). +4 score bump.
const HIDDEN_GEMS = new Set([3, 13, 17, 18, 24, 25, 27, 28]);

// --- PROPOSAL_TAGS: semantic tags per destination, used to score Q3c /
//     Q_pace / Q_physicality matches and to drive the highlight spotlight.
const PROPOSAL_TAGS = {
  1:  ["mountains","trekking","hiking-heavy","forests","hilltop-ruins","fortress","river","spa","massage"],    // Saxon Switzerland
  2:  ["medieval","foodie","river","cozy","cathedrals","markets","cocktails"],                                  // Bamberg
  3:  ["literary","university","river","hilltop-castle","sweets","cozy","medieval"],                            // Tübingen
  4:  ["medieval","sweets","chocolate","cathedrals","synagogue","river-bridge","ramen","cocktails","mixology"], // Erfurt
  5:  ["coastal","medieval","cathedrals","history","cozy","maritime"],                                          // Lübeck
  6:  ["coffee","cathedrals","medieval","river","markets","quirky","cocktails","weird-bars","speakeasy"],       // Wrocław
  7:  ["spa","thermal","indulgence","sweets","cozy","architecture","massage","hammam","bodywork"],              // Karlovy Vary
  8:  ["history_deep","memorial","wwii","coastal","ramen","cathedrals","amber","maritime","cocktails","weird-bars","themed"], // Gdańsk
  9:  ["foodie","markets","trekking","hilltop-sanctuary","ancient","university","ramen","sweets","cocktails","weird-bars","mixology"], // Bologna
  10: ["coffee","coastal","sweets","pastries","cathedrals","tasting","cocktails","weird-bars","themed"],        // Porto
  11: ["lakeside","gardens","sacred","medieval","spa","swim","boat","hilltop-castle","massage","cocktails"],   // Konstanz
  12: ["forests","trekking","sweets","cakes","coffee","cathedrals","cable-car","viewpoint","spa","massage","cocktails"], // Freiburg
  13: ["medieval","architecture","cinematic","coffee","river","cobblestone"],                                   // Görlitz
  14: ["medieval","foodie","cathedrals","ramen","river-bridge","sausage","viewpoint","cocktails","weird-bars","mixology"], // Regensburg
  15: ["coastal","forests","trekking","beaches","cliffs","cliff-walk","steam-train"],                           // Rügen
  16: ["mountains","alpine","trekking","lakeside","memorial","hilltop","viewpoint","massage","spa","cocktails"], // Berchtesgaden
  17: ["medieval","cathedrals","forests","trekking","hilltop-ruins","steam-train","cocktails","themed","massage"], // Quedlinburg
  18: ["confluence","sacred","architecture","hilltop-ruins","fortress","cocktails","themed"],                   // Passau
  19: ["literary","sacred","hilltop-ruins","river","art","university","cocktails","weird-bars","mixology"],    // Heidelberg
  20: ["art","baroque","cathedrals","hilltop-ruins","fortress","cocktails","weird-bars","speakeasy","themed"], // Würzburg
  21: ["literary","memorial","art","museums","history_deep","bauhaus","library","cocktails"],                  // Weimar
  22: ["cathedrals","art","markets","history","printing","cocktails","speakeasy"],                             // Mainz
  23: ["sweets","pastries","rogal","markets","medieval","quirky","cocktails","weird-bars","mixology"],         // Poznań
  24: ["baroque","foodie","university","cathedrals","fountains","cocktails"],                                  // Olomouc
  25: ["coastal","coffee","sweets","cakes","art","markets","architecture","cocktails","weird-bars","themed"],  // Malmö
  26: ["art","chocolate","coffee","cathedrals","medieval","fortress","canals","cocktails","weird-bars","speakeasy","themed"], // Ghent
  27: ["architecture","coffee","lakeside","hilltop-castle","sweets","cozy","river","cocktails","weird-bars","speakeasy"], // Ljubljana
  28: ["coffee","coastal","pastries","byzantine","markets","ancient","history","cocktails","weird-bars","speakeasy"], // Thessaloniki
  29: ["markets","foodie","cathedrals","ramen","sweets","praline","bouchon","traboules","cocktails","weird-bars","speakeasy"], // Lyon
  30: ["medieval","coffee","art","cathedrals","design-hotels","creative","cocktails","weird-bars","themed","speakeasy"] // Tallinn
};

// --- Q3C_QUESTIONS: micro-vibe layer conditional on Q3b answer.
//     Exactly one Q3c fires per run (the one matching the user's Q3b).
//     Each option exposes `tags` which go into the user-tag bundle used for
//     highlight spotlight + scoring (via Q3C_VIBE_MAP).
const Q3C_QUESTIONS = [
  // --- nature sub-branches ---
  { id: "3c", text: "In the mountains, what calls you?",
    condition: { questionId: "3b", value: "mountains" },
    options: [
      { label: "Day hikes with a proper summit",        value: "day-hike",      cat: "excited",  tags: ["trekking","hiking-heavy","mountains"] },
      { label: "Hilltop ruins with a walk up",          value: "hilltop-ruins", cat: "thinking", tags: ["hilltop-ruins","hilltop-castle","trekking","fortress"] },
      { label: "Viewpoints, cable cars, easy pace",     value: "viewpoint",     cat: "happy",    tags: ["viewpoint","cable-car","alpine"] }
    ]},
  { id: "3c", text: "By the coast, what sounds best?",
    condition: { questionId: "3b", value: "coastal" },
    options: [
      { label: "Cliff walks with sea-spray views",      value: "cliff-walk",    cat: "excited",  tags: ["cliff-walk","cliffs","trekking","coastal"] },
      { label: "Long quiet beaches, no crowds",         value: "beach-quiet",   cat: "dreamy",   tags: ["beaches","coastal"] },
      { label: "Little fishing towns & harbors",        value: "fishing-town",  cat: "happy",    tags: ["coastal","cozy","maritime"] }
    ]},
  { id: "3c", text: "In the forest, what draws you?",
    condition: { questionId: "3b", value: "forests" },
    options: [
      { label: "Deep-forest treks, proper kilometers",  value: "forest-trek",   cat: "excited",  tags: ["forests","trekking","hiking-heavy"] },
      { label: "Fairy-tale cozy — cabins & half-timber",value: "forest-cozy",   cat: "happy",    tags: ["forests","cozy","medieval"] },
      { label: "Quiet wildlife-watching walks",         value: "forest-quiet",  cat: "thinking", tags: ["forests","wildlife","cozy"] }
    ]},
  { id: "3c", text: "At the lake, what sounds best?",
    condition: { questionId: "3b", value: "lakeside" },
    options: [
      { label: "Swim, row, boat-hop",                   value: "lake-swim",     cat: "excited",  tags: ["lakeside","swim","boat"] },
      { label: "Lakeside gardens & long café afternoons",value: "lake-gardens", cat: "happy",    tags: ["lakeside","gardens","cozy","coffee"] },
      { label: "A slow boat tour & a hilltop castle",   value: "lake-castle",   cat: "thinking", tags: ["lakeside","hilltop-castle","boat"] }
    ]},
  // --- culture sub-branches ---
  { id: "3c", text: "Medieval draws — which most?",
    condition: { questionId: "3b", value: "medieval" },
    options: [
      { label: "Hilltop ruins & fortresses",            value: "ruins",          cat: "excited", tags: ["hilltop-ruins","fortress","ruins","trekking"] },
      { label: "Cathedrals & cloisters",                value: "cathedrals",     cat: "thinking",tags: ["cathedrals","sacred"] },
      { label: "Cobblestone crawl, half-timbered streets",value: "cobblestone", cat: "happy",   tags: ["medieval","cobblestone","cozy"] }
    ]},
  { id: "3c", text: "Literary — which angle?",
    condition: { questionId: "3b", value: "literary" },
    options: [
      { label: "Author pilgrimage — their house, their streets", value: "author", cat: "dreamy", tags: ["literary","museums"] },
      { label: "Ancient library you can actually visit",         value: "library",cat: "thinking",tags: ["literary","library"] },
      { label: "Bookshop wander & café reading",                value: "bookshop",cat: "happy",  tags: ["literary","bookshops","cozy","coffee"] }
    ]},
  { id: "3c", text: "Art — which kind?",
    condition: { questionId: "3b", value: "art" },
    options: [
      { label: "Classic museum, one great collection",  value: "classic-museum", cat: "thinking", tags: ["art","museums","baroque"] },
      { label: "Street art & studios",                  value: "street-art",     cat: "excited",  tags: ["art","street-art","quirky"] },
      { label: "A whole town built by artists",         value: "artist-town",    cat: "happy",    tags: ["art","cozy","studios"] }
    ]},
  { id: "3c", text: "History — what hits hardest?",
    condition: { questionId: "3b", value: "history_deep" },
    options: [
      { label: "WWII & 20th-century memorials",         value: "wwii-memorial",  cat: "thinking", tags: ["memorial","wwii","history_deep"] },
      { label: "Ancient ruins — Byzantine / Roman / earlier", value: "ancient",  cat: "excited",  tags: ["ancient","byzantine","ruins","history"] },
      { label: "Maritime & mercantile heritage",        value: "maritime-heritage",cat: "thinking",tags: ["maritime","coastal","history"] }
    ]},
  // --- food sub-branches ---
  { id: "3c", text: "Sweet tooth — go deep where?",
    condition: { questionId: "3b", value: "sweets_sub" },
    options: [
      { label: "Bean-to-bar chocolate obsession",       value: "chocolate-deep", cat: "happy",   tags: ["chocolate","sweets"] },
      { label: "Pastries & bakery classics",            value: "pastries-deep",  cat: "dreamy",  tags: ["pastries","sweets"] },
      { label: "Cakes, tarts & long café afternoons",   value: "cakes-deep",     cat: "happy",   tags: ["cakes","sweets","coffee","cozy"] }
    ]},
  { id: "3c", text: "Coffee — deep end?",
    condition: { questionId: "3b", value: "coffee_sub" },
    options: [
      { label: "Roastery tour — meet the beans",        value: "roastery",       cat: "excited", tags: ["coffee","roastery","tasting"] },
      { label: "Café-hop — 4 shops, 1 day",             value: "cafe-hop",       cat: "happy",   tags: ["coffee","cozy"] },
      { label: "Coffee history & old-guard houses",     value: "coffee-history", cat: "thinking",tags: ["coffee","historic"] }
    ]},
  { id: "3c", text: "Markets — which vibe?",
    condition: { questionId: "3b", value: "markets" },
    options: [
      { label: "Early-morning produce & cheese",        value: "morning-market", cat: "thinking",tags: ["markets","foodie"] },
      { label: "Street food — eat-your-way-through",    value: "street-food",    cat: "excited", tags: ["markets","street-food","foodie"] },
      { label: "Guided tasting tour, 5 stops",          value: "tasting-tour",   cat: "happy",   tags: ["tasting","markets","foodie"] }
    ]},
  { id: "3c", text: "Cocktail bars \u2014 what flavour?",
    condition: { questionId: "3b", value: "drinks" },
    options: [
      { label: "Speakeasies & hidden-door spots",       value: "speakeasy",      cat: "excited", tags: ["cocktails","weird-bars","speakeasy","mixology"] },
      { label: "Experimental mixology, weird ingredients", value: "experimental", cat: "thinking", tags: ["cocktails","weird-bars","mixology"] },
      { label: "Themed \u2014 apothecary, library, theatre vibes", value: "themed-bars", cat: "dreamy", tags: ["cocktails","weird-bars","themed"] }
    ]},
  // --- spa sub-branches ---
  { id: "3c", text: "Thermal — which style?",
    condition: { questionId: "3b", value: "thermal" },
    options: [
      { label: "Roman-style grand bath, high ceilings", value: "roman-bath",     cat: "sleepy",  tags: ["thermal","spa","indulgence","architecture"] },
      { label: "Nordic spa — sauna ritual, icy plunge", value: "nordic-spa",     cat: "dreamy",  tags: ["spa","sauna","indulgence"] },
      { label: "Forest sauna & quiet pines",            value: "forest-sauna",   cat: "happy",   tags: ["spa","sauna","forests","cozy"] }
    ]},
  { id: "3c", text: "Massage \u2014 what kind?",
    condition: { questionId: "3b", value: "massage_sub" },
    options: [
      { label: "Classic Swedish / Balinese in a dedicated spa", value: "massage-classic", cat: "sleepy", tags: ["massage","spa","indulgence"] },
      { label: "Deep tissue / sports / Thai",                    value: "massage-deep",   cat: "thinking", tags: ["massage","bodywork","spa"] },
      { label: "Hammam, scrub & full ritual",                    value: "massage-hammam", cat: "dreamy", tags: ["massage","hammam","indulgence","thermal"] }
    ]},
  { id: "3c", text: "Cozy — what kind?",
    condition: { questionId: "3b", value: "cozy_sub" },
    options: [
      { label: "Hotel with a real ritual — robe-to-dinner", value: "ritual-hotel",cat: "dreamy", tags: ["cozy","indulgence"] },
      { label: "A slow village you don't leave",        value: "slow-village",   cat: "sleepy",  tags: ["cozy","village","medieval"] },
      { label: "Boutique in a quiet, pretty town",      value: "boutique-quiet", cat: "happy",   tags: ["cozy","boutique"] }
    ]},
  { id: "3c", text: "Seaside — which morning?",
    condition: { questionId: "3b", value: "seaside" },
    options: [
      { label: "Beach + sauna ritual",                  value: "beach-sauna",    cat: "dreamy",  tags: ["beaches","sauna","coastal"] },
      { label: "Coastal hot spring & rocks",            value: "coastal-thermal",cat: "sleepy",  tags: ["thermal","coastal"] },
      { label: "Sea-view balcony & a book",             value: "sea-balcony",    cat: "happy",   tags: ["coastal","cozy"] }
    ]}
];

// --- Q_PACE + Q_PHYS: unconditional additions after Q4 (morning).
const Q_PACE = {
  id: "pace",
  text: "How packed do you want the days?",
  options: [
    { label: "Chill — two anchors a day, long coffees between", value: "chill",    cat: "sleepy",  tags: ["cozy","indulgence","coffee"] },
    { label: "Balanced — a morning thing and an afternoon thing",value: "balanced", cat: "happy",   tags: [] },
    { label: "Packed — 3+ stops, set the alarm",                value: "packed",   cat: "excited", tags: ["markets","museums","foodie"] }
  ]
};

const Q_PHYS = {
  id: "phys",
  text: "How much walking & hiking are you up for?",
  options: [
    { label: "Low — flat walks, comfy shoes, no boots",         value: "low",      cat: "happy",    tags: ["spa","indulgence","cozy","coffee"] },
    { label: "Moderate — an hour uphill for a view is fine",    value: "moderate", cat: "thinking", tags: ["viewpoint"] },
    { label: "High — I'd walk 20km for a ridgeline",            value: "heavy",    cat: "excited",  tags: ["trekking","hiking-heavy"] }
  ]
};

// V2-C: Build the final QUESTIONS flow by (1) injecting Q3c + Q_pace + Q_phys,
// (2) adding "I'm flexible" skip options to every soft-scoring question, and
// (3) reordering so preferences come first and logistics last. This guarantees
// that by the time we hit days+distance we can warn about empty intersections.
(function buildQuestionFlow() {
  // 1. Inject Q3c variants after the Q3b block
  let insert3c = QUESTIONS.findIndex(q => q.id === "3b");
  while (insert3c >= 0 && QUESTIONS[insert3c] && QUESTIONS[insert3c].id === "3b") insert3c++;
  QUESTIONS.splice(insert3c, 0, ...Q3C_QUESTIONS);

  // 2. Insert Q_pace and Q_phys after Q4
  const q4idx = QUESTIONS.findIndex(q => q.id === 4);
  if (q4idx >= 0) QUESTIONS.splice(q4idx + 1, 0, Q_PACE, Q_PHYS);

  // 3. Add "I'm flexible" option to every soft-scoring question.
  //    Q1 (days) and Q2 (distance) are hard commitments, so skip them.
  const SKIP = { label: "Es ist mir egal", value: "_skip", cat: "thinking", tags: [] };
  const softIds = new Set(["3b", "3c", 3, 4, "pace", "phys", 5, 6]);
  for (const q of QUESTIONS) {
    if (softIds.has(q.id) && !q.options.some(o => o.value === "_skip")) {
      q.options = [...q.options, SKIP];
    }
  }

  // 4. Reorder: preferences first, logistics (Q1 days, Q2 distance) last.
  //    New flow: Q3 -> Q3b -> Q3c -> Q4 -> pace -> phys -> Q5 -> Q1 -> Q2 -> Q6
  const order = [3, "3b", "3c", 4, "pace", "phys", 5, 1, 2, 6];
  const rank = new Map(order.map((id, i) => [String(id), i]));
  QUESTIONS.sort((a, b) => {
    const ra = rank.get(String(a.id));
    const rb = rank.get(String(b.id));
    if (ra === undefined || rb === undefined) return 0;
    return ra - rb;
  });
})();

// --- Vibe maps for new questions. Q3c:+3, Q_pace:+2, Q_phys:+2.
const Q3C_VIBE_MAP = {
  "day-hike":        ["trekking","hiking-heavy","mountains"],
  "hilltop-ruins":   ["hilltop-ruins","hilltop-castle","fortress","ruins","hilltop-sanctuary"],
  "viewpoint":       ["viewpoint","cable-car","alpine"],
  "cliff-walk":      ["cliff-walk","cliffs","coastal","trekking"],
  "beach-quiet":     ["beaches","coastal"],
  "fishing-town":    ["maritime","coastal","cozy"],
  "forest-trek":     ["forests","trekking","hiking-heavy"],
  "forest-cozy":     ["forests","cozy","medieval"],
  "forest-quiet":    ["forests","wildlife"],
  "lake-swim":       ["lakeside","swim","boat"],
  "lake-gardens":    ["lakeside","gardens","cozy","coffee"],
  "lake-castle":     ["lakeside","hilltop-castle","boat"],
  "ruins":           ["hilltop-ruins","fortress","ruins"],
  "cathedrals":      ["cathedrals","sacred"],
  "cobblestone":     ["medieval","cobblestone","cozy"],
  "author":          ["literary","museums"],
  "library":         ["literary","library"],
  "bookshop":        ["literary","bookshops","cozy","coffee"],
  "classic-museum":  ["art","museums","baroque"],
  "street-art":      ["art","street-art","quirky"],
  "artist-town":     ["art","cozy"],
  "wwii-memorial":   ["memorial","wwii","history_deep"],
  "ancient":         ["ancient","byzantine","history"],
  "maritime-heritage":["maritime","coastal","history"],
  "chocolate-deep":  ["chocolate","sweets"],
  "pastries-deep":   ["pastries","sweets"],
  "cakes-deep":      ["cakes","sweets","coffee","cozy"],
  "roastery":        ["coffee","roastery","tasting"],
  "cafe-hop":        ["coffee","cozy"],
  "coffee-history":  ["coffee","historic"],
  "morning-market":  ["markets","foodie"],
  "street-food":     ["markets","street-food","foodie"],
  "tasting-tour":    ["tasting","markets","foodie"],
  "speakeasy":       ["cocktails","weird-bars","speakeasy","mixology"],
  "experimental":    ["cocktails","weird-bars","mixology"],
  "themed-bars":     ["cocktails","weird-bars","themed"],
  "roman-bath":      ["thermal","spa","indulgence","architecture"],
  "nordic-spa":      ["spa","sauna","indulgence"],
  "forest-sauna":    ["spa","sauna","forests"],
  "massage-classic": ["massage","spa","indulgence"],
  "massage-deep":    ["massage","bodywork","spa"],
  "massage-hammam":  ["massage","hammam","thermal","indulgence"],
  "ritual-hotel":    ["cozy","indulgence"],
  "slow-village":    ["cozy","village","medieval"],
  "boutique-quiet":  ["cozy","boutique"],
  "beach-sauna":     ["beaches","sauna","coastal"],
  "coastal-thermal": ["thermal","coastal"],
  "sea-balcony":     ["coastal","cozy"]
};

const Q_PACE_MAP = {
  chill:    ["cozy","indulgence","spa","lakeside","coffee"],
  balanced: [],
  packed:   ["markets","museums","foodie","culture"]
};

const Q_PHYS_MAP = {
  low:      ["spa","indulgence","cozy","coffee"],
  moderate: ["viewpoint"],
  heavy:    ["trekking","hiking-heavy","cliff-walk"]
};

// --- SWEET_TOURS: verified (or easy-to-verify-on-site) tasting
//     experiences. Surfaced prominently when user's sweets lean is strong.
const SWEET_TOURS = {
  4:  { name: "Goldhelm Schokoladenmanufaktur tasting", description: "Bean-to-bar chocolate tasting + cardamom hot chocolate at the Krämerbrücke chocolatier.", duration: "~45min", bookingNote: "Walk-in; busier on market days." },
  9:  { name: "Bologna chocolate & gelato class", description: "Hands-on truffle + artisan gelato class with a local chocolatier — eat-what-you-make.", duration: "~3h", bookingNote: "Book via Lezioni di Cioccolato / Airbnb Experiences." },
  10: { name: "Porto pastel de nata workshop", description: "Make pastel de nata from scratch with a traditional bakery.", duration: "~2h", bookingNote: "Book via Workshops Pastel de Nata in Ribeira; several operators." },
  23: { name: "Rogalowe Muzeum live baking show", description: "Watch master bakers make EU-protected rogal świętomarciński, then eat warm.", duration: "~1h", bookingNote: "Daily shows; walk-in friendly. Arrive 10 minutes early." },
  26: { name: "Ghent chocolate walking tour", description: "2.5h walking tour of Ghent's best small chocolatiers — tastings at 4–5 shops along the Leie.", duration: "~2.5h", bookingNote: "Book via Chocolate Story Belgium or Ghent Greeters." },
  29: { name: "Lyon praline tart & traboule walk", description: "Vieux Lyon traboules + Les Halles stop for Lyon's signature praline tart (Maison Victoire or Pignol).", duration: "~2h", bookingNote: "Self-guided possible; guided via Lyon City Tour." }, img: { file: "images/29-lyon/inline-sweet-tour.webp", caption: "Tarte à la praline de Lyon", credit: "Amada44 — CC BY-SA 4.0" }
};

// --- RUINS_AND_CASTLES: hilltop ruins/fortresses per destination. Surfaced
//     when user's Q3c picks hilltop-ruins/fortress/castle micro-vibes.
const RUINS_AND_CASTLES = {
  1:  { name: "Festung Königstein", type: "fortress", description: "One of Europe's largest hilltop fortresses — 750 years of unconquered walls, reached by a short steep climb or a lift." },
  3:  { name: "Schloss Hohentübingen", type: "hilltop-castle", description: "Renaissance castle on the hill above the Neckar — houses the 40,000-year-old ivory carvings." },
  9:  { name: "Santuario della Madonna di San Luca", type: "hilltop-sanctuary", description: "3.8 km covered walkway of 666 arches climbs to a hilltop sanctuary over Bologna." },
  11: { name: "Meersburg Castle", type: "hilltop-castle", description: "Germany's oldest continuously inhabited castle, across the lake from Konstanz — ferry access." },
  14: { name: "Walhalla", type: "hilltop", description: "Neoclassical marble temple on the Danube outside Regensburg — a hall-of-fame with 358 steps up." },
  16: { name: "Kehlsteinhaus (Eagle's Nest)", type: "hilltop", description: "Mountain-top building at 1,834m with 360° Alpine views, reached by dedicated bus + brass-doored lift." },
  17: { name: "Schloss Quedlinburg & Stiftskirche", type: "hilltop-ruins", description: "Schlossberg perch — one of Germany's oldest royal seats, with a preserved Ottonian crypt." },
  18: { name: "Veste Oberhaus", type: "fortress", description: "Powerful hilltop fortress over Passau's three-rivers confluence — a short climb or ferry." },
  19: { name: "Heidelberger Schloss", type: "hilltop-ruins", description: "Half-ruined Renaissance castle above the Neckar — the ruin IS the icon. Funicular or on foot." },
  20: { name: "Festung Marienberg", type: "fortress", description: "Hilltop fortress over Würzburg's vineyards — 20-min uphill walk from the Alte Mainbrücke." },
  26: { name: "Gravensteen", type: "fortress", description: "12th-century moated castle in the heart of Ghent — climb the keep for medieval rooftops." },
  27: { name: "Ljubljana Castle", type: "hilltop-castle", description: "Funicular or hike up to a hilltop castle dominating the old town — vineyards and restaurants at the top." }, img: { file: "images/27-ljubljana/inline-ruin.webp", caption: "Ljubljana Castle on the hill", credit: "Viktar Palstsiuk — CC BY-SA 4.0" }
};

// --- GALLERIES: populated after image sourcing completes.
//     Shape: { [id]: [{ file, caption, credit, source }, ...] }
//     File paths resolve to images/{id}-{slug}/{file}.
const GALLERIES = {};
// Galleries will be populated from images/_manifest-batch-*.json during build.

// ============================================================
// GALLERIES — destination photo manifest (auto-generated from
// images/_manifest-batch-*.json). Each entry: { slug, photos: [...] }
// with photos[0] being the hero, rest supporting.
// ============================================================
Object.assign(GALLERIES, {
  1: { slug: "saxon-switzerland", photos: [
    { file: "hero.webp", caption: "Bastei Bridge over the Elbe gorge", credit: "Kolossos — CC BY 3.0", source: "https://commons.wikimedia.org/wiki/File:Basteibr%C3%BCcke-Gansfelsen-gp.jpg" },
    { file: "highlight-a.webp", caption: "Festung Königstein fortress", credit: "Pudelek (Marcin Szala) — CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Festung_K%C3%B6nigstein_(by_Pudelek)_3.jpg" },
    { file: "highlight-b.webp", caption: "Sunlight in the Schwedenlöcher gorge", credit: "Ziddalie — CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Jungle_feeling_at_the_Schwedenl%C3%B6cher_in_Saxony.jpg" },
    { file: "highlight-c.webp", caption: "View into the Elbe valley from the national park", credit: "Sha2566 (sha256_) — CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Saxon_Switzerland_-_View_into_the_valley.jpg" }
  ] },
  2: { slug: "bamberg", photos: [
    { file: "hero.webp", caption: "Altes Rathaus (Old Town Hall) on the Regnitz river island", credit: "Berthold Werner — Public Domain", source: "https://commons.wikimedia.org/wiki/File:Bamberg_Altes_Rathaus_BW_2.JPG" },
    { file: "highlight-a.webp", caption: "Klein Venedig (Little Venice) fishermen's houses on the Regnitz", credit: "MaxEmanuel — CC0", source: "https://commons.wikimedia.org/wiki/File:Klein-Venedig_(Bamberg)_01.jpg" },
    { file: "highlight-b.webp", caption: "Bamberg Cathedral", credit: "Berthold Werner — Public Domain", source: "https://commons.wikimedia.org/wiki/File:Bamberger_Dom_BW_6.JPG" },
    { file: "highlight-c.webp", caption: "Schlenkerla brewpub (Rauchbier)", credit: "Z thomas — CC BY-SA 3.0", source: "https://commons.wikimedia.org/wiki/File:Schlenkerla_dominikanerstr6_bamberg.JPG" }
  ] },
  3: { slug: "tubingen", photos: [
    { file: "hero.webp", caption: "Neckarfront of Tübingen with candy-colored houses over the river", credit: "Felix König — CC BY 3.0", source: "https://commons.wikimedia.org/wiki/File:Neckarfront_T%C3%BCbingen_7._M%C3%A4rz_2016.jpg" },
    { file: "highlight-a.webp", caption: "Stocherkahn punting boats on the Neckar", credit: "MBe57 — CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Stocherkahn_on_Neckar_river,_T%C3%BCbingen,_Germany.jpg" },
    { file: "highlight-b.webp", caption: "Schloss Hohentübingen hilltop castle (aerial view)", credit: "Carsten Steger — CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Aerial_image_of_the_Schloss_Hohent%C3%BCbingen_(view_from_the_east).jpg" }
  ] },
  4: { slug: "erfurt", photos: [
    { file: "hero.webp", caption: "Krämerbrücke, the inhabited medieval bridge", credit: "H. Zell — CC BY-SA 3.0", source: "https://commons.wikimedia.org/wiki/File:Erfurt_-_Kr%C3%A4merbr%C3%BCcke_01.jpg" },
    { file: "highlight-a.webp", caption: "Dom and Severikirche on Domplatz", credit: "JopkeB — CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Dom_und_Severikirche_in_Erfurt_2010.jpg" },
    { file: "highlight-b.webp", caption: "Fischmarkt old town square", credit: "Giorno2 — CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Fischmarkt_(Erfurt).jpg" }
  ] },
  5: { slug: "lubeck", photos: [
    { file: "hero.webp", caption: "Holstentor, the medieval twin-towered gate", credit: "Christian Wolf (Dr. Chriss) — CC BY-SA 3.0 DE", source: "https://commons.wikimedia.org/wiki/File:Holstentor_in_L%C3%BCbeck_2015.jpg" },
    { file: "highlight-a.webp", caption: "Niederegger marzipan café arcade", credit: "Jorge Franganillo — CC BY 2.0", source: "https://commons.wikimedia.org/wiki/File:L%C3%BCbeck_Niederegger_Arkadencafe_(38962085281).jpg" },
    { file: "highlight-b.webp", caption: "St. Mary's Church (Marienkirche) aerial view", credit: "Carsten Steger — CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Aerial_image_of_St._Mary%27s_Church,_L%C3%BCbeck_(view_from_the_west).jpg" }
  ] },
  6: { slug: "wroclaw", photos: [
    { file: "hero.webp", caption: "Panorama of Wrocław's Rynek (Market Square)", credit: "Gerd Eichmann — CC BY 4.0", source: "https://commons.wikimedia.org/wiki/File:Breslau-Rynek-38-Panorama-2014-gje.jpg" },
    { file: "highlight-a.webp", caption: "Brickwork on a building in Ostrów Tumski (Cathedral Island)", credit: "Matti Blume — CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Ostrow_Tumski,_Wroclaw_(P1180410).jpg" },
    { file: "highlight-b.webp", caption: "Wrocław Rynek (Market Square) — colorful Renaissance façades", credit: "Jacek Halicki — CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:2016_Wroc%C5%82aw,_Rynek_49.jpg" }
  ] },
  7: { slug: "karlovy-vary", photos: [
    { file: "hero.webp", caption: "Panorama of Karlovy Vary — colorful spa-town in the Teplá valley", credit: "Nikita Sazonenko — CC BY-SA 3.0", source: "https://commons.wikimedia.org/wiki/File:Karlovy_Vary_Panorama_(135669935).jpeg" },
    { file: "highlight-a.webp", caption: "Grandhotel Pupp exterior", credit: "Manecke — CC BY-SA 3.0", source: "https://commons.wikimedia.org/wiki/File:Grandhotel_Pupp.JPG" },
    { file: "highlight-b.webp", caption: "Vřídlo thermal spring geyser", credit: "Perituss — CC0", source: "https://commons.wikimedia.org/wiki/File:V%C5%99%C3%ADdlo_Karlovy_Vary_2010_2.jpg" },
    { file: "highlight-c.webp", caption: "Panorama of Karlovy Vary spa town", credit: "Nikita Sazonenko — CC BY-SA 3.0", source: "https://commons.wikimedia.org/wiki/File:Karlovy_Vary_Panorama_(135669935).jpeg" }
  ] },
  8: { slug: "gdansk", photos: [
    { file: "hero.webp", caption: "Long Market (Długi Targ) with Artus Court and Green Gate", credit: "BjoernEisbaer — CC BY-SA 3.0 PL", source: "https://commons.wikimedia.org/wiki/File:Long_Market_Square_(D%C5%82ugi_Targ),_Gda%C5%84sk.jpg" },
    { file: "highlight-a.webp", caption: "Żuraw (the medieval Crane Gate) on the Motława river", credit: "DerHexer — CC BY-SA 3.0", source: "https://commons.wikimedia.org/wiki/File:%C5%BBuraw_in_Gda%C5%84sk.jpg" },
    { file: "highlight-b.webp", caption: "Sopot Pier (Molo) on the Baltic Sea", credit: "Diego Delso — CC BY-SA 3.0", source: "https://commons.wikimedia.org/wiki/File:Muelle_de_Sopot,_Polonia,_2013-05-22,_DD_20.jpg" }
  ] },
  9: { slug: "bologna", photos: [
    { file: "hero.webp", caption: "Two Towers: Asinelli and Garisenda", credit: "Giacomo Alessandroni — CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Le_due_torri_-_Bologna.jpg" },
    { file: "highlight-a.webp", caption: "Portico di San Luca arched walkway on the hill", credit: "Vanni Lazzari — CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Portico_di_San_Luca_-_Bologna.jpg" },
    { file: "highlight-b.webp", caption: "Fountain of Neptune on Piazza Maggiore", credit: "Zairon — CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Bologna_Piazza_Maggiore_Fontana_del_Nettuno_14.jpg" }
  ] },
  10: { slug: "porto", photos: [
    { file: "hero.webp", caption: "Ribeira riverfront viewed from the Dom Luís I bridge", credit: "Krzysztof Golik (Tournasol7) — CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Ribeira_from_Dom_Luis_I_bridge_(4).jpg" },
    { file: "highlight-a.webp", caption: "Livraria Lello bookstore exterior", credit: "John Samuel — CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Exterior_view_of_Livraria_Lello_01.jpg" },
    { file: "highlight-b.webp", caption: "Torre dos Clérigos — 75m Baroque tower by Nasoni, Porto", credit: "Thomas Dahlstrøm Nielsen — CC BY 4.0", source: "https://commons.wikimedia.org/wiki/File:Torre_dos_Cl%C3%A9rigos,_2023.jpg" },
    { file: "highlight-c.webp", caption: "Pastel de nata Portuguese custard tart", credit: "Claude TRUONG-NGOC — CC BY-SA 3.0", source: "https://commons.wikimedia.org/wiki/File:Pastel_de_nata_septembre_2015.jpg" }
  ] },
  11: { slug: "konstanz", photos: [
    { file: "hero.webp", caption: "Imperia statue at Konstanz harbor with historic Konzilgebäude", credit: "JoachimKohler-HB — CC-BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Konstanz_-_Feuerwehrboot_LBD_Heinz_Sch%C3%A4fer_mit_Imperia.jpg" },
    { file: "highlight-a.webp", caption: "Rose garden and palm house on Mainau flower island", credit: "JoachimKohler-HB — CC-BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Rosengarten_und_Palmenhaus_der_Insel_Mainau_(2015).jpg" },
    { file: "highlight-b.webp", caption: "Marktstätte square in Konstanz old town", credit: "Rizzo — CC-BY 3.0", source: "https://commons.wikimedia.org/wiki/File:Konstanz_Markt%C3%A4tte.jpg" },
    { file: "highlight-c.webp", caption: "Rheintorturm, former city wall gate in Konstanz", credit: "JoachimKohler-HB — CC-BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Rheintorturm_in_Konstanz.jpg" }
  ] },
  12: { slug: "freiburg", photos: [
    { file: "hero.webp", caption: "Freiburg Münster (cathedral) southern facade in red sandstone", credit: "D.W.Germann — CC-BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Freiburg_M%C3%BCnster_S%C3%BCdseite.jpg" },
    { file: "highlight-a.webp", caption: "Bächle water channels running along a Freiburg street", credit: "Joergens.mi — CC-BY-SA 3.0", source: "https://commons.wikimedia.org/wiki/File:B%C3%A4chle_(Freiburg).jpg" },
    { file: "highlight-b.webp", caption: "Schauinsland cable-car valley station near Freiburg", credit: "Helfmann — CC-BY-SA 3.0", source: "https://commons.wikimedia.org/wiki/File:Schauinsland,_Talstation_der_Seilbahn_-_panoramio.jpg" },
    { file: "highlight-c.webp", caption: "Freiburger Münster seen from Herrenstraße", credit: "Giftzwerg 88 — CC-BY-SA 3.0", source: "https://commons.wikimedia.org/wiki/File:Freiburger_M%C3%BCnster_von_Herrenstra%C3%9Fe_01.jpg" }
  ] },
  13: { slug: "gorlitz", photos: [
    { file: "hero.webp", caption: "Görlitz Untermarkt square with its Renaissance townhouses", credit: "Mario Foerster (Userm1971) — CC-BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Untermarkt-zu-goerlitz.jpg" },
    { file: "highlight-a.webp", caption: "West side of the Untermarkt, Görlitz", credit: "Rolf Kranz — CC-BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:G%C3%B6rlitz,_Untermarkt,_Westseite.jpg" },
    { file: "highlight-b.webp", caption: "Alley by the Peterskirche (St. Peter and Paul) in Görlitz", credit: "Frank Vincentz — CC-BY-SA 3.0", source: "https://commons.wikimedia.org/wiki/File:G%C3%B6rlitz_-_Bei_der_Peterskirche_02_ies.jpg" },
    { file: "highlight-c.webp", caption: "Altstadtbrücke, the pedestrian bridge between Görlitz and Zgorzelec", credit: "Frank Vincentz — CC-BY-SA 3.0", source: "https://commons.wikimedia.org/wiki/File:G%C3%B6rlitz_-_Altstadtbr%C3%BCcke_01_ies.jpg" }
  ] },
  14: { slug: "regensburg", photos: [
    { file: "hero.webp", caption: "Regensburg Cathedral and the Steinerne Brücke over the Danube", credit: "Jakub Hałun — CC-BY 4.0", source: "https://commons.wikimedia.org/wiki/File:Regensburg_Cathedral_and_Stone_Bridge,_Germany,_20250430_1632_8211.jpg" },
    { file: "highlight-a.webp", caption: "Steinerne Brücke panorama", credit: "Guido Radig — CC-BY 3.0", source: "https://commons.wikimedia.org/wiki/File:Regensburg_-_Steinerne_Br%C3%BCcke_-_Panorama_I.jpg" },
    { file: "highlight-b.webp", caption: "Historische Wurstküche, the Old Sausage Kitchen in Regensburg", credit: "Geolina163 — CC-BY-SA 3.0 DE", source: "https://commons.wikimedia.org/wiki/File:Regensburg_Historische_Wurstk%C3%BCche_Detail.jpg" },
    { file: "highlight-c.webp", caption: "Ratskeller and tower of the Altes Rathaus, Regensburg", credit: "W. Bulach — CC-BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:00_2201_Regensburg_-_Ratskeller.jpg" }
  ] },
  15: { slug: "rugen", photos: [
    { file: "hero.webp", caption: "Königsstuhl chalk cliffs on Rügen", credit: "Felix König — CC-BY 3.0", source: "https://commons.wikimedia.org/wiki/File:K%C3%B6nigsstuhl_R%C3%BCgen_2012.JPG" },
    { file: "highlight-a.webp", caption: "Binz Seebrücke pier on Rügen", credit: "Lukas Beck — CC-BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Binz_Seebr%C3%BCcke.jpg" },
    { file: "highlight-b.webp", caption: "Beech forest in Jasmund National Park", credit: "Siarhei Besarab — CC-BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Beech_forest_in_Jasmund_National_Park_R%C3%BCgen_02.jpg" },
    { file: "highlight-c.webp", caption: "Rasender Roland narrow-gauge steam train on Rügen", credit: "Derbrauni — CC-BY 4.0", source: "https://commons.wikimedia.org/wiki/File:Rasender_Roland_R%C3%BCgenbahn_07.jpg" }
  ] },
  16: { slug: "berchtesgaden", photos: [
    { file: "hero.webp", caption: "St. Bartholomä church on the Königssee lake", credit: "Polle (derivative work by Ikar.us) — Public Domain", source: "https://commons.wikimedia.org/wiki/File:StBartholom%C3%A4.jpg" },
    { file: "highlight-a.webp", caption: "Watzmann massif in the Berchtesgaden Alps", credit: "Diego Delso — CC-BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Watzmann,_Alpes_de_Berchtesgaden,_Alemania,_2019-05-17,_DD_14.jpg" },
    { file: "highlight-b.webp", caption: "Jenner mountain viewed from Berchtesgaden", credit: "MatthiasKabel — CC-BY-SA 3.0", source: "https://commons.wikimedia.org/wiki/File:Jenner_from_Berchtesgaden.jpg" },
    { file: "highlight-c.webp", caption: "Watzmann massif from the north above Berchtesgaden", credit: "Franzfoto — CC-BY-SA 3.0", source: "https://commons.wikimedia.org/wiki/File:Berchtesgaden_-_Watzmann-Massiv_von_Norden.jpg" }
  ] },
  17: { slug: "quedlinburg", photos: [
    { file: "hero.webp", caption: "Quedlinburg half-timbered Markt (market square) from the south", credit: "Ymblanter — CC-BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Quedlinburg_Markt_from_the_south.jpg" },
    { file: "highlight-a.webp", caption: "Stiftskirche St. Servatius on the Schlossberg, Quedlinburg", credit: "Avda — CC-BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Quedlinburg_-_Stiftskirche_St._Servatius_-_2016.jpg" },
    { file: "highlight-b.webp", caption: "Harzer Schmalspurbahn steam train crossing the Harz", credit: "Christian Alexander Otto — CC-BY 4.0", source: "https://commons.wikimedia.org/wiki/File:Harzer_Schmalspurbahn_%C3%BCber_dem_Harz.jpg" },
    { file: "highlight-c.webp", caption: "Quedlinburg old town panorama with castle and church", credit: "David Short — CC-BY 2.0", source: "https://commons.wikimedia.org/wiki/File:Quedlinburg_panorama_(9163558289).jpg" }
  ] },
  18: { slug: "passau", photos: [
    { file: "hero.webp", caption: "Dreiflüsseeck, confluence of the Danube, Inn, and Ilz in Passau", credit: "Flocci Nivis (Livia Rasp) — CC-BY 4.0", source: "https://commons.wikimedia.org/wiki/File:20230212_Dreifl%C3%BCsseeck_Passau.jpg" },
    { file: "highlight-a.webp", caption: "St. Stephen's Cathedral, Passau", credit: "Flocci Nivis (Livia Rasp) — CC-BY 4.0", source: "https://commons.wikimedia.org/wiki/File:20230212_St._Stephen%27s_Cathedral_Passau_04.jpg" },
    { file: "highlight-b.webp", caption: "Veste Oberhaus fortress overlooking Passau", credit: "High Contrast — CC-BY 3.0 DE", source: "https://commons.wikimedia.org/wiki/File:2011_-_Veste_Oberhaus_in_Passau.jpg" },
    { file: "highlight-c.webp", caption: "Ortsspitze: the tip of the Passau peninsula at the three-rivers confluence", credit: "Gerd Eichmann — CC-BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Passau-82-Ortsspitze-2017-gje.jpg" }
  ] },
  19: { slug: "heidelberg", photos: [
    { file: "hero.webp", caption: "Heidelberg Castle and the Alte Brücke panorama over the Neckar", credit: "Polansky — CC-BY 3.0", source: "https://commons.wikimedia.org/wiki/File:Heidelberg,_Germany._Castle_and_%22Alte_Br%C3%BCcke%22_Panorama.jpg" },
    { file: "highlight-a.webp", caption: "Aerial view of Schloss Heidelberg on the hill", credit: "Schlurcher — CC-BY 4.0", source: "https://commons.wikimedia.org/wiki/File:Heidelberg_Schloss_Luftbild_2.JPG" },
    { file: "highlight-b.webp", caption: "View of Heidelberg from the Philosophenweg", credit: "Schlurcher — CC-BY 4.0", source: "https://commons.wikimedia.org/wiki/File:HeidelbergPhilosophenweg.JPG" },
    { file: "highlight-c.webp", caption: "Alte Brücke (Old Bridge) in Heidelberg", credit: "Jaimrsilva — CC-BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Heidelberg_Old_Bridge.jpg" }
  ] },
  20: { slug: "wurzburg", photos: [
    { file: "hero.webp", caption: "Würzburger Residenz, UNESCO Baroque palace, front facade", credit: "Christian Horvat (VisualBeo) — CC-BY-SA 3.0", source: "https://commons.wikimedia.org/wiki/File:Residenz_Wuerzburg_Vorderan.jpg" },
    { file: "highlight-a.webp", caption: "Alte Mainbrücke with Festung Marienberg in the background", credit: "Daniel Vorndran (DXR) — CC-BY-SA 3.0", source: "https://commons.wikimedia.org/wiki/File:Alte_Mainbr%C3%BCcke_and_Festung_Marienberg,_East_View_20140604.jpg" },
    { file: "highlight-b.webp", caption: "Festung Marienberg fortress above Würzburg", credit: "Avda — CC-BY-SA 3.0", source: "https://commons.wikimedia.org/wiki/File:Festung_Marienberg_-_W%C3%BCrzburg_-_2013.jpg" },
    { file: "highlight-c.webp", caption: "Käppele pilgrimage church, Würzburg (winter)", credit: "Tors — Public Domain", source: "https://commons.wikimedia.org/wiki/File:W%C3%BCrzburg_-_K%C3%A4ppele_(Winter).jpg" }
  ] },
  21: { slug: "weimar", photos: [
    { file: "hero.webp", caption: "Weimar Marktplatz with Renaissance patrician houses", credit: "Nikater — CC-BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:We-marktplatz01.jpg" },
    { file: "highlight-a.webp", caption: "Rococo Hall of the Duchess Anna Amalia Library", credit: "Lina.foe — CC-BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Herzogin_Anna_Amalia_Bibliothek,_Rokokosaal.jpg" },
    { file: "highlight-b.webp", caption: "Bauhaus Museum Weimar at Theaterplatz", credit: "Sailko — CC-BY-SA 3.0", source: "https://commons.wikimedia.org/wiki/File:Bauhaus_Museum_Weimar_01.JPG" },
    { file: "highlight-c.webp", caption: "Panoramic view over Weimar rooftops", credit: "Z thomas — CC-BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Blick_auf_Weimar_2020-06-06.jpg" }
  ] },
  22: { slug: "mainz", photos: [
    { file: "hero.webp", caption: "Mainzer Dom (St. Martin's Cathedral) at blue hour", credit: "salomon10 — CC-BY 2.0", source: "https://commons.wikimedia.org/wiki/File:Mainzer_Dom_Blaue_Stunde_(37539430014).jpg" },
    { file: "highlight-a.webp", caption: "Reconstructed Gutenberg printing press at the Gutenberg Museum", credit: "dronepicr — CC-BY 2.0", source: "https://commons.wikimedia.org/wiki/File:Gutenberg%27s_printing_press_in_the_Gutenberg_Museum,_Mainz,_Germany_(48988292696).jpg" },
    { file: "highlight-b.webp", caption: "Mainz Rheinufer (Rhine riverfront) with old town", credit: "Oliver Abels (SBT) — CC-BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Mainz_-_Rheinufer_(1_09.2015).jpg" },
    { file: "highlight-c.webp", caption: "Red sandstone facade of Mainz Cathedral", credit: "Wow2010 — CC-BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Mainz-Dom.jpg" }
  ] },
  23: { slug: "poznan", photos: [
    { file: "hero.webp", caption: "Poznań Old Market Square (Stary Rynek) from above", credit: "Aneta Pawska — CC-BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Stary_Rynek_w_Poznaniu,_widok_z_drona_(cropped).jpg" },
    { file: "highlight-a.webp", caption: "Mechanical goats (Koziołki) of the Poznań Town Hall clock", credit: "Scotch Mist — CC-BY-SA 3.0", source: "https://commons.wikimedia.org/wiki/File:Poznan_Goats_(cropped).jpg" },
    { file: "highlight-b.webp", caption: "Imperial Castle (Zamek Cesarski) in Poznań", credit: "Radomil — CC-BY-SA 3.0", source: "https://commons.wikimedia.org/wiki/File:Zamek_Cesarski_w_Poznaniu_ca%C5%82o%C5%9B%C4%87.jpg" },
    { file: "highlight-c.webp", caption: "Rogal świętomarciński - traditional Saint Martin's croissant", credit: "Polonist (Kasia Kronenberger) — CC-BY 2.0", source: "https://commons.wikimedia.org/wiki/File:Polish_St._Martin%27s_croissant_(Rogal_%C5%9Bwi%C4%99tomarci%C5%84ski),_halved.jpg" }
  ] },
  24: { slug: "olomouc", photos: [
    { file: "hero.webp", caption: "Holy Trinity Column, UNESCO Baroque plague column", credit: "Michal Maňas — CC-BY 4.0", source: "https://commons.wikimedia.org/wiki/File:Holy_Trinity_Column.jpg" },
    { file: "highlight-a.webp", caption: "Cathedral of St. Wenceslas, Olomouc", credit: "Kirk / Rabanus Flavus — CC-BY-SA 3.0", source: "https://commons.wikimedia.org/wiki/File:Olomouc_Katedrala_Sv._Vaclava.jpg" },
    { file: "highlight-b.webp", caption: "Astronomical clock on Olomouc Town Hall", credit: "Michal Maňas — CC-BY 4.0", source: "https://commons.wikimedia.org/wiki/File:Old_astronomical_clock_in_Olomouc.jpg" },
    { file: "highlight-c.webp", caption: "Hercules Fountain on Horní náměstí, Olomouc", credit: "ŠJů — CC-BY 4.0", source: "https://commons.wikimedia.org/wiki/File:Olomouc,_Horn%C3%AD_n%C3%A1m%C4%9Bst%C3%AD_2_-_6,_Herkulova_font%C3%A1na.jpg" }
  ] },
  25: { slug: "malmo", photos: [
    { file: "hero.webp", caption: "Turning Torso by Santiago Calatrava in Malmö's Western Harbour", credit: "Väsk — CC-BY-SA 3.0", source: "https://commons.wikimedia.org/wiki/File:Turning_Torso_3.jpg" },
    { file: "highlight-a.webp", caption: "Lilla Torg half-timbered square in Malmö", credit: "Jorchr — CC-BY-SA 3.0", source: "https://commons.wikimedia.org/wiki/File:Lilla_Torg,_Malm%C3%B6,_mars_2015-3.jpg" },
    { file: "highlight-b.webp", caption: "Malmöhus Castle reflected in the moat", credit: "Kateryna Baiduzha (SvartKat) — CC-BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Malm%C3%B6hus_slott_2022.jpg" },
    { file: "highlight-c.webp", caption: "Jakob Nilsgatan alley in Gamla Väster old town", credit: "Zeth Winther — CC-BY 3.0", source: "https://commons.wikimedia.org/wiki/File:Jakob_Nilsgatan,_Gamla_V%C3%A4ster_Malm%C3%B6_-_panoramio.jpg" }
  ] },
  26: { slug: "ghent", photos: [
    { file: "hero.webp", caption: "Graslei guild houses with the Belfry and St. Nicholas Church", credit: "Giles Laurent — CC-BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:1007_Graslei,_Clock_tower_of_the_Post_Office,_Church_of_Saint-Nicolas_in_Ghent_and_Belfry_of_Ghent_Photo_by_Giles_Laurent.jpg" },
    { file: "highlight-a.webp", caption: "St. Bavo's Cathedral seen from the Belfry", credit: "Mylius — CC-BY-SA 3.0", source: "https://commons.wikimedia.org/wiki/File:Gent-Sint-Baafskathedraal_vom_Belfried_aus_gesehen.jpg" },
    { file: "highlight-b.webp", caption: "Gravensteen, the medieval Castle of the Counts in Ghent", credit: "Marc Ryckaert (MJJR) — CC-BY 3.0", source: "https://commons.wikimedia.org/wiki/File:Gent_Gravensteen_R01.jpg" },
    { file: "highlight-c.webp", caption: "Sunset over a canal on the Leie river in Ghent", credit: "Graham Richter (Solipsia) — CC-BY-SA 3.0", source: "https://commons.wikimedia.org/wiki/File:Sunset_over_a_canal_in_Ghent,_Belgium.jpg" }
  ] },
  27: { slug: "ljubljana", photos: [
    { file: "hero.webp", caption: "Triple Bridge (Tromostovje) by Jože Plečnik in Ljubljana", credit: "CAPTAIN RAJU — CC-BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Triple_Bridge_(Ljubljana)_in_2023.02.jpg" },
    { file: "highlight-a.webp", caption: "Ljubljana Castle viewed from Congress Square", credit: "Med Cruise Guide — CC-BY 2.0", source: "https://commons.wikimedia.org/wiki/File:Ljubljana_Castle_Viewed_from_Congress_Square,_Ljubljana,_Slovenia_(36169514730).jpg" },
    { file: "highlight-b.webp", caption: "Dragon statue guarding the Dragon Bridge", credit: "Protopopica — CC0 1.0", source: "https://commons.wikimedia.org/wiki/File:Dragon_on_the_Dragon_Bridge_in_Ljubljana-3906673.jpg" },
    { file: "highlight-c.webp", caption: "Old town and excursion boat on the Ljubljanica river", credit: "Petar Milošević — CC-BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Ljubljana_old_town_with_excursion_boat.JPG" }
  ] },
  28: { slug: "thessaloniki", photos: [
    { file: "hero.webp", caption: "White Tower on the Thessaloniki waterfront", credit: "Hermann Hammer (Haneburger) — CC-BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:White_Tower_in_Thessaloniki.jpg" },
    { file: "highlight-a.webp", caption: "Interior of the Rotunda of Galerius", credit: "George M. Groutas — CC-BY 2.0", source: "https://commons.wikimedia.org/wiki/File:Rotunda_of_Galerius_(February_2009).jpg" },
    { file: "highlight-b.webp", caption: "Byzantine walls of the Heptapyrgion fortress in Ano Poli", credit: "Ymblanter — CC-BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Thessaloniki_Heptapyrgion_northeastern_wall_from_the_inner_yard.jpg" },
    { file: "highlight-c.webp", caption: "Aristotelous Square (Plateia Aristotelous), Thessaloniki", credit: "JFKennedy — Public Domain", source: "https://commons.wikimedia.org/wiki/File:Aristotelous_Plateia_2006_(cropped).jpg" }
  ] },
  29: { slug: "lyon", photos: [
    { file: "hero.webp", caption: "Rooftops of Vieux Lyon, the Renaissance old town", credit: "Drong — CC-BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Vue_des_toits_Vieux_Lyon.jpg" },
    { file: "highlight-a.webp", caption: "Basilica of Notre-Dame de Fourvière on the hill", credit: "Dennis G. Jarvis (archer10) — CC-BY-SA 2.0", source: "https://commons.wikimedia.org/wiki/File:France-003038_-_Basilica_of_Notre-Dame_de_Fourvi%C3%A8re_(15939822990_cropped).jpg" },
    { file: "highlight-b.webp", caption: "Traboule passageway in Lyon", credit: "Tusco — CC-BY-SA 3.0", source: "https://commons.wikimedia.org/wiki/File:Traboule_de_Lyon_002.JPG" },
    { file: "highlight-c.webp", caption: "Confluence of the Rhône and Saône rivers in Lyon", credit: "Prométhée — CC-BY-SA 3.0", source: "https://commons.wikimedia.org/wiki/File:Confluence_Lyon.jpg" }
  ] },
  30: { slug: "tallinn", photos: [
    { file: "hero.webp", caption: "Tallinn Old Town panorama from Kohtuotsa viewpoint", credit: "Hans Steiger (HaSt) — CC-BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Tallinn_-_Aussichtspunkt_Kohtuotsa_-_Panorama.jpg" },
    { file: "highlight-a.webp", caption: "Alexander Nevsky Cathedral on Toompea hill", credit: "Kallerna — CC-BY-SA 3.0", source: "https://commons.wikimedia.org/wiki/File:Alexander_Nevsky_Cathedral,_Tallinn.jpg" },
    { file: "highlight-b.webp", caption: "Tallinn Town Hall on Raekoja plats", credit: "Aleksandr Abrosimov — CC-BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Tallinna_Raekoda._01.jpg" },
    { file: "highlight-c.webp", caption: "Wooden apartment house in the Kalamaja district", credit: "Flying Saucer — CC-BY-SA 3.0", source: "https://commons.wikimedia.org/wiki/File:Tallinn-kalamaja-linda-2009-07-16.JPG" }
  ] }
});

// --- WEIRD_BARS: distinctive / unusual cocktail bars per destination.
//     Speakeasies, themed rooms, hidden doors, experimental mixology.
//     Surfaced when user picks cocktail-related Q3c options.
const WEIRD_BARS = {
  1: [
    { name: "Karl May Bar", address: "Taschenberg 3, Kempinski Taschenbergpalais, Dresden Altstadt", description: "Wild West saloon inside a Baroque palace: dark wood and leather booths themed around Saxony's own cowboy-novel author Karl May, with a 50-page award-winning menu of American classics and house creations" },
    { name: "nook", address: "Louisenstraße 39, Dresden Neustadt", description: "Tiny 'nook and cranny' bar where cocktails are built from regional Saxon ingredients and spirits — the open kitchen is integrated into the bar so you watch the chef cook and the bartender pour simultaneously" }
  ],
  2: [
    { name: "Kawenzmann", address: "Obere Sandstraße 20, Bamberg", description: "Hidden tiki bar in the UNESCO old town with 60+ rums, exotic drinks menu and Hawaiian-dream decor tucked behind an unassuming sandstone facade — a tropical oasis inside a beer-obsessed medieval town" },
    { name: "Schluckspecht", address: "Obere Sandstraße 18, Bamberg", description: "Personal-living-room-style speakeasy run by a single bartender (Christoph Köll) with a deliberately tiny menu, homemade infusions/syrups and 70+ whiskies on the back bar" }
  ],
  3: [
    { name: "Asmara Cocktailbar", address: "Kirchgasse 10, Tübingen Altstadt", description: "Cocktails served inside a charming medieval vaulted stone cellar in the heart of the old town — the low arched ceilings and candlelight make it feel like drinking in a monk's wine cave" },
    { name: "Jigger & Spoon (Stuttgart fallback)", address: "Rotebühlstraße 59, Stuttgart Hospitalviertel", description: "Stuttgart's first modern speakeasy, set inside a decommissioned bank vault — you ring a bell at an unmarked door to be let in, 1930s style; only ~45 min from Tübingen by train" }
  ],
  4: [
    { name: "Modern Masters Bar & Lounge", address: "Michaelisstraße 48, 99084 Erfurt", description: "Historic-Altstadt bar run by Torsten Spuhn, the only three-time German Champion of mixology — the 250-drink list spans Prohibition classics to cutting-edge techniques and the venue regularly places on best-bars-in-Germany lists" },
    { name: "Hemingway Bar & Lounge", address: "Michaelisstraße 45, 99084 Erfurt", description: "25-year-old cozy 'living-room' cocktail bar run by the same owner (Holger Spitzki) since opening, with Havana-Hemingway theming directly across from Modern Masters on Erfurt's tiny cocktail street" }
  ],
  5: [
    { name: "Tonfink", address: "Hüxstraße 89, 23552 Lübeck", description: "Bohemian 'anti-normal' bar where the decor is a jumble of eclectic artwork, mismatched furniture and live music nights — cocktails served in a cluttered artist-salon atmosphere where 'normal is a foreign word'" },
    { name: "Marcos Cocktailbar", address: "Hüxstraße 115, 23552 Lübeck", description: "Quirky one-man cocktail den where Marcos himself shakes every drink — known for creations described by regulars as having 'a dash of magic' and a charmingly eccentric, off-menu-heavy approach" }
  ],
  6: [
    { name: "Cocktail Bar by Incognito", address: "św. Antoniego 36/1a, Wrocław (entrance via a café)", description: "Speakeasy hidden downstairs from a café — there is no menu; the bartender asks your favourite spirit and flavours and builds cold-brew or molecular cocktails to order, with prohibition-era soundtrack" },
    { name: "Znasz Ich Cocktail Bar", address: "Ruska 51, Wrocław", description: "No signage, no name on the door — 'Znasz Ich' means 'You know them', and you have to already know to find it; inside it's a bygone-era experimental cocktail lab" }
  ],
  7: [
    { name: "Splendid Bar", address: "T. G. Masaryka 282/57 (hidden inside Becher's Bar), Karlovy Vary", description: "Speakeasy concealed in the depths of the historic Becher's Bar — reservation-only, with its signature Vintage Vesper served in a bespoke glass from the Moser collection, pairing mixology with Czech glass art" },
    { name: "Becher's Bar", address: "Grandhotel Pupp, Mírové náměstí 2, Karlovy Vary", description: "English-club style bar inside the Grandhotel Pupp where the Vesper martini was recreated on-screen for Casino Royale (2006) — the Pupp played 'Hotel Splendide' in the Bond film" }
  ],
  8: [
    { name: "Flisak '76", address: "Chlebnicka 9/10, Gdańsk Old Town", description: "Basement bar (one of the oldest cocktail bars in Poland, running since 1976) with faded tapestries and armchairs — the cocktail menu is rebuilt every few years around a single theme and drinks arrive with moving parts, lights and backstories" },
    { name: "Józef K.", address: "Piwna 1/2, Gdańsk Old Town", description: "Kafka-themed bar with a ceiling papered in open books, neon lights, and a bric-a-brac jumble of mismatched furniture — named after the protagonist of The Trial" }
  ],
  9: [
    { name: "Donkey (Bologna)", address: "Vicolo Sampieri 3, Bologna (near the Two Towers)", description: "Password-required speakeasy up a dark staircase on a narrow alley near the Two Towers — 50s-modernist velvet armchairs, soft lighting, and the most 'secret' bar experience in Bologna" },
    { name: "I Conoscenti", address: "Via Manzoni 6/3, Bologna", description: "Cocktail bar built into the base of a 14th-century 'hidden' tower — all green velvet, marble and low lighting; regulars compare the interior to a Bond villain's lair" }
  ],
  10: [
    { name: "Bigorna Social Club", address: "Rua do Almada 536, Porto", description: "Speakeasy tucked behind a working hair salon — the entrance is through the salon and the room itself has an industrial 1920s vibe with a billiards table right in the middle of the bar" },
    { name: "Apotecário", address: "central Porto (address shared only on booking)", description: "Reservation-only 'flavour laboratory' opened 2025 — no fixed menu, no public address; bartender Pedro Duarte interviews each guest and builds bespoke cocktails for them, pharmacy-apothecary theme" }
  ],
  11: [
    { name: "Tolle Knolle Bar (Bar im Steigenberger / Bodensee speakeasy scene)", address: "Konstanz Altstadt, near Marktstätte", description: "Konstanz lacks a true speakeasy, but Tolle Knolle's cellar bar sits inside vaulted medieval stone rooms right by the harbor and mixes a respectable classic list in candlelight." },
    { name: "Klimperkasten", address: "Bodanstraße 40, 78462 Konstanz", description: "Tiny, quirky, heavily-decorated living-room-style bar stuffed with vintage lamps, curios and mismatched furniture; bartenders do off-menu cocktails on request." }
  ],
  12: [
    { name: "Hemingway Bar Freiburg", address: "Grünwälderstraße 5, 79098 Freiburg", description: "Low-lit, wood-panelled cocktail den with a serious classics list and a Cuban-library aesthetic — a proper bartender's bar hidden down a side street in the Altstadt." },
    { name: "Schlappen (Kellerbar) / Kagan Skybar alternative: Jos Fritz-era Hausbar 'Eldorado'", address: "Leopoldring 1 (Kagan, 18th floor) — or Eldorado, Wilhelmstraße 7", description: "Eldorado is a dim, glittery, kitsch-gold cocktail bar with disco-era mirrors and a bartender who improvises drinks based on your mood; Kagan is the alternative weirdness — cocktails on the 18th floor of a brutalist tower with 360-degree Black Forest views." }
  ],
  13: [
    { name: "Destille im Schlesischen Hof / Bar Vino e Cultura", address: "Peterstraße, 02826 Görlitz", description: "Görlitz is tiny and genuinely under-served for cocktails; the best option is a handful of Altstadt cellar bars in restored Renaissance merchant houses where classic cocktails are mixed under original painted ceilings." },
    { name: "Filmnächte / Brauhaus an der Landskron bar counter — fallback", address: "An der Landskronbrauerei 116, 02826 Görlitz", description: "If no cocktail bar is open, the Landskron brewery park has a small bar building inside the old malthouse; for actual cocktails the Tuchmacher Hotel bar is the most reliable Altstadt option with a short classics list." }
  ],
  14: [
    { name: "Bernstein Bar", address: "Unter den Schwibbögen 1, 93047 Regensburg", description: "Hidden under the medieval arched passageways ('Schwibbögen') of the old town, this dim amber-lit cocktail bar feels carved into the city wall; strong focus on whisky-forward and smoke-infused drinks." },
    { name: "Hemingway's Regensburg", address: "Obere Bachgasse 5, 93047 Regensburg", description: "Tucked into a 13th-century patrician house with original vaulted Gothic cellar; cocktails served beneath stone ribs and candles in a room that pre-dates most European countries." }
  ],
  15: [
    { name: "Strandhalle Binz — Bar", address: "Strandpromenade 5, 18609 Binz", description: "The bar inside the 1908 Art Nouveau Strandhalle is all white wood, sea-facing verandas and Belle Époque tiles; short but properly mixed cocktail list, more atmosphere than invention." },
    { name: "Hafenbar / Störtebeker Brauquartier Stralsund (fallback)", address: "Greifswalder Chaussee 84–85, 18439 Stralsund", description: "Rügen itself has almost no dedicated cocktail bars; across the bridge in Stralsund, the Hansakeller and the bar at the Scheelehof hotel (in a restored 14th-century merchant house with a glass-roofed courtyard) are the closest real cocktail experiences." }
  ],
  16: [
    { name: "PANORAMA Bar / Kempinski Berchtesgaden", address: "Hintereck 1, 83471 Berchtesgaden", description: "Alpine hotel bar 1000m up the Obersalzberg with full-wall windows onto the Watzmann massif; alpine-herb-infused cocktails (mountain pine, gentian, hay) that lean into the terroir." },
    { name: "Grassl Enzianbrennerei Bar / Tasting Room", address: "Salinenplatz 1, 83471 Berchtesgaden", description: "Bavaria's oldest enzian distillery (founded 1692) runs a tasting bar in the old salt-works building; you can drink gentian-root spirits straight or in simple highballs in the distillery itself." }
  ],
  17: [
    { name: "Theophano Cocktailbar (Hotel Theophano)", address: "Markt 13–14, 06484 Quedlinburg", description: "Cocktail bar set inside the crooked half-timbered Hotel Theophano on the main square, with a low-ceilinged beamed room that slants noticeably; classic drinks served beside a tiled ceramic oven." },
    { name: "Abtshof / Nordhäuser Korn Distillery Bar (Harz fallback)", address: "Grimmelallee 11, 99734 Nordhausen", description: "Nearby in the Harz, the Nordhäuser Traditionsbrennerei runs a tasting bar inside the historic Korn distillery; Quedlinburg proper has mostly wine bars, so this is the closest weird-distillery option." }
  ],
  18: [
    { name: "Cubana Bar", address: "Bräugasse 9, 94032 Passau", description: "Tropical-themed cocktail bar tucked into the pointed tip of the Altstadt peninsula where the three rivers meet; rum-heavy list and a small riverside terrace almost on the water." },
    { name: "Innsteg Bar / Café Duft — Kowalski", address: "Grabengasse 5 / Rindermarkt, 94032 Passau", description: "Kowalski is a narrow, slightly surreal bar stacked with old portraits, taxidermy and mismatched chandeliers; cocktails are short-list classics done well in a room that feels like a Wes Anderson set." }
  ],
  19: [
    { name: "Destille", address: "Untere Straße 16, 69117 Heidelberg", description: "Legendary narrow student-era bar on Heidelberg's bar alley; the specialty is flaming shots and absinthe rituals served with dramatic fire, in a dark wood cave of a room." },
    { name: "Zum Roten Ochsen adjacent: Regie Bar / Bar Centrale — or better, Sonderbar", address: "Untere Straße 13, 69117 Heidelberg", description: "Sonderbar is a cramped, candle-lit cocktail bar with a single long copper counter and a bartender-driven menu that changes weekly; no loud music, serious mixing, tiny capacity." }
  ],
  20: [
    { name: "MUCK Bar", address: "Sanderstraße 29, 97070 Würzburg", description: "Dark, narrow speakeasy-style cocktail bar in the student quarter with a long list of forgotten pre-Prohibition classics; bartenders will build bespoke drinks if you describe a flavour." },
    { name: "Sol y Sombra / Omnibus — better: Bar Chérie", address: "Theaterstraße 21, 97070 Würzburg", description: "Bar Chérie is a pink-hued, velvet-and-brass Parisian-boudoir-themed cocktail bar with tasseled lamps and a heavy gin/vermouth program; small, quiet, and deliberately kitsch-glam." }
  ],
  21: [
    { name: "Lorke Bar", address: "Kaufstraße 7, 99423 Weimar", description: "Tiny candlelit cocktail nook tucked into Weimar's old town, pouring classics by a single barkeep who knows every regular by name." },
    { name: "Fieselkontor", address: "Wielandstraße 3, 99423 Weimar", description: "Literary-themed bar with Goethe-era curios, a piano, and a cocktail list riffing on Weimar Classicism figures." }
  ],
  22: [
    { name: "Bar zum Grünen Baum", address: "Kartäuserstraße 3, 55116 Mainz", description: "Dark wood speakeasy-style cocktail bar run by bartenders who measure to the drop; entrance is an unmarked wooden door on a side lane." },
    { name: "Die Hafenbar", address: "Rheinstraße 4e, 55116 Mainz (Zollhafen)", description: "Industrial bar inside a former harbor customs building with Rhine views and a cocktail menu leaning on Gutenberg-era herbs and spirits." }
  ],
  23: [
    { name: "Weranda Cocktail Bar", address: "ul. Jaskółcza 3, 60-100 Poznań", description: "Plant-drenched hideaway where cocktails arrive in anatomical glassware and smoking cloches; entry through an inconspicuous tenement door." },
    { name: "Coctail Bar Wódki i Aplikacje", address: "ul. Wrocławska 21, 61-837 Poznań", description: "Vodka-forward cocktail lab dedicated to Polish nalewki and infusions, with a rotating menu built around foraged herbs and fruit." }
  ],
  24: [
    { name: "The Black Stuff Irish Pub & Cocktail Bar", address: "1. máje 832/19, 779 00 Olomouc", description: "Skip the pub side — downstairs is a low-ceilinged stone cellar cocktail room under a 16th-century house where the barkeep improvises based on what you've drunk before." },
    { name: "Vertigo", address: "Univerzitní 223/6, 779 00 Olomouc", description: "Three-floor student-adjacent bar with a rooftop, set inside a former merchant house; the cocktail floor uses Moravian fruit brandies (slivovice, hruškovice) as bases." }
  ],
  25: [
    { name: "Tjoget", address: "Davidshallstorg 5, 211 45 Malmö", description: "Stockholm-bred cocktail temple's Malmö outpost, dimly lit with a tiled bar and a menu organized by emotion rather than spirit." },
    { name: "Malmö Chokladfabrik - Bar Central", address: "Mäster Johansgatan 1, 211 21 Malmö", description: "Bar set inside a former chocolate factory where cacao husks, nibs and house chocolate bitters feature in a dessert-leaning cocktail list." }
  ],
  26: [
    { name: "Jiggers - The Noble Art of Cocktails", address: "Oudburg 16, 9000 Gent", description: "Unmarked black door, knock and a speakeasy opens: vintage apothecary bottles, a 20-page leather menu, and no standing allowed." },
    { name: "Pharmacie", address: "Vlaanderenstraat 65, 9000 Gent", description: "Bar built into a preserved 1900s pharmacy: original wooden drawers, pharmacist scales and prescription bottles repurposed for tinctures and bitters." }
  ],
  27: [
    { name: "Slovenska hiša (Figovec) - Lost in Translation bar", address: "Cankarjevo nabrežje 13, 1000 Ljubljana", description: "Riverside cocktail bar focused entirely on Slovenian spirits, bitters and foraged botanicals — no imports allowed behind the bar." },
    { name: "Telovadnica Bar (Gimnasium Speakeasy)", address: "Gosposka ulica 1, 1000 Ljubljana", description: "Hidden speakeasy behind an unmarked door in the old Gymnasium building, decorated with school desks and chemistry glassware." }
  ],
  28: [
    { name: "The Blue Cup", address: "Chrysostomou Smyrnis 3, Thessaloniki 546 22", description: "Basement speakeasy with a single blue neon cup marking the unmarked stairs; bartenders build drinks around Greek spirits like tsipouro, mastiha and tentura." },
    { name: "Gorilas", address: "Verias 1, Thessaloniki 546 25", description: "Crammed, loud mixology bar on a tiny corner with a jungle-meets-Bauhaus interior and menus printed on postcards you can mail from the bar." }
  ],
  29: [
    { name: "Le Fantôme de l'Opéra", address: "6 Rue Abbé Rozier, 69001 Lyon", description: "Phantom-of-the-Opera themed speakeasy in the Croix-Rousse with masked bartenders, candelabras and a password-ish door ritual." },
    { name: "L'Antiquaire", address: "20 Rue Hippolyte Flandrin, 69001 Lyon", description: "One of France's oldest speakeasies, tucked behind a plain door near the Opéra; Belle Époque interior, no menu, bartender-led tasting." }
  ],
  30: [
    { name: "Whisper Sister", address: "Roseni 7, 10111 Tallinn (Rotermann Quarter)", description: "Prohibition-era speakeasy with unmarked entrance in the Rotermann factory quarter; coupe glasses, period jazz and a bartender who'll improvise to a mood." },
    { name: "Sigmund Freud Bar", address: "Vana-Viru 14, 10140 Tallinn", description: "Psychoanalysis-themed cocktail bar with a chaise longue, Freud portraits, and drinks named after neuroses and complexes." }
  ]
};
