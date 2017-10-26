var _ = function (_, extraDependencies) {
    var $ = {
        $first: function $first(protoProps) {
            return _.$all(protoProps)[0];
        }
    };

    return $;
}(_, extraDependencies);

var testB = function testB() {
    console.log('testB');
};