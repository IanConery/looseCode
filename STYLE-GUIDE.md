### Indentation

When writing any block of code that is logically subordinate to the line immediately before and after it, that block should be indented two spaces more than the surrounding lines

* We use two spaces, we do not use tabs. Convert your tabs to spaces.
* Do not put any tab characters anywhere in your code. We use spaces, two of them.
* Increase the indent level for all blocks by two extra spaces.
    * When a line opens a block, the next line starts 2 spaces further in than the line that opened

        ```javascript
        // good:
        if(condition){
          action();
        }

        // bad:
        if(condition){
        action();
        }
        ```

    * When a line closes a block, that line starts at the same level as the line that opened the block.
        ```javascript
        // good:
        if(condition){
          action();
        }

        // bad:
        if(condition){
          action();
          }
        ```

    * No two lines should ever have more or less than 2 spaces difference in their indentation. Any number of mistakes in the above rules could lead to this, but one example would be:

        ```javascript
        // bad: b looks like a child of a, however it isn't, they are siblings
        transmogrify({
          a: {
            b: function(){
            }
        }});
        ```



### Variable names

* A single descriptive word is best. But anything logicaly named works for me.

    ```javascript
    // good:
    var animals = ['cat', 'dog', 'fish'];

    // bad:
    var targetInputs = ['cat', 'dog', 'fish'];
    ```

* Collections such as arrays and maps should have plural noun variable names.

    ```javascript
    // good:
    var animals = ['cat', 'dog', 'fish'];

    // bad:
    var animalList = ['cat', 'dog', 'fish'];

    // bad:
    var animal = ['cat', 'dog', 'fish'];
    ```

* Name your variables after their purpose, not their structure

    ```javascript
    // good:
    var animals = ['cat', 'dog', 'fish'];

    // bad:
    var array = ['cat', 'dog', 'fish'];
    ```


### Language constructs

* Do not use `for...in` statements with the intent of iterating over a list of numeric keys. Use a normal for loop instead.

  ```javascript
  // good:
  var list = ['a', 'b', 'c']
  for(var i = 0; i < list.length; i++){
    alert(list[i]);
  }

  // bad:
  var list = ['a', 'b', 'c']
  for(var i in list){
    alert(list[i]);
  }
  ```

* Never omit braces for statement blocks (although they are technically optional).
    ```javascript
    // good:
    for(key in object){
      alert(key);
    }

    // bad:
    for(key in object)
      alert(key);
    ```

* Always use `===` and `!==`, since `==` and `!=` will automatically convert types in ways you're unlikely to expect.
* Unless you are ABSOLUTELY positive you know what you are doing and you can explain how it works to a five year old.

    ```javascript
    // good:

    // this comparison evaluates to false, because the number zero is not the same as the empty string.
    if(0 === ''){
      alert('looks like they\'re equal');
    }

    // bad:

    // This comparison evaluates to true, because after type coercion, zero and the empty string are equal.
    if(0 == ''){
      alert('looks like they\'re equal');
    }
    ```

* I prefer function expressions over function declarations, obviously there are times when it makes sense to use declarations. I am not against them, so do what you will but I may ask you to fix/change your code to match the style.

    ```javascript
    // good:
    var go = function(){...};

    // not my favorite:
    function stop(){...};
    ```


### Semicolons

* Don't forget semicolons at the end of lines. There will be no discussion about this. We are not going to rely on the interpreter to put them where they belong for us.

  ```javascript
  // good:
  alert('hi');

  // bad:
  alert('hi')
  ```

* Semicolons are not required at the end of statements that include a block--i.e. `if`, `for`, `while`, etc.


  ```javascript
  // good:
  if(condition){
    response();
  }

  // bad:
  if(condition){
    response();
  };
  ```

* Misleadingly, a function may be used at the end of a normal assignment statement, and would require a semicolon (even though it looks rather like the end of some statement block).

  ```javascript
  // good:
  var greet = function(){
    alert('hi');
  };

  // bad:
  var greet = function(){
    alert('hi');
  }
  ```

# Supplemental reading

### Code density

* Conserve line quantity by minimizing the number lines you write in. The more concisely your code is written, the more context can be seen in one screen.
* Conserve line length by minimizing the amount of complexity you put on each line. Long lines are difficult to read. Rather than a character count limit, I recommend limiting the amount of complexity you put on a single line. Try to make it easily read in one glance. This goal is in conflict with the line quantity goal, so you must do your best to balance them.

### Comments

* Provide comments any time you are confident it will make reading your code easier.
* Comment on what code is attempting to do, not how it will achieve it.
* A good comment is often less effective than a good variable name.


### Padding & additional whitespace

* Generally, I don't care where you put extra spaces, provided they are not distracting.
* You may use it as padding for visual clarity. If you do though, make sure it's balanced on both sides.

    ```javascript
    // optional:
    alert( "I chose to put visual padding around this string" );

    // bad:
    alert( "I only put visual padding on one side of this string");
    ```

* Please do not align things visually using spaces, DO NOT do this. This pattern usually leads to unnecessary edits of many lines in your code every time you change a variable name. It also doesn't look as pretty as you would think.

    ```javascript
    // strongly discouraged:
    var firstItem  = getFirst ();
    var secondItem = getSecond();
    ```

* Put `else` and `else if` statements on the same line as the ending curly brace for the preceding `if` block.
    ```javascript
    // good:
    if(condition){
      response();
    }else{
      otherResponse();
    }

    // bad:
    if(condition){
      response();
    }
    else{
      otherResponse();
    }
    ```



### Working with files

* Github will handle end of file complexity most of the time. If you don't understand this and the following bullet, don't worry about it, you will probably be fine.
* Do not end a file with any character other than a newline. This is not a problem if you have [configured git correctly][] and you are using the [.editorconfig](https://github.com/Controlco/looseCode/blob/master/.editorconfig) file.
* My personal preference is to not use the -a or -m flags with git commit. Do what you want however. I would suggest that you do it my way until you are completely comfortable with git.

    ```shell
    # good:
    > git add .
    > git commit
    [save edits to the commit message file using the text editor that opens, by default vi]

    # discouraged:
    > git commit -a
    [save edits to the commit message file using the text editor that opens]

    # discouraged:
    > git add .
    > git commit -m "updated algorithm"
    ```


### Opening or closing too many blocks at once

* The more blocks you open on a single line, the more others need to remember about the context of what they are reading. A good rule is to avoid closing more than two blocks on a single line--three in a pinch.

    ```javascript
    // avoid:
    _.ajax(url, {success: function(){
      // ...
    }});

    // prefer:
    _.ajax(url, {
      success: function(){
        // ...
      }
    });
    ```


### Variable declaration

* You MUST use a new var statement for each line you declare a variable on.
* DO NOT break variable declarations onto mutiple lines (separated with commas). I hate this.
* Use a new line for each variable declaration.
* See http://benalman.com/news/2012/05/multiple-var-statements-javascript/ for more details

    ```javascript
    // good:
    var ape;
    var bat;

    // bad, DO NOT do this:
    var cat,
        dog

    // you better have a good reason to do this:
    var eel, fly;
    ```

### Capital letters in variable names

* Some people choose to use capitalization of the first letter in their variable names to indicate that they contain a [class][]. This capitalized variable might contain a function, a prototype, or some other construct that acts as a representative for the whole class.
* Optionally, some people use a capital letter only on functions that are written to be run with the keyword `new`.
* In JavaScript the above two items are usually the same. But, I prefer to use psuedo-classical instantiation.
* Do not use all-caps for any variables.


### Minutia

* Don't rely on JavaScripts implicit global variables. If you are intending to write to the global scope, export things to `window.*` explicitly instead.

    ```javascript
    // good:
    var overwriteNumber = function(){
      window.exported = Math.random();
    };

    // bad:
    var overwriteNumber = function(){
      exported = Math.random();
    };
    ```

* For lists, put commas at the end of each newline, not at the beginning of each item in a list

    ```javascript
    // good:
    var animals = [
      'ape',
      'bat',
      'cat'
    ];

    // bad:
    var animals = [
        'ape'
      , 'bat'
      , 'cat'
    ];
    ```

* Avoid use of `switch` statements altogether. They are hard to outdent using the standard whitespace rules above, and are prone to error due to missing `break` statements.

* Use single quotes around JavaScript strings, rather than double quotes. Having a standard of any sort is preferable to a mix-and-match approach, and single quotes allow for easy embedding of HTML, which prefers double quotes around tag attributes.

    ```javascript
    // good:
    var dog = 'dog';
    var cat = 'cat';

    // acceptable:
    var dog = "dog";
    var cat = "cat";

    // bad:
    var dog = 'dog';
    var cat = "cat";
    ```


### HTML

* Do not include a `type=text/javascript"` attribute on script tags, it is not neccessary.

    ```html
    <!-- good -->
    <script src="a.js"></script>

    <!-- bad -->
    <script src="a.js" type="text/javascript"></script>
    ```


<!--links-->
[configured git correctly]: https://help.github.com/articles/dealing-with-line-endings/
[class]: https://en.wikipedia.org/wiki/Class_(computer_programming)