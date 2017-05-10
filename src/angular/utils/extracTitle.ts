

export function extractTitle(pkg: any) : string {
    if (pkg === undefined) {
        return;
    }
    if (pkg.name === undefined) {
        return;
    }
    if (pkg.name  === 'corifeus' ) {
        return 'Corifeus One';
    }
    let result = pkg.name.split('-').map((word: string) => {
        return word[0].toUpperCase() + word.substr(1)
    }).slice(1).join(' ');
    return result;
}

