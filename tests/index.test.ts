import { build } from 'esbuild';
import requireContext from '../src/index';
import path from 'path';

describe('test', () => {
  it('should', async () => {
    const logs = await runTestFile('service/main.ts');

    const migrationModules = logs[0][0];
    expect(migrationModules).toMatchSnapshot();

    const entitiesModules = logs[1][0];
    expect(entitiesModules).toMatchSnapshot();

    const migration2Modules = logs[2][0];
    expect(migrationModules.default).toEqual(migration2Modules);
  });

  it('keeps proper scope of imports', async () => {
    const logs = await runTestFile('conflicts/main.ts');

    const [setA, setB] = logs[0];
    expect(setA).toMatchSnapshot();
    expect(setB).toMatchSnapshot();
  });

  async function runTestFile(testFile) {
    const result = await build({
      entryPoints: [path.resolve(__dirname, testFile)],
      write: false,
      plugins: [requireContext()],
      outfile: `tests/bundle.js`,
      bundle: true,
    });

    const fakeLogger = jest.fn();

    eval(`(console) => ${result.outputFiles[0].text}`)({ log: fakeLogger });

    return fakeLogger.mock.calls;
  }
});
