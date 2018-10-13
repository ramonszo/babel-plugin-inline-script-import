# babel-plugin-inline-script-import
A babel plugin that inlines all JS imports straight into your code.


## Example
Given the following module file:

```js
export const foo = {
	doSomething: function(){
		
	}
};
```

The plugin will transform:

```js
import foo from 'scripts/foo.js';

foo.doSomething();
```

to:

```js
var foo = {
	doSomething: function(){

	}
};

foo.doSomething();
```


## Installation

Install the plugin through `npm`, you will also need `babel` installed:

```sh
$ npm install --save-dev babel-plugin-inline-script-import
```

Add `babel-plugin-inline-script-import` to the list of plugins. If you are using a `.babelrc` file, the file should have an entry that looks like this:

```json
{
  "plugins": [
    ["inline-script-import", {}]
  ]
}
```


## License
MIT
