if (process.env.ENV === 'production') {
    // Production
    require('corifeus-web-material/src/bundle');
} else {
    // Development
}
require('../assets/style.scss')


