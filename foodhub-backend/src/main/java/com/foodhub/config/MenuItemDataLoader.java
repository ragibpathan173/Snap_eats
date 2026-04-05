package com.foodhub.config;

import com.foodhub.model.MenuItem;
import com.foodhub.model.Restaurant;
import com.foodhub.repository.MenuItemRepository;
import com.foodhub.repository.RestaurantRepository;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Component
public class MenuItemDataLoader {

    private final MenuItemRepository menuItemRepository;
    private final RestaurantRepository restaurantRepository;
    private final RealFoodPhotoService realFoodPhotoService;

    public MenuItemDataLoader(MenuItemRepository menuItemRepository,
                              RestaurantRepository restaurantRepository,
                              RealFoodPhotoService realFoodPhotoService) {
        this.menuItemRepository = menuItemRepository;
        this.restaurantRepository = restaurantRepository;
        this.realFoodPhotoService = realFoodPhotoService;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void loadMenuItems() {
        List<Restaurant> restaurants = restaurantRepository.findByActiveTrue();
        if (restaurants.isEmpty()) {
            return;
        }

        Map<String, MenuItem> existingByItemId = new HashMap<>();
        for (MenuItem existingItem : menuItemRepository.findAll()) {
            if (existingItem.getItemId() != null && !existingItem.getItemId().isBlank()) {
                existingByItemId.put(existingItem.getItemId(), existingItem);
            }
        }

        List<MenuItem> menuItems = new ArrayList<>();
        int createdCount = 0;
        int updatedCount = 0;
        for (Restaurant restaurant : restaurants) {
            List<MenuSeed> seeds = buildMenuForCategory(restaurant.getCategory());
            for (int index = 0; index < seeds.size(); index++) {
                MenuSeed seed = seeds.get(index);
                String itemId = restaurant.getRestaurantId() + "_ITEM_" + (index + 1);
                MenuItem item = existingByItemId.get(itemId);

                if (item == null) {
                    item = new MenuItem();
                    populateSeededMenuItem(item, restaurant, seed, index, itemId);
                    existingByItemId.put(itemId, item);
                    menuItems.add(item);
                    createdCount++;
                    continue;
                }

                if (refreshSeededMenuItemArtwork(item, restaurant, seed, index, itemId)) {
                    menuItems.add(item);
                    updatedCount++;
                }
            }
        }

        if (menuItems.isEmpty()) {
            return;
        }

        menuItemRepository.saveAll(menuItems);
        System.out.println("Synced menu item artwork for " + restaurants.size() + " restaurants (" + createdCount + " new, " + updatedCount + " updated)");
    }

    private List<MenuSeed> buildMenuForCategory(String category) {
        return switch (category == null ? "" : category.toLowerCase()) {
            case "italian" -> italianMenu();
            case "healthy" -> healthyMenu();
            case "chinese" -> chineseMenu();
            case "desserts" -> dessertsMenu();
            case "indian" -> indianMenu();
            case "mexican" -> mexicanMenu();
            case "american" -> americanMenu();
            case "breakfast" -> breakfastMenu();
            case "cafe" -> cafeMenu();
            case "japanese" -> japaneseMenu();
            case "thai" -> thaiMenu();
            case "vegan" -> veganMenu();
            case "bakery" -> bakeryMenu();
            case "bbq" -> bbqMenu();
            case "seafood" -> seafoodMenu();
            default -> defaultMenu();
        };
    }

    private List<MenuSeed> italianMenu() {
        return List.of(
                seed("Margherita Pizza", "Stone-baked pizza with mozzarella, basil, and rich tomato sauce.", 249, "Pizza", true, false, false, false, 10),
                seed("Farmhouse Pizza", "Loaded with onion, capsicum, olives, and mushrooms.", 329, "Pizza", true, false, false, false, 15),
                seed("Pepperoni Feast", "Classic pepperoni pizza with stretchy cheese.", 399, "Pizza", false, false, false, false, 15),
                seed("Truffle Alfredo Pasta", "Creamy fettuccine finished with parmesan and black pepper.", 319, "Pasta", true, false, false, false, 10),
                seed("Arrabbiata Penne", "Tomato-chili tossed penne with garlic and herbs.", 279, "Pasta", true, false, false, true, 0),
                seed("Chicken Lasagna", "Layered pasta sheets with minced chicken and bechamel.", 349, "Lasagna", false, false, false, false, 0),
                seed("Risotto Funghi", "Creamy arborio rice with mushrooms and parmesan.", 299, "Risotto", true, false, false, false, 0),
                seed("Garlic Bread Supreme", "Toasted artisan bread with garlic butter and cheese.", 149, "Sides", true, false, false, false, 0),
                seed("Cheese Jalapeno Breadsticks", "Soft breadsticks with melted cheese and jalapenos.", 179, "Sides", true, false, false, true, 10),
                seed("Minestrone Soup", "Hearty vegetable soup with Italian herbs.", 169, "Soups", true, true, true, false, 0),
                seed("Chicken Caesar Salad", "Crisp lettuce, grilled chicken, parmesan, and dressing.", 259, "Salads", false, false, false, false, 0),
                seed("Tiramisu Cup", "Coffee-soaked sponge layered with mascarpone cream.", 199, "Desserts", true, false, false, false, 0),
                seed("Panna Cotta Berry", "Silky vanilla panna cotta with berry compote.", 189, "Desserts", true, false, false, false, 0),
                seed("Lemon Iced Tea", "Fresh brewed tea with lemon and mint.", 119, "Beverages", true, true, true, false, 0),
                seed("Cold Coffee Float", "Chilled coffee topped with creamy foam.", 159, "Beverages", true, false, false, false, 0)
        );
    }

    private List<MenuSeed> healthyMenu() {
        return List.of(
                seed("Power Protein Bowl", "Brown rice, grilled protein, greens, and citrus dressing.", 289, "Bowls", false, false, true, false, 10),
                seed("Rainbow Veg Bowl", "Quinoa, roasted vegetables, hummus, and seeds.", 259, "Bowls", true, true, true, false, 10),
                seed("Keto Chicken Salad", "Herb chicken, avocado, lettuce, and olive oil dressing.", 299, "Salads", false, false, true, false, 0),
                seed("Greek Salad", "Cucumber, tomato, olives, feta, and oregano dressing.", 229, "Salads", true, false, true, false, 0),
                seed("Paneer Millet Bowl", "Millet, grilled paneer, sauteed veggies, and pesto drizzle.", 269, "Bowls", true, false, true, false, 0),
                seed("Tofu Satay Box", "Tofu skewers with peanut dip and fresh greens.", 249, "Protein Plates", true, true, false, false, 0),
                seed("Grilled Fish Meal", "Lean fish fillet with sauteed vegetables and couscous.", 349, "Protein Plates", false, false, true, false, 0),
                seed("Detox Green Smoothie", "Spinach, pineapple, mint, and coconut water.", 169, "Smoothies", true, true, true, false, 0),
                seed("Berry Banana Shake", "Banana, berries, oats, and almond milk.", 189, "Smoothies", true, true, true, false, 0),
                seed("Acai Yogurt Parfait", "Granola, yogurt, berries, and chia seeds.", 199, "Breakfast", true, false, false, false, 0),
                seed("Overnight Oats Jar", "Rolled oats soaked with dates, nuts, and fresh fruit.", 149, "Breakfast", true, false, false, false, 0),
                seed("Sprouts Chaat", "Protein-rich sprouts tossed with onions and lime.", 139, "Snacks", true, true, true, true, 0),
                seed("Roasted Sweet Potato", "Baked sweet potatoes with herbs and sea salt.", 129, "Snacks", true, true, true, false, 0),
                seed("Cold Pressed Orange", "Freshly pressed orange juice.", 139, "Juices", true, true, true, false, 0),
                seed("Coconut Water Cooler", "Tender coconut water with basil seeds.", 109, "Juices", true, true, true, false, 0)
        );
    }

    private List<MenuSeed> chineseMenu() {
        return List.of(
                seed("Chili Garlic Noodles", "Wok-tossed noodles with vegetables and chili garlic sauce.", 219, "Noodles", true, false, false, true, 10),
                seed("Hakka Noodles Chicken", "Street-style noodles with chicken and scallions.", 249, "Noodles", false, false, false, true, 10),
                seed("Schezwan Fried Rice", "Smoky fried rice with bold schezwan flavors.", 229, "Rice Bowls", true, true, false, true, 0),
                seed("Kung Pao Chicken Bowl", "Savory stir-fried chicken with peppers and roasted peanuts.", 289, "Rice Bowls", false, false, false, true, 0),
                seed("Veg Manchurian Gravy", "Soft veg dumplings in a glossy Indo-Chinese sauce.", 239, "Main Course", true, false, false, true, 0),
                seed("Chicken Manchurian", "Crisp chicken bites tossed in spicy tangy gravy.", 299, "Main Course", false, false, false, true, 0),
                seed("Dimsum Veg Platter", "Steamed assorted veg dumplings with dip.", 269, "Dimsums", true, false, false, false, 0),
                seed("Chicken Dimsums", "Juicy steamed chicken momos with chili oil.", 289, "Dimsums", false, false, false, true, 0),
                seed("Crispy Spring Rolls", "Golden vegetable spring rolls with sweet chili dip.", 159, "Starters", true, true, false, false, 0),
                seed("Honey Chili Potatoes", "Crisp potato fingers glazed with honey chili sauce.", 179, "Starters", true, true, false, true, 10),
                seed("Hot and Sour Soup", "Classic soup with tofu, mushrooms, and black pepper.", 149, "Soups", true, true, false, true, 0),
                seed("Sweet Corn Chicken Soup", "Creamy sweet corn soup with tender chicken.", 169, "Soups", false, false, false, false, 0),
                seed("Dragon Chicken", "Crispy fried chicken tossed with dry red chilies.", 319, "Starters", false, false, false, true, 0),
                seed("Lemon Coriander Cooler", "Refreshing citrus cooler with coriander notes.", 119, "Beverages", true, true, true, false, 0),
                seed("Peach Iced Tea", "Light peach tea served over ice.", 129, "Beverages", true, true, true, false, 0)
        );
    }

    private List<MenuSeed> dessertsMenu() {
        return List.of(
                seed("Chocolate Lava Cake", "Warm molten cake with rich dark chocolate center.", 169, "Desserts", true, false, false, false, 10),
                seed("Berry Cheesecake Slice", "Creamy cheesecake with blueberry compote.", 199, "Desserts", true, false, false, false, 0),
                seed("Salted Caramel Sundae", "Vanilla ice cream with caramel and brownie crumbs.", 149, "Ice Cream", true, false, false, false, 0),
                seed("Belgian Waffle Classic", "Fresh waffle served with maple and cream.", 189, "Waffles", true, false, false, false, 10),
                seed("Nutella Waffle", "Crisp waffle loaded with Nutella and chocolate chips.", 229, "Waffles", true, false, false, false, 10),
                seed("Chocolate Brownie Fudge", "Dense chocolate brownie with hot fudge sauce.", 159, "Brownies", true, false, false, false, 0),
                seed("Red Velvet Pastry", "Soft sponge with cream cheese frosting.", 149, "Cakes", true, false, false, false, 0),
                seed("Tiramisu Jar", "Coffee-infused layered dessert in a jar.", 179, "Desserts", true, false, false, false, 0),
                seed("Banoffee Cup", "Banana, toffee, and biscuit crumble in whipped cream.", 159, "Desserts", true, false, false, false, 0),
                seed("Classic Donut Box", "Assorted glazed and chocolate donuts.", 219, "Donuts", true, false, false, false, 10),
                seed("Cookie Crumble Shake", "Cold milkshake blended with crushed cookies.", 179, "Shakes", true, false, false, false, 0),
                seed("Strawberry Shake", "Thick strawberry milkshake topped with cream.", 169, "Shakes", true, false, false, false, 0),
                seed("Kulfi Falooda", "Traditional kulfi layered with falooda sev.", 189, "Indian Desserts", true, false, false, false, 0),
                seed("Mango Sorbet", "Refreshing fruit sorbet made with alphonso pulp.", 139, "Ice Cream", true, true, true, false, 0),
                seed("Coffee Walnut Cake", "Coffee sponge layered with walnut cream.", 169, "Cakes", true, false, false, false, 0)
        );
    }

    private List<MenuSeed> indianMenu() {
        return List.of(
                seed("Butter Chicken", "Creamy tomato gravy with tandoor-finished chicken.", 349, "Curries", false, false, true, false, 10),
                seed("Paneer Tikka Masala", "Chargrilled paneer cubes in rich masala gravy.", 299, "Curries", true, false, true, true, 10),
                seed("Dal Makhani", "Slow-cooked black lentils finished with butter.", 229, "Curries", true, false, true, false, 0),
                seed("Chicken Biryani", "Fragrant basmati layered with spiced chicken.", 329, "Biryani", false, false, false, true, 10),
                seed("Veg Dum Biryani", "Long-grain rice cooked with saffron and vegetables.", 249, "Biryani", true, false, false, true, 0),
                seed("Mutton Rogan Josh", "Kashmiri-style mutton curry with warming spices.", 429, "Curries", false, false, true, true, 0),
                seed("Kadhai Paneer", "Paneer tossed with peppers in bold onion-tomato masala.", 289, "Curries", true, false, true, true, 0),
                seed("Butter Naan Basket", "Soft butter naan served hot from the tandoor.", 99, "Breads", true, false, false, false, 0),
                seed("Garlic Naan", "Classic naan finished with garlic and coriander.", 119, "Breads", true, false, false, false, 0),
                seed("Jeera Rice", "Steamed basmati rice tempered with cumin.", 139, "Rice", true, true, true, false, 0),
                seed("Tandoori Chicken", "Spiced chicken roasted in the tandoor.", 329, "Starters", false, false, true, true, 0),
                seed("Paneer Tikka", "Smoky paneer skewers served with mint chutney.", 269, "Starters", true, false, true, true, 0),
                seed("Masala Papad", "Crisp papad topped with onions, tomato, and spice.", 89, "Sides", true, true, true, true, 0),
                seed("Gulab Jamun", "Warm khoya dumplings in sugar syrup.", 119, "Desserts", true, false, false, false, 0),
                seed("Sweet Lassi", "Creamy chilled yogurt drink.", 109, "Beverages", true, false, false, false, 0)
        );
    }

    private List<MenuSeed> mexicanMenu() {
        return List.of(
                seed("Loaded Burrito", "Rice, beans, salsa, cheese, and house crema wrapped warm.", 259, "Burritos", false, false, false, true, 10),
                seed("Street Tacos Trio", "Three tacos with salsa fresca and pickled onions.", 239, "Tacos", false, false, false, true, 10),
                seed("Veg Bean Burrito", "Black beans, rice, peppers, and smoky salsa.", 219, "Burritos", true, true, false, true, 0),
                seed("Chicken Quesadilla", "Toasted tortilla stuffed with cheese and seasoned chicken.", 279, "Quesadillas", false, false, false, false, 0),
                seed("Veg Quesadilla", "Grilled tortilla with peppers, corn, and cheese.", 239, "Quesadillas", true, false, false, false, 0),
                seed("Nacho Fiesta", "Crispy nachos with queso, beans, and jalapenos.", 199, "Starters", true, false, false, true, 10),
                seed("Guacamole and Chips", "Fresh avocado mash with tortilla chips.", 189, "Starters", true, true, true, false, 0),
                seed("Mexican Rice Bowl", "Chipotle rice bowl with salsa, beans, and veg.", 229, "Rice Bowls", true, true, true, true, 0),
                seed("Chicken Fajita Bowl", "Sizzling chicken with peppers over rice.", 289, "Rice Bowls", false, false, true, true, 0),
                seed("Corn Cheese Cups", "Baked corn kernels with cheese and paprika.", 159, "Sides", true, false, true, false, 0),
                seed("Jalapeno Poppers", "Crunchy poppers with molten cheese filling.", 179, "Sides", true, false, false, true, 0),
                seed("Churros with Chocolate", "Cinnamon sugar churros with warm dip.", 149, "Desserts", true, false, false, false, 0),
                seed("Tres Leches Cup", "Soft sponge soaked in sweet milk blend.", 169, "Desserts", true, false, false, false, 0),
                seed("Lime Soda", "Fresh sweet-salty lime soda.", 99, "Beverages", true, true, true, false, 0),
                seed("Horchata Shake", "Creamy cinnamon rice milkshake.", 149, "Beverages", true, false, false, false, 0)
        );
    }

    private List<MenuSeed> americanMenu() {
        return List.of(
                seed("Signature Smash Burger", "Double-seared patty with cheese and house sauce.", 279, "Burgers", false, false, false, false, 10),
                seed("Crispy Chicken Burger", "Crunchy fried chicken with slaw and mayo.", 249, "Burgers", false, false, false, false, 10),
                seed("Veggie Burger", "Grilled veg patty with lettuce and chipotle mayo.", 199, "Burgers", true, false, false, false, 0),
                seed("BBQ Bacon Burger", "Juicy burger stacked with smoky sauce and bacon.", 349, "Burgers", false, false, false, false, 0),
                seed("Grilled Chicken Sandwich", "Toasted sandwich with herb grilled chicken.", 239, "Sandwiches", false, false, false, false, 0),
                seed("Club Sandwich", "Three-layer sandwich with chicken, egg, and lettuce.", 259, "Sandwiches", false, false, false, false, 0),
                seed("Loaded Waffle Fries", "Crispy fries with cheese sauce and herbs.", 169, "Sides", true, false, false, false, 0),
                seed("Peri Peri Fries", "Seasoned fries with fiery peri peri dust.", 149, "Sides", true, true, true, true, 0),
                seed("Mac and Cheese", "Creamy baked macaroni with cheddar crust.", 199, "Comfort Bowls", true, false, false, false, 0),
                seed("Buffalo Wings", "Hot wings tossed in house buffalo glaze.", 279, "Starters", false, false, false, true, 0),
                seed("Chicken Tenders", "Crispy strips served with dip.", 239, "Starters", false, false, false, false, 0),
                seed("Onion Rings", "Beer-batter onion rings with chipotle dip.", 159, "Starters", true, false, false, false, 0),
                seed("Chocolate Shake", "Thick and creamy classic chocolate shake.", 149, "Beverages", true, false, false, false, 0),
                seed("Vanilla Cola Float", "Chilled cola topped with vanilla ice cream.", 139, "Beverages", true, false, false, false, 0),
                seed("Brownie Sundae", "Warm brownie served with vanilla ice cream.", 169, "Desserts", true, false, false, false, 0)
        );
    }

    private List<MenuSeed> breakfastMenu() {
        return List.of(
                seed("Classic Pancake Stack", "Fluffy pancakes with butter and maple syrup.", 189, "Breakfast", true, false, false, false, 10),
                seed("Masala Omelette Toast", "Spiced omelette served with buttered toast.", 159, "Breakfast", false, false, false, true, 0),
                seed("Avocado Toast Deluxe", "Sourdough topped with smashed avocado and seeds.", 219, "Breakfast", true, true, false, false, 0),
                seed("Egg Bhurji Roll", "Scrambled masala eggs wrapped in flaky paratha.", 149, "Breakfast", false, false, false, true, 0),
                seed("Stuffed Aloo Paratha", "Hot paratha with curd and pickle.", 139, "Indian Breakfast", true, false, false, false, 0),
                seed("Idli Sambar", "Soft steamed idlis with sambar and chutney.", 129, "Indian Breakfast", true, true, false, false, 0),
                seed("Masala Dosa", "Crisp dosa filled with spiced potato masala.", 169, "Indian Breakfast", true, false, false, false, 0),
                seed("French Toast", "Golden toast dusted with cinnamon sugar.", 189, "Breakfast", true, false, false, false, 0),
                seed("Granola Yogurt Bowl", "Crunchy granola with fruit and yogurt.", 159, "Healthy Breakfast", true, false, false, false, 0),
                seed("Breakfast Burrito", "Egg, beans, salsa, and cheese in a tortilla wrap.", 219, "Breakfast", false, false, false, true, 0),
                seed("Hash Brown Bites", "Crisp potato bites with herb dip.", 119, "Sides", true, true, true, false, 0),
                seed("Iced Latte", "Smooth espresso over chilled milk.", 149, "Coffee", true, false, false, false, 0),
                seed("Cappuccino", "Silky coffee with a thick foam cap.", 139, "Coffee", true, false, false, false, 0),
                seed("Fresh Orange Juice", "Cold-pressed orange juice.", 119, "Juices", true, true, true, false, 0),
                seed("Banana Walnut Muffin", "Soft muffin with banana and walnuts.", 99, "Bakery", true, false, false, false, 0)
        );
    }

    private List<MenuSeed> cafeMenu() {
        return List.of(
                seed("Cafe Mocha", "Espresso, chocolate, and steamed milk.", 209, "Coffee", true, false, false, false, 0),
                seed("Cappuccino", "Balanced espresso with creamy milk foam.", 189, "Coffee", true, false, false, false, 0),
                seed("Americano", "Bold espresso topped with hot water.", 169, "Coffee", true, true, true, false, 0),
                seed("Cold Brew", "Slow-steeped coffee served chilled.", 199, "Coffee", true, true, true, false, 0),
                seed("Hazelnut Latte", "Smooth latte infused with hazelnut syrup.", 229, "Coffee", true, false, false, false, 0),
                seed("Caramel Frappé", "Icy blended coffee with caramel drizzle.", 249, "Coffee", true, false, false, false, 10),
                seed("Croissant Sandwich", "Buttery croissant layered with cheese and greens.", 199, "Bakery", true, false, false, false, 0),
                seed("Chicken Pesto Sandwich", "Grilled sandwich with basil pesto and chicken.", 249, "Sandwiches", false, false, false, false, 0),
                seed("Veggie Panini", "Toasted panini with roasted vegetables and cheese.", 219, "Sandwiches", true, false, false, false, 0),
                seed("Blueberry Cheesecake", "Creamy cheesecake with berry topping.", 199, "Desserts", true, false, false, false, 0),
                seed("Fudge Brownie", "Dense dark chocolate brownie slice.", 149, "Desserts", true, false, false, false, 0),
                seed("Banana Walnut Cake", "Tea cake with ripe banana and toasted nuts.", 129, "Bakery", true, false, false, false, 0),
                seed("Classic Fries", "Golden fries sprinkled with sea salt.", 119, "Sides", true, true, true, false, 0),
                seed("Peach Iced Tea", "Refreshing peach iced tea.", 139, "Coolers", true, true, true, false, 0),
                seed("Lemon Mint Cooler", "Sparkling lemon-mint cooler.", 129, "Coolers", true, true, true, false, 0)
        );
    }

    private List<MenuSeed> japaneseMenu() {
        return List.of(
                seed("Salmon Sushi Roll", "Fresh salmon roll with cucumber and sesame.", 379, "Sushi", false, false, true, false, 10),
                seed("California Roll", "Crab stick roll with avocado and cucumber.", 329, "Sushi", false, false, false, false, 10),
                seed("Veg Tempura Roll", "Crisp tempura vegetables wrapped in sushi rice.", 289, "Sushi", true, false, false, false, 0),
                seed("Chicken Katsu Curry", "Breaded chicken cutlet with curry rice.", 349, "Rice Bowls", false, false, false, false, 0),
                seed("Teriyaki Chicken Bowl", "Glazed chicken over sticky rice.", 319, "Rice Bowls", false, false, false, false, 0),
                seed("Spicy Ramen", "Noodles in rich broth with chili oil and toppings.", 329, "Ramen", false, false, false, true, 0),
                seed("Miso Ramen Veg", "Comforting miso broth with noodles and tofu.", 289, "Ramen", true, false, false, false, 0),
                seed("Chicken Gyoza", "Pan-seared dumplings with soy dip.", 249, "Starters", false, false, false, false, 0),
                seed("Veg Tempura", "Lightly battered seasonal vegetables.", 219, "Starters", true, false, false, false, 0),
                seed("Takoyaki Bites", "Japanese street-style octopus fritters.", 279, "Starters", false, false, false, false, 0),
                seed("Edamame Sea Salt", "Steamed edamame pods with flaky salt.", 169, "Sides", true, true, true, false, 0),
                seed("Prawn Tempura", "Crisp tempura prawns with spicy mayo.", 329, "Starters", false, false, false, false, 0),
                seed("Matcha Cheesecake", "Creamy cheesecake with matcha finish.", 199, "Desserts", true, false, false, false, 0),
                seed("Yuzu Cooler", "Citrus cooler with a bright yuzu twist.", 149, "Beverages", true, true, true, false, 0),
                seed("Japanese Iced Coffee", "Chilled pour-over coffee.", 169, "Beverages", true, true, true, false, 0)
        );
    }

    private List<MenuSeed> thaiMenu() {
        return List.of(
                seed("Pad Thai", "Rice noodles with tamarind sauce and crunchy peanuts.", 279, "Noodles", false, false, false, true, 10),
                seed("Thai Basil Chicken", "Wok-tossed basil chicken with jasmine rice.", 299, "Rice Bowls", false, false, true, true, 0),
                seed("Green Curry Veg", "Aromatic green curry with vegetables and herbs.", 259, "Curries", true, true, true, true, 0),
                seed("Green Curry Chicken", "Spiced Thai curry with chicken and coconut milk.", 319, "Curries", false, false, true, true, 0),
                seed("Red Curry Prawns", "Prawns simmered in red curry sauce.", 369, "Curries", false, false, true, true, 0),
                seed("Thai Fried Rice", "Fragrant jasmine fried rice with vegetables.", 229, "Rice Bowls", true, false, false, false, 0),
                seed("Tom Yum Soup", "Hot and sour soup with lemongrass and kaffir lime.", 189, "Soups", false, false, true, true, 0),
                seed("Tom Kha Veg", "Coconut milk soup with mushrooms and galangal.", 179, "Soups", true, true, true, false, 0),
                seed("Chicken Satay", "Grilled skewers with peanut dipping sauce.", 249, "Starters", false, false, false, false, 0),
                seed("Veg Spring Rolls", "Crunchy Thai-style spring rolls.", 159, "Starters", true, true, false, false, 0),
                seed("Papaya Salad", "Raw papaya salad with peanut and lime dressing.", 179, "Salads", true, true, true, true, 0),
                seed("Thai Basil Tofu", "Stir-fried tofu with basil and chili.", 239, "Main Course", true, true, true, true, 0),
                seed("Mango Sticky Rice", "Sweet sticky rice served with mango.", 189, "Desserts", true, false, true, false, 0),
                seed("Thai Iced Tea", "Sweet chilled tea with creamy finish.", 139, "Beverages", true, false, true, false, 0),
                seed("Lemongrass Cooler", "Refreshing lemongrass and lime drink.", 129, "Beverages", true, true, true, false, 0)
        );
    }

    private List<MenuSeed> veganMenu() {
        return List.of(
                seed("Jackfruit Taco Duo", "Pulled jackfruit with slaw and smoky salsa.", 229, "Tacos", true, true, true, true, 10),
                seed("Lentil Nourish Bowl", "Roasted vegetables, lentils, and tahini drizzle.", 249, "Bowls", true, true, true, false, 10),
                seed("Falafel Wrap", "Crisp falafel wrapped with hummus and greens.", 219, "Wraps", true, true, true, false, 0),
                seed("Vegan Burrito Bowl", "Brown rice, black beans, salsa, and guacamole.", 239, "Bowls", true, true, true, true, 0),
                seed("Mushroom Millet Burger", "Millet-mushroom patty with vegan aioli.", 249, "Burgers", true, true, false, false, 0),
                seed("Tofu Teriyaki Bowl", "Tofu glazed in teriyaki with rice and greens.", 259, "Bowls", true, true, false, false, 0),
                seed("Quinoa Salad", "Herbed quinoa with cucumber, olives, and citrus dressing.", 199, "Salads", true, true, true, false, 0),
                seed("Vegan Caesar Salad", "Crunchy lettuce with dairy-free caesar dressing.", 219, "Salads", true, true, false, false, 0),
                seed("Sweet Potato Wedges", "Roasted wedges with smoked paprika.", 149, "Sides", true, true, true, false, 0),
                seed("Hummus Mezze Plate", "Creamy hummus with pita, olives, and crudites.", 189, "Sides", true, true, false, false, 0),
                seed("Chickpea Curry Bowl", "Warm chickpea stew with brown rice.", 229, "Main Course", true, true, true, true, 0),
                seed("Vegan Chocolate Mousse", "Rich dairy-free chocolate mousse cup.", 159, "Desserts", true, true, true, false, 0),
                seed("Cashew Cheesecake Jar", "Plant-based cheesecake with berry swirl.", 179, "Desserts", true, true, true, false, 0),
                seed("Almond Date Shake", "Natural sweet shake blended with almond milk.", 149, "Beverages", true, true, true, false, 0),
                seed("Cold Brew Oat Latte", "Coffee blended with oat milk.", 169, "Beverages", true, true, true, false, 0)
        );
    }

    private List<MenuSeed> bakeryMenu() {
        return List.of(
                seed("Almond Croissant", "Flaky pastry with toasted almond cream.", 129, "Pastries", true, false, false, false, 0),
                seed("Butter Croissant", "Classic airy croissant with butter layers.", 109, "Pastries", true, false, false, false, 0),
                seed("Pain au Chocolat", "Croissant roll with dark chocolate center.", 139, "Pastries", true, false, false, false, 0),
                seed("Cinnamon Roll", "Soft roll with cream cheese glaze.", 149, "Pastries", true, false, false, false, 10),
                seed("Blueberry Muffin", "Moist muffin packed with blueberries.", 99, "Bakery", true, false, false, false, 0),
                seed("Banana Walnut Muffin", "Freshly baked muffin with banana and walnuts.", 99, "Bakery", true, false, false, false, 0),
                seed("Red Velvet Cupcake", "Soft cupcake with cream cheese frosting.", 119, "Cupcakes", true, false, false, false, 0),
                seed("Chocolate Truffle Pastry", "Chocolate sponge with silky ganache.", 149, "Cakes", true, false, false, false, 0),
                seed("Black Forest Slice", "Rich cake slice with cream and cherries.", 159, "Cakes", true, false, false, false, 0),
                seed("Veg Puff", "Golden flaky puff with spiced veg filling.", 69, "Savories", true, false, false, true, 0),
                seed("Chicken Puff", "Buttery puff stuffed with chicken masala.", 89, "Savories", false, false, false, true, 0),
                seed("Paneer Roll", "Soft roll with paneer tikka filling.", 129, "Savories", true, false, false, true, 0),
                seed("Garlic Bread Loaf", "Freshly baked loaf with herbed garlic butter.", 149, "Breads", true, false, false, false, 0),
                seed("Cold Coffee", "Smooth cold coffee topped with foam.", 139, "Beverages", true, false, false, false, 0),
                seed("Masala Chai", "Brewed spiced tea with milk.", 59, "Beverages", true, false, false, false, 0)
        );
    }

    private List<MenuSeed> bbqMenu() {
        return List.of(
                seed("Smoked BBQ Platter", "Slow-cooked barbecue meat with slaw and pickles.", 499, "Grill", false, false, true, false, 10),
                seed("BBQ Chicken Wings", "Sticky wings finished in smoky barbecue glaze.", 289, "Starters", false, false, true, true, 0),
                seed("Pulled Chicken Burger", "Toasted bun loaded with pulled barbecue chicken.", 279, "Burgers", false, false, false, false, 0),
                seed("Grilled Chicken Steak", "Char-grilled chicken served with pepper jus.", 349, "Grill", false, false, true, false, 0),
                seed("Lamb Chops", "Tender lamb chops glazed with barbecue sauce.", 549, "Grill", false, false, true, false, 0),
                seed("BBQ Paneer Skewers", "Paneer skewers brushed with smoky barbecue glaze.", 249, "Starters", true, false, true, true, 0),
                seed("Smoked Sausage Platter", "Grilled sausage pieces with mustard dip.", 319, "Starters", false, false, true, false, 0),
                seed("Loaded Mac and Cheese", "Creamy mac and cheese with toasted crumb topping.", 219, "Sides", true, false, false, false, 0),
                seed("Corn on the Cob", "Butter-brushed grilled corn cobs.", 139, "Sides", true, false, true, false, 0),
                seed("Garlic Butter Mash", "Creamy mashed potato finished with garlic butter.", 149, "Sides", true, false, true, false, 0),
                seed("Coleslaw Bowl", "Creamy crunchy slaw.", 99, "Sides", true, false, true, false, 0),
                seed("Peri Peri Chicken", "Spicy grilled chicken with peri peri glaze.", 339, "Grill", false, false, true, true, 0),
                seed("Brownie with Ice Cream", "Warm brownie served with vanilla scoop.", 169, "Desserts", true, false, false, false, 0),
                seed("Lemon Cooler", "Zesty lemon cooler served chilled.", 109, "Beverages", true, true, true, false, 0),
                seed("Iced Tea", "Brewed tea with citrus notes.", 119, "Beverages", true, true, true, false, 0)
        );
    }

    private List<MenuSeed> seafoodMenu() {
        return List.of(
                seed("Grilled Fish Plate", "Seared fish fillet with lemon herb butter.", 399, "Seafood", false, false, true, false, 10),
                seed("Garlic Shrimp Rice", "Juicy shrimp over seasoned herb rice.", 349, "Rice Bowls", false, false, true, false, 10),
                seed("Fish and Chips", "Crisp battered fish with fries and tartar dip.", 329, "Seafood", false, false, false, false, 0),
                seed("Prawn Tempura", "Lightly battered prawns with mayo dip.", 359, "Starters", false, false, false, false, 0),
                seed("Butter Garlic Prawns", "Pan-seared prawns in butter garlic sauce.", 389, "Seafood", false, false, true, false, 0),
                seed("Coastal Fish Curry", "Tangy coconut fish curry served with rice.", 379, "Curries", false, false, true, true, 0),
                seed("Seafood Noodles", "Wok noodles tossed with shrimp and squid.", 329, "Noodles", false, false, false, true, 0),
                seed("Calamari Rings", "Crispy calamari rings with lemon aioli.", 279, "Starters", false, false, false, false, 0),
                seed("Lemon Butter Basa", "Soft basa fillet finished with butter sauce.", 319, "Seafood", false, false, true, false, 0),
                seed("Prawn Biryani", "Fragrant biryani layered with masala prawns.", 399, "Biryani", false, false, false, true, 0),
                seed("Seafood Soup", "Light broth with prawns, fish, and herbs.", 189, "Soups", false, false, true, false, 0),
                seed("Herb Rice", "Steamed rice tossed with herbs and butter.", 129, "Sides", true, false, true, false, 0),
                seed("Grilled Veg Sides", "Sauteed vegetables with light seasoning.", 149, "Sides", true, true, true, false, 0),
                seed("Tender Coconut Cooler", "Chilled coconut cooler with basil seeds.", 109, "Beverages", true, true, true, false, 0),
                seed("Lemon Tart", "Tangy dessert tart with buttery crust.", 159, "Desserts", true, false, false, false, 0)
        );
    }

    private List<MenuSeed> defaultMenu() {
        return List.of(
                seed("Chef Special Meal", "A house favorite prepared fresh every day.", 249, "Chef Specials", false, false, false, false, 10),
                seed("Signature Rice Bowl", "Comfort bowl with grains, greens, and house sauce.", 219, "Bowls", true, false, false, false, 0),
                seed("Loaded Fries", "Crispy fries topped with sauces and herbs.", 149, "Sides", true, false, false, false, 0),
                seed("Crispy Starter Basket", "Assorted crunchy starters with dip.", 199, "Starters", true, false, false, true, 0),
                seed("House Burger", "Balanced burger with crisp lettuce and sauce.", 229, "Mains", false, false, false, false, 0),
                seed("Veg Wrap", "Soft wrap filled with spiced vegetables.", 169, "Wraps", true, true, false, true, 0),
                seed("Chicken Wrap", "Grilled chicken, lettuce, and smoky mayo.", 199, "Wraps", false, false, false, false, 0),
                seed("Garden Salad", "Fresh seasonal salad with citrus dressing.", 149, "Salads", true, true, true, false, 0),
                seed("Soup of the Day", "A fresh house-made soup.", 129, "Soups", true, false, false, false, 0),
                seed("Garlic Bread", "Toasted bread with herb garlic butter.", 109, "Sides", true, false, false, false, 0),
                seed("Chocolate Brownie", "Warm brownie with fudgy center.", 149, "Desserts", true, false, false, false, 0),
                seed("Classic Shake", "Creamy house-style milkshake.", 159, "Beverages", true, false, false, false, 0),
                seed("Fresh Lime Soda", "Sparkling lime soda served chilled.", 99, "Beverages", true, true, true, false, 0),
                seed("Family Combo", "A complete meal combo for sharing.", 449, "Combos", false, false, false, false, 10),
                seed("Mini Dessert Cup", "Sweet finish for the meal.", 99, "Desserts", true, false, false, false, 0)
        );
    }

    private MenuSeed seed(
            String name,
            String description,
            double price,
            String category,
            boolean vegetarian,
            boolean vegan,
            boolean glutenFree,
            boolean spicy,
            double discountPercent
    ) {
        return new MenuSeed(name, description, price, category, vegetarian, vegan, glutenFree, spicy, discountPercent);
    }

    private void populateSeededMenuItem(MenuItem item, Restaurant restaurant, MenuSeed seed, int index, String itemId) {
        item.setItemId(itemId);
        item.setRestaurantId(restaurant.getId());
        item.setName(seed.name());
        item.setDescription(seed.description());
        item.setPrice(seed.price());
        item.setCategory(seed.category());
        item.setImage(realFoodPhotoService.menuItemPhotoUrl(restaurant, itemId, seed.name(), seed.category()));
        item.setVegetarian(seed.vegetarian());
        item.setVegan(seed.vegan());
        item.setGlutenFree(seed.glutenFree());
        item.setSpicy(seed.spicy());
        item.setPrepTime(restaurant.getTime());
        item.setAvailable(true);
        item.setActive(true);
        item.setRating(Math.max(3.9, restaurant.getRating() - (0.05 * (index % 6))));
        item.setOrderCount(Math.max(12, 180 - (index * 8)));
        item.setReviewCount(Math.max(10, 96 - (index * 4)));
        item.setPortionSize(resolvePortionSize(index));
        item.setDiscount(seed.discountPercent());
        item.setFeatured(index < 3);
        item.setBestSeller(index < 6);
        item.setTags(buildTags(restaurant, seed, index));
    }

    private boolean refreshSeededMenuItemArtwork(MenuItem item, Restaurant restaurant, MenuSeed seed, int index, String itemId) {
        boolean changed = false;
        String desiredImageUrl = realFoodPhotoService.menuItemPhotoUrl(restaurant, itemId, seed.name(), seed.category());

        if (!Objects.equals(item.getRestaurantId(), restaurant.getId())) {
            item.setRestaurantId(restaurant.getId());
            changed = true;
        }
        if (shouldReplaceSeededImage(item.getImage(), desiredImageUrl)) {
            item.setImage(desiredImageUrl);
            changed = true;
        }
        if (item.getPrepTime() == null || item.getPrepTime().isBlank()) {
            item.setPrepTime(restaurant.getTime());
            changed = true;
        }
        if (item.getCategory() == null || item.getCategory().isBlank()) {
            item.setCategory(seed.category());
            changed = true;
        }
        if (item.getPortionSize() == null || item.getPortionSize().isBlank()) {
            item.setPortionSize(resolvePortionSize(index));
            changed = true;
        }
        if (item.getTags() == null || item.getTags().isBlank()) {
            item.setTags(buildTags(restaurant, seed, index));
            changed = true;
        }
        return changed;
    }

    private boolean shouldReplaceSeededImage(String currentImage, String desiredImageUrl) {
        return realFoodPhotoService.shouldReplaceManagedImage(currentImage, desiredImageUrl);
    }

    private String resolvePortionSize(int index) {
        if (index < 4) {
            return "Regular";
        }
        if (index < 10) {
            return "Shareable";
        }
        return "Family";
    }

    private String buildTags(Restaurant restaurant, MenuSeed seed, int index) {
        return String.join(", ", List.of(
                Objects.toString(restaurant.getCategory(), "featured"),
                seed.category().toLowerCase(),
                index < 6 ? "bestseller" : "chef-special"
        ));
    }

    private record MenuSeed(
            String name,
            String description,
            Double price,
            String category,
            boolean vegetarian,
            boolean vegan,
            boolean glutenFree,
            boolean spicy,
            Double discountPercent
    ) {
    }
}
