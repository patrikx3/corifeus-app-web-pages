export function Token(token: String): any {
    try {
        if (token === '') {
            return token;
        }
        const data = token.split('-');
        const info = JSON.parse(atob(data[0]));
        return info;
    } catch (e) {
        console.error(e);
        throw e;
    }
}
