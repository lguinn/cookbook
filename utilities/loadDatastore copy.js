// loadDatastore.js

// to run under nodeJS
// reads cat.txt and recipes.txt and loads the data into Datastore
// categories.txt => Kind: Category
// recipes.txt => Kind: Recipe with ancestor: Category

const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');
const os = require('os');

function Recipe(id = '', cat = [], directions = '', ingredients = '', tags = [], title = '',
            notes = '', servings = '', source = '', time = '', introduction = '', yieldQty = '')  {
        this.id = id.toLowerCase();
        this.categories = categories;
        this.directions = directions;
        this.ingredients = ingredients;
        this.tags = tags;
        this.title = title;
        this.notes = notes;
        this.servings = servings;
        this.source = source;
        this.time = time;
        this.introduction = introduction;
        this.yieldQty = yieldQty;
}

function Category(id, name) {
    this.id = id;
    this.name = name;
}

function categoryExists(catName) {
    var i;
    for (i=0; i < categories.length; i++) {
        if (catName == categories[i].id) {
            return true;
        }
    }
    return false;
}

function addTag(inputStr) { // adds the tag if it doesn't exist
    if (!tags.includes(inputStr)) {
        tags.push(inputStr);
    }

}

function getKey(inputStr) {
    var endPos = inputStr.search(":");
    if (endPos < 0) {             // not found
        return null;
    }
    var startPos = 0;
    endPos = endPos - 1;
    if (endPos >= startPos) {
        return inputStr.slice(startPos,endPos);
    }
    return null;
}

function getText(inputStr) {
    inputStr = inputStr.trim();
    if (inputStr == '<TEXT></TEXT>') {
        return '';
    }
    var startPos = inputStr.search("<TEXT>");
    if (startPos < 0) {
        return null;
    }
    startPos = startPos + 6;
    var newString = inputStr.slice(startPos);
    var endPos = newString.search("</TEXT>");
    if (endPos > 0 ) {
        return newString.slice(0, endPos);  
    }
    else {
        if (newString == '</TEXT>') {
            return '';
        }
        return inputStr.slice(startPos);
    }
}

function getArray(inputStr) {
    inputStr = inputStr.trim();
    var startPos = inputStr.search("\\[");
    if (startPos < 0) {
        return null;
    }
    startPos = startPos + 1;
    var newString = inputStr.slice(startPos);
    var endPos = newString.search("]");
    if (endPos < 0 ) {
        console.log('malformed array = ', inputStr);
        return null;
    }

    newString = newString.slice(0, endPos);
    newString = newString.trim();
    if (newString.length < 1) { // the array is empty 
        return [];
    }
    startPos = 0;
    var result = [];
    while (startPos < newString.length) {
        startPos = newString.search('"');
        if (startPos < 0) { // no more items
            return result;
        } else {
            startPos = startPos + 1;
            newString = newString.slice(startPos);
            endPos = newString.search('"');
            if (endPos <= startPos) {
                console.log('malformed array = ', inputStr);
                return result;
            }
            result.push(newString.slice(0, endPos).toLowerCase());
            if (newString.length > endPos) {
                newString = newString.slice(endPos + 1);
            } else {
                newString = '';
            }
            startPos = 0;
        }
    }
    return result;
}

function storeData(recipe, key, text) {
    switch (key) {
        case 'id':
            recipe.id = text.toLowerCase();
            break;
        case 'directions':
            recipe.directions = text;
            break;
        case 'ingredients':
            recipe.ingredients = text;
            break;
        case 'title':
            recipe.title = text;
            break;
        case 'notes':
            recipe.notes = text;
            break;
        case 'servings':
            this.servings = text;
            break;
        case 'source':
            recipe.source = text;
            break;
        case 'time':
            recipe.time = text;
            break;
        case 'introduction':
            recipe.introduction = text;
            break;
        case 'yield':
            recipe.yieldQty = text;
            break;
        default:
            console.log('Unknown key ' + key + ' text: ' + text);  
    }
}

var recipes = [];
var categories = [];
var tags = [];
var data = [];
var i;
inBlock = false;                    // used to track when we are in the middle of a multiline-block
currentText = '';
currentKey = '';
currentArray = [];

var filename = path.join(__dirname, '/categories.txt');
try {
  const fileContents = fs.readFileSync(filename, 'utf8');
  data = yaml.loadAll(fileContents);
} catch (err) {
  console.error(err)
}

for (i=0; i<data.length; i++) {
    cat = new Category(data[i].id, data[i].name);
    categories.push(cat);
}

var filename = path.join(__dirname, '/recipes.txt');
try {
    //data = fs.readFileSync(filename, 'utf8');
    data = String(fs.readFileSync(filename)).split(os.EOL);
  } catch (err) {
    console.error(err);
  }

for (i=0; i<data.length; i++) {
    if (data[i] == '---') {
        if (i > 0) {    
            // store the last recipe unless this is the first item
            recipes.push(currentRecipe);
            currentRecipe.tags.forEach(element => {
                addTag(element);
            });
        }
        // start a new recipe
        currentRecipe = new Recipe();
    }
    else {
        if (inBlock) {
            // Get text and check for block end
            pos = data[i].search("</TEXT>");
            if (pos < 0) {
                // not at the end of the text yet, just append this line to the text
                currentText = currentText + ' ' + data[i];
            }
            else {
                if (pos > 1) {  // Don't bother unless there is more than </TEXT> on this line
                    currentText = currentText + ' ' + data[i].slice(0,pos);
                }
                storeData(currentRecipe, currentKey, currentText);
                currentKey = '';
                currentText = '';
                inBlock = false;
            }
        }
        else { // not in the middle of a block and not ---, should be a key
            currentKey = getKey(data[i]);  
            if (currentKey == 'categories' || currentKey == 'tags') { // the value must be array
                currentArray = getArray(data[i]);
                if (currentKey == 'categories') { currentRecipe.categories = currentArray; }
                if (currentKey == 'tags') { currentRecipe.tags = currentArray; } 
                currentKey = '';
                currentText = '';
                inBlock = false;
            } else { // the value is text
                currentText = getText(data[i]);
                if (data[i].search("</TEXT>") > 0 ) {   // this is a single line item and we are done
                    storeData(currentRecipe, currentKey, currentText);
                    currentKey = '';
                    currentText = '';
                    inBlock = false;
                }
                else {
                    inBlock = true;
                }
            }
        }
    }
}

// time to show what we have

for (i=0; i<recipes.length; i++) {
    recipes[i].categories.forEach(element => {
        if (!categoryExists(element)) { 
            console.log('Missing category ' + element);
        }
    });
}

tags.forEach(element => {
    console.log(element);
});

//console.log(categories.length, ' categories, ', recipes.length, ' recipes, ', tags.length, ' tags');


