Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = babelPluginInlineScriptImport;

const babel = require('babel-core');
const babylon = require('babylon');
const babelTraverse = require('babel-traverse').default;

const _path = require('path');
const _path2 = _interopRequireDefault(_path);
const _decache = require('decache');
const _decache2 = _interopRequireDefault(_decache);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function formatName(filename){
  const path = require('path');
  let name = filename;

  name = path.basename(name, '.js');

  if (name === 'index') {
    name = path.basename(path.dirname(filename));
  }

  //name = normalizeName(name);  

  return name;
}

function getFile(filepath) {
  (0, _decache2.default)(filepath);

  const fs = require('fs');
  const code = fs.readFileSync(filepath, 'utf8');

  //return code;
  
  return babylon.parse(code, {
    sourceType: "module"
  });
}

function babelPluginInlineScriptImport(_ref) {
  const t = _ref.types;

  return {
    visitor: {
      ExportDeclaration: {
        exit: function exit(path, state) {
          const name = formatName(state.file.opts.filename);          
          let declaration = path.node.declaration;

          if(!declaration){
            return;
          }

          if (declaration.id && declaration.id.name) {            
            return;
          }

          if (t.isExportDefaultDeclaration(path.node)) {
            declaration = t.variableDeclaration("var", [
                                  t.variableDeclarator(
                                    t.identifier(name), 
                                    declaration
                                  )
                                ]);            
          }

          path.replaceWith(declaration);
        }
      },

      ImportDeclaration: {
        exit: function exit(path, state) {
          const node = path.node;
          const modulePath = node.source.value;
          const specificImports = [];

          node.specifiers.forEach((spec) => {
            let filepath = null;            
            let isWildcard = false;
            let currentExpression = t.booleanLiteral(false);

            if(t.isImportNamespaceSpecifier(spec)){
              isWildcard = true;
            } else if (!t.isImportSpecifier(spec)&&!t.isImportDefaultSpecifier(spec)) {
              return;
            }

            const fileLocation = state.file.opts.filename;
            if (fileLocation === 'unknown') {
              filepath = modulePath;
            } else {
              filepath = _path2.default.join(_path2.default.resolve(fileLocation), '..', modulePath);
            }

            let defaultSpecifier = false;
            if(t.isImportDefaultSpecifier(spec)){
              defaultSpecifier = spec;
            }

            const ast = getFile(filepath);
            const body = ast.program.body;
            const varName = spec.local.name;
            const moduleName = (spec.imported)?spec.imported.name:'*';
            const defaultName = formatName(filepath);    
            const allExports = {};

            babelTraverse(ast, {
              enter(path) {
                //console.log('search import '+moduleName+' as '+varName+' from '+filepath);

                if (path.isExportDefaultDeclaration()){
                  if(moduleName=='default') {
                    currentExpression = path.node.declaration;

                    allExports['default'] = path.node.declaration;
                  }
                } else if (path.isExportDeclaration()) {
                  const vars = path.node.declaration;
                  let nameDeclaration = false;

                  if(vars) {     
                    nameDeclaration = vars.declarations[0].id.name;

                    if(nameDeclaration==moduleName) {
                      currentExpression = vars.declarations[0].init;
                    } else if (defaultSpecifier){
                      if(vars.declarations[0].id.name==defaultSpecifier.local.name) {
                        currentExpression = vars.declarations[0].init;
                      }
                    }

                    allExports[nameDeclaration] = vars.declarations[0].init;

                  } else if(path.node.specifiers.length > 0){
                    //remove specifiers
                  }

                }
              }
            });

            if(isWildcard){
              objectMembers = [];

              Object.keys(allExports).forEach( (key) => {
                objectMembers.push(
                  t.objectProperty(
                    t.identifier(key), 
                    allExports[key]
                  )
                );
              });

              currentExpression = t.objectExpression(objectMembers);
            }

            const declaration = t.variableDeclaration("var", [
                                  t.variableDeclarator(
                                    t.identifier(varName), 
                                    currentExpression
                                  )
                                ]);

            specificImports.push(declaration);
          });

          if (specificImports.length) {
            path.replaceWithMultiple(specificImports);
          } else {
            console.log(node);
          }

        }
      }
    }
  };
}