import {Injectable,} from '@angular/core';

import kebabCase from 'lodash/kebabCase';

import {CookieService, SettingsService} from '../../web';

//import {OverlayContainer} from '@angular/material';

export type ThemeType = "dark" | "light";

import debounce from 'lodash/debounce'

@Injectable()
export class ThemeService {

    private firstThemeImport = true

    public current: string;

    private original: string;

    private all: string[];

    private settings: any;

    public type: ThemeType;

    public usingCookie = false;

    constructor(
        private cookies: CookieService,
        private settingsAll: SettingsService,
        //        private overlayContainer: OverlayContainer
    ) {
        this.firstThemeImport = true
        this.windowResize = debounce(this.windowResizeRaw.bind(this), 250)
    }

    boot() {
        this.settings = this.settingsAll.data.material;

        this.original = this.settings.themes.material[6]
        this.current = this.original;

        this.all = this.settings.themes.material.map((element: string) => {
            return kebabCase(element)
        })

        const fromCookie = this.cookies.get(this.settings.cookie.theme);
        try {
            if (fromCookie !== undefined) {
                this.usingCookie = true;
                this.setTheme(fromCookie);
            } else {
                this.setTheme(this.original);
            }
        } catch (e) {
            this.setTheme(this.original);
        }

    }

    setTheme(newTheme: string) {
        newTheme = kebabCase(newTheme);

        if (newTheme === this.current && this.firstThemeImport === false) {
            return
        }

        if (this.all.indexOf(newTheme) > -1) {

            if (this.firstThemeImport) {
                document.body.style.visibility = 'hidden'
            }

            import(
                /* webpackPrefetch: true */
                `../scss/material/theme/_${newTheme}.scss`
                ).then((module) => {

                /*
                 */
                if (this.firstThemeImport) {
                   window.addEventListener('resize', this.windowResize.bind(this))
                }
                document.getElementById("cory-pages-layout-theme-matrix").style.display = 'none'
                //console.warn('current', this.current, 'newTheme', newTheme)
                if (newTheme === 'cory-mat-theme-dark-matrix' && (this.current !== 'cory-mat-theme-dark-matrix' || this.firstThemeImport)) {
                    //console.warn('run matrix effect')
                    this.runMatrixEffect()
                }

                const body = document.body;

                let style = document.getElementById('cory-web-app-pages-theme-style')
                if (style) {
                    style.remove()
                }
                style = document.createElement('style');
                style.id = 'cory-web-app-pages-theme-style'
                style.innerText = module.default
                document.head.appendChild(style)

                body.classList.remove(this.current);
//            this.overlayContainer.getContainerElement().classList.remove(this.current);

                this.current = newTheme;
                body.classList.add(this.current);
//            this.overlayContainer.getContainerElement().classList.add(this.current);

                //this.overlayContainer.themeClass = newTheme;
                this.cookies.set(this.settings.cookie.theme, this.current);

                if (this.current.startsWith('cory-mat-theme-dark')) {
                    this.type = "dark";
                    body.classList.add('cory-mat-theme-dark');
                    body.classList.remove('cory-mat-theme-light');
                } else {
                    this.type = "light";
                    body.classList.add('cory-mat-theme-light')
                    body.classList.remove('cory-mat-theme-dark');
                }

                if (this.firstThemeImport) {
                    this.firstThemeImport = false
                    document.body.style.visibility = 'visible'
                }

            })

        } else {
            throw new Error(`undefined ${newTheme}`);
        }
    }

    matrixEffectData: any

    clearMatrixEffect() {
        // geting canvas by Boujjou Achraf
        const c: any = document.getElementById("cory-pages-layout-theme-matrix");
        c.style.display = 'block'
        const ctx = c.getContext("2d");

        //making the canvas full screen
        //c.height = window.innerHeight - 124;
        c.height = window.innerHeight
        c.width = window.innerWidth;

        let matrix: any = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()*&^%+-/~{[|`]}";

        //chinese characters - taken from the unicode charset
        // https://www.chinese-tools.com/learn/characters/list.html
        //let matrix: any = "安吧八爸百北不大岛的弟地东都对多儿二方港哥个关贵国过海好很会家见叫姐京九可老李零六吗妈么没美妹们名明哪那南你您朋七起千去人认日三上谁什生师十识是四他她台天湾万王我五西息系先香想小谢姓休学也一亿英友月再张这中字"
        //let matrix: any = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()*&^%+-/~{[|`]}安吧八爸百北不大岛的弟地东都对多儿二方港哥个关贵国过海好很会家见叫姐京九可老李零六吗妈么没美妹们名明哪那南你您朋七起千去人认日三上谁什生师十识是四他她台天湾万王我五西息系先香想小谢姓休学也一亿英友月再张这中字"
        //converting the string into an array of single characters
        matrix = matrix.split("");

        const font_size = 10;
        ctx.font = font_size + "px Roboto Mono";

        const columns = c.width / font_size; //number of columns for the rain
        //an array of drops - one per column
        const drops = [];
        //x below is the x coordinate
        //1 = y co-ordinate of the drop(same for every drop initially)
        for (let x = 0; x < columns; x++)
            drops[x] = 1;

        //drawing the characters
        return {
            c,
            ctx,
            font_size,
            drops,
            matrix,
            start: true,
        }
    }

    runMatrixEffectTimeout: any;
    runMatrixEffect() {

        const fps = 18;

        this.matrixEffectData = this.clearMatrixEffect()

        const colors = ['#27c027', '#00ff00', '#20b920', '#000000']

        //const fps = 1000 / 6

        const draw = () => {

            if (this.current === 'cory-mat-theme-dark-matrix') {
                // console.info('request draw')
                //window.requestAnimationFrame(draw);

                /*
                const deltaTime = Date.now() - delta;
                if (deltaTime >= fps) {
                    requestAnimationFrame(draw);
                }
                else {
                    setTimeout(function () { requestAnimationFrame(draw); }, fps - deltaTime);
                }
                 */
                setTimeout(() => {
                    requestAnimationFrame(draw);
                }, 1000 / fps);

                //setTimeout(draw, fps)
            }

            const { c, ctx, font_size, drops, matrix } = this.matrixEffectData
            ///console.info('draw', self.current)

            const inlineDraw = () => {
                //Black BG for the canvas
                //translucent BG to show trail
                ctx.fillStyle = "rgba(0, 0, 0, 0.04)";
                ctx.fillRect(0, 0, c.width, c.height);

                //looping over drops
                for (let i = 0; i < drops.length; i++) {
                    ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)]
                    //a random chinese character to print
                    //x = i*font_size, y = value of drops[i]*font_size
                    ctx.fillText(matrix[Math.floor(Math.random() * matrix.length)], i * font_size, drops[i] * font_size);

                    //sending the drop back to the top randomly after it has crossed the screen
                    //adding a randomness to the reset to make the drops scattered on the Y axis
                    if (drops[i] * font_size > c.height && Math.random() > 0.975)
                        drops[i] = 0;

                    //incrementing Y coordinate
                    drops[i]++;
                }
            }

            //const delta = Date.now();

            if (this.matrixEffectData.start === false) {
                inlineDraw()
            } else {
                for (let i = 0; i < 200; i++) {
                    inlineDraw()
                }
                this.matrixEffectData.start = false
            }
        }
        setTimeout(() => requestAnimationFrame(draw))
        //setTimeout(draw, fps)
        //draw()
    }

    windowResize: any

    windowResizeRaw() {
        if (this.current === 'cory-mat-theme-dark-matrix') {
            this.matrixEffectData = this.clearMatrixEffect()
        }
    }
    /*
     */
}






