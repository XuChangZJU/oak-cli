import {
    Success,
    error,
    primary,
    success,
    warn,
    Warn,
} from './tip-style';
import spawn from 'cross-spawn';
import { resolve } from 'path';
import { copyFileSync, unlinkSync } from 'fs';

export default async function run(options: any): Promise<void> {
    const prjDir = process.cwd();
    const cwd = resolve(process.cwd(), options.subDir || 'native');
    if (options.platform === 'ios') {
        copyFileSync(resolve(prjDir, 'package.json'), resolve(cwd, 'package.json'));
        Success(`${primary('run react-native run-ios')}`);
        const result = spawn.sync(
            'react-native',
            ['run-ios'],
            {
                cwd,
                stdio: 'inherit',
                shell: true,
            }
        );

        if (result.status === 0) {
            Success(`${success(`react-native run-ios success`)}`);
        } else {
            Error(`${error('react-native run-ios fail')}`);
            process.exit(-1);
        }
    }
    else if (options.platform === 'android') {
        Success(`${primary('run react-native run-android')}`);
        copyFileSync(resolve(prjDir, 'package.json'), resolve(cwd, 'package.json'));
        const result = spawn.sync(
            'react-native',
            ['run-android'],
            {
                cwd,
                stdio: 'inherit',
                shell: true,
            }
        );
        
        if (result.status === 0) {
            Success(`${success(`react-native run-android success`)}`);
        } else {
            Error(`${error('react-native run-android fail')}`);
            process.exit(-1);
        }
    }
    else {
        Error(error(`unrecoganized platfrom: ${options.platform}`));
        process.exit(-1);
    }
}