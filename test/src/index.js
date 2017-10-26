
/* imports */ 
import { _, testA as testAAlias} from './shell/a.js';
import { _ as UI, testB} from './shell/b.js';

import { testC as testCAlias } from './shell/c.js';
import { default as testC } from './shell/c.js';

import * as extraTests from './shell/d.js';


/* index.js */
const index = () => {
	console.log(UI.$first('body'));
}