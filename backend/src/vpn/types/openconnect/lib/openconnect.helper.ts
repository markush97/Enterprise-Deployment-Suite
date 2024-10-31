import {exec} from './exec';

export const connect = async (remote: string, username: string, password: string, authgroup: string, name: string, vendor: 'anyconnect' | 'gp' | 'fortinet' | 'openconnect') => {
    try {
        await exec(`echo ${password} | sudo openconnect --protocol=${vendor} --background --servercert pin-sha256:q+pYWBNW7f5OY5O9kGPXXwTCT4kEJS8ix6OhSXZrzKs= --user=${username} --non-inter --authgroup=${authgroup} --interface=${name} --passwd-on-stdin ${remote}`, {
            onData: (d) => console.log(d),
            // onError: (d) => console.log(d),
             onClose: (d) => {
                console.log('Tunnel setup')
             }
        })
    } catch (e) {
        console.error(e);
    }
}

/**
 * Checks that Openconnect is installed and available in path at 'openconnect' and returns the version string.
 * 
 * Will throw on Error if wg is not installed
 */
export const checkOpenconnectIsInstalled = async () => {
    try {
        const version = await exec('openconnect --version')
        return version
    } catch (e) {
        throw new Error('Openconnect is not installed on the system. Please install openconnect')
    }

}