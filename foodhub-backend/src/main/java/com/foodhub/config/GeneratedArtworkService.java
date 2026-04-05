package com.foodhub.config;

import com.foodhub.model.MenuItem;
import com.foodhub.model.Restaurant;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;
import java.util.Objects;

@Service
public class GeneratedArtworkService {

    private static final List<Palette> PALETTES = List.of(
            new Palette("#1d4ed8", "#38bdf8", "#facc15", "#eff6ff", "#0f172a"),
            new Palette("#14532d", "#22c55e", "#f97316", "#f0fdf4", "#052e16"),
            new Palette("#7c2d12", "#ea580c", "#fde047", "#fff7ed", "#1c1917"),
            new Palette("#4c1d95", "#8b5cf6", "#f472b6", "#faf5ff", "#1e1b4b"),
            new Palette("#0f766e", "#14b8a6", "#fb7185", "#f0fdfa", "#042f2e"),
            new Palette("#9a3412", "#f59e0b", "#84cc16", "#fffbeb", "#451a03")
    );

    public String restaurantImagePath(String restaurantId) {
        return "/api/restaurants/" + safeSegment(restaurantId) + "/image";
    }

    public String menuItemImagePath(String itemId) {
        return "/api/menu-items/item/" + safeSegment(itemId) + "/image";
    }

    public String buildRestaurantSvg(Restaurant restaurant) {
        String name = textOrFallback(restaurant == null ? null : restaurant.getName(), "SnapEats Kitchen");
        String category = labelize(restaurant == null ? null : restaurant.getCategory());
        String cuisine = truncate(textOrFallback(restaurant == null ? null : restaurant.getCuisine(), "Curated daily specials"), 34);
        String locality = truncate(joinNonBlank(
                restaurant == null ? null : restaurant.getLocality(),
                restaurant == null ? null : restaurant.getCity()
        ), 34);
        String discount = textOrFallback(restaurant == null ? null : restaurant.getDiscount(), "Open now");
        Palette palette = paletteFor(joinNonBlank(
                restaurant == null ? null : restaurant.getRestaurantId(),
                name,
                locality
        ));

        return """
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" role="img" aria-label="%s artwork">
                  <defs>
                    <linearGradient id="bg" x1="0%%" y1="0%%" x2="100%%" y2="100%%">
                      <stop offset="0%%" stop-color="%s"/>
                      <stop offset="100%%" stop-color="%s"/>
                    </linearGradient>
                  </defs>
                  <rect width="1200" height="800" fill="url(#bg)"/>
                  <circle cx="180" cy="140" r="120" fill="%s" fill-opacity="0.14"/>
                  <circle cx="1020" cy="160" r="150" fill="%s" fill-opacity="0.12"/>
                  <circle cx="1030" cy="650" r="170" fill="%s" fill-opacity="0.16"/>
                  <rect x="72" y="72" width="1056" height="656" rx="42" fill="%s" fill-opacity="0.12" stroke="%s" stroke-opacity="0.16"/>

                  <g transform="translate(110 124)">
                    %s
                  </g>

                  <g transform="translate(648 122)">
                    <rect width="214" height="58" rx="22" fill="%s" fill-opacity="0.18"/>
                    <text x="24" y="38" font-size="28" font-family="Segoe UI,Arial,sans-serif" font-weight="700" fill="%s">%s</text>
                  </g>

                  <text x="648" y="280" font-size="66" font-family="Segoe UI,Arial,sans-serif" font-weight="800" fill="%s">%s</text>
                  <text x="648" y="338" font-size="30" font-family="Segoe UI,Arial,sans-serif" fill="%s">%s</text>
                  <text x="648" y="388" font-size="24" font-family="Segoe UI,Arial,sans-serif" fill="%s">%s</text>

                  <g transform="translate(648 520)">
                    <rect width="184" height="76" rx="24" fill="%s"/>
                    <text x="24" y="48" font-size="33" font-family="Segoe UI,Arial,sans-serif" font-weight="800" fill="%s">%s</text>
                  </g>
                </svg>
                """.formatted(
                escape(name),
                palette.start(),
                palette.end(),
                palette.accent(),
                palette.accent(),
                palette.accent(),
                palette.text(),
                palette.surface(),
                illustrationForRestaurant(name, category, restaurant == null ? null : restaurant.getCuisine(), palette),
                palette.surface(),
                palette.text(),
                escape(category),
                palette.text(),
                escape(truncate(name, 28)),
                palette.text(),
                escape(cuisine),
                palette.text(),
                escape(locality.isBlank() ? "Fresh kitchens with daily specials" : locality),
                palette.text(),
                palette.surface(),
                escape(discount)
        );
    }

    public String buildMenuItemSvg(Restaurant restaurant, MenuItem menuItem) {
        String dish = textOrFallback(menuItem == null ? null : menuItem.getName(), "Chef Special");
        String category = labelize(menuItem == null ? null : menuItem.getCategory());
        String restaurantName = truncate(textOrFallback(restaurant == null ? null : restaurant.getName(), "SnapEats Kitchen"), 26);
        String subtitle = truncate(menuSubtitle(menuItem), 32);
        String price = menuItem != null && menuItem.getDiscountedPrice() != null
                ? "Rs " + Math.round(menuItem.getDiscountedPrice())
                : menuItem != null && menuItem.getPrice() != null
                ? "Rs " + Math.round(menuItem.getPrice())
                : "Fresh daily";
        Palette palette = paletteFor(joinNonBlank(
                menuItem == null ? null : menuItem.getItemId(),
                dish,
                restaurantName
        ));

        return """
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" role="img" aria-label="%s menu artwork">
                  <defs>
                    <linearGradient id="bg" x1="0%%" y1="0%%" x2="100%%" y2="100%%">
                      <stop offset="0%%" stop-color="%s"/>
                      <stop offset="100%%" stop-color="%s"/>
                    </linearGradient>
                  </defs>
                  <rect width="1200" height="800" fill="url(#bg)"/>
                  <circle cx="1010" cy="152" r="140" fill="%s" fill-opacity="0.14"/>
                  <circle cx="180" cy="650" r="150" fill="%s" fill-opacity="0.14"/>
                  <rect x="72" y="72" width="1056" height="656" rx="42" fill="%s" fill-opacity="0.12" stroke="%s" stroke-opacity="0.16"/>

                  <g transform="translate(110 120)">
                    %s
                  </g>

                  <g transform="translate(650 118)">
                    <rect width="240" height="58" rx="22" fill="%s" fill-opacity="0.18"/>
                    <text x="24" y="38" font-size="28" font-family="Segoe UI,Arial,sans-serif" font-weight="700" fill="%s">%s</text>
                  </g>

                  <text x="650" y="278" font-size="64" font-family="Segoe UI,Arial,sans-serif" font-weight="800" fill="%s">%s</text>
                  <text x="650" y="336" font-size="29" font-family="Segoe UI,Arial,sans-serif" fill="%s">%s</text>
                  <text x="650" y="384" font-size="24" font-family="Segoe UI,Arial,sans-serif" fill="%s">%s</text>

                  <g transform="translate(650 522)">
                    <rect width="172" height="76" rx="24" fill="%s"/>
                    <text x="24" y="48" font-size="33" font-family="Segoe UI,Arial,sans-serif" font-weight="800" fill="%s">%s</text>
                  </g>
                </svg>
                """.formatted(
                escape(dish),
                palette.start(),
                palette.end(),
                palette.accent(),
                palette.accent(),
                palette.text(),
                palette.surface(),
                illustrationForMenu(dish, category, palette),
                palette.surface(),
                palette.text(),
                escape(category),
                palette.text(),
                escape(truncate(dish, 25)),
                palette.text(),
                escape(restaurantName),
                palette.text(),
                escape(subtitle),
                palette.text(),
                palette.surface(),
                escape(price)
        );
    }

    private String menuSubtitle(MenuItem item) {
        if (item == null) {
            return "Signature dish artwork";
        }
        if (Boolean.TRUE.equals(item.getVegan())) {
            return "Vegan favorite";
        }
        if (Boolean.TRUE.equals(item.getVegetarian())) {
            return "Vegetarian pick";
        }
        if (Boolean.TRUE.equals(item.getBestSeller())) {
            return "Bestseller";
        }
        if (Boolean.TRUE.equals(item.getFeatured())) {
            return "Featured special";
        }
        return "Made fresh";
    }

    private String illustrationForRestaurant(String name, String category, String cuisine, Palette palette) {
        String key = normalize(joinNonBlank(name, category, cuisine));
        int variant = variantFor(key, 4);
        if (containsAny(key, "breakfast", "dosa", "idli", "vada", "filter coffee")) {
            return breakfastSpread(palette, variant);
        }
        if (containsAny(key, "bbq", "barbecue", "grill", "kebab")) {
            return bbqPlatter(palette, variant);
        }
        if (containsAny(key, "american", "burger", "continental", "fast food")) {
            return burgerCombo(palette, variant);
        }
        if (containsAny(key, "japanese", "sushi", "ramen")) {
            return sushiSet(palette, variant);
        }
        if (containsAny(key, "italian", "pizza", "pasta")) {
            return italianSpread(palette, variant);
        }
        if (containsAny(key, "chinese", "thai", "asian", "noodle", "fried rice", "dimsum")) {
            return wokBowl(palette, variant);
        }
        if (containsAny(key, "cafe", "coffee")) {
            return cafeBrunch(palette, variant);
        }
        if (containsAny(key, "dessert", "desserts", "bakery", "pastry", "cake")) {
            return dessertTray(palette, variant);
        }
        if (containsAny(key, "healthy", "vegan", "salad", "bowl")) {
            return nourishBowl(palette, variant);
        }
        if (containsAny(key, "seafood", "prawn", "fish")) {
            return seafoodPlate(palette, variant);
        }
        if (containsAny(key, "mexican", "taco", "burrito")) {
            return mexicanSpread(palette, variant);
        }
        if (containsAny(key, "indian", "biryani", "mughlai", "curry", "north indian", "south indian")) {
            return indianFeast(palette, variant);
        }
        return signaturePlatedMeal(palette, variant);
    }

    private String illustrationForMenu(String name, String category, Palette palette) {
        String key = normalize(joinNonBlank(name, category));
        int variant = variantFor(key, 5);
        if (containsAny(key, "pizza")) {
            return pizzaPie(palette, variant);
        }
        if (containsAny(key, "burger", "sandwich")) {
            return burgerCombo(palette, variant);
        }
        if (containsAny(key, "sushi", "roll", "maki")) {
            return sushiSet(palette, variant);
        }
        if (containsAny(key, "coffee", "tea", "shake", "cooler", "soda", "latte", "brew", "frapp", "mojito", "juice", "beverage")) {
            return beverageHero(palette, variant);
        }
        if (containsAny(key, "cake", "pastry", "croissant", "brownie", "tart", "dessert", "ice cream")) {
            return dessertTray(palette, variant);
        }
        if (containsAny(key, "dosa", "idli", "vada", "upma", "filter coffee")) {
            return breakfastSpread(palette, variant);
        }
        if (containsAny(key, "bbq", "grill", "kebab", "wings", "tandoori", "bacon")) {
            return bbqPlatter(palette, variant);
        }
        if (containsAny(key, "taco", "quesadilla", "burrito", "nacho")) {
            return mexicanSpread(palette, variant);
        }
        if (containsAny(key, "salad", "bowl", "millet", "vegan", "avocado", "healthy")) {
            return nourishBowl(palette, variant);
        }
        if (containsAny(key, "biryani", "curry", "masala", "paneer", "tikka", "dal", "korma")) {
            return indianFeast(palette, variant);
        }
        if (containsAny(key, "naan", "bread", "paratha", "roti")) {
            return breadBasket(palette, variant);
        }
        if (containsAny(key, "noodle", "fried rice", "rice", "wok", "spring roll", "manchurian", "thai")) {
            return wokBowl(palette, variant);
        }
        if (containsAny(key, "prawn", "fish", "seafood", "salmon")) {
            return seafoodPlate(palette, variant);
        }
        if (containsAny(key, "pasta", "lasagna", "risotto")) {
            return italianSpread(palette, variant);
        }
        return signaturePlatedMeal(palette, variant);
    }

    private String indianFeast(Palette palette, int variant) {
        int mintX = 162 + (variant * 18);
        int lemonX = 332 - (variant * 16);
        String riceBase = variant % 2 == 0 ? "#facc15" : "#fbbf24";
        String curry = variant % 3 == 0 ? "#dc2626" : "#ea580c";
        String kebab = variant % 2 == 0 ? "#7c2d12" : "#92400e";
        return """
                <ellipse cx="244" cy="340" rx="192" ry="118" fill="#fff7ed" fill-opacity="0.92"/>
                <ellipse cx="244" cy="330" rx="164" ry="88" fill="%s"/>
                <path d="M128 292 C180 252 312 252 360 298 C326 340 164 348 128 292 Z" fill="%s" fill-opacity="0.88"/>
                <path d="M136 302 C190 270 304 270 350 308" fill="none" stroke="#fff4c2" stroke-width="12" stroke-linecap="round"/>
                <path d="M170 176 C216 138 310 140 344 182" fill="none" stroke="%s" stroke-width="16" stroke-linecap="round"/>
                <circle cx="118" cy="186" r="52" fill="#fff7ed"/>
                <circle cx="118" cy="186" r="36" fill="%s"/>
                <circle cx="374" cy="176" r="46" fill="#fff7ed"/>
                <circle cx="374" cy="176" r="31" fill="#16a34a"/>
                <circle cx="%d" cy="248" r="10" fill="#15803d"/>
                <circle cx="%d" cy="226" r="8" fill="#22c55e"/>
                <path d="M%d 252 l18 -18 l20 24" fill="none" stroke="#166534" stroke-width="8" stroke-linecap="round"/>
                """.formatted(riceBase, curry, kebab, "#fb7185", mintX, lemonX, mintX + 18);
    }

    private String breakfastSpread(Palette palette, int variant) {
        int coffeeX = 332 - (variant * 12);
        int idliX = 116 + (variant * 8);
        String dosa = variant % 2 == 0 ? "#f59e0b" : "#fbbf24";
        return """
                <ellipse cx="228" cy="310" rx="198" ry="122" fill="#f8fafc" fill-opacity="0.94"/>
                <path d="M86 332 L278 168 L346 332 Z" fill="%s"/>
                <path d="M118 318 L274 194 L318 318 Z" fill="#fde68a"/>
                <circle cx="%d" cy="220" r="48" fill="#ffffff"/>
                <circle cx="%d" cy="220" r="30" fill="#92400e"/>
                <circle cx="%d" cy="314" r="36" fill="#ffffff"/>
                <circle cx="%d" cy="314" r="24" fill="#f8fafc"/>
                <circle cx="%d" cy="144" r="34" fill="#ffffff"/>
                <circle cx="%d" cy="144" r="24" fill="#ffffff"/>
                <circle cx="92" cy="164" r="26" fill="#dc2626"/>
                <circle cx="82" cy="238" r="24" fill="#16a34a"/>
                <circle cx="360" cy="332" r="26" fill="#d97706"/>
                """.formatted(dosa, coffeeX, coffeeX, idliX, idliX, idliX + 84, idliX + 126);
    }

    private String burgerCombo(Palette palette, int variant) {
        int fryX = 344 - (variant * 8);
        String bun = variant % 2 == 0 ? "#d97706" : "#b45309";
        return """
                <ellipse cx="228" cy="192" rx="150" ry="60" fill="%s"/>
                <rect x="106" y="206" width="248" height="24" rx="12" fill="#166534"/>
                <rect x="100" y="232" width="260" height="52" rx="18" fill="#7f1d1d"/>
                <rect x="112" y="286" width="236" height="18" rx="9" fill="#fbbf24"/>
                <ellipse cx="228" cy="340" rx="162" ry="56" fill="%s"/>
                <rect x="%d" y="148" width="72" height="144" rx="16" fill="#ef4444"/>
                <path d="M%d 166 l18 -34 l18 34" fill="none" stroke="#fbbf24" stroke-width="16" stroke-linecap="round"/>
                <path d="M%d 184 l18 -34 l18 34" fill="none" stroke="#fbbf24" stroke-width="16" stroke-linecap="round"/>
                <circle cx="106" cy="154" r="34" fill="#e2e8f0"/>
                <rect x="92" y="122" width="30" height="26" rx="10" fill="#0ea5e9"/>
                """.formatted(bun, bun, fryX, fryX + 10, fryX + 20);
    }

    private String bbqPlatter(Palette palette, int variant) {
        int skewerShift = variant * 10;
        return """
                <rect x="62" y="132" width="344" height="234" rx="34" fill="#5b3419" fill-opacity="0.92"/>
                <rect x="90" y="154" width="288" height="190" rx="24" fill="#3f2512"/>
                <path d="M114 190 L314 150" stroke="#d6d3d1" stroke-width="8" stroke-linecap="round"/>
                <path d="M120 258 L320 218" stroke="#d6d3d1" stroke-width="8" stroke-linecap="round"/>
                <path d="M128 326 L328 286" stroke="#d6d3d1" stroke-width="8" stroke-linecap="round"/>
                <ellipse cx="%d" cy="176" rx="34" ry="18" fill="#b45309"/>
                <ellipse cx="%d" cy="176" rx="26" ry="14" fill="#fb923c"/>
                <ellipse cx="%d" cy="244" rx="34" ry="18" fill="#92400e"/>
                <ellipse cx="%d" cy="244" rx="26" ry="14" fill="#f97316"/>
                <ellipse cx="%d" cy="312" rx="34" ry="18" fill="#7c2d12"/>
                <ellipse cx="%d" cy="312" rx="26" ry="14" fill="#fb7185"/>
                <circle cx="100" cy="332" r="22" fill="#fef3c7"/>
                <circle cx="366" cy="182" r="24" fill="#fee2e2"/>
                <circle cx="366" cy="182" r="12" fill="#dc2626"/>
                """.formatted(196 + skewerShift, 238 + skewerShift, 214 + skewerShift, 256 + skewerShift, 234 + skewerShift, 276 + skewerShift);
    }

    private String sushiSet(Palette palette, int variant) {
        int trayAccent = 126 + (variant * 10);
        return """
                <rect x="66" y="126" width="340" height="226" rx="34" fill="#0f172a" fill-opacity="0.94"/>
                <rect x="92" y="152" width="288" height="174" rx="24" fill="#1e293b"/>
                <rect x="118" y="186" width="64" height="84" rx="18" fill="#f8fafc"/>
                <rect x="194" y="186" width="64" height="84" rx="18" fill="#f8fafc"/>
                <rect x="270" y="186" width="64" height="84" rx="18" fill="#f8fafc"/>
                <rect x="346" y="186" width="24" height="84" rx="12" fill="#f8fafc"/>
                <rect x="132" y="204" width="36" height="28" rx="14" fill="#fb7185"/>
                <rect x="208" y="204" width="36" height="28" rx="14" fill="#f97316"/>
                <rect x="284" y="204" width="36" height="28" rx="14" fill="#22c55e"/>
                <path d="M96 %d L342 %d" stroke="#cbd5e1" stroke-width="10" stroke-linecap="round"/>
                <path d="M110 %d L356 %d" stroke="#fde68a" stroke-width="10" stroke-linecap="round"/>
                """.formatted(trayAccent, trayAccent + 24, trayAccent + 28, trayAccent + 52);
    }

    private String italianSpread(Palette palette, int variant) {
        int basilX = 218 + (variant * 12);
        return """
                <circle cx="210" cy="230" r="128" fill="#fff7ed" fill-opacity="0.94"/>
                <circle cx="210" cy="230" r="102" fill="#f59e0b"/>
                <circle cx="168" cy="198" r="14" fill="#dc2626"/>
                <circle cx="242" cy="214" r="14" fill="#dc2626"/>
                <circle cx="224" cy="276" r="14" fill="#dc2626"/>
                <circle cx="284" cy="246" r="14" fill="#dc2626"/>
                <path d="M%d 188 c20 8 24 24 10 36 c-18 -2 -28 -14 -10 -36" fill="#16a34a"/>
                <ellipse cx="344" cy="322" rx="72" ry="44" fill="#fff7ed"/>
                <path d="M296 322 C316 284 374 284 392 322 C372 356 316 356 296 322 Z" fill="#fde68a"/>
                <path d="M308 322 C326 298 364 298 380 322" fill="none" stroke="#f59e0b" stroke-width="10" stroke-linecap="round"/>
                """.formatted(basilX);
    }

    private String wokBowl(Palette palette, int variant) {
        int chopstickY = 104 + (variant * 8);
        return """
                <ellipse cx="238" cy="324" rx="176" ry="70" fill="#cbd5e1" fill-opacity="0.36"/>
                <path d="M104 240 C116 148 360 148 372 240 L330 352 C308 382 170 382 146 352 Z" fill="#ea580c"/>
                <ellipse cx="238" cy="238" rx="134" ry="48" fill="#fcd34d"/>
                <path d="M138 232 C178 190 300 192 338 236" fill="none" stroke="#fef3c7" stroke-width="10" stroke-linecap="round"/>
                <path d="M154 244 C196 210 286 212 322 250" fill="none" stroke="#fde68a" stroke-width="10" stroke-linecap="round"/>
                <circle cx="174" cy="210" r="10" fill="#16a34a"/>
                <circle cx="286" cy="226" r="10" fill="#dc2626"/>
                <circle cx="244" cy="198" r="10" fill="#22c55e"/>
                <path d="M106 %d L334 %d" stroke="#f8fafc" stroke-width="10" stroke-linecap="round"/>
                <path d="M126 %d L354 %d" stroke="#d6d3d1" stroke-width="10" stroke-linecap="round"/>
                """.formatted(chopstickY, chopstickY + 28, chopstickY + 24, chopstickY + 52);
    }

    private String cafeBrunch(Palette palette, int variant) {
        int foamR = 28 + (variant * 2);
        return """
                <circle cx="166" cy="220" r="92" fill="#fff7ed" fill-opacity="0.96"/>
                <circle cx="166" cy="220" r="62" fill="#92400e"/>
                <circle cx="166" cy="220" r="%d" fill="#f8fafc" fill-opacity="0.84"/>
                <path d="M242 184 C278 126 354 126 386 178 C372 226 272 234 242 184 Z" fill="#f59e0b"/>
                <path d="M258 184 C290 146 336 146 364 176" fill="none" stroke="#fde68a" stroke-width="12" stroke-linecap="round"/>
                <circle cx="342" cy="270" r="42" fill="#f8fafc"/>
                <circle cx="342" cy="270" r="28" fill="#fb7185"/>
                """.formatted(foamR);
    }

    private String dessertTray(Palette palette, int variant) {
        int cherryX = 304 + (variant * 10);
        return """
                <rect x="88" y="266" width="290" height="46" rx="20" fill="#d97706"/>
                <path d="M120 266 C156 164 320 164 356 266 Z" fill="#fb7185"/>
                <path d="M140 246 C186 208 286 208 330 246" fill="none" stroke="#f8fafc" stroke-width="12" stroke-linecap="round"/>
                <circle cx="%d" cy="160" r="20" fill="#dc2626"/>
                <path d="M%d 144 C%d 116 %d 110 %d 124" fill="none" stroke="#166534" stroke-width="8" stroke-linecap="round"/>
                <circle cx="154" cy="190" r="14" fill="#fde68a"/>
                <circle cx="210" cy="170" r="12" fill="#fde68a"/>
                <circle cx="270" cy="194" r="12" fill="#fde68a"/>
                <circle cx="354" cy="308" r="34" fill="#fff7ed"/>
                <circle cx="354" cy="308" r="22" fill="#92400e"/>
                """.formatted(cherryX, cherryX, cherryX - 6, cherryX + 24, cherryX + 6);
    }

    private String nourishBowl(Palette palette, int variant) {
        int avocadoX = 160 + (variant * 18);
        return """
                <ellipse cx="238" cy="332" rx="170" ry="70" fill="#cbd5e1" fill-opacity="0.34"/>
                <path d="M102 238 C118 332 360 332 376 238 L340 344 C314 382 168 382 138 344 Z" fill="#f8fafc"/>
                <ellipse cx="238" cy="236" rx="134" ry="52" fill="#bbf7d0"/>
                <circle cx="%d" cy="212" r="34" fill="#22c55e"/>
                <circle cx="%d" cy="212" r="16" fill="#a16207"/>
                <circle cx="246" cy="198" r="24" fill="#f97316"/>
                <circle cx="300" cy="234" r="24" fill="#dc2626"/>
                <circle cx="186" cy="250" r="20" fill="#facc15"/>
                <circle cx="276" cy="266" r="18" fill="#84cc16"/>
                <path d="M150 184 C198 156 292 156 328 184" fill="none" stroke="#166534" stroke-width="10" stroke-linecap="round"/>
                """.formatted(avocadoX, avocadoX);
    }

    private String seafoodPlate(Palette palette, int variant) {
        int lemonX = 328 - (variant * 10);
        return """
                <ellipse cx="236" cy="304" rx="192" ry="112" fill="#fff7ed" fill-opacity="0.94"/>
                <path d="M118 288 C170 220 286 220 346 280 C302 334 170 340 118 288 Z" fill="#fb923c"/>
                <path d="M154 278 C192 246 274 246 314 282" fill="none" stroke="#fef3c7" stroke-width="10" stroke-linecap="round"/>
                <ellipse cx="166" cy="198" rx="54" ry="24" fill="#f8fafc"/>
                <path d="M122 198 C154 160 204 160 220 198 C198 230 154 230 122 198 Z" fill="#f97316"/>
                <circle cx="%d" cy="182" r="28" fill="#fde68a"/>
                <path d="M%d 156 L%d 208" stroke="#f59e0b" stroke-width="8" stroke-linecap="round"/>
                <circle cx="364" cy="302" r="20" fill="#16a34a"/>
                """.formatted(lemonX, lemonX - 14, lemonX + 14);
    }

    private String mexicanSpread(Palette palette, int variant) {
        int tacoShift = variant * 12;
        return """
                <path d="M92 306 C126 228 200 212 252 306 Z" fill="#fbbf24"/>
                <path d="M168 286 C202 208 276 192 328 286 Z" fill="#f59e0b"/>
                <path d="M244 306 C278 228 352 212 404 306 Z" fill="#fbbf24"/>
                <path d="M112 286 C150 252 202 250 230 286" fill="none" stroke="#166534" stroke-width="10" stroke-linecap="round"/>
                <path d="M188 266 C226 232 278 230 306 266" fill="none" stroke="#dc2626" stroke-width="10" stroke-linecap="round"/>
                <path d="M264 286 C302 252 354 250 382 286" fill="none" stroke="#166534" stroke-width="10" stroke-linecap="round"/>
                <circle cx="%d" cy="184" r="26" fill="#fee2e2"/>
                <circle cx="%d" cy="184" r="14" fill="#dc2626"/>
                <circle cx="%d" cy="226" r="22" fill="#dcfce7"/>
                """.formatted(144 + tacoShift, 144 + tacoShift, 354 - tacoShift);
    }

    private String signaturePlatedMeal(Palette palette, int variant) {
        int garnishX = 152 + (variant * 18);
        return """
                <ellipse cx="240" cy="322" rx="194" ry="116" fill="#fff7ed" fill-opacity="0.92"/>
                <ellipse cx="240" cy="300" rx="156" ry="84" fill="#fcd34d"/>
                <ellipse cx="238" cy="292" rx="92" ry="42" fill="#ea580c"/>
                <circle cx="166" cy="218" r="28" fill="#16a34a"/>
                <circle cx="320" cy="232" r="26" fill="#f97316"/>
                <circle cx="%d" cy="270" r="12" fill="#15803d"/>
                <circle cx="%d" cy="248" r="10" fill="#22c55e"/>
                """.formatted(garnishX, garnishX + 94);
    }

    private String pizzaPie(Palette palette, int variant) {
        int basilX = 178 + (variant * 18);
        return """
                <circle cx="236" cy="236" r="154" fill="#fff7ed" fill-opacity="0.94"/>
                <circle cx="236" cy="236" r="126" fill="#f59e0b"/>
                <circle cx="182" cy="188" r="16" fill="#dc2626"/>
                <circle cx="282" cy="194" r="16" fill="#dc2626"/>
                <circle cx="220" cy="286" r="16" fill="#dc2626"/>
                <circle cx="312" cy="270" r="16" fill="#dc2626"/>
                <path d="M%d 176 c20 8 24 24 10 36 c-18 -2 -28 -14 -10 -36" fill="#16a34a"/>
                <path d="M266 126 L382 132 L302 244 Z" fill="#fbbf24" fill-opacity="0.92"/>
                """.formatted(basilX);
    }

    private String beverageHero(Palette palette, int variant) {
        int strawX = 248 + (variant * 6);
        String drink = variant % 2 == 0 ? "#fb923c" : "#38bdf8";
        return """
                <rect x="154" y="98" width="164" height="240" rx="38" fill="#f8fafc" fill-opacity="0.94"/>
                <rect x="170" y="130" width="132" height="188" rx="28" fill="%s"/>
                <rect x="194" y="70" width="84" height="34" rx="17" fill="#f8fafc"/>
                <path d="M%d 68 L284 4" fill="none" stroke="#f8fafc" stroke-width="14" stroke-linecap="round"/>
                <circle cx="216" cy="170" r="18" fill="#ffffff" fill-opacity="0.24"/>
                <circle cx="258" cy="222" r="12" fill="#ffffff" fill-opacity="0.22"/>
                <circle cx="334" cy="286" r="42" fill="#fde68a" fill-opacity="0.74"/>
                """.formatted(drink, strawX);
    }

    private String breadBasket(Palette palette, int variant) {
        int breadX = 156 + (variant * 16);
        return """
                <ellipse cx="240" cy="318" rx="184" ry="88" fill="#8b5a2b" fill-opacity="0.92"/>
                <ellipse cx="%d" cy="246" rx="64" ry="34" fill="#fbbf24"/>
                <ellipse cx="238" cy="214" rx="64" ry="34" fill="#f59e0b"/>
                <ellipse cx="306" cy="248" rx="64" ry="34" fill="#fbbf24"/>
                <path d="M124 246 C154 224 188 224 220 246" fill="none" stroke="#fde68a" stroke-width="8" stroke-linecap="round"/>
                <path d="M206 214 C236 192 270 192 302 214" fill="none" stroke="#fde68a" stroke-width="8" stroke-linecap="round"/>
                <path d="M274 248 C304 226 338 226 370 248" fill="none" stroke="#fde68a" stroke-width="8" stroke-linecap="round"/>
                """.formatted(breadX);
    }

    private Palette paletteFor(String seed) {
        return PALETTES.get(Math.floorMod(Math.abs(Objects.toString(seed, "snap-eats").hashCode()), PALETTES.size()));
    }

    private int variantFor(String seed, int choices) {
        return Math.floorMod(Objects.toString(seed, "snap-eats").hashCode(), Math.max(1, choices));
    }

    private boolean containsAny(String value, String... options) {
        for (String option : options) {
            if (value.contains(option)) {
                return true;
            }
        }
        return false;
    }

    private String initials(String value) {
        StringBuilder builder = new StringBuilder();
        for (String part : normalize(value).split(" ")) {
            if (part.isBlank()) {
                continue;
            }
            builder.append(Character.toUpperCase(part.charAt(0)));
            if (builder.length() == 2) {
                break;
            }
        }
        return builder.length() == 0 ? "SE" : builder.toString();
    }

    private String labelize(String value) {
        StringBuilder builder = new StringBuilder();
        for (String part : normalize(value).split(" ")) {
            if (part.isBlank()) {
                continue;
            }
            if (builder.length() > 0) {
                builder.append(' ');
            }
            builder.append(Character.toUpperCase(part.charAt(0)));
            if (part.length() > 1) {
                builder.append(part.substring(1));
            }
        }
        return builder.length() == 0 ? "Featured" : builder.toString();
    }

    private String safeSegment(String value) {
        return Objects.toString(value, "").replaceAll("[^A-Za-z0-9_-]", "-");
    }

    private String textOrFallback(String value, String fallback) {
        String normalized = Objects.toString(value, "").trim();
        return normalized.isBlank() ? fallback : normalized;
    }

    private String joinNonBlank(String... values) {
        StringBuilder builder = new StringBuilder();
        for (String value : values) {
            String normalized = Objects.toString(value, "").trim();
            if (normalized.isBlank()) {
                continue;
            }
            if (builder.length() > 0) {
                builder.append(" - ");
            }
            builder.append(normalized);
        }
        return builder.toString();
    }

    private String truncate(String value, int max) {
        String normalized = Objects.toString(value, "").trim();
        if (normalized.length() <= max) {
            return normalized;
        }
        return normalized.substring(0, Math.max(0, max - 3)).trim() + "...";
    }

    private String normalize(String value) {
        return Objects.toString(value, "")
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9\\s]", " ")
                .replaceAll("\\s+", " ")
                .trim();
    }

    private String escape(String value) {
        return Objects.toString(value, "")
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&apos;");
    }

    private record Palette(String start, String end, String accent, String surface, String text) {
    }
}
