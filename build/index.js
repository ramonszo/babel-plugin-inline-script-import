Object.defineProperty(exports, '__esModule', {
  value: true
});

const babylon = require('babylon');
const babelTraverse = require('babel-traverse').default;

const _interopRequireDefault = (obj) => {
  return obj && obj.__esModule ? obj : { default: obj };
};

const formatName = (filename) => {
  const path = require('path');
  let name = filename;

  name = path.basename(name, '.js');

  if (name === 'index') {
    name = path.basename(path.dirname(filename));
  }

  return name;
};

const getFile = (filepath) => {
  (0, _decache2.default)(filepath);

  const fs = require('fs');
  const code = fs.readFileSync(filepath, 'utf8');

  // if log --babylon
  // console.log('[Babylon]', filepath);
  // return code;

  return babylon.parse(code, {
    sourceType: 'module'
  });
};

const _path = require('path');
const _path2 = _interopRequireDefault(_path);
const _decache = require('decache');
const _decache2 = _interopRequireDefault(_decache);

exports.default = (_ref) => {
  const t = _ref.types;

  return {
    visitor: {
      ExportDeclaration: {
        exit: (path, state) => {
          const name = formatName(state.file.opts.filename);
          let declaration = path.node.declaration;

          if (!declaration) {
            return;
          }

          if (declaration.id && declaration.id.name) {
            return;
          }

          if (t.isExportDefaultDeclaration(path.node)) {
            declaration = t.variableDeclaration('var', [
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
        exit: (path, state) => {
          const node = path.node;
          const modulePath = node.source.value;
          const specificImports = [];

          node.specifiers.forEach((spec) => {
            let filepath = null;
            let isWildcard = false;
            let currentExpression = t.booleanLiteral(false);

            if (t.isImportNamespaceSpecifier(spec)) {
              isWildcard = true;
            } else if (!t.isImportSpecifier(spec) && !t.isImportDefaultSpecifier(spec)) {
              return;
            }

            const fileLocation = state.file.opts.filename;
            if (fileLocation === 'unknown') {
              filepath = modulePath;
            } else {
              filepath = _path2.default.join(_path2.default.resolve(fileLocation), '..', modulePath);
            }

            let defaultSpecifier = false;
            if (t.isImportDefaultSpecifier(spec)) {
              defaultSpecifier = spec;
            }

            const ast = getFile(filepath);
            const body = ast.program.body;
            const varName = spec.local.name;
            const moduleName = (spec.imported) ? spec.imported.name : '*';
            const defaultName = formatName(filepath);
            const allExports = {};

            babelTraverse(ast, {
              enter (path) {
                /// /console.log('search import '+moduleName+' as '+varName+' from '+filepath);

                if (path.isExportDefaultDeclaration()) {
                  // console.log('export default', path.node);

                  if (moduleName == 'default' || moduleName == '*') {
                    currentExpression = path.node.declaration;

                    allExports['default'] = path.node.declaration;
                  }
                } else if (path.isExportDeclaration()) {
                  const vars = path.node.declaration;
                  let nameDeclaration = false;

                  // console.log('export type', vars);
                  if (vars) {
                    nameDeclaration = vars.declarations[0].id.name;

                    if (nameDeclaration == moduleName) {
                      currentExpression = vars.declarations[0].init;
                    } else if (defaultSpecifier) {
                      if (vars.declarations[0].id.name == defaultSpecifier.local.name) {
                        currentExpression = vars.declarations[0].init;
                      }
                    }

                    // console.log('export', nameDeclaration);

                    allExports[nameDeclaration] = vars.declarations[0].init;
                  }
                } else if (path.isFunctionDeclaration()) {
                  // const vars = path.node.declaration;
                  let declaration = path.node;
                  let nameDeclaration = false;
                  let expression = currentExpression;

                  // console.log('isfunction');
                  if (declaration) {
                    nameDeclaration = declaration.id.name;
                    expression = t.functionExpression(path.node.id, path.node.params, path.node.body, path.node.generator, path.node.async);

                    if (nameDeclaration == moduleName) {
                      currentExpression = expression;
                    }

                    // console.log('func', nameDeclaration, Object.keys(path.node.body), path.node.params);

                    allExports[nameDeclaration] = expression;
                    // allExports[nameDeclaration] = declaration;
                  }
                } else {
                  // console.log('what is ', path.node.type);
                }
              }
            });

            if (isWildcard) {
              var objectMembers = [];

              Object.keys(allExports).forEach((key) => {
                objectMembers.push(
                  t.objectProperty(
                    t.identifier(key),
                    allExports[key]
                  )
                );
              });

              currentExpression = t.objectExpression(objectMembers);
            }

            const declaration = t.variableDeclaration('var', [
              t.variableDeclarator(
                                    t.identifier(varName),
                                    currentExpression
                                  )
            ]);

            specificImports.push(declaration);
          });

          if (specificImports.length) {
            path.replaceWithMultiple(specificImports);
          } /* else {
            console.log(node);
          }
          */
        }
      }
    }
  };
};
