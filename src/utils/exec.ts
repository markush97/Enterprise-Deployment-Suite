import * as util from 'util';
import * as childProcess from 'child_process';

const execute = util.promisify(childProcess.exec);

interface Options {
  onData?: (data: string) => void;
  onError?: (err: string) => void;
  onClose?: (code: number) => void;
}

export const exec = async (command: string, opts?: Options): Promise<string> => {
  const promise = execute(command);
  const child = promise.child;

  if (opts) {
    const { onData, onError, onClose } = opts;
    if (onData && child.stdout) {
      child.stdout.on('data', onData);
    }
    if (onError && child.stderr) {
      child.stderr.on('data', onError);
    }
    if (onClose) {
      child.on('close', onClose);
    }
  }

  try {
    const { stdout, stderr } = await promise;
    if (stderr) throw new Error(stderr);
    return stdout;
  } catch (error) {
    throw new Error(`Command failed: ${error.message}`);
  }
};