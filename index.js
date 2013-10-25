
var canvas = document.getElementsByTagName('canvas')[0];
var context = canvas.getContext('2d');

function rect(context, color, x, y, width, height) {
	// console.log('rect(%s, %s, %s, %s, %s)', color, x, y, width, height);
	context.fillStyle = color;
	context.beginPath();
	context.rect(x, y, width, height);
	context.fill();
}

var img = (function() {
	var canvas = document.createElement('canvas');
	canvas.width = 1320;
	canvas.height = 1440;

	var context = canvas.getContext('2d');
	rect(context, '#999', 0, 0, canvas.width, canvas.height);
	rect(context, '#fff', 20, 20, canvas.width - 40, canvas.height - 40);

	for (var i = 0; i < 10000; i++) {
		rect(
			context,
			'#' + ('000000' + (Math.random() * 0x1000000 | 0).toString(16)).slice(-6),
			Math.random() * (canvas.width - 10) | 0,
			Math.random() * (canvas.height - 10) | 0,
			10,
			10
		);
	}

	return canvas;
}());

function drawImage(x, y) {
	// console.log('drawImage(%s, %s)', x, y);
	context.drawImage(img, -1000 + x, -1000 + y);
}

var position = {
	x: 1000,
	y: 1000
};
drawImage(1000, 1000);
var diff = {
	x: 0,
	y: 0
};
var touches = [];
var currentTouch;

var deacc = {
	time: 0,
	x: 0,
	y: 0
};

function deaccCurve(n) {
	return Math.sqrt(2 * n - n * n);
}

function deaccelerate() {
	var now = Date.now();
	var dt = 0.001 * (now - deacc.time);
	var i = dt * 1;
	if (i >= 1) {
		i = 1;
		clearInterval(deaccelerate.interval);
	}

	i = deaccCurve(i);
	position.x = Math.round(deacc.x + i * diff.x);
	position.y = Math.round(deacc.y + i * diff.y);
	drawImage(position.x, position.y);
}

function inrange(value) {
	return Math.max(0, Math.min(1000, value));
}

function handleTouch(event) {
	if (event.type === 'touchstart') {
		if (event.touches.length === 1) {
			currentTouch = event.touches[0];
		} else {
			currentTouch = null;
		}
	}

	if (currentTouch) {
		var x = currentTouch.clientX;
		var y = currentTouch.clientY;

		if (event.type === 'touchstart') {
			clearInterval(deaccelerate.interval);
			touches = [];
			diff.x = position.x - x;
			diff.y = position.y - y;
		}

		position.x = inrange(x + diff.x);
		position.y = inrange(y + diff.y);
		if (event.type === 'touchend') {
			currentTouch = null;
			var movement = touches[0];
			var now = Date.now();
			for (var i = 0; i < touches.length; i++) {
				movement = touches[i];
				if (movement.time < now - 100) break;
			}
			var dx = position.x - movement.x;
			var dy = position.y - movement.y;
			var dt = 0.001 * (now - movement.time);
			console.log('(%s, %s) in %s ms', dx, dy, dt);
			deacc.x = position.x;
			deacc.y = position.y;
			deacc.time = now;
			dx *= 0.3 / dt;
			dy *= 0.3 / dt;
			if (Math.abs(dx) > 0 || Math.abs(dy) > 0) {
				diff.x = inrange(position.x + dx) - position.x;
				diff.y = inrange(position.y + dy) - position.y;
				deaccelerate.interval = setInterval(deaccelerate, 1);
			}
		} else {
			touches.unshift({
				x: position.x,
				y: position.y,
				time: Date.now()
			});
			if (touches.length > 50) {
				touches.pop();
			}
		}
		drawImage(position.x, position.y);
	}
}

canvas.addEventListener('touchstart', function(event) {
	handleTouch(event);
}, false);

canvas.addEventListener('touchmove', function(event) {
	event.preventDefault();
	handleTouch(event);
}, false);

canvas.addEventListener('touchend', function(event) {
	handleTouch(event);
}, false);

canvas.addEventListener('touchcancel', function(event) {
	handleTouch(event);
}, false);

canvas.addEventListener('gesturestart', function(event) {
	event.preventDefault();
}, false);

canvas.addEventListener('gesturechange', function(event) {
	event.preventDefault();
}, false);
