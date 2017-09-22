[//]: #@corifeus-header

 [![Build Status](https://travis-ci.org/patrikx3/corifeus-app-web-pages.svg?branch=master)](https://travis-ci.org/patrikx3/corifeus-app-web-pages)  [![Scrutinizer Code Quality](https://scrutinizer-ci.com/g/patrikx3/corifeus-app-web-pages/badges/quality-score.png?b=master)](https://scrutinizer-ci.com/g/patrikx3/corifeus-app-web-pages/?branch=master)  [![Code Coverage](https://scrutinizer-ci.com/g/patrikx3/corifeus-app-web-pages/badges/coverage.png?b=master)](https://scrutinizer-ci.com/g/patrikx3/corifeus-app-web-pages/?branch=master)  
 
---
# Corifeus App Web Pages - Support

This is an open source project. Just code.

### Node Version Requirement 
``` 
>=7.8.0 
```  
   
### Built on Node 
``` 
v8.5.0
```   
   
The ```async``` and ```await``` keywords are required.

Install NodeJs:    
https://nodejs.org/en/download/package-manager/    

# Description  

                        
[//]: #@corifeus-header:end


It is the common GitHub pages for all Corifeus projects.


# AOT
Right now, NPM LINKED modules not working with ```tsconfig.json```.

# More info
[API](https://api.github.com/)   
[Repositories](https://api.github.com/users/patrikx3/repos)


There is an error in TypeScript. The workaround is in ```tsconfig.json```:
```javascript
"skipLibCheck": true,
```

Should remove once it works.

# Node SASS errors
```bash
nodejs node_modules/node-sass/scripts/install.js
npm rebuild node-sass
```


[//]: #@corifeus-footer

---

[**CORIFEUS-APP-WEB-PAGES**](https://pages.corifeus.com/corifeus-app-web-pages) Build v4.4.11-221

[Corifeus](http://www.corifeus.com) by [Patrik Laszlo](http://patrikx3.com)

[//]: #@corifeus-footer:end