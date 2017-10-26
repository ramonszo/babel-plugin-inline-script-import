var _ = function () {
    var $ = {
        $all: function $all(attr, deepDataAndEvents) {
            return (deepDataAndEvents || document).querySelectorAll(attr);
        }
    };

    return $;
}();

var testA = function testA() {
    console.log('testA');
};