export const _ = (function(_, extraDependencies){
    let $ = {
        $first(protoProps) {
            return _.$all(protoProps)[0];
        }
    };

    return $;
})(_, extraDependencies);

export const testB = (function() {
    console.log('testB');
});