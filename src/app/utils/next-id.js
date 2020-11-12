let currentId = 0
let currentIdTime = Date.now()

const random = () => {
    return (Math.floor(Math.random() * (99999999999999999 - 10000000000000000)) + 10000000000000000).toString(16)
}


const reverse = function (str) {
    return str.split('').reverse().join('')
}

const nextId = () => {

    const now = Date.now();
    if (currentIdTime !== now) {
        currentId = 0;
        currentIdTime = now
    }
    const comingId = ++currentId;
    const randomHex = reverse(random()).padStart(15, '0');
    const timeHex = reverse(currentIdTime.toString(16).padStart(12, '0'))
    const comingIdHex = reverse(comingId.toString(16).padStart(3, '0'));
    const newId = `P3Xid${timeHex}${comingIdHex}${randomHex}`;
    //console.log(newId)
    return newId
}

module.exports = nextId
