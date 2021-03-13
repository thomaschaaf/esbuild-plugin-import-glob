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
        path: args.path,
        namespace: 'import-glob',
        pluginData: {
          resolveDir: args.resolveDir,
        },
      };
    });

    build.onLoad({ filter: /.*/, namespace: 'import-glob' }, async (args) => {
      const files = (
        await fastGlob(args.path, {
          cwd: args.pluginData.resolveDir,
        })
      ).sort();

      let importerCode = `
        ${files
          .map((module, index) => `import * as module${index} from '${module}'`)
          .join(';')}

        const modules = [${files
          .map((module, index) => `module${index}`)
          .join(',')}];

        export default modules;
        export const filenames = [${files
          .map((module, index) => `'${module}'`)
          .join(',')}]
      `;

      return { contents: importerCode, resolveDir: args.pluginData.resolveDir };
    });
  },
});

export default EsbuildPluginImportGlob;
