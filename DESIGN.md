# Design read

Each restaurant page takes its palette, display face, and hero from its own JSON file. The directory page is a separate quiet list (ivory paper, ink, one rust accent) so the nine rooms are not recolored copies of one skin.

No rights-cleared dish photos were available, so every hero is type. A real plate photo can replace a hero later. Until then the page does not use stock rooms, generated food, or illustration.

The paper grain is a faint fractal noise tiled in CSS so the background is not flat white. It is not a dot grid. Menu leaders (Andros, Brisas) are a dotted flex filler on the dish name, so the price stays in its own column.

Motion is a 1px lift on button hover, removed when the visitor asks for reduced motion. Focus is a 3px ink ring plus a paper halo so it shows on both the cream page and a dark band.

Open and closed use `America/New_York`. Unknown hours stay unknown.

## Per restaurant

| Restaurant | Paper / ink / accent | Display | Hero | Menu |
| --- | --- | --- | --- | --- |
| J&V Grill | Beige #F4E6D2, forest #1B4D32, gold #4A460C | Fraunces | Cafeteria ticket | Rows, names only |
| Andros Diner | Ivory #F4EFE4, maroon #7C1E28, mustard #6E5010 | Bowlby One | Marquee | Leaders, 2018 menu |
| Boi Na Brasa | Cream #F7F0E4, gold wood #6E4E14, crimson #7C1E3A | Anton | Poster, left accent bar | Rows. Named dishes, then a labeled sample |
| Brisas del Mar | Foam #F2F5F1, sea #0E3E4A, lime #4E6B0E | Young Serif | Tide panel | Leaders, four published prices |
| Cityrub | Butcher paper #F6EFE6, soot #16110E, ember #8C3C0C | Oswald | Butcher slab | Rows, SinglePlatform prices |
| Peruvian Brazas | Warm paper #FFF8EE, teal ink #12302E, pale band #EDEEEC, teal #0E6B62 | Bricolage Grotesque | Counter window | Rows, names only |
| Cantinho Mineiro | Paper #F7F3E8, ink #1C2410, green #1F6B4A | Libre Baskerville | Letterpress card | Hanging names |
| Sabor Unido | Paper #F3EEE6, navy #12324E, terracotta #B42E1C | Petrona | Two columns, Saturday feijoada | Rows, published menu |
| Virgen de la Nube | Paper #F7F4EE, plum ink #2A1848, blue #1A3278, plum #7A3A68 | Cormorant Garamond | Chapel stack | Hanging names, labeled sample |

Palette cues that come from a real surface: J&V beige is sampled from a photo of the room and the forest green is the cafeteria awning. Andros keeps diner maroon and mustard. Brisas keeps sea blue and lime. Cityrub's soot and ember follow the dark wood of the room and the black site. Boi's wood band is sampled from a photo of the room and shifted toward gold. Sabor's navy follows the restaurant site, with a terracotta accent. Accent, band, and ink hues are checked in pairs, and each accent is also checked against that restaurant's own band. The hero variant is not part of that check.

Checkout on every page ends on the sentence "Demo site: no order was placed. Call to order."
