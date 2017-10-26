
/* imports */
var _ = function () {
	var $ = {
		$all: function $all(attr, deepDataAndEvents) {

			return (deepDataAndEvents || document).querySelectorAll(attr);
		}
	};return $;
}();

var Underscore = function () {
	var $ = {
		$all: function $all(attr, deepDataAndEvents) {
			return (deepDataAndEvents || document).querySelectorAll(attr);
		}
	};return $;
}();

var testAAlias = function testAAlias() {
	console.log('testA');
};

var UI = function (_, extraDependencies) {
	var $ = {
		$first: function $first(protoProps) {
			return _.$all(protoProps)[0];
		}
	};return $;
}(_, extraDependencies);

var testB = function testB() {
	console.log('testB');
};

var testCAlias = function testCAlias() {
	console.log('testC named');
};

var testC = function () {
	console.log('testC');
}();

var extraTests = {
	testD: function testD() {
		console.log('testD');
	},
	testE: function testE() {
		console.log('testE');
	},
	testF: function testF() {
		console.log('testF');
	}
};

/* index.js */

var index = function index() {
	console.log(UI.$first('body'));
};