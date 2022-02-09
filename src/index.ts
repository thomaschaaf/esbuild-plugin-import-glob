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
        // 'path' is the value that esbuild uses for optimizations, to not call 'onLoad' for the same file again.
        // 'args.path' contains only the glob string. If the same glob string is used from different directories,
        // then the found globbing from a previous directory is used again.
        // To enforce that globbing is done again, when a different directory appears, the path is fed with a 
        // concatenation of the glob string and the directory
        path: args.resolveDir + '|' + args.path,
        namespace: 'import-glob',
      };
    });

    build.onLoad({ filter: /.*/, namespace: 'import-glob' }, async (args) => {
      const [resolveDir, path] = args.path.split('|');
      const files = (
        await fastGlob(path, {
          cwd: resolveDir,
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

      return { contents: importerCode, resolveDir };
    });
  },
});

export default EsbuildPluginImportGlob;
