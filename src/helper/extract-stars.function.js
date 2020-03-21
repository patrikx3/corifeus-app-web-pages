module.exports.extractStars = (stars) => {
    if (stars >= 1000) {
        const starsCount = parseFloat((stars / 1000).toFixed(1))
        return ( starsCount === Math.ceil(starsCount) ? starsCount.toFixed(0) : starsCount.toFixed(1)) + 'k'
    }
    return stars
}
