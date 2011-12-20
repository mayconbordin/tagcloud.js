Usage
=====

Instantiate the object
----------------------

`var tagcloud = new TagCloud(container, options);`

container: element object or a string for the id.
options: an object with the following attributes:

* sortstyle: There are 4 sorting options: "random", "ascending", descending" and "". This determines the order the tags will be drawn in. For example, "ascending" will cause the smallest tags to be drawn first resulting in the larger tags being furtherest from the center of the cloud. Sending through a blank string will render the tags in the order they were added.
* colors: This is a single colour object, or an array of colours. If you pass an array, the each tags colour will be randomly selected from that array. A colour should be passed through as {r:0,g:0,b:0}. The number can be between 0 and 255. The previous example would result in black circles. For red circles you would send {r:255,g:0,b:0} or for a mix of blue and yellow circles, pass through the array [{r:255,g:255,b:0},{r:0,g:0,b:255}].
* highlightcolors: Again, a single colour object, or an array of colours. This is the color or colors the circles will turn when you hover over them with the mouse.
* url: The base url clicking on a tag will link to. The name of the tag will be appended to this stub. So to link to a Technorati tag page you would pass through "http://technorati.com/tag/".
* duration: the interval in milliseconds between the creation of each node.
* scale: the scale of the bubbles.


Add the tags
------------

`tagcloud.addNode(name, size);`

name: string with the tag name.
size: the integer value of the tag, to reflect the bubble size.


Draw
----

`tagcloud.draw();`

Will draw the added tags in the given container.


Clear
-----

`tagcloud.clear();`

Remove all the tags added and clear the drawn canvas.
