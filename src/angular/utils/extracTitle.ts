

export function extractTitle(pkg: any) : string {
    if (pkg === undefined) {
        return;
    }
    if (pkg.name === undefined) {
        return;
    }
    if (pkg.name  === 'corifeus' ) {
        return 'Corifeus';
    }
    if (pkg.name.startsWith('grunt')) {
        let result = pkg.name.split('-').map((word: string) => {
            return word[0].toUpperCase() + word.substr(1)
        });
        result = result.slice();
        result.splice(1, 1);
        return result.join(' ');
    } else {
        let result : string = pkg.name.split('-').map((word: string) => {
            return word[0].toUpperCase() + word.substr(1)
        }).slice(1).join(' ');
        if (result !== undefined && result.startsWith('Openwrt')) {
            result = result.replace('Openwrt', 'OpenWrt')
        }
        return result;
    }
}

