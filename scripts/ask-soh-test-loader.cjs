/* eslint-disable @typescript-eslint/no-require-imports -- Node CommonJS test tooling */
// Execute actual TypeScript modules for Node's test runner; no copied parser implementations.
const ts=require('typescript'),fs=require('node:fs');
require.extensions['.ts']=(module,file)=>module._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);
