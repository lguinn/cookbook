#TODO: preserve newlines inside strings, but not otherwise

import re

catregexPattern = '<key>NAME</key>.*?<string>(?P<cat>.*?)</string>'

ingredientPattern = ('<key>DESCRIPTION</key>.*?<string>(?P<ingredient>.*?)</string>.*?' +
        '<key>DIRECTION</key>.*?<string>(?P<direction>.*?)</string>.*?' +
        '<key>MEASUREMENT</key>.*?<string>(?P<measurement>.*?)</string>.*?' +
        '<key>QUANTITY</key>.*?<string>(?P<quantity>.*?)</string>.*?')

timePattern = ('<key>AMOUNT</key>.*?<integer>(?P<hrs>.*?)</integer>.*?' + 
        '<key>AMOUNT_2</key>.*?<integer>(?P<mins>.*?)</integer>')

def parseCategories(inputStr):
    categories = []
    c = re.search('<key>CATEGORIES</key>.*?<array>(?P<categorylist>.*?)<array>', inputStr, re.DOTALL)
    if c:
        result = c.group('categorylist')
        if result:
            catList = re.findall(catregexPattern, result, re.DOTALL)
            for item in catList:
                categories.append(item)
    return categories

def parseDirections(inputStr):
    d = re.search('<key>DIRECTIONS</key>.*?<string>(?P<directions>.*?)</string>', inputStr, re.DOTALL)
    if d:
        result = d.group('directions')
        if result:
            return parseParagraphs(result)
    return ''

def parseTimes(inputStr):
    arry = re.search('<key>PREP_TIMES</key>.*?<array>.*?<dict>(?P<times>.*?)', inputStr, re.DOTALL)
    if arry:
        result = arry.group('times')
        t = re.search(timePattern, result, re.DOTALL)
        if t:
            outputStr = t.group('hrs') + ':' + t.group('mins')
            return outputStr
    return ''

def parseParagraphs(inputStr):
    lines = inputStr.splitlines()
    outputStr = ''
    for l in lines:
        outputStr = outputStr + '<p>' + l + '</p>\n'
    return outputStr

def parseKeywords(inputStr):
    k = re.search('<key>KEYWORDS</key>.*?<string>(?P<keywords>.*?)</string>', inputStr, re.DOTALL)
    if k:
        result = k.group('keywords')
        return result.split()
    return ''

def parseIngredients(inputStr):
    result = re.search('<key>INGREDIENTS</key>.*?<array>(?P<ingredientslist>.*?)<array>', 
        inputStr, re.DOTALL)
    if result:
        outputStr = '<table id="ingredients-table">'

        newStr = result.group('ingredientslist')
        #make it one big string
        newStr = " ".join(newStr.splitlines())
        #split it based on </dict>
        iList = re.split('</dict>',newStr)
        #each line is now one ingredient
        for line in iList:
            result =  re.search(ingredientPattern, line, re.DOTALL)
            if result:
                ingredient = result.group('ingredient')
                direction = result.group('direction')
                if direction != '':
                    ingredient = ingredient + ', ' + direction
                measurement = result.group('measurement')
                quantity = result.group('quantity')
                outputStr = (outputStr + ' <tr><td>' + quantity + '</td>' +
                    '<td>' + measurement + '</td>' +
                    '<td>' + ingredient + '</td></tr>')
        outputStr = outputStr + '</table>'
        return outputStr

def parseId(inputStr):       # creating an Id for the recipe by compressing the name
    outputStr = "".join(inputStr.split())
    return outputStr.strip()

def parseIntro(inputStr):
    n = re.search('<key>SUMMARY</key>.*?<string>(?P<introduction>.*?)</string>', inputStr, re.DOTALL)
    if n:
        result = n.group('introduction')
        if result:
            return  parseParagraphs(result) 
    return ''

def parseNotes(inputStr):
    n = re.search('<key>NOTE</key>.*?<string>(?P<notes>.*?)</string>', inputStr, re.DOTALL)
    if n:
        result = n.group('notes')
        if result:
            return '<div id="notes">' +  parseParagraphs(result) + '</div>'
    return ''

def parseServings(inputStr):
    s = re.search('<key>SERVINGS</key>.*?<integer>(?P<servings>.*?)</integer>', inputStr, re.DOTALL)
    if s:
        result = s.group('servings')
        if result:
            return result
    return ''

def parseSource(inputStr):
    s = re.search('<key>SOURCE</key>.*?<string>(?P<source>.*?)</string>', inputStr, re.DOTALL)
    if s:
        result = s.group('source')
        if result:
            return result
    return ''

def parseTitle(inputStr):
    t = re.search('<key>MEASUREMENT_SYSTEM</key>.*?<key>NAME</key>.*?<string>(?P<title>.*?)</string>', 
            inputStr, re.DOTALL)
    if t:
        result = t.group('title')
        if result:
            return result
    return ''

def parseYield(inputStr):
    y = re.search('<key>YIELD</key>.*?<string>(?P<yield>.*?)</string>', inputStr, re.DOTALL)
    if y:
        result = y.group('yield')
        if result:
            return result
    return ''

def parseXML(rxml):
    categories = parseCategories(rxml)
    directions =  parseDirections(rxml)
    ingredients = parseIngredients(rxml)
    keywords = parseKeywords(rxml)
    title = parseTitle(rxml)
    id = parseId(title)
    notes = parseNotes(rxml)
    times = parseTimes(rxml)
    servings = parseServings(rxml)
    source = parseSource(rxml)
    introduction = parseIntro(rxml)
    yieldstr = parseYield(rxml)
    return {
        'id' : id,
        'categories' : categories,      # as array
        'directions' : directions,
        'ingredients' : ingredients,
        'tags' : keywords,               # as array
        'title' : title,
        'notes' : notes,
        'servings' : servings,
        'source' : source,
        'time' : times,
        'introduction' : introduction,
        'yield' : yieldstr
    }
        #key = client.key("Task")
        #task = datastore.Entity(key)
        #task.update({"tags": ["fun", "programming"], "collaborators": ["alice", "bob"]})

count = 0
filecount = 0
recipeXML = ''
mgFile = open('/Users/lguinn/Desktop/MacGourmetExport.xml','r')
Lines = mgFile.readlines()
recipeFile = open('recipe.txt','w')
depth = -1
for line in Lines:
    count = count + 1
    data = line.strip()
    if data:            #skip blank lines if any
        if depth > 0:
            # we are in the middle of a recipe
            if data == '<dict>':
                depth = depth + 1
            elif data == '</dict>':
                depth = depth - 1
            recipeXML = recipeXML + data + '\n'
        else:
            if depth == 0:
                # finish the prior set by parsing and writing it
                myrecipe = parseXML(recipeXML)
                outputStr = '"id":"' + myrecipe['id'] + '"\n'
                recipeFile.write(outputStr)
                for i in myrecipe.items():
                    if i[0] != 'id':
                        if isinstance(i[1], list):
                            outputStr = '"' + i[0] + '" : [ '
                            myList = i[1]
                            length = len(myList) 
                            for j in range(length):
                                outputStr = outputStr + '"' + myList[j] + '"'
                                if j < length - 1:
                                    outputStr = outputStr + ', '
                            outputStr = outputStr + ' ]\n'
                        else:
                            outputStr = '"' + i[0] + '" : "' + i[1] + '"\n'
                        recipeFile.write(outputStr)
                #recipeFile.close()                  # a separate file for each recipe
                #filecount = filecount + 1
                #fileName = 'recipe' + str(filecount) + '.txt'
                #recipeFile = open(fileName,'w')
            depth = 1                               # because initially it is -1
            recipeXML = data
            if data !=  '<dict>':
                print('Unexpected value: ',data, ' at ', count)
                exit(1)
recipeFile.close()