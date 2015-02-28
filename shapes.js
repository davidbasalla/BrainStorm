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

    this.shapeId = 0;

    this.x = x || 0;
    this.y = y || 0;

    this.text = text || "sample text";
    this.shape = shape || "square";
    this.fill = '#EEEEEE';
    this.lineWidth = 1;

    this.lineHeight = 20;


    if(this.shape === 'square'){
	this.w = 100;
	this.h = 50;
    }

    this.connector = new Connector(this.x + this.w/2.0 - 10/2.0, 
				   this.y + this.h, 
				   10);

    this.deleteBox = new DeleteBox(this.x + this.w - 14, y);
}

Shape.prototype.setWidth = function(value){
    this.w = value;
    this.connector.x = this.x + this.w/2.0 - 5;
    this.deleteBox.x = this.x + this.w - 14;
}


Shape.prototype.setHeight = function(value){
    this.h = value;
    this.connector.y = this.y + this.h;
}

Shape.prototype.move = function(x, y){

    //rejig to move everything as an offset
    //vector based...?

    this.x += x;
    this.y += y;

    
    /*
    var oldX = this.x;
    var oldY = this.y;
    this.x = x;
    this.y = y;
    offsetX = this.x - oldX;
    offsetY = this.y - oldY;
    */


    var connectorOldX = this.connector.x;
    var connectorOldY = this.connector.y;
    var connectorOldTargetX = this.connector.targetX;
    var connectorOldTargetY = this.connector.targetY;

    this.connector.x += x;
    this.connector.y += y;
    this.connector.targetX += x; 
    this.connector.targetY += y;

    this.deleteBox.x += x;
    this.deleteBox.y += y;

}


Shape.prototype.highlight = function(ctx, mode) {

    if (this.shape === "square"){

	var minX = this.x;
	var minY = this.y;
	var maxX = this.x + this.w;
	var maxY = this.y + this.h;
	var offset = 10;

	if (mode === "hover")
	    ctx.strokeStyle = '#FF0000';
	else
	    ctx.strokeStyle = '#00FF00';

	ctx.beginPath();
	ctx.moveTo(minX + offset, minY);
	ctx.lineTo(maxX - offset, minY);
	ctx.quadraticCurveTo(maxX, minY, maxX, minY + offset);
	ctx.lineTo(maxX, maxY - offset);
	ctx.quadraticCurveTo(maxX, maxY, maxX - offset, maxY);
	ctx.lineTo(minX + offset, maxY);
	ctx.quadraticCurveTo(minX, maxY, minX, maxY - offset);
	ctx.lineTo(minX, minY + offset);
	ctx.quadraticCurveTo(minX, minY, minX + offset, minY);

	ctx.stroke();
	ctx.closePath();
    }
}


Shape.prototype.centerPos = function(){

    var centerPos = [0, 0];

    centerPos[0] = this.x + this.w/2.0;
    centerPos[1] = this.y + this.h/2.0;

    return centerPos;

}


// Draws this shape to a given context
Shape.prototype.draw = function(ctx) {

    if (this.shape === "square"){
	
	ctx.save();
	
	//ctx.rect(this.x, this.y, this.w, this.h);
	
	var minX = this.x;
	var minY = this.y;
	var maxX = this.x + this.w;
	var maxY = this.y + this.h;
	var offset = 10;

	ctx.beginPath();
	ctx.moveTo(minX + offset, minY);
	ctx.lineTo(maxX - offset, minY);
	ctx.quadraticCurveTo(maxX, minY, maxX, minY + offset);
	ctx.lineTo(maxX, maxY - offset);
	ctx.quadraticCurveTo(maxX, maxY, maxX - offset, maxY);
	ctx.lineTo(minX + offset, maxY);
	ctx.quadraticCurveTo(minX, maxY, minX, maxY - offset);
	ctx.lineTo(minX, minY + offset);
	ctx.quadraticCurveTo(minX, minY, minX + offset, minY);

	ctx.fillStyle = this.fill;

	ctx.shadowColor = "#999";
	ctx.shadowBlur = 10;
	ctx.shadowOffsetX = 5;
	ctx.shadowOffsetY = 5;

	ctx.fill();
	ctx.closePath();

	ctx.restore();
	

	//DRAW THE CONNECTOR

	ctx.fillStyle = 'black';

	ctx.fillRect(this.connector.x, 
		     this.connector.y, 
		     this.connector.w, 
		     this.connector.w);

	this.deleteBox.draw(ctx);
    }
    



    // DRAW THE TEXT

    var text = this.text;

    var offsetX = 0;
    var offsetY = 0;

    if (this.shape === "square"){
	offsetX = 15;
	offsetY = 30;
    }
    else if (this.shape === "circle"){
	offsetX = -10;
    }

    //ctx.font="14px Avenir";
    //ctx.fillText(text, this.x + offsetX, this.y + offsetY);
    //var metrics = ctx.measureText(text);
    //var width = metrics.width;
    this.wrapText(ctx, text, this.x + offsetX, this.y + offsetY, 100, 20);

}

Shape.prototype.setText = function(text, ctx) {

    this.text = text;

    /* sets the size dependent on text content - 
       issue, need to get the CTX in order to determine
       the proper dimensions for it */

    ctx.font="14px Avenir";
    //ctx.fillText(text, this.x, this.y);

    var lines = text.split('\n');
    var lineHeight = 20;
    var maxHeight = 0;

    var maxWidth = 0;

    for (i in lines){
	var line = lines[i];
	var metrics = ctx.measureText(line);
	var width = metrics.width;

	if (width > maxWidth)
	    maxWidth = width;
	maxHeight += lineHeight;
    }
    
    this.setWidth(maxWidth + 30);
    this.setHeight(maxHeight + 30);
    //this.wrapText(ctx, text, this.x + offsetX, this.y + offsetY, 100, 20);

    //var metrics = ctx.measureText(text);
    //var width = metrics.width;

    //this.setWidth(width + 30);
}



// Determine if a point is inside the shape's bounds
Shape.prototype.contains = function(mx, my) {

    //need to extend for circle code

    if (this.shape === "square"){
	return  (this.x <= mx) && (this.x + this.w >= mx) &&
            (this.y <= my) && (this.y + this.h >= my);
    }
}

Shape.prototype.containedInRect = function(points) {

    var x1 = Math.min(this.x, this.x + this.w);
    var y1 = Math.min(this.y, this.y + this.h);
    var x2 = Math.max(this.x, this.x + this.w);
    var y2 = Math.max(this.y, this.y + this.h);

    var rect_x1 = Math.min(points[0], points[2]);
    var rect_y1 = Math.min(points[1], points[3]);
    var rect_x2 = Math.max(points[0], points[2]);
    var rect_y2 = Math.max(points[1], points[3]);

    if (x1 < rect_x2 && x2 > rect_x1 &&
	y1 < rect_y2 && y2 > rect_y1) 
	return true;

    return false;
}



Shape.prototype.wrapText = function(context, text, x, y, maxWidth, lineHeight) {

    /* need to rework this... 

       new line needs to happen when enter is pressed in the textarea
       allow long run ons
       only add new line when new line is pressed in box

       also need to get the longest element so as to resize the whole box

       */
       
    context.font="14px Avenir";

    var lines = text.split('\n');
    var height = y;

    var maxWidth = 0;

    for (i in lines){
	context.fillText(lines[i], x, height);
	height += this.lineHeight;
    }

    //this.setWidth(maxWidth);

    //reset width AND height (!!) here after max line length

}





/////////////////////////////////////////////////////////////////


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



////////////////////////////////////////////////////////////////////////////

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
    
    /* draw a line either between two shapes or between the original shape
       and a target position */
    
    origX = this.origShape.centerPos()[0];
    origY = this.origShape.centerPos()[1];
    
    if (this.destShape){
	destX = this.destShape.centerPos()[0];
	destY = this.destShape.centerPos()[1];
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

Connection.prototype.contains = function(mx, my){

    /* should probably clean this up a little bit */

    //figure out the points

    var x1 = Math.min(this.origShape.centerPos()[0], this.destShape.centerPos()[0]);
    var y1 = Math.min(this.origShape.centerPos()[1], this.destShape.centerPos()[1]);

    var x2 = Math.max(this.origShape.centerPos()[0], this.destShape.centerPos()[0]);
    var y2 = Math.max(this.origShape.centerPos()[1], this.destShape.centerPos()[1]);

    //first, check if mouse is in the rectangle described by the 2 points...
    if ((x1 <= mx) && (x2 >= mx) && (y1 <= my) && (y2 >= my)){
	//define the definition of the line

	var x1 = this.origShape.centerPos()[0];
	var y1 = this.origShape.centerPos()[1];

	var x2 = this.destShape.centerPos()[0];
	var y2 = this.destShape.centerPos()[1];

	var xDiff = x2 - x1;
	var yDiff = y2 - y1;

	var m = yDiff/xDiff;
	var d = y1 - m * x1;

	var eps = 4;

	if (m * mx + d - my < eps && m * mx + d - my > -(eps))
	    return true;

	return false;
    }
}


Connection.prototype.highlight = function(ctx, mode){
    
    origX = this.origShape.centerPos()[0];
    origY = this.origShape.centerPos()[1];
    destX = this.destShape.centerPos()[0];
    destY = this.destShape.centerPos()[1];

    ctx.lineWidth = 6;
    ctx.strokeStyle = 'red';

    ctx.beginPath();
    ctx.moveTo(origX, origY)
    ctx.lineTo(destX, destY);
    ctx.stroke();
    ctx.closePath();

    ctx.strokeStyle = 'lightgrey';

}


Connection.prototype.setTarget = function(x, y) {
    
    this.targetX = x;
    this.targetY = y;
}


Connection.prototype.resetTarget = function() {
    
    this.targetX = this.origShape.connector.x;
    this.targetY = this.origShape.connector.y;
}


Connection.prototype.removeClosestShape = function(mx, my) {

    var x1 = this.origShape.x;
    var y1 = this.origShape.y;
    var x2 = this.destShape.x;
    var y2 = this.destShape.y;

    //a^2 + b^2 = c^2

    var a1 = Math.pow(mx - x1, 2);
    var b1 = Math.pow(my - y1, 2);
    var c1 = a1 + b1;

    var a2 = Math.pow(mx - x2, 2);
    var b2 = Math.pow(my - y2, 2);
    var c2 = a2 + b2;

    if (c2 > c1){
	//remove origShape
	this.origShape = this.destShape;
	this.destShape = null;
    }
    else{
	this.destShape = null;
    }
    
    //reset the target points...
    this.targetX = mx;
    this.targetY = my;
    
}





////////////////////////////////////////////////////////////////////////////


function DeleteBox(x, y){
    
    this.x = x;
    this.y = y;
    this.w = 8;
    this.offset = 5;

}

DeleteBox.prototype.contains = function(mx, my) {

    return  (this.x <= mx) && (this.x + this.w >= mx) &&
        (this.y + this.offset <= my) && (this.y + this.offset + this.w >= my);
    
}

DeleteBox.prototype.draw = function(ctx){
    
    ctx.strokeStyle = 'lightgrey';
    
    ctx.lineWidth = 4;
    ctx.beginPath();

    var y = this.y + this.offset;

    ctx.moveTo(this.x, y);
    ctx.lineTo(this.x + this.w, y + this.w);
    
    ctx.moveTo(this.x + this.w, y);
    ctx.lineTo(this.x, y + this.w);
    
    ctx.closePath();
    ctx.stroke();
}


////////////////////////////////////////////////////////////////////////////


function Modal(){
    /* access to the bootstrap model */

    this.jqModal = $('#myModal');
    this.jqTextField = this.jqModal.find('#nodeText');
    this.jqOkButton = this.jqModal.find('#modalok');
    
    //colorButtons
    this.colors = ['#EEEEEE', 'white', 'grey', 'lightgreen', '#FF6666'];
    this.colorButtons = [
	this.jqModal.find('#colorBox1'),
	this.jqModal.find('#colorBox2'),
	this.jqModal.find('#colorBox3'),
	this.jqModal.find('#colorBox4'),
	this.jqModal.find('#colorBox5')
    ];
    //set default col to GREY
    this.currentColor = this.colors[0];
    
    this.setButtonClickEvents();
}


Modal.prototype.show = function(){
    this.jqModal.modal('show');
}


Modal.prototype.setButtonClickEvents = function(){
    
    var _this = this;
    this.colorButtons[0].on(
	'click',
	function(evt){
	    _this.currentColor = _this.colors[0];
	    _this.setColorBtnActive(_this.colorButtons[0]);
	}
    );
    this.colorButtons[1].on(
	'click',
	function(evt){
	    _this.currentColor = _this.colors[1];
	    _this.setColorBtnActive(_this.colorButtons[1]);
	}
    );
    this.colorButtons[2].on(
	'click',
	function(evt){
	    _this.currentColor = _this.colors[2];
	    _this.setColorBtnActive(_this.colorButtons[2]);
	}
    );
    this.colorButtons[3].on(
	'click',
	function(evt){
	    _this.currentColor = _this.colors[3];
	    _this.setColorBtnActive(_this.colorButtons[3]);
	}
    );
    this.colorButtons[4].on(
	'click',
	function(evt){
	    _this.currentColor = _this.colors[4];
	    _this.setColorBtnActive(_this.colorButtons[4]);
	}
    );

}



Modal.prototype.setNode = function(node){
    /* sets up the contents of a modal according to a node */
    
    this.setText(node.text);
    this.setColor(node.fill);
}



Modal.prototype.setText = function(text){
    this.jqTextField.val(text);
}


Modal.prototype.setColor = function(fill){

    for (i in this.colors){
	if (this.colors[i] === fill){
	    this.currentColor = this.colors[i];
	    this.setColorBtnActive(this.colorButtons[i]);
	}
    }
}

Modal.prototype.setColorBtnActive = function(button){
    
    for (i in this.colorButtons)
	this.colorButtons[i].removeClass('color-box-selected');
    button.addClass('color-box-selected');
}


Modal.prototype.setCallback = function(state, node, ctx){
    
    var _this = this;
    this.jqOkButton.on(
	'click',
	function(evt)
	{
	    node.setText(_this.jqTextField.val(), ctx);
	    node.fill = _this.currentColor;
	    _this.jqModal.modal('hide');

	    state.valid = false; // Something's dragging so we must redraw

	    _this.resetCallback();
	}
    );
}    


Modal.prototype.resetCallback = function(){
    this.jqOkButton.off();
}


Modal.prototype.setPosition = function(x, y){

    var width = document.body.clientWidth;

    var val = width/2 - x;

    //this.jqModal.css( "margin-left", -val); 
    //this.jqModal.css( "margin-right", val); 


    var doc = document.documentElement;
    var top = (window.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0);

    this.jqModal.css( "top", top); 
    this.jqModal.css( "margin-bottom", -top); 
}



////////////////////////////////////////////////////////////////////////////


function CanvasState(canvas) {
    // **** First some setup! ****
  
    this.canvas = canvas;
    this.canvas.width = document.body.clientWidth; //document.width is obsolete
    this.canvas.height = document.body.clientHeight * 2; //document.height is obsolete

    this.width = canvas.width;
    this.height = canvas.height;
    this.ctx = canvas.getContext('2d');
    //this.ctx.scale(2,2);
    //this.ctxScale = 2;

    this.currentShapeId = 1;

    this.modal = new Modal();


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
    this.selection = [];
    this.hoverSelection = [];
    this.connectionSelection = null;
    this.dragSelect = false;

    this.dragoffx = 0; // See mousedown and mousemove events for explanation
    this.dragoffy = 0;
    this.mx = 0;
    this.my = 0;

    
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

	//need to figure out the cases here

	// 1.) if no selection, start a drag selection
	// 2.) if hover selection, start a select/delete/move
	// 3.) if connector, start a connection drag


	var mouse = myState.getMouse(e);
	var mx = mouse.x;
	var my = mouse.y;

	myState.mx = mouse.x;
	myState.my = mouse.y;


	// CHECK FOR CONNECTIONS ///////
	if (myState.hoverSelection.length){
	    if (myState.hoverSelection[0] instanceof Connection){

		//figure out closer shape...
		var mySel = myState.hoverSelection[0];

		mySel.removeClosestShape(mx, my);

		myState.connectionDragging = true;
		myState.connectionSelection = mySel;

		myState.hoverSelection = [];

		//remove current connection from connections
		var index = myState.connections.indexOf(mySel);
		if(index > -1)
		    myState.connections.splice(index, 1);

		myState.valid = false;		

		return;
	    }
	}
	




	// CHECK FOR CONNECTORS ///////

	var shapes = myState.shapes;
	var l = shapes.length;
	for (var i = l-1; i >= 0; i--) {

	    //check the connectors first
	    if (shapes[i].connector.contains(mx, my)){

		var mySel = new Connection(shapes[i]);
		myState.connectionDragging = true;
		myState.connectionSelection = mySel;
		myState.valid = false;
		return;
	    }
	    
	}


	// 0.) if selection and no hover, clear the selection
	if (!myState.hoverSelection.length && myState.selection.length){
	    myState.selection = [];
	}


	// 1.) if no hoverSelection, start a drag select
	if (!myState.hoverSelection.length){
	    myState.dragSelect = true;
	    myState.dragSelectCoords = [mx, my, mx, my];
	    return;
	}

	// 2.) if hoverSelection, check for delete
	if (myState.hoverSelection.length){

	    mySel = myState.hoverSelection[0];

	    //check for deleteBox

	    if (mySel.deleteBox.contains(mx, my)){
		myState.deleteShape(mySel);
		myState.hoverSelection = [];
		myState.selection = [];
		myState.valid = false;
		return;
	    }

	    //if hoverSel not in sel
	    //     clear sel
	    //     add hoverSel to sel
	    

	    if (myState.selection.indexOf(mySel) == -1){

		myState.selection = [];
		if(!myState.selection.length)
		    myState.selection.push(mySel);
	    }
	}

	if (myState.hoverSelection.length && myState.selection.length){
	    //myState.dragoffx = mx - mySel.x;
	    //myState.dragoffy = my - mySel.y;

	    myState.dragging = true;
	    myState.valid = false;
	    return;
	}




    }, true);

    canvas.addEventListener('mousemove', function(e) {

	//detect shapes here
	//if shape found, set it to selected

	var mouse = myState.getMouse(e);
	var mx = mouse.x;
	var my = mouse.y;

	if(!myState.mx)
	    myState.mx  = mouse.x;
	if(!myState.my)
	    myState.my  = mouse.y;

	var x_diff = mouse.x - myState.mx;
	var y_diff = mouse.y - myState.my;

	myState.mx = mouse.x;
	myState.my = mouse.y;


	//if drag in process...
	if (myState.dragging){
	    
	    for (i in myState.selection){
		myState.selection[i].move(x_diff, y_diff);
	    }
	    
	    //myState.selection.x = mouse.x - myState.dragoffx;
	    //myState.selection.y = mouse.y - myState.dragoffy;   
	    myState.valid = false; // Something's dragging so we must redraw
	    return;
	}


	//if dragSelect in process...
	if (myState.dragSelect){

	    //set the coords
	    myState.dragSelectCoords[2] = mx;
	    myState.dragSelectCoords[3] = my;
	    myState.valid = false;


	    // put detection code in here...
	    var shapes = myState.shapes;
	    var selectedShapes = [];

	    var l = shapes.length;
	    for (var i = l-1; i >= 0; i--) {
		
		if (shapes[i].containedInRect(myState.dragSelectCoords)){
		    //add to selected shapes

		    if (!selectedShapes.indexOf(shapes[i]) > -1)
			selectedShapes.push(shapes[i]);
		}
	    }

	    myState.hoverSelection = selectedShapes;

	    return;
	}

	
	if (!myState.hoverSelection.length){

	    //check for connections...

	    if(!myState.connectionDragging){
		var cons = myState.connections;
		for (var i = cons.length-1; i >= 0; i--) {
		    
		    var val = cons[i].contains(mx, my);
		    if (val) {
			// Keep track of where in the object we clicked
			// so we can move it smoothly (see mousemove)
			
			var mySel = cons[i];		    
			myState.hoverSelection[0] = mySel;
			myState.valid = false;
			
			return;
		    }
		}
	    }

	    //check for shapes!!
	    var shapes = myState.shapes;
	    var l = shapes.length;
	    for (var i = l-1; i >= 0; i--) {
		
		if (shapes[i].contains(mx, my)) {
		    // Keep track of where in the object we clicked
		    // so we can move it smoothly (see mousemove)

		    var mySel = shapes[i];		    
		    myState.hoverSelection[0] = mySel;
		    myState.valid = false;
		    
		    return;
		}
	    }
	}
	//myState.selection = null;

	//check that current object still in mouse range
	else if (myState.hoverSelection.length){
	    if (!myState.hoverSelection[0].contains(mx, my)){
		myState.hoverSelection = [];
		myState.valid = false;
	    }
	}


	/////////////

	if (myState.connectionDragging){
	    console.log('connectionDragging');


	    var mouse = myState.getMouse(e);

	    myState.connectionSelection.setTarget(mouse.x, mouse.y);

	    //need to check here if another shape is detected underneath

	    myState.valid = false; // Something's dragging so we must redraw
	    }

	else if (myState.dragging){

	    for (i in myState.selection){
		myState.selection[i].move(x_diff, y_diff);
		}
	    
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
	myState.dragSelect = false;
	myState.connectionDragging = false;


	if (myState.hoverSelection.length){
	    myState.selection = myState.hoverSelection;
	}




	//need to clear the selected status and stop drawing the line
	//myState.selection = null;

	//reset the connector
	if (myState.connectionSelection){

	    if (myState.hoverSelection.length){
		myState.connectionSelection.destShape = myState.hoverSelection[0];
		myState.connections.push(myState.connectionSelection); 

	    }


	    myState.connectionSelection.resetTarget();
	}



	myState.connectionSelection = null;

	myState.valid = false; // Something's dragging so we must redraw

    }, true);

    // double click for making new shapes

    var _ctx = this.ctx;

    canvas.addEventListener('dblclick', function(e) {
	var mouse = myState.getMouse(e);

	if (myState.selection.length){

	    if(myState.selection[0] instanceof Shape){
	    
		myState.modal.setPosition(mouse.x, mouse.y);
		myState.modal.setNode(myState.selection[0]);
		myState.modal.setCallback(myState, myState.selection[0], _ctx);
		myState.modal.show();
	    }
	}
	else
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

    shape.shapeId = this.currentShapeId += 1;
    this.shapes.push(shape);
    this.valid = false;
}


CanvasState.prototype.deleteShape = function(shape) {

    //FIRST REMOVE CONNECTIONS
    for(var i = this.connections.length - 1; i >= 0; i--) {
	if(this.connections[i].origShape === shape ||
	   this.connections[i].destShape === shape){
	    this.connections.splice(i, 1);
	    this.valid = false;

	}
    }

    //SECONDLY REMOVE SHAPE
    for(var i = this.shapes.length - 1; i >= 0; i--) {
	if(this.shapes[i] === shape) {
	    this.shapes.splice(i, 1);
	    this.valid = false;
	    return
	}
    }

    




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
	
	// draw all Connections

	ctx.strokeStyle = 'lightgrey';
	var l = connections.length;
	for (var i = 0; i < l; i++) {
	    var con = connections[i];
	    // We can skip the drawing of elements that have moved off the screen:
	    //if (con.x > this.width || shape.y > this.height ||
	    //shape.x + shape.w < 0 || shape.y + shape.h < 0) continue;
	    connections[i].draw(ctx);
	    
	    if (this.hoverSelection.indexOf(connections[i]) > -1){
		connections[i].highlight(ctx);
	    }
	}
	
	
	//draw connector lines
	if (this.connectionSelection != null) {
	    ctx.strokeStyle = 'red';
	    var mySel = this.connectionSelection;
	    mySel.draw(ctx);

	}

	
	// draw all shapes
	var l = shapes.length;
	for (var i = 0; i < l; i++) {
	    var shape = shapes[i];
	    // We can skip the drawing of elements that have moved off the screen:
	    if (shape.x > this.width || shape.y > this.height ||
		shape.x + shape.w < 0 || shape.y + shape.h < 0) continue;
	    shapes[i].draw(ctx);

	    if (this.selection.indexOf(shapes[i]) > -1){
		shapes[i].highlight(ctx, "select");
	    }
	    if (this.hoverSelection.indexOf(shapes[i]) > -1){
		shapes[i].highlight(ctx, "hover");
	    }

	}
	
	
	//draw selection box
	if (this.dragSelect){

	    var dragX = this.dragSelectCoords[0];
	    var dragY = this.dragSelectCoords[1];
	    var mx = this.dragSelectCoords[2];
	    var my = this.dragSelectCoords[3];
	    
	    ctx.lineWidth = 2;
	    ctx.strokeStyle = 'lightgrey';
	    ctx.beginPath();
	    ctx.moveTo(dragX, dragY);
	    ctx.lineTo(dragX, my);
	    ctx.lineTo(mx, my);
	    ctx.lineTo(mx, dragY);
	    ctx.lineTo(dragX, dragY);
	    ctx.closePath();
	    ctx.stroke();
	}
    }
    
    // ** Add stuff you want drawn on top all the time here **
    this.valid = true;
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
    var s = new CanvasState(document.getElementById('canvas1'));

    var shape1 = new Shape(100, 150);
    var shape2 = new Shape(300, 150, "square", "text");
    var shape3 = new Shape(200, 50);

    var connec = new Connection(shape3, shape2);
    var connec2 = new Connection(shape3, shape1);

    s.addShape(shape1);
    s.addShape(shape2);
    s.connections.push(connec);
    s.connections.push(connec2);
    s.addShape(shape3);



    $('#aboutButton').on(
	'click',
	function(evt)
	{
	    var modal = $('#aboutModal');

	    modal.modal('show');
	}
    );



    $('#saveAsButton').on(
	'click',
	function(evt)
	{
	    //SAVE THE DATA AS JSON FORMAT HERE...

	    var combinedText = {
		shapes: s.shapes,
		connections: s.connections
	    };

	    var jsonText = JSON.stringify(combinedText);

	    var data = new Blob([jsonText], {type: 'text/plain'});
	    var textFile = null;
	    
	    // If we are replacing a previously generated file we need to
	    // manually revoke the object URL to avoid memory leaks.
	    if (textFile !== null) {
		window.URL.revokeObjectURL(textFile);
	    }
	    
	    textFile = window.URL.createObjectURL(data);
	    
	    var link = document.getElementById('downloadlink');
	    link.href = textFile;

	    link.click();


	}
    );	


    $('#loadButton').on(
	'click',
	function(evt)
	{
	    //trigger the hidden fileLoader
	    $('#filePicker', this.el).trigger('click');
	    event.stopPropagation(); 
	}
    );
    
    $('#filePicker', this.el).on(
	'change',
	function(e)
	{
	    var file = e.currentTarget.files[0];
	    var extension = file.name.split('.').pop();	    
	    
	    //reset all
	    s.shapes = [];
	    s.connections = [];
	    s.selection = [];
	    s.hoverSelection = [];
	    s.valid = false;
		
	    //check for correct extension
	    if(extension == 'json'){
		// FILE READING
		var reader = new FileReader();
		
		reader.onload = function(event){
		    
		    //parse JSON
		    var jsonContents = JSON.parse(reader.result);

		    
		    //deal with shapes

		    var shapes = jsonContents.shapes;
		    for(var i = 0; i < shapes.length; i++){

			var elem = shapes[i];
			var shape = new Shape(elem.x, elem.y, "square");
			shape.setText(elem.text, s.ctx)
			shape.shapeId = elem.shapeId;
			shape.fill = elem.fill;

			//update the current shape id
			s.currentShapeId = Math.max(s.currentShapeId, shape.shapeId);

			s.shapes.push(shape);
		    }


		    //deal with connections

		    var connections = jsonContents.connections;


		    for(var i = 0; i < connections.length; i++){

			var elem = connections[i];

			//dont create again, just loop through already existing ones...

			var origShape = null;
			for (index in s.shapes){

			    if (s.shapes[index].shapeId === connections[i].origShape.shapeId){
				origShape = s.shapes[index];
				break;
			    }
			}

			var destShape = null;
			for (index in s.shapes){
			    if (s.shapes[index].shapeId === connections[i].destShape.shapeId){
				destShape = s.shapes[index];
				break;
			    }
			}


			if (destShape && origShape){
			    var connec = new Connection(origShape, destShape);
			    s.connections.push(connec);
			}
		    }


		    s.valid = false;
		}


		reader.readAsText(file);		
	    }
	}
    );
    
}



