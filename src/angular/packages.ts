if (process.env.ENV === 'production') {
    // Production
} else {
    // Development
    require('corifeus-web');
    require('corifeus-web-material/src/bundle');
    require('corifeus-web-material');

    require('highlight.js/lib/highlight.js');
    require('marked')
    require('twemoji')
}

