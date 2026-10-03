const fs = require('node:fs');
const ts = require('typescript');
const Module = require('node:module');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const cache = new Map();
function loadMatcher(relative) {
  const file = path.resolve(root,relative.endsWith('.ts') ? relative : relative + '.ts');
  if (!file.startsWith(path.join(root,'lib','admission-matcher') + path.sep)) throw new Error('Matcher loader must stay isolated');
  if(cache.has(file)) return cache.get(file).exports;
  const mod = new Module(file,module);mod.filename=file;mod.paths=Module._nodeModulePaths(path.dirname(file));cache.set(file,mod);
  mod.require = spec => {
    if(!spec.startsWith('.')) return require(spec);
    const resolved=path.resolve(path.dirname(file),spec);
    return loadMatcher(path.relative(root,fs.existsSync(resolved) && fs.statSync(resolved).isDirectory() ? path.join(resolved,'index') : resolved));
  };
  const output=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
  mod._compile(output,file);return mod.exports;
}
module.exports={loadMatcher};
