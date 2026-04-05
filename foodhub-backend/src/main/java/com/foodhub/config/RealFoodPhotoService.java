package com.foodhub.config;

import com.foodhub.model.Restaurant;
import org.springframework.stereotype.Service;

import java.util.Locale;
import java.util.Objects;

@Service
public class RealFoodPhotoService {

    private static final String UNSPLASH_BASE_URL = "https://images.unsplash.com/";
    private static final String SEEDED_IMAGE_MARKER = "snap_eats_seed=";
    private static final int RESTAURANT_IMAGE_WIDTH = 1200;
    private static final int RESTAURANT_IMAGE_HEIGHT = 800;
    private static final int MENU_ITEM_IMAGE_WIDTH = 900;
    private static final int MENU_ITEM_IMAGE_HEIGHT = 900;

    private static final String FOOD_PHOTO_ID = "photo-1504674900247-0877df9cc836";
    private static final String PIZZA_PHOTO_ID = "photo-1513104890138-7c749659a591";
    private static final String BURGER_PHOTO_ID = "photo-1568901346375-23c9450c58cd";
    private static final String CHINESE_PHOTO_ID = "photo-1525755662778-989d0524087e";
    private static final String INDIAN_PHOTO_ID = "photo-1585937421612-70a008356fbe";
    private static final String DESSERT_PHOTO_ID = "photo-1578985545062-69928b1d9587";
    private static final String MEXICAN_PHOTO_ID = "photo-1565299585323-38d6b0865b47";
    private static final String HEALTHY_PHOTO_ID = "photo-1512621776951-a57141f2eefd";
    private static final String COFFEE_PHOTO_ID = "photo-1511920170033-f8396924c348";
    private static final String SUSHI_PHOTO_ID = "photo-1579584425555-c3ce17fd4351";
    private static final String BREAKFAST_PHOTO_ID = "photo-1533089860892-a7c6f0a88666";
    private static final String BAKERY_PHOTO_ID = "photo-1509440159596-0249088772ff";
    private static final String SEAFOOD_PHOTO_ID = "photo-1559737558-2f5a35f4523e";
    private static final String BBQ_PHOTO_ID = "photo-1555939594-58d7cb561ad1";
    private static final String THAI_PHOTO_ID = "photo-1559314809-0d155014e29e";
    private static final String SANDWICH_PHOTO_ID = "photo-1528735602780-2552fd46c7af";
    private static final String BEVERAGE_PHOTO_ID = "photo-1544145945-f90425340c7e";

    private static final String[] BREAKFAST_RESTAURANT_PHOTOS = {
            BREAKFAST_PHOTO_ID,
            "photo-1482049016688-2d3e1b311543",
            "photo-1504754524776-8f4f37790ca0"
    };
    private static final String[] BBQ_RESTAURANT_PHOTOS = {
            BBQ_PHOTO_ID,
            "photo-1527477396000-e27163b481c2",
            "photo-1600891964092-4316c288032e",
            "photo-1558030006-450675393462"
    };
    private static final String[] CAFE_RESTAURANT_PHOTOS = {
            COFFEE_PHOTO_ID,
            "photo-1495474472287-4d71bcdd2085",
            "photo-1509042239860-f550ce710b93"
    };
    private static final String[] ITALIAN_RESTAURANT_PHOTOS = {
            PIZZA_PHOTO_ID,
            "photo-1520201163981-8cc95007dd2e",
            "photo-1541745537411-b8046dc6d66c",
            "photo-1593504049359-74330189a345"
    };
    private static final String[] JAPANESE_RESTAURANT_PHOTOS = {
            SUSHI_PHOTO_ID,
            "photo-1579871494447-9811cf80d66c",
            "photo-1611143669185-af224c5e3252",
            "photo-1553621042-f6e147245754"
    };
    private static final String[] CHINESE_RESTAURANT_PHOTOS = {
            CHINESE_PHOTO_ID,
            "photo-1617093727343-374698b1b08d",
            "photo-1557872943-16a5ac26437e",
            "photo-1569718212165-3a8278d5f624"
    };
    private static final String[] THAI_RESTAURANT_PHOTOS = {
            THAI_PHOTO_ID,
            "photo-1512058564366-18510be2db19",
            "photo-1559847844-5315695dadae"
    };
    private static final String[] SEAFOOD_RESTAURANT_PHOTOS = {
            SEAFOOD_PHOTO_ID,
            "photo-1615141982883-c7ad0e69fd62",
            "photo-1563379091339-03246963d29a"
    };
    private static final String[] DESSERT_RESTAURANT_PHOTOS = {
            DESSERT_PHOTO_ID,
            "photo-1563729784474-d77dbb933a9e",
            "photo-1551024506-0bccd828d307",
            "photo-1488477181946-6428a0291777"
    };
    private static final String[] HEALTHY_RESTAURANT_PHOTOS = {
            HEALTHY_PHOTO_ID,
            "photo-1546793665-c74683f339c1",
            "photo-1505253716362-afaea1d3d1af"
    };
    private static final String[] MEXICAN_RESTAURANT_PHOTOS = {
            MEXICAN_PHOTO_ID,
            "photo-1565299507177-b0ac66763828",
            "photo-1552332386-f8dd00dc2f85"
    };
    private static final String[] AMERICAN_RESTAURANT_PHOTOS = {
            BURGER_PHOTO_ID,
            "photo-1550547660-d9450f859349",
            "photo-1520072959219-c595dc870360",
            "photo-1565299507177-b0ac66763828"
    };
    private static final String[] INDIAN_RESTAURANT_PHOTOS = {
            INDIAN_PHOTO_ID,
            "photo-1518492104633-130d0cc84637",
            "photo-1589302168068-964664d93dc0",
            "photo-1552566626-52f8b828add9",
            "photo-1504674900247-0877df9cc836",
            "photo-1546833999-b9f581a1996d",
            "photo-1559339352-11d035aa65de",
            "photo-1529193591184-b1d58069ecdd"
    };
    private static final String[] BAKERY_RESTAURANT_PHOTOS = {
            BAKERY_PHOTO_ID,
            "photo-1483695028939-5bb13f8648b0",
            "photo-1509440159596-0249088772ff"
    };
    private static final String[] DEFAULT_RESTAURANT_PHOTOS = {
            FOOD_PHOTO_ID,
            "photo-1540189549336-e6e99c3679fe",
            "photo-1482049016688-2d3e1b311543"
    };
    private static final String[] BIRYANI_MENU_PHOTOS = {
            "photo-1633945274309-2c16c9682a8b",
            "photo-1512058564366-18510be2db19",
            "photo-1603133872878-684f208fb84b",
            "photo-1529193591184-b1d58069ecdd"
    };
    private static final String[] INDIAN_CURRY_MENU_PHOTOS = {
            "photo-1518492104633-130d0cc84637",
            "photo-1589302168068-964664d93dc0",
            "photo-1552566626-52f8b828add9",
            "photo-1546833999-b9f581a1996d",
            "photo-1559339352-11d035aa65de"
    };
    private static final String[] TANDOOR_MENU_PHOTOS = {
            BBQ_PHOTO_ID,
            "photo-1527477396000-e27163b481c2",
            "photo-1600891964092-4316c288032e",
            "photo-1558030006-450675393462"
    };
    private static final String[] BREAD_MENU_PHOTOS = {
            BAKERY_PHOTO_ID,
            "photo-1483695028939-5bb13f8648b0",
            "photo-1509440159596-0249088772ff"
    };
    private static final String[] ITALIAN_MENU_PHOTOS = {
            PIZZA_PHOTO_ID,
            "photo-1621996346565-e3dbc646d9a9",
            "photo-1551183053-bf91a1d81141",
            "photo-1473093295043-cdd812d0e601"
    };
    private static final String[] BURGER_MENU_PHOTOS = {
            BURGER_PHOTO_ID,
            "photo-1550547660-d9450f859349",
            "photo-1520072959219-c595dc870360"
    };
    private static final String[] SANDWICH_MENU_PHOTOS = {
            SANDWICH_PHOTO_ID,
            "photo-1528735602780-2552fd46c7af",
            "photo-1509722747041-616f39b57569"
    };
    private static final String[] CHINESE_MENU_PHOTOS = {
            CHINESE_PHOTO_ID,
            "photo-1617093727343-374698b1b08d",
            "photo-1557872943-16a5ac26437e",
            "photo-1569718212165-3a8278d5f624"
    };
    private static final String[] THAI_MENU_PHOTOS = {
            THAI_PHOTO_ID,
            "photo-1559847844-5315695dadae",
            "photo-1512058564366-18510be2db19"
    };
    private static final String[] MEXICAN_MENU_PHOTOS = {
            MEXICAN_PHOTO_ID,
            "photo-1565299507177-b0ac66763828",
            "photo-1552332386-f8dd00dc2f85"
    };
    private static final String[] HEALTHY_MENU_PHOTOS = {
            HEALTHY_PHOTO_ID,
            "photo-1546793665-c74683f339c1",
            "photo-1505253716362-afaea1d3d1af"
    };
    private static final String[] SEAFOOD_MENU_PHOTOS = {
            SEAFOOD_PHOTO_ID,
            "photo-1615141982883-c7ad0e69fd62",
            "photo-1563379091339-03246963d29a"
    };
    private static final String[] DESSERT_MENU_PHOTOS = {
            DESSERT_PHOTO_ID,
            "photo-1563729784474-d77dbb933a9e",
            "photo-1551024506-0bccd828d307",
            "photo-1488477181946-6428a0291777"
    };
    private static final String[] COFFEE_MENU_PHOTOS = {
            COFFEE_PHOTO_ID,
            "photo-1495474472287-4d71bcdd2085",
            "photo-1509042239860-f550ce710b93"
    };
    private static final String[] BEVERAGE_MENU_PHOTOS = {
            BEVERAGE_PHOTO_ID,
            "photo-1461023058943-07fcbe16d735",
            "photo-1499638673689-79a0b5115d87"
    };
    private static final String[] BREAKFAST_MENU_PHOTOS = {
            BREAKFAST_PHOTO_ID,
            "photo-1482049016688-2d3e1b311543",
            "photo-1504754524776-8f4f37790ca0"
    };
    private static final String[] APPETIZER_MENU_PHOTOS = {
            FOOD_PHOTO_ID,
            "photo-1626082927389-6cd097cdc6ec",
            "photo-1513456852971-30c0b8199d4d",
            "photo-1541599188778-cdc73298e8df"
    };
    private static final String[] DEFAULT_MENU_PHOTOS = {
            FOOD_PHOTO_ID,
            "photo-1540189549336-e6e99c3679fe",
            "photo-1482049016688-2d3e1b311543"
    };

    public String restaurantPhotoUrl(Restaurant restaurant) {
        String explicitImage = normalizeExternalUrl(restaurant == null ? null : restaurant.getImage());
        String seedToken = buildSeedToken(
                "restaurant",
                restaurant == null ? null : restaurant.getRestaurantId(),
                restaurant == null ? null : restaurant.getName(),
                restaurant == null ? null : restaurant.getCategory()
        );

        if (!explicitImage.isBlank() && !isGeneratedImage(explicitImage) && !isSeedLibraryImage(explicitImage)) {
            return appendSeedMarker(explicitImage, seedToken);
        }

        String key = normalize(joinNonBlank(
                restaurant == null ? null : restaurant.getName(),
                restaurant == null ? null : restaurant.getCategory(),
                restaurant == null ? null : restaurant.getCuisine()
        ));
        return restaurantFallbackPhotoUrl(key, seedToken);
    }

    public String menuItemPhotoUrl(Restaurant restaurant, String itemId, String itemName, String category) {
        String key = normalize(joinNonBlank(
                itemName,
                category,
                restaurant == null ? null : restaurant.getCategory()
        ));
        String seedToken = buildSeedToken(
                "menu",
                itemId,
                itemName,
                restaurant == null ? null : restaurant.getRestaurantId()
        );

        if (containsAny(key, "biryani", "pulao", "rice bowl", "dum")) {
            return seededUnsplashUrl(selectPhotoId(BIRYANI_MENU_PHOTOS, seedToken), MENU_ITEM_IMAGE_WIDTH, MENU_ITEM_IMAGE_HEIGHT, seedToken);
        }
        if (containsAny(key, "butter chicken", "korma", "curry", "masala", "rogan", "dal", "kadhai")) {
            return seededUnsplashUrl(selectPhotoId(INDIAN_CURRY_MENU_PHOTOS, seedToken), MENU_ITEM_IMAGE_WIDTH, MENU_ITEM_IMAGE_HEIGHT, seedToken);
        }
        if (containsAny(key, "paneer", "tikka", "tandoori", "kebab", "satay", "skewer")) {
            return seededUnsplashUrl(selectPhotoId(TANDOOR_MENU_PHOTOS, seedToken), MENU_ITEM_IMAGE_WIDTH, MENU_ITEM_IMAGE_HEIGHT, seedToken);
        }
        if (containsAny(key, "naan", "paratha", "bread", "croissant", "muffin", "loaf", "toast", "puff")) {
            return seededUnsplashUrl(selectPhotoId(BREAD_MENU_PHOTOS, seedToken), MENU_ITEM_IMAGE_WIDTH, MENU_ITEM_IMAGE_HEIGHT, seedToken);
        }
        if (containsAny(key, "pizza")) {
            return seededUnsplashUrl(selectPhotoId(ITALIAN_MENU_PHOTOS, seedToken), MENU_ITEM_IMAGE_WIDTH, MENU_ITEM_IMAGE_HEIGHT, seedToken);
        }
        if (containsAny(key, "pasta", "lasagna", "risotto")) {
            return seededUnsplashUrl(selectPhotoId(ITALIAN_MENU_PHOTOS, seedToken), MENU_ITEM_IMAGE_WIDTH, MENU_ITEM_IMAGE_HEIGHT, seedToken);
        }
        if (containsAny(key, "burger")) {
            return seededUnsplashUrl(selectPhotoId(BURGER_MENU_PHOTOS, seedToken), MENU_ITEM_IMAGE_WIDTH, MENU_ITEM_IMAGE_HEIGHT, seedToken);
        }
        if (containsAny(key, "sandwich", "panini", "wrap")) {
            return seededUnsplashUrl(selectPhotoId(SANDWICH_MENU_PHOTOS, seedToken), MENU_ITEM_IMAGE_WIDTH, MENU_ITEM_IMAGE_HEIGHT, seedToken);
        }
        if (containsAny(key, "bbq", "barbecue", "grill", "steak", "wings", "chops")) {
            return seededUnsplashUrl(selectPhotoId(TANDOOR_MENU_PHOTOS, seedToken), MENU_ITEM_IMAGE_WIDTH, MENU_ITEM_IMAGE_HEIGHT, seedToken);
        }
        if (containsAny(key, "sushi", "roll", "maki", "ramen", "gyoza", "tempura", "katsu")) {
            return seededUnsplashUrl(selectPhotoId(JAPANESE_RESTAURANT_PHOTOS, seedToken), MENU_ITEM_IMAGE_WIDTH, MENU_ITEM_IMAGE_HEIGHT, seedToken);
        }
        if (containsAny(key, "noodle", "manchurian", "dimsum", "fried rice", "spring roll")) {
            return seededUnsplashUrl(selectPhotoId(CHINESE_MENU_PHOTOS, seedToken), MENU_ITEM_IMAGE_WIDTH, MENU_ITEM_IMAGE_HEIGHT, seedToken);
        }
        if (containsAny(key, "pad thai", "thai", "tom yum", "lemongrass")) {
            return seededUnsplashUrl(selectPhotoId(THAI_MENU_PHOTOS, seedToken), MENU_ITEM_IMAGE_WIDTH, MENU_ITEM_IMAGE_HEIGHT, seedToken);
        }
        if (containsAny(key, "taco", "burrito", "quesadilla", "nacho", "churro")) {
            return seededUnsplashUrl(selectPhotoId(MEXICAN_MENU_PHOTOS, seedToken), MENU_ITEM_IMAGE_WIDTH, MENU_ITEM_IMAGE_HEIGHT, seedToken);
        }
        if (containsAny(key, "salad", "bowl", "quinoa", "millet", "smoothie", "vegan", "tofu", "hummus", "falafel")) {
            return seededUnsplashUrl(selectPhotoId(HEALTHY_MENU_PHOTOS, seedToken), MENU_ITEM_IMAGE_WIDTH, MENU_ITEM_IMAGE_HEIGHT, seedToken);
        }
        if (containsAny(key, "fish", "prawn", "shrimp", "seafood", "calamari", "salmon")) {
            return seededUnsplashUrl(selectPhotoId(SEAFOOD_MENU_PHOTOS, seedToken), MENU_ITEM_IMAGE_WIDTH, MENU_ITEM_IMAGE_HEIGHT, seedToken);
        }
        if (containsAny(key, "cake", "pastry", "brownie", "waffle", "donut", "ice cream", "cheesecake", "dessert", "kulfi", "falooda")) {
            return seededUnsplashUrl(selectPhotoId(DESSERT_MENU_PHOTOS, seedToken), MENU_ITEM_IMAGE_WIDTH, MENU_ITEM_IMAGE_HEIGHT, seedToken);
        }
        if (containsAny(key, "coffee", "latte", "brew", "espresso", "cappuccino")) {
            return seededUnsplashUrl(selectPhotoId(COFFEE_MENU_PHOTOS, seedToken), MENU_ITEM_IMAGE_WIDTH, MENU_ITEM_IMAGE_HEIGHT, seedToken);
        }
        if (containsAny(key, "tea", "shake", "juice", "cooler", "soda", "drink", "beverage", "lassi")) {
            return seededUnsplashUrl(selectPhotoId(BEVERAGE_MENU_PHOTOS, seedToken), MENU_ITEM_IMAGE_WIDTH, MENU_ITEM_IMAGE_HEIGHT, seedToken);
        }
        if (containsAny(key, "breakfast", "pancake", "dosa", "omelette", "oats", "parfait")) {
            return seededUnsplashUrl(selectPhotoId(BREAKFAST_MENU_PHOTOS, seedToken), MENU_ITEM_IMAGE_WIDTH, MENU_ITEM_IMAGE_HEIGHT, seedToken);
        }
        if (containsAny(key, "rice", "papad", "chaat", "fries", "dimsum", "momo", "starter", "sides")) {
            return seededUnsplashUrl(selectPhotoId(APPETIZER_MENU_PHOTOS, seedToken), MENU_ITEM_IMAGE_WIDTH, MENU_ITEM_IMAGE_HEIGHT, seedToken);
        }

        return seededUnsplashUrl(selectPhotoId(DEFAULT_MENU_PHOTOS, seedToken), MENU_ITEM_IMAGE_WIDTH, MENU_ITEM_IMAGE_HEIGHT, seedToken);
    }

    public boolean shouldReplaceManagedImage(String currentImage, String desiredImageUrl) {
        String normalizedCurrentImage = normalizeExternalUrl(currentImage);
        if (normalizedCurrentImage.isBlank()) {
            return true;
        }
        if (isGeneratedImage(normalizedCurrentImage) || normalizedCurrentImage.startsWith("https://loremflickr.com/")) {
            return true;
        }
        if (normalizedCurrentImage.contains(SEEDED_IMAGE_MARKER)) {
            return !Objects.equals(normalizedCurrentImage, desiredImageUrl);
        }
        return false;
    }

    private String restaurantFallbackPhotoUrl(String key, String seedToken) {
        if (containsAny(key, "breakfast", "dosa", "idli", "vada", "paratha", "omelette")) {
            return seededUnsplashUrl(selectPhotoId(BREAKFAST_RESTAURANT_PHOTOS, seedToken), RESTAURANT_IMAGE_WIDTH, RESTAURANT_IMAGE_HEIGHT, seedToken);
        }
        if (containsAny(key, "bbq", "barbecue", "grill", "steak", "kebab")) {
            return seededUnsplashUrl(selectPhotoId(BBQ_RESTAURANT_PHOTOS, seedToken), RESTAURANT_IMAGE_WIDTH, RESTAURANT_IMAGE_HEIGHT, seedToken);
        }
        if (containsAny(key, "cafe", "coffee", "brunch")) {
            return seededUnsplashUrl(selectPhotoId(CAFE_RESTAURANT_PHOTOS, seedToken), RESTAURANT_IMAGE_WIDTH, RESTAURANT_IMAGE_HEIGHT, seedToken);
        }
        if (containsAny(key, "italian", "pizza", "pasta")) {
            return seededUnsplashUrl(selectPhotoId(ITALIAN_RESTAURANT_PHOTOS, seedToken), RESTAURANT_IMAGE_WIDTH, RESTAURANT_IMAGE_HEIGHT, seedToken);
        }
        if (containsAny(key, "japanese", "sushi", "ramen")) {
            return seededUnsplashUrl(selectPhotoId(JAPANESE_RESTAURANT_PHOTOS, seedToken), RESTAURANT_IMAGE_WIDTH, RESTAURANT_IMAGE_HEIGHT, seedToken);
        }
        if (containsAny(key, "chinese", "noodle", "fried rice", "dimsum")) {
            return seededUnsplashUrl(selectPhotoId(CHINESE_RESTAURANT_PHOTOS, seedToken), RESTAURANT_IMAGE_WIDTH, RESTAURANT_IMAGE_HEIGHT, seedToken);
        }
        if (containsAny(key, "thai")) {
            return seededUnsplashUrl(selectPhotoId(THAI_RESTAURANT_PHOTOS, seedToken), RESTAURANT_IMAGE_WIDTH, RESTAURANT_IMAGE_HEIGHT, seedToken);
        }
        if (containsAny(key, "seafood", "fish", "prawn", "shrimp")) {
            return seededUnsplashUrl(selectPhotoId(SEAFOOD_RESTAURANT_PHOTOS, seedToken), RESTAURANT_IMAGE_WIDTH, RESTAURANT_IMAGE_HEIGHT, seedToken);
        }
        if (containsAny(key, "dessert", "desserts", "cake", "pastry", "bakery")) {
            return seededUnsplashUrl(selectPhotoId(DESSERT_RESTAURANT_PHOTOS, seedToken), RESTAURANT_IMAGE_WIDTH, RESTAURANT_IMAGE_HEIGHT, seedToken);
        }
        if (containsAny(key, "vegan", "healthy", "salad", "bowl")) {
            return seededUnsplashUrl(selectPhotoId(HEALTHY_RESTAURANT_PHOTOS, seedToken), RESTAURANT_IMAGE_WIDTH, RESTAURANT_IMAGE_HEIGHT, seedToken);
        }
        if (containsAny(key, "mexican", "taco", "burrito")) {
            return seededUnsplashUrl(selectPhotoId(MEXICAN_RESTAURANT_PHOTOS, seedToken), RESTAURANT_IMAGE_WIDTH, RESTAURANT_IMAGE_HEIGHT, seedToken);
        }
        if (containsAny(key, "american", "burger", "fast food", "continental")) {
            return seededUnsplashUrl(selectPhotoId(AMERICAN_RESTAURANT_PHOTOS, seedToken), RESTAURANT_IMAGE_WIDTH, RESTAURANT_IMAGE_HEIGHT, seedToken);
        }
        if (containsAny(key, "indian", "biryani", "mughlai", "curry", "north indian", "south indian")) {
            return seededUnsplashUrl(selectPhotoId(INDIAN_RESTAURANT_PHOTOS, seedToken), RESTAURANT_IMAGE_WIDTH, RESTAURANT_IMAGE_HEIGHT, seedToken);
        }
        if (containsAny(key, "bakery", "bread", "pastries")) {
            return seededUnsplashUrl(selectPhotoId(BAKERY_RESTAURANT_PHOTOS, seedToken), RESTAURANT_IMAGE_WIDTH, RESTAURANT_IMAGE_HEIGHT, seedToken);
        }
        return seededUnsplashUrl(selectPhotoId(DEFAULT_RESTAURANT_PHOTOS, seedToken), RESTAURANT_IMAGE_WIDTH, RESTAURANT_IMAGE_HEIGHT, seedToken);
    }

    private String seededUnsplashUrl(String photoId, int width, int height, String seedToken) {
        return UNSPLASH_BASE_URL + photoId
                + "?auto=format&fit=crop&w=" + width
                + "&h=" + height
                + "&q=80&" + SEEDED_IMAGE_MARKER + seedToken;
    }

    private String appendSeedMarker(String imageUrl, String seedToken) {
        String normalizedImageUrl = normalizeExternalUrl(imageUrl);
        if (normalizedImageUrl.isBlank() || normalizedImageUrl.contains(SEEDED_IMAGE_MARKER)) {
            return normalizedImageUrl;
        }
        return normalizedImageUrl + (normalizedImageUrl.contains("?") ? "&" : "?") + SEEDED_IMAGE_MARKER + seedToken;
    }

    private String buildSeedToken(String type, String... values) {
        StringBuilder builder = new StringBuilder(normalize(type));
        for (String value : values) {
            String normalized = normalize(value).replace(' ', '-');
            if (normalized.isBlank()) {
                continue;
            }
            if (builder.length() > 0) {
                builder.append('-');
            }
            builder.append(normalized);
            if (builder.length() >= 72) {
                break;
            }
        }
        return builder.toString();
    }

    private boolean containsAny(String value, String... options) {
        for (String option : options) {
            if (value.contains(option)) {
                return true;
            }
        }
        return false;
    }

    private String selectPhotoId(String[] photoIds, String seedToken) {
        return photoIds[Math.floorMod(Objects.toString(seedToken, "snap-eats").hashCode(), photoIds.length)];
    }

    private String joinNonBlank(String... values) {
        StringBuilder builder = new StringBuilder();
        for (String value : values) {
            String normalized = Objects.toString(value, "").trim();
            if (normalized.isBlank()) {
                continue;
            }
            if (builder.length() > 0) {
                builder.append(" ");
            }
            builder.append(normalized);
        }
        return builder.toString();
    }

    private String normalizeExternalUrl(String value) {
        return Objects.toString(value, "").trim();
    }

    private boolean isGeneratedImage(String imageUrl) {
        return imageUrl.startsWith("/api/restaurants/")
                || imageUrl.startsWith("/api/menu-items/");
    }

    private boolean isSeedLibraryImage(String imageUrl) {
        return imageUrl.startsWith(UNSPLASH_BASE_URL) && !imageUrl.contains(SEEDED_IMAGE_MARKER);
    }

    private String normalize(String value) {
        return Objects.toString(value, "")
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9\\s-]", " ")
                .replaceAll("\\s+", " ")
                .trim();
    }
}
