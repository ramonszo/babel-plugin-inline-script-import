export const _ = (function(){
    let $ = {
        $all(attr, deepDataAndEvents) {
            return (deepDataAndEvents || document).querySelectorAll(attr);
        }
    };

    return $;
})();

export const testA = (function() {
    console.log('testA');
});