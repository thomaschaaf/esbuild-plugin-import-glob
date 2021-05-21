import path from 'path';
import fastGlob from 'fast-glob';
import { Plugin } from 'esbuild';

const EsbuildPluginImportGlob = (): Plugin => ({
  name: 'require-context',
  setup: (build) => {
    build.onResolve({ filter: /\*/ }, async (args) => {
      if (args.resolveDir === '') {
        return; // Ignore unresolvable paths
      }

      return {
        // make sure that imports are properly scoped to directories that are requested from
        // otherwise results get overwritten
        path: path.resolve(args.resolveDir, args.path),
        namespace: 'import-glob',
        pluginData: {
          path: args.path,
          resolveDir: args.resolveDir,
        },
      };
    });

    build.onLoad({ filter: /.*/, namespace: 'import-glob' }, async (args) => {
      const files = (
        await fastGlob(args.pluginData.path, {
          cwd: args.pluginData.resolveDir,
        })
      ).sort();

      const importerCode = `
        ${files
          .map((module, index) => `import * as module${index} from '${module}'`)
          .join(';')}

        const modules = [${files
          .map((module, index) => `module${index}`)
          .join(',')}];

        export default modules;
        export const filenames = [${files
          .map((module) => `'${module}'`)
          .join(',')}]
      `;

      return { contents: importerCode, resolveDir: args.pluginData.resolveDir };
    });
  },
});

export default EsbuildPluginImportGlob;
