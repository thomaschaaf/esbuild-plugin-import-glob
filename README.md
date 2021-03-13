# esbuild-plugin-import-glob

A esbuild plugin which allows to import multiple files using the glob syntax.

## Basic Usage

1. Install this plugin in your project:

   ```sh
   npm install --save-dev esbuild-plugin-import-glob
   ```

2. Add this plugin to your esbuild build script:

   ```diff
   +const ImportGlobPlugin = require('esbuild-plugin-import-glob');
    ...
    esbuild.build({
      ...
      plugins: [
   +    ImportGlobPlugin(),
      ],
    })
   ```

3. Use import or require

   ```typescript
   // @ts-ignore
   import migrationsArray from './migrations/**/*';

   // contains default export
   migrationsArray[0].default;
   ```

   ```typescript
   // @ts-ignore
   import * as migrations from './migrations/**/*';

   const { default: migrationsArray, filenames } = migrations;
   ```

   ```typescript
   const { default: migrationsArray, filenames } = require('./migrations/**/*');
   ```
