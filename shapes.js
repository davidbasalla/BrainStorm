// By Simon Sarris
// www.simonsarris.com
// sarris@acm.org
//
// Last update December 2011
//
// Free to use and distribute at will
// So long as you are nice to people, etc

// Constructor for Shape objects to hold data for all drawn objects.
// For now they will just be defined as rectangles.
function Shape(x, y, shape, text) {
  // This is a very simple and unsafe constructor. All we're doing is checking if the values exist.
  // "x || 0" just means "if there is a value for x, use that. Otherwise use 0."
  // But we aren't checking anything else! We could put "Lalala" for the value of x 

    this.x = x || 0;
    this.y = y || 0;

    this.text = text || "testText";
    this.shape = shape || "square";
    this.fill = '#CCCCCC';
    this.lineWidth = 2;

    if(this.shape === 'square'){
	this.w = 100;
	this.h = 50;
    }
    if(this.shape === 'circle'){
	this.w = 100;
	this.h = 50;
    }

    var connectWidth = 10;
    this.connector = new Connector(this.x + this.w/2.0 - connectWidth/2.0, 
				   this.y + this.h, 
				   connectWidth);


}


Shape.prototype.move = function(x, y){

    var oldX = this.x;
    var oldY = this.y;

    this.x = x;
    this.y = y;

    var connectorOldX = this.connector.x;
    var connectorOldY = this.connector.y;
    var connectorOldTargetX = this.connector.targetX;
    var connectorOldTargetY = this.connector.targetY;


    offsetX = this.x - oldX;
    offsetY = this.y - oldY;

    this.connector.x = connectorOldX + offsetX;
    this.connector.y = connectorOldY + offsetY;
    this.connector.targetX = connectorOldTargetX + offsetX;
    this.connector.targetY = connectorOldTargetY + offsetY;

}





// Draws this shape to a given context
Shape.prototype.draw = function(ctx) {

    if (this.shape === "square"){
	
	ctx.save();

	ctx.beginPath();
	ctx.rect(this.x, this.y, this.w, this.h);
	ctx.fillStyle = this.fill;

	ctx.shadowColor = "#999";
	ctx.shadowBlur = 20;
	ctx.shadowOffsetX = 5;
	ctx.shadowOffsetY = 5;

	ctx.fill();
	ctx.closePath();

	ctx.restore();

	ctx.lineWidth = this.lineWidth;
	ctx.strokeStyle = '#003300';
	ctx.stroke();

	//draw the connect handle
	
	ctx.fillStyle = 'black';

	ctx.fillRect(this.connector.x, 
		     this.connector.y, 
		     this.connector.w, 
		     this.connector.w);


	}
    
    else if (this.shape === "circle"){

	ctx.save()
	
	ctx.beginPath();
	ctx.arc(this.x, this.y, this.w/2, 0, 2 * Math.PI, false);
	ctx.fillStyle = this.fill;

	ctx.shadowColor = "#999";
	ctx.shadowBlur = 20;
	ctx.shadowOffsetX = 5;
	ctx.shadowOffsetY = 5;

	ctx.fill();
	ctx.closePath();

	ctx.restore();

	ctx.lineWidth = this.lineWidth;
	ctx.strokeStyle = '#003300';
	ctx.stroke();
	ctx.closePath();
	
	}
    
    var text = this.text;

    var offsetX = 0;
    var offsetY = 0;

    if (this.shape === "square"){
	offsetX = 10;
	offsetY = this.h/2.0;
    }
    else if (this.shape === "circle"){
	offsetX = -10;
    }

    ctx.font="20px Georgia";
    ctx.fillText(text, this.x + offsetX, this.y + offsetY);
    //var metrics = ctx.measureText(text);
    //var width = metrics.width;


}

// Determine if a point is inside the shape's bounds
Shape.prototype.contains = function(mx, my) {

    //need to extend for circle code

    if (this.shape === "circle"){
	return Math.pow(mx - this.x, 2) + Math.pow(my - this.y, 2) < Math.pow(this.w/2, 2);
    }

    else if (this.shape === "square"){
	return  (this.x <= mx) && (this.x + this.w >= mx) &&
            (this.y <= my) && (this.y + this.h >= my);
    }
}


// Connector class, attached to a shape
function Connector(x, y, w){

    this.x = x || 0;
    this.y = y || 0;
    this.targetX = x || 0;
    this.targetY = y || 0;

    this.w = w || 5;

}



// Determine if a point is inside the shape's bounds
Connector.prototype.contains = function(mx, my) {

    return  (this.x <= mx) && (this.x + this.w >= mx) &&
        (this.y <= my) && (this.y + this.w >= my);

}





function Connection(origShape, destShape){

    /* class for keeping track of connections,
       kept independent to avoid recursive objects */

    //original shape has to be there
    this.origShape = origShape;

    //dest shape is optional
    this.destShape = destShape || null;

    //custom coords in case of no destShape
    this.targetX = 0;
    this.targetY = 0;
    this.resetTarget();
}



Connection.prototype.draw = function(ctx){

    console.log('Connection.draw()');
    console.log(this.origShape);
    console.log(this.destShape);

    /* draw a line either between two shapes or between the original shape
       and a target position */

    origX = this.origShape.x + this.origShape.w/2.0;
    origY = this.origShape.y + this.origShape.h/2.0;

    if (this.destShape){
	destX = this.destShape.x + this.destShape.w/2.0;
	destY = this.destShape.y  + this.destShape.h/2.0;
    }
    else {
	destX = this.targetX;
	destY = this.targetY;
    }	

    ctx.beginPath();
    ctx.moveTo(origX, origY)
    ctx.lineTo(destX, destY);
    ctx.stroke();
    ctx.closePath();

}


Connection.prototype.setTarget = function(x, y) {
    
    this.targetX = x;
    this.targetY = y;
}


Connection.prototype.resetTarget = function() {
    
    this.targetX = this.origShape.connector.x;
    this.targetY = this.origShape.connector.y;
}







function CanvasState(canvas) {
    // **** First some setup! ****
  
    this.canvas = canvas;
    this.width = canvas.width;
    this.height = canvas.height;
    this.ctx = canvas.getContext('2d');
    // This complicates things a little but but fixes mouse co-ordinate problems
    // when there's a border or padding. See getMouse for more detail
    var stylePaddingLeft, stylePaddingTop, styleBorderLeft, styleBorderTop;
    if (document.defaultView && document.defaultView.getComputedStyle) {
	this.stylePaddingLeft = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingLeft'], 10)      || 0;
	this.stylePaddingTop  = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingTop'], 10)       || 0;
	this.styleBorderLeft  = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderLeftWidth'], 10)  || 0;
	this.styleBorderTop   = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderTopWidth'], 10)   || 0;
    }
    // Some pages have fixed-position bars (like the stumbleupon bar) at the top or left of the page
    // They will mess up mouse coordinates and this fixes that
    var html = document.body.parentNode;
    this.htmlTop = html.offsetTop;
    this.htmlLeft = html.offsetLeft;
    
    // **** Keep track of state! ****
    
    this.valid = false; // when set to false, the canvas will redraw everything
    this.shapes = [];  // the collection of things to be drawn
    this.connections = [];  // the collection of things to be drawn
    this.dragging = false; // Keep track of when we are dragging
    // the current selected object. In the future we could turn this into an array for multiple selection
    this.selection = null;
    this.hoverSelection = null;
    this.connectionSelection = null;

    this.dragoffx = 0; // See mousedown and mousemove events for explanation
    this.dragoffy = 0;
    
    // **** Then events! ****
    
    // This is an example of a closure!
    // Right here "this" means the CanvasState. But we are making events on the Canvas itself,
    // and when the events are fired on the canvas the variable "this" is going to mean the canvas!
    // Since we still want to use this particular CanvasState in the events we have to save a reference to it.
    // This is our reference!
    var myState = this;
    
    //fixes a problem where double clicking causes text to get selected on the canvas
    canvas.addEventListener('selectstart', function(e) { e.preventDefault(); return false; }, false);
    // Up, down, and move are for dragging

    canvas.addEventListener('mousedown', function(e) {

	var mouse = myState.getMouse(e);
	var mx = mouse.x;
	var my = mouse.y;


	if (myState.hoverSelection){

	    mySel = myState.hoverSelection;
	    myState.selection = mySel;

	    myState.dragoffx = mx - mySel.x;
	    myState.dragoffy = my - mySel.y;

	    myState.dragging = true;
	    myState.valid = false;
	    return;
	}


	var shapes = myState.shapes;
	var l = shapes.length;
	for (var i = l-1; i >= 0; i--) {

	    //check the connectors first
	    if (shapes[i].connector.contains(mx, my)){

		console.log('found connector');
		
		var mySel = new Connection(shapes[i]);
		myState.connectionDragging = true;
		myState.connectionSelection = mySel;
		myState.valid = false;
		return;
	    }
	    
	}



	// havent returned means we have failed to select anything.
	// If there was an object selected, we deselect it

	if (myState.selection) {
	    if (!myState.selection.contains(mx, my)){

		myState.selection = null;
		myState.valid = false; // Need to clear the old selection border
		}
	    }
    }, true);

    canvas.addEventListener('mousemove', function(e) {

	//detect shapes here
	//if shape found, set it to selected

	var mouse = myState.getMouse(e);
	var mx = mouse.x;
	var my = mouse.y;
	
	if (!myState.hoverSelection){

	    var shapes = myState.shapes;
	    var l = shapes.length;
	    for (var i = l-1; i >= 0; i--) {
		
		if (shapes[i].contains(mx, my)) {
		    // Keep track of where in the object we clicked
		    // so we can move it smoothly (see mousemove)

		    var mySel = shapes[i];		    
		    myState.hoverSelection = mySel;
		    myState.valid = false;
		    
		    return;
		}
	    }
	}
	//myState.selection = null;

	//check that current object still in mouse range
	else if (myState.hoverSelection){
	    if (!myState.hoverSelection.contains(mx, my)){
		myState.hoverSelection = null;
		myState.valid = false;
	    }
	}

	if (myState.connectionDragging){
	    var mouse = myState.getMouse(e);

	    myState.connectionSelection.setTarget(mouse.x, mouse.y);

	    //need to check here if another shape is detected underneath

	    myState.valid = false; // Something's dragging so we must redraw
	    }

	else if (myState.dragging){
	    // We don't want to drag the object by its top-left corner, we want to drag it
	    // from where we clicked. Thats why we saved the offset and use it here
	    
	    
	    //should wrap this in a function, since we need to move the connector too!
	    myState.selection.move(mouse.x - myState.dragoffx,
				   mouse.y - myState.dragoffy);
	    
	    //myState.selection.x = mouse.x - myState.dragoffx;
	    //myState.selection.y = mouse.y - myState.dragoffy;   
	    myState.valid = false; // Something's dragging so we must redraw
	}

    }, true);

    canvas.addEventListener('mouseup', function(e) {

	//if there is a shape underneath... create a connection!!
	//equally check if an ACTIVE shape is underneath!!
	//concept of active... when mouse is hovering over it!!


	myState.dragging = false;
	myState.connectionDragging = false;

	//need to clear the selected status and stop drawing the line
	//myState.selection = null;

	//reset the connector
	if (myState.connectionSelection){

	    if (myState.hoverSelection){
		console.log('make connection');
		myState.connectionSelection.destShape = myState.hoverSelection;

		myState.connections.push(myState.connectionSelection); 

	    }


	    myState.connectionSelection.resetTarget();
	}



	myState.connectionSelection = null;

	myState.valid = false; // Something's dragging so we must redraw

    }, true);

    // double click for making new shapes
    canvas.addEventListener('dblclick', function(e) {
	var mouse = myState.getMouse(e);
	myState.addShape(new Shape(mouse.x - 10, mouse.y - 10));
    }, true);
    
    // **** Options! ****
    
    this.selectionColor = '#CC0000';
    this.hoverColor = '#FF5555';
    this.hoverSelectedColor = '#EE4444';
    this.selectionWidth = 2;  
    this.interval = 15;
    setInterval(function() { myState.draw(); }, myState.interval);
}

CanvasState.prototype.addShape = function(shape) {
    this.shapes.push(shape);
    this.valid = false;
}

CanvasState.prototype.clear = function() {
    this.ctx.clearRect(0, 0, this.width, this.height);
}


// While draw is called as often as the INTERVAL variable demands,
// It only ever does something if the canvas gets invalidated by our code
CanvasState.prototype.draw = function() {
    // if our state is invalid, redraw and validate!
    if (!this.valid) {
	var ctx = this.ctx;
	var shapes = this.shapes;
	var connections = this.connections;
	this.clear();
	
	// ** Add stuff you want drawn in the background all the time here **
	
	// draw all shapes
	var l = connections.length;
	for (var i = 0; i < l; i++) {
	    var con = connections[i];
	    // We can skip the drawing of elements that have moved off the screen:
	    //if (con.x > this.width || shape.y > this.height ||
	    //shape.x + shape.w < 0 || shape.y + shape.h < 0) continue;
	    connections[i].draw(ctx);
	}



	// draw all shapes
	var l = shapes.length;
	for (var i = 0; i < l; i++) {
	    var shape = shapes[i];
	    // We can skip the drawing of elements that have moved off the screen:
	    if (shape.x > this.width || shape.y > this.height ||
		shape.x + shape.w < 0 || shape.y + shape.h < 0) continue;
	    shapes[i].draw(ctx);
	}




	
	
	// draw selection
	// right now this is just a stroke along the edge of the selected Shape
	if (this.selection != null) {
	    ctx.strokeStyle = this.selectionColor;
	    ctx.lineWidth = this.selectionWidth;
	    ctx.lineWidth = 5;
	    var mySel = this.selection;
	    
	    //SHOULD MOVE THIS INTO A FUNCTION OF THE OBJECT

	    if (mySel.shape === 'square')
		ctx.strokeRect(mySel.x,mySel.y,mySel.w,mySel.h);
	    else if (mySel.shape === 'circle'){
		ctx.beginPath();
		ctx.arc(mySel.x, mySel.y, mySel.w/2, 0, 2 * Math.PI, false);
		ctx.stroke();
		ctx.closePath();
	    }
	    
	    
	}

	// draw HOVER selection
	// right now this is just a stroke along the edge of the selected Shape
	if (this.hoverSelection != null) {

	    ctx.strokeStyle = this.hoverColor;	    
	    if (this.selection){
		if (this.selection === this.hoverSelection)
		    ctx.strokeStyle = this.hoverSelectedColor;
	    }

	    ctx.lineWidth = this.selectionWidth;
	    ctx.lineWidth = 5;
	    var mySel = this.hoverSelection;
	    
	    //SHOULD MOVE THIS INTO A FUNCTION OF THE OBJECT

	    if (mySel.shape === 'square')
		ctx.strokeRect(mySel.x,mySel.y,mySel.w,mySel.h);
	    else if (mySel.shape === 'circle'){
		ctx.beginPath();
		ctx.arc(mySel.x, mySel.y, mySel.w/2, 0, 2 * Math.PI, false);
		ctx.stroke();
		ctx.closePath();
	    }
	    
	    
	}




	//draw connector lines

	if (this.connectionSelection != null) {
	    var mySel = this.connectionSelection;
	    mySel.draw(ctx);
	}



	
	// ** Add stuff you want drawn on top all the time here **
	this.valid = true;
    }
}


// Creates an object with x and y defined, set to the mouse position relative to the state's canvas
// If you wanna be super-correct this can be tricky, we have to worry about padding and borders
CanvasState.prototype.getMouse = function(e) {
  var element = this.canvas, offsetX = 0, offsetY = 0, mx, my;
  
  // Compute the total offset
  if (element.offsetParent !== undefined) {
    do {
      offsetX += element.offsetLeft;
      offsetY += element.offsetTop;
    } while ((element = element.offsetParent));
  }

  // Add padding and border style widths to offset
  // Also add the <html> offsets in case there's a position:fixed bar
  offsetX += this.stylePaddingLeft + this.styleBorderLeft + this.htmlLeft;
  offsetY += this.stylePaddingTop + this.styleBorderTop + this.htmlTop;

  mx = e.pageX - offsetX;
  my = e.pageY - offsetY;
  
  // We return a simple javascript object (a hash) with x and y defined
  return {x: mx, y: my};
}

// If you dont want to use <body onLoad='init()'>
// You could uncomment this init() reference and place the script reference inside the body tag
//init();

function init() {
    console.log("init");
    
    var s = new CanvasState(document.getElementById('canvas1'));
    s.addShape(new Shape(40,40)); // The default is gray
    s.addShape(new Shape(60,140));
    // Lets make some partially transparent
    s.addShape(new Shape(80,150,'circle','Notiz'));
    s.addShape(new Shape(125,80));
}
