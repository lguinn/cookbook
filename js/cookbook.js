// cookbook.js
// Lisa Guinn 2021
//
// javascript for initializing web pages and responding to user actions

// functions to create the Recipe and Category objects

function Recipe(id, image, intro, categories, directions, ingredients, notes, nutrition, 
    servings, source, tags, time, title) {
    this.id = id;
    this.image = image;
    this.intro = intro;
    this.categories = categories;
    this.directions = directions;
    this.ingredients = ingredients;
    this.notes = notes;
    this.nutrition = nutrition;
    this.servings = servings;
    this.source = source;
    this.tags = tags;
    this.time = time;
    this.title = title;
  }

function Category(id, name) {
    this.id = id;
    this.name = name;
}

var recipes = [];
var categories = [];

// *********************************************************************
// initIndex() sets up the dynamic data on index.html

function initIndex() {
    // initialize the list of favorite recipes and the list of categories on the index page when it loads
    initData(); // really just need this for our demo, IRL will use a database
    initCategories();
    initFavorites();
}

//  initialize the categories list on index.html
function initCategories() {
    var catHTML = '';
    var i;
    
    for (var i = 0; i < categories.length; i++) {
        catHTML = catHTML + `<li><a href="category.html?category=${categories[i].id}">${categories[i].name}</a></li>`;
    }
    document.getElementById('categoryList').innerHTML = catHTML;
}

//initialize the favorites panel on index.html
function initFavorites() {
    var favHTML = '';
    var i;
    var maxFavs;

    maxFavs = recipes.length;
    if (maxFavs > 7) { maxFavs = 7; }
    for (i = 0; i < maxFavs; i++) {
        favHTML = favHTML + `<a href="recipe.html?recipe=${recipes[i].id}">` +
                    `<figure><img src="${recipes[i].image}" alt="${recipes[i].title}">` +
                    `<figcaption>${recipes[i].title}</figcaption></figure></a>`;
    }
    document.getElementById('favList').innerHTML = favHTML;
}

// *********************************************************************
// initialize the dynamic data on recipe.html

function initRecipe() {
    // initialize the recipe page when loading. Use the id of the recipe in the ?recipe=X in the URL
    var addr = new URL(window.location.href);
    var recipeId = addr.searchParams.get("recipe");

    initData(); // really just need this for our demo, IRL will use a database

    var recipe = findRecipe(recipeId);
    if (recipe) { // recipe was found
        document.getElementById('recipe-pic').src = recipe.image;
        document.getElementById('recipe-pic').alt = recipe.title;
        document.getElementById('recipe-pic-end').src = recipe.image;
        document.getElementById('recipe-pic-end').alt = recipe.title;
        document.getElementById('recipe-name').innerHTML = recipe.title;
        document.getElementById('recipe-intro').innerHTML = recipe.intro;
        document.getElementById('ingredients').innerHTML = recipe.ingredients;
        document.getElementById('directions').innerHTML = recipe.directions;
        document.getElementById('recipe-footer').innerHTML = recipe.notes;
    } else { // no recipe
        document.getElementById('recipe-name').innerHTML = 'MISSING RECIPE';
    }   
}

// *********************************************************************
// initialize the dynamic data on category.html

function initCategory() {
    // initialize the category page when loading. Use the name of the category in the ?category=X in the URL
    var addr = new URL(window.location.href);
    var catId = addr.searchParams.get("category");
    var recipePic;
    var i, j;

    initData(); // really just need this for our demo, IRL will use a database

    var catName = findCategoryName(catId);
    if (!catName) { catName = catId; }

    document.getElementById('category-name').innerHTML = catName;  

    var recipes = findCategory(catId);
    if (recipes.length > 0) { // there were some recipes found
        var tableRows = '';
        for (i = 0; i < recipes.length; i++) {
            recipeURL=`recipe.html?recipe=${recipes[i].id}`;
            recipePic = `<a href="${recipeURL}"><img src="${recipes[i].image}" alt="${recipes[i].title}"></a>`;
            recipeTags = '';
            if (recipes[i].tags.length > 0) { 
                for (j=0; j<recipes[i].tags.length; j++) {
                    recipeTags = recipeTags + ' ' + recipes[i].tags[j];
                }
            }
            tableRows = tableRows + `<tr><td>${recipePic}</td><td><a href="${recipeURL}">${recipes[i].title}</a></td>` +
                `<td>${recipeTags}</td></tr>`;
        }
        document.getElementById('results-body').innerHTML = tableRows;
    }
    else
    { // no recipes found in this category
        document.getElementById('results').innerHTML = "<h4>No recipes in this category yet!</h4>";
    }
}

// *********************************************************************
// Helper Functions

function findRecipe(id) {
    var i;
    for (i = 0; i < recipes.length; i++) {
        if (recipes[i].id == id) { 
            return recipes[i]; 
        }
    }
    return null;
}

function findCategory(id) {
    var i, j;  // for indices
    results = [];
    for (i=0; i<recipes.length; i++) {
        if(recipes[i].categories) { // it has categories
            for (j=0; j<recipes[i].categories.length; j++) {
                if (recipes[i].categories[j] == id) {
                    results.push(recipes[i])
                }
            }
        }
    }
    return results;
}

function findCategoryName(id) {
    var i;
    for (i = 0; i < categories.length; i++) {
        if (categories[i].id == id) { 
            return categories[i].name; 
        }
    }
    return null;
}

// *********************************************************************
//set up the data because we don't have a backend database system connected yet
function initData() {

    recipes.push(new Recipe('chickeninasweetredpeppersauce',
    'https://storage.googleapis.com/recipe-photos/chickeninasweetredpeppersauce.jpg',
    '<div id="intro"> <p>This is a wonderful dish with lots of color, that is spicy but not too hot.</p> </div>',
    ['chicken', 'indian'],
    '<p>Skin all chicken pieces. If using breasts instead of thighs, divide them in 4 parts.</p> <p>Place onion, ginger, garlic, almonds, peppers, cumin, coriander, tumeric, cayenne, and salt in a blender or food processor; blend to a smooth paste.</p> <p>Place oil in a large wide skillet over medium-high heat. When hot, avert face and add onion paste. Stir and fry for 10 to 12 minutes.</p> <p>Add chicken, water, lemon juice, and pepper. Stir and bring to a boil. Cover, turn heat to low, and simmer for 25 minutes, stirring occasionally.</p> <p>Add up to 1/2 cup more water if needed. Wait until chicken has simmered a bit before adding additional water, as the sauce tends to thin as it cooks.</p>',
    '<table id="ingredients-table"> <tr> <td>2 1/4</td><td>lbs.</td><td>chicken thighs</td></tr><tr><td>1</td><td>large</td><td>onion, peeled and chopped</td></tr><tr><td>1</td><td>inch</td><td>fresh ginger, peeled and chopped</td></tr><tr><td>3</td><td>cloves</td><td>garlic, peeled</td></tr><tr><td>2 1/2</td><td>Tablespoons</td><td>slivered blanched almonds</td></tr><tr><td>3/4</td><td>lb.</td><td>red bell peppers, seeded and chopped</td></tr><tr><td>1</td><td>Tablespoon</td><td>ground cumin</td></tr><tr><td>2</td><td>teaspoons</td><td>ground coriander</td></tr><tr><td>1/2</td><td>teaspoon</td><td>ground tumeric</td></tr><tr><td>1/4</td><td>teaspoon</td><td>cayenne pepper</td></tr><tr><td>2</td><td>teaspoons</td><td>salt</td></tr><tr><td>7</td><td>Tablespoons</td><td>vegetable oil</td></tr><tr><td>1/2</td><td>cup</td><td>water</td></tr><tr><td>2</td><td>Tablespoons</td><td>lemon juice</td></tr><tr><td>1/2</td><td>teaspoon</td><td>ground black pepper</td></tr></table>',
    '<div id="notes"> <p>Notes: We usually use chicken thighs for this dish, but you can use any chicken pieces that you like. If you are using boneless chicken, then use about 1 1/2 pounds of meat. If you want this dish to be hotter, add a red jalapeño to the mix - if you just add one, it\'s still not that hot.</p> </div>',
    '<div id="nutrition"> <p>Per serving: 608 calories, 35g fat, 53g protein, 12g carbohydrates, 3.6g dietary fiber, 239mg cholesterol, 1414mg sodium</p> </div>',
    '4',
    'Indian Cooking',
    ['bell pepper'],
    '0:45',
    'Chicken in a Sweet Red Pepper Sauce (lal Masale Wali Murgh)'
    ));

    recipes.push(new Recipe('blackeyedpeasoup',
    'https://storage.googleapis.com/recipe-photos/blackeyedpeasoup.jpg',
    '<p>This recipe came to us from Linda Thompson, Steve\'s cousin. It exactly as she said: "nice and easy and so good." Of course, we modified the recipe slightly; you can see our variations in the notes. Steve sometimes adds ground beef, but we both like to add ham.</p> <p>If you don\'t have canned black-eyed peas, you can use dried peas. Soak and cook 2 cups of dried black-eyed peas, then use them in recipe in place of the canned. They should be cooked until done but still firm.</p>', 
    ['soup', 'beans'],   
    '<p>Sauté onion, garlic, and bacon in a large pot. Add remaining ingredients and simmer for 1 hour. Season to taste.</p>', 
    '<table id="ingredients-table"> <tr> <td>1</td><td>large</td><td>onion, chopped</td></tr><tr><td>1</td><td>clove</td><td>garlic, minced</td></tr><tr><td>4</td><td>slices</td><td>bacon, cut in 1-inch pieces</td></tr><tr><td>3</td><td>cups</td><td>beef stock</td></tr><tr><td>2</td><td>cans</td><td>black-eyed peas, rinsed and drained</td></tr><tr><td>1</td><td>medium</td><td>jalapeño, chopped</td></tr><tr><td>1</td><td>can</td><td>diced tomatoes, with juice</td></tr><tr><td>1</td><td>can</td><td>Rotel, with juice</td></tr> </table>', 
    '<div id="notes"> <p>The original recipe called for 1 can of plain black-eyed peas and one can of black-eyed peas with jalapeños. It also used 2 cans of stewed tomatoes or Rotel; using only stewed tomatoes would obviously make the dish milder. I like to add ham to this recipe, especially since I often cook this for New Year\'s Day and I usually have leftover ham with a bone. Steve adds a pound of browned ground beef to this recipe instead of ham. Personally, I don\'t see the need for that, but if you do, you will need to adjust the seasonings a bit, since ground beef is not seasoned.</p> </div>', 
    '<div id="nutrition"> <p>Per serving: 251 calories, 6g fat, 6g protein, 42g carbohydrates, 1.0g dietary fiber, 2mg cholesterol, 408mg sodium</p> </div>', 
    '4', 
    'Linda Thompson', 
    ['peas'],
    '1:15', 
    'Black-Eyed Pea Soup'
     ));

    recipes.push(new Recipe('chili',
    'https://storage.googleapis.com/recipe-photos/chili.jpg',
    '<p>This is supposed to be Jessica\'s grandmother\'s recipe. It is the best chili recipe that I\'ve ever had.</p>',
    ['beef'],
    '<p>Drain kidney beans and rinse. Let sit in sieve until needed.</p><p>Brown meat in a large heavy skillet. Remove meat, but leave a oil behind.</p><p>Sauté onion in skillet until soft. Return meat to skillet. Add chili powder, cumin, and garlic. Mix well.</p> <p>Mix in remaining ingredients. Bring to a good rolling boil, then simmer on low heat for at least one hour. Stir occasionally and add water if needed. </p>',
    '<table id="ingredients-table"> <tr> <td>1</td><td>lb.</td><td>ground beef chuck</td></tr><tr><td>1</td><td>large</td><td>onion, chopped</td></tr><tr><td>3</td><td>Tablespoons</td><td>Gebhardt\'s chili powder</td></tr><tr><td>1</td><td>teaspoon</td><td>ground cumin</td></tr><tr><td>1/2</td><td>clove</td><td>garlic, minced</td></tr><tr><td>6</td><td>ounces</td><td>tomato paste</td></tr><tr><td>30</td><td>ounces</td><td>canned kidney beans</td></tr><tr><td>a</td><td>pinch</td><td>sugar</td></tr><tr><td>1</td><td>teaspoon</td><td>salt, or to taste</td></tr><tr><td>10</td><td>ounces</td><td>water</td></tr></table>',
    '<div id="notes"> <p>Gebhardt\'s chili powder is worth hunting down - Steve didn\'t believe me until he tried it himself. If you like more tomatoes in your chili, you can add them, or even a can of Rotel. Jessica\'s father just hated tomatoes in general. I guess it was a family trait, although Jessica enjoys them now that she is an adult.</p> </div>',
    '<div id="nutrition"> <p>Per serving: 544 calories, 16g fat, 36g protein, 70g carbohydrates, 13.5g dietary fiber, 78mg cholesterol, 1504mg sodium</p> </div>',
    '4',
    'Kelly Hale',
    ['beans'],
    '1:30',
    'Chili'
    ));

    recipes.push(new Recipe('featherpancakes',
    'https://storage.googleapis.com/recipe-photos/featherpancakes.jpg',
    '<p>This is the pancake recipe that I have used since the 1970s. It works every time and it makes nice, light pancakes.</p>',
    ['breads'],
    '<p>Sift together dry ingrdients into a small bowl. (Yes, the flour will have been sifted twice: once before you measure it, and once with the other dry ingredients.</p> <p>Combine liquids in a medium bowl. Mix in the dry ingredients and beat smooth. Dip batter with a 1/4 cup measure onto a preheated, lightly-oiled griddle.</p> <p>When the top of the pancake has holes where bubbles have popped and not refilled, check the bottom of the pancake. If it is browned to your taste, flip it. Cook until lightly browned on bottom, and pancake is cooked all the way through. Temperature and time will vary with your griddle and your taste.</p> <p>Keep pancakes warm in a low oven as you cook.</p>',
    '<table id="ingredients-table"> <tr> <td>1</td><td>cup</td><td>flour, sifted</td></tr><tr><td>2</td><td>Tablespoons</td><td>baking powder</td></tr><tr><td>2</td><td>Tablespoons</td><td>sugar</td></tr><tr><td>1/2</td><td>teaspoon</td><td>salt</td></tr><tr><td>1</td><td>large</td><td>egg, beaten</td></tr><tr><td>1</td><td>cup</td><td>milk</td></tr><tr><td>2</td><td>Tablespoons</td><td>vegetable oil</td></tr></table>',
    '<div id="notes"> <p>The only problem I\'ve ever had with this recipe is over-active baking powder. Some brands may cause the batter to balloon up so much that it can\'t be ladled onto the griddle. If this happens, stir the batter lightly to release the excess air bubbles. And next time, cut the baking powder down - a tablespoon may be enough. [For Rumford Baking Powder, I only use 2 teaspoons.]</p> </div>',
    '<div id="nutrition"> <p>Per serving: 342 calories, 13g fat, 9g protein, 47g carbohydrates, 1.0g dietary fiber, 70mg cholesterol, 1421mg sodium</p> </div>',
    '3',
    'Better Homes and Gardens',
    ['pancakes'],
    '0:05 plus cooking',
    'Feather Pancakes'
    ));

    recipes.push(new Recipe('masaledarbasmati',
    'https://storage.googleapis.com/recipe-photos/masaledarbasmati.jpg',
    '<p>This is the Indian rice that I cook most often. It is very fragrant but does not overpower other dishes.</p>',
    ['rice', 'indian'],
    '<p>Wash rice in several changes of water, until most of the starch is removed. Drain and place in a medium bowl. Add 5 cups of water and let soak for 30 minutes.</p> <p>Drain rice in sieve for 20 minutes.</p> <p>Heat oil in a heavy saucepan over medium heat. When hot, add onion; stir and fry until slightly browned. Add rice, pepper, garlic, garam masala, and salt. Stir gently for 3 to 4 minutes. (If rice sticks, turn down the heat slightly.)</p> <p>Add stock and bring to boil. Cover with a very tight-fitting lid. Turn heat very, very low and cook for 25 minutes. (Or, bake in a preheated 325 degree F oven for 25 minutes.) Fluff gently with fork.</p>',
    '<table id="ingredients-table"> <tr> <td>2</td><td>cups</td><td>basmati rice</td></tr><tr><td>3</td><td>Tablespoons</td><td>vegetable oil</td></tr><tr><td>1</td><td>small</td><td>onion, peeled and finely chopped</td></tr><tr><td>1/2</td><td>medium</td><td>serrano pepper, seeded and finely chopped</td></tr><tr><td>1/2</td><td>teaspoon</td><td>garlic, finely minced</td></tr><tr><td>1/2</td><td>teaspoon</td><td>garam masala</td></tr><tr><td>1</td><td>teaspoon</td><td>salt</td></tr><tr><td>2 2/3</td><td>cups</td><td>chicken stock</td></tr></table>',
    '<div id="notes"> <p>I put a piece of aluminum foil over the saucepan, and then press the lid onto it. This gives a very tight seal.</p> </div>',
    '<div id="nutrition"> <p>Per serving: 608 calories, 35g fat, 53g protein, 12g carbohydrates, 3.6g dietary fiber, 239mg cholesterol, 1414mg sodium</p></div>',
    '8',
    'Indian Cooking',
    ['basmati'],
    '1:30 including soaking',
    'Masaledar Basmati (Spiced Basmati Rice)'
    ));

    var catNames = ['Beans', 'Beef', 'Breads', 'Cakes', 'Cheese', 'Chicken and Poultry', 'Cookies', 'Eggs', 
    'Fish', 'Indian Cooking', 'Pasta', 'Pies', 'Pork', 'Potatoes', 'Rice and Grains', 'Soup', 'Vegetables'];
    var catIds = ['beans', 'beef', 'breads', 'cakes', 'cheese', 'chicken', 'cookies', 'eggs',
    'fish', 'indian', 'pasta', 'pies', 'pork', 'potatoes', 'rice', 'soup', 'vegetables'];
    var i;

    for (i=0; i<catIds.length; i++) {
        categories.push(new Category(catIds[i], catNames[i]));
    }
}