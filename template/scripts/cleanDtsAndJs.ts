import { removeSync, readdirSync, statSync } from 'fs-extra';
import { join } from 'path';

function removeDts(path: string) {
    const files = readdirSync(path);

    files.forEach(
        (file) => {
            const stat = statSync(join(path, file));
            if (stat.isDirectory() && !['types', 'typings', 'lin-ui'].includes(file)) {
                removeDts(join(path, file));
            }
            else if ((file.endsWith('.d.ts') || file.endsWith('.js')) && file !== 'react-app-env.d.ts') {
                removeSync(join(path, file));
                console.log(`remove ${join(path, file)}`);
            }
        }
    );
}

if (process.argv[2]) {
    console.log(`清理${process.argv[2]}路径下的d.ts和js文件`);
    removeDts(join(process.cwd(), process.argv[2]));
}
else {
    console.log('请输入路径名');
}

