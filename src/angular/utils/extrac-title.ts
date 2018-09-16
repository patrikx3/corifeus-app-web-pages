const cache = {

};

export function extractTitle(pkg: any) : string {
    if (pkg === undefined) {
        return '';
    }
    if (pkg.name === undefined) {
        return '';
    }
    if (cache.hasOwnProperty(pkg.name)) {
        return cache[pkg.name];
    }

    if (pkg.name  === 'corifeus' ) {
        cache[pkg.name] = 'Corifeus';
        return cache[pkg.name];
    }
    if (pkg.name.startsWith('grunt')) {
        let result = pkg.name.split('-').map((word: string) => {
            return word[0].toUpperCase() + word.substr(1)
        });
        result = result.slice();
        result.splice(1, 1);

        cache[pkg.name] = result.join(' ');
        return cache[pkg.name];
    } else {
        let result : string = pkg.name.split('-').map((word: string) => {
            return word[0].toUpperCase() + word.substr(1)
        }).slice(1).join(' ');
        if (result !== undefined && result.startsWith('Openwrt')) {
            result = result.replace('Openwrt', 'OpenWrt')
        }
        result = result.split(' ').map((elem: string) => {
            if (elem.length === 2) {
                elem = elem.toUpperCase()
            } else if (elem.toLowerCase() === 'pdf') {
                elem = elem.toUpperCase()
            } else if (elem.endsWith('db')) {
                elem = elem.substr(0, elem.length - 2) + 'DB'
            }
            return elem
        }).join(' ')
        cache[pkg.name] = result;
        return cache[pkg.name];
    }
}

export function extractTitleWithStars(pkg: any) : string {
    let title = extractTitle(pkg);
    if (pkg !== undefined && pkg !== null && pkg.corifeus.stargazers_count < 1) {
        return title
    }
    return `${title} ⭐${pkg.corifeus.stargazers_count}`;
}
