import * as path from 'path';
import * as ts from 'typescript';

const rootDir = path.resolve(__dirname, '..');
// Virtual directory (never written to disk) located inside the project so that node_modules resolution works
const declarationsDir = path.join(rootDir, 'dist-declarations-check');

function emitDeclarations(): Map<string, string> {
  const config = ts.getParsedCommandLineOfConfigFile(path.join(rootDir, 'tsconfig.json'), {}, {
    ...ts.sys,
    onUnRecoverableConfigFileDiagnostic: (diagnostic) => {
      throw new Error(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
    },
  });
  if (!config) {
    throw new Error('Unable to parse tsconfig.json');
  }
  const files = new Map<string, string>();
  const program = ts.createProgram(config.fileNames, {
    ...config.options,
    declaration: true,
    emitDeclarationOnly: true,
    noEmit: false,
    outDir: declarationsDir,
  });
  const result = program.emit(undefined, (fileName, text) => files.set(fileName, text));
  if (result.emitSkipped) {
    throw new Error('Declaration emit was skipped');
  }
  return files;
}

function checkDeclarations(files: Map<string, string>, options: ts.CompilerOptions): string[] {
  const host = ts.createCompilerHost(options);
  const { fileExists, readFile, directoryExists } = host;
  host.fileExists = (fileName) => files.has(fileName) || fileExists.call(host, fileName);
  host.readFile = (fileName) => files.get(fileName) ?? readFile.call(host, fileName);
  host.directoryExists = (directoryName) =>
    directoryName === declarationsDir || (directoryExists ? directoryExists.call(host, directoryName) : false);

  const program = ts.createProgram([path.join(declarationsDir, 'index.d.ts')], options, host);
  return ts.getPreEmitDiagnostics(program)
    // Only report problems located in our own declaration files, not in third-party typings
    .filter((diagnostic) => diagnostic.file && diagnostic.file.fileName.startsWith(declarationsDir))
    // TS1479 (CommonJS require() of an ES module) is reported by typescript < 5.8 for any import of the ESM-only
    // nestjs 12.x packages, including the consumer's own: not specific to our declarations
    .filter((diagnostic) => diagnostic.code !== 1479)
    .map((diagnostic) => ts.formatDiagnostic(diagnostic, {
      getCanonicalFileName: (fileName) => fileName,
      getCurrentDirectory: () => rootDir,
      getNewLine: () => '\n',
    }).trim());
}

describe('declaration files', () => {
  let files: Map<string, string>;

  beforeAll(() => {
    files = emitDeclarations();
  });

  it('are emitted', () => {
    expect(files.has(path.join(declarationsDir, 'index.d.ts'))).toBe(true);
  });

  // nestjs 12.x ships an "exports" map, so deep imports like "@nestjs/common/interfaces" no longer resolve
  // for consumers using moduleResolution "node16"/"nodenext" (the default for nestjs projects)
  it('type-check for consumers using moduleResolution nodenext', () => {
    const diagnostics = checkDeclarations(files, {
      module: ts.ModuleKind.NodeNext,
      moduleResolution: ts.ModuleResolutionKind.NodeNext,
      noEmit: true,
      skipLibCheck: false,
      strict: true,
      types: [],
    });
    expect(diagnostics).toEqual([]);
  }, 30000);
});
