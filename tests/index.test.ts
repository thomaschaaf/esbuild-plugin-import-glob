import { build } from 'esbuild';
import requireContext from '../src/index';
import path from 'path';

describe('test', () => {
  it('should', async () => {
    const result = await build({
      entryPoints: [path.resolve(__dirname, 'service', 'main.ts')],
      write: false,
      plugins: [requireContext()],
      outfile: `tests/bundle.js`,
      bundle: true,
    });

    const fakeLogger = jest.fn();

    eval(`(console) => ${result.outputFiles[0].text}`)({ log: fakeLogger });

    const migrationModules = fakeLogger.mock.calls[0][0];
    expect(migrationModules).toMatchSnapshot();

    const entitesModules = fakeLogger.mock.calls[1][0];
    expect(entitesModules).toMatchSnapshot();

    const migration2Modules = fakeLogger.mock.calls[2][0];
    expect(migrationModules.default).toEqual(migration2Modules);
  });
});
