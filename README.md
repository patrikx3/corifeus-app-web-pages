[//]: #@corifeus-header

  

[![Donate for Corifeus / P3X](https://img.shields.io/badge/Donate-Corifeus-003087.svg)](https://paypal.me/patrikx3) [![Contact Corifeus / P3X](https://img.shields.io/badge/Contact-P3X-ff9900.svg)](https://www.patrikx3.com/en/front/contact) [![Corifeus @ Facebook](https://img.shields.io/badge/Facebook-Corifeus-3b5998.svg)](https://www.facebook.com/corifeus.software)  [![Build Status](https://github.com/patrikx3/corifeus-app-web-pages/workflows/build/badge.svg)](https://github.com/patrikx3/corifeus-app-web-pages/actions?query=workflow%3Abuild)
[![Uptime Robot ratio (30 days)](https://img.shields.io/uptimerobot/ratio/m780749701-41bcade28c1ea8154eda7cca.svg)](https://stats.uptimerobot.com/9ggnzcWrw)





# 🕸️ Corifeus App Web Pages v2021.4.113



**Bugs are evident™ - MATRIX️**
    

### NodeJs LTS Version Requirement
```txt
>=12.13.0
```

### Built on NodeJs
```txt
v14.17.0
```

The ```async``` and ```await``` keywords are required. Only the latest LTS variant is supported.

Install NodeJs:
https://nodejs.org/en/download/package-manager/


# Built on Angular

```text
12.0.0
```



# Description

                        
[//]: #@corifeus-header:end

It is the common GitHub pages for all Corifeus projects.  
The Markdown rendering is off-loaded via a web worker. Non-blocking rendering, good for mobile clients.  
The code is splitted into multiple js chunks and using the script defer (deferred) loading.

# More info
[API](https://api.github.com/)   
[Repositories](https://api.github.com/users/patrikx3/repos)


There is an error in TypeScript. The workaround is in ```tsconfig.json```:
```json
{
    "compilerOptions": {
        "skipLibCheck": true    
    }
}
```

Should remove once it works.


# `@Host()` decorator not working in Ivy
https://github.com/angular/angular/issues/31539    
Actually, I can inject the component without the `@Host` decorator.
  
[//]: #@corifeus-footer

---

🙏 This is an open-source project. Star this repository, if you like it, or even donate to maintain the servers and the development. Thank you so much!

Possible, this server, rarely, is down, please, hang on for 15-30 minutes and the server will be back up.

All my domains ([patrikx3.com](https://patrikx3.com) and [corifeus.com](https://corifeus.com)) could have minor errors, since I am developing in my free time. However, it is usually stable.

**Note about versioning:** Versions are cut in Major.Minor.Patch schema. Major is always the current year. Minor is either 4 (January - June) or 10 (July - December). Patch is incremental by every build. If there is a breaking change, it should be noted in the readme.


---

[**CORIFEUS-APP-WEB-PAGES**](https://corifeus.com/corifeus-app-web-pages) Build v2021.4.113

[![Donate for Corifeus / P3X](https://img.shields.io/badge/Donate-Corifeus-003087.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=QZVM4V6HVZJW6)  [![Contact Corifeus / P3X](https://img.shields.io/badge/Contact-P3X-ff9900.svg)](https://www.patrikx3.com/en/front/contact) [![Like Corifeus @ Facebook](https://img.shields.io/badge/LIKE-Corifeus-3b5998.svg)](https://www.facebook.com/corifeus.software)


## P3X Sponsor

[IntelliJ - The most intelligent Java IDE](https://www.jetbrains.com/?from=patrikx3)

[![JetBrains](https://cdn.corifeus.com/assets/svg/jetbrains-logo.svg)](https://www.jetbrains.com/?from=patrikx3)




[//]: #@corifeus-footer:end
