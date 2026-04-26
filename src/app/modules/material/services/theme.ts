import { Injectable, Inject } from '@angular/core';

import kebabCase from 'lodash/kebabCase';
import debounce from 'lodash/debounce'

import { CookieService, SettingsService } from '../../web';

export type ThemeType = "dark" | "light";

const VERTEX_SHADER_SRC = `
attribute vec2 a_position;

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_halfWidth;
uniform float u_amp;
uniform vec4 u_wave1;
uniform vec4 u_wave2;
uniform float u_passthrough;

vec2 waveContrib(float x, vec4 w) {
    float f = w.x;
    float phase = w.y;
    float speed = w.z;
    float ampFactor = w.w;
    float p = phase + u_time * speed;
    float amp = u_amp * ampFactor;
    float y = sin(f * x + p) * amp + sin(f * 0.5 * x + p) * amp * 0.3;
    float s = cos(f * x + p) * amp * f + cos(f * 0.5 * x + p) * amp * f * 0.15;
    return vec2(y, s);
}

void main() {
    if (u_passthrough > 0.5) {
        gl_Position = vec4(a_position, 0.0, 1.0);
        return;
    }

    float x = a_position.x;
    float side = a_position.y;
    float midY = u_resolution.y * 0.5;

    vec2 w1 = waveContrib(x, u_wave1);
    vec2 w2 = waveContrib(x, u_wave2);

    float y = midY + w1.x + w2.x;
    float slope = w1.y + w2.y;

    float invLen = inversesqrt(1.0 + slope * slope);
    vec2 normal = vec2(-slope, 1.0) * invLen;

    vec2 pos = vec2(x, y) + normal * side * u_halfWidth;

    vec2 clip = (pos / u_resolution) * 2.0 - 1.0;
    gl_Position = vec4(clip.x, clip.y, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER_SRC = `
precision mediump float;
uniform vec4 u_color;
void main() {
    gl_FragColor = u_color;
}
`;

@Injectable()
export class ThemeService {

    public current: string;

    public selected: string;

    public all: string[];

    private settings: any;

    public type: ThemeType;

    public usingCookie = false;

    private runningEffect: symbol | null = null;
    private gl: WebGLRenderingContext | null = null;
    private glProgram: WebGLProgram | null = null;
    private glWaveBuffer: WebGLBuffer | null = null;
    private glQuadBuffer: WebGLBuffer | null = null;
    private glWaveVertexCount: number = 0;
    private glUniforms: {
        resolution: WebGLUniformLocation | null,
        time: WebGLUniformLocation | null,
        halfWidth: WebGLUniformLocation | null,
        amp: WebGLUniformLocation | null,
        wave1: WebGLUniformLocation | null,
        wave2: WebGLUniformLocation | null,
        color: WebGLUniformLocation | null,
        passthrough: WebGLUniformLocation | null,
    } | null = null;
    private glPosLoc: number = -1;
    private glStartTime: number = 0;

    constructor(
        private cookies: CookieService,
        private settingsAll: SettingsService,
        @Inject('Window') private window: Window
    ) {
        this.windowResize = debounce(this.windowResizeRaw.bind(this), 250)
        if (typeof window !== 'undefined' && this.window && (this.window as any).addEventListener) {
            this.listenToResize();
        }
    }

    private listenToResize() {
        const handler = () => this.windowResize();
        this.window.addEventListener('resize', handler);
        this.window.addEventListener('orientationchange', handler);
    }

    boot() {
        this.settings = this.settingsAll.data.material;

        this.all = this.settings.themes.material.map((element: string) => {
            return kebabCase(element)
        })

        const fromCookie = this.cookies.get(this.settings.cookie.theme);
        try {
            if (fromCookie !== undefined) {
                this.usingCookie = true;
                this.setTheme(fromCookie);
            } else {
                this.setTheme('auto');
            }
        } catch (e) {
            this.setTheme('auto');
        }
        this.startBackgroundEffect();
        this.listenToSystemThemeChange();
    }

    private listenToSystemThemeChange() {
        this.window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
            if (this.selected === 'auto') {
                this.setTheme('auto');
            }
        });
    }

    private resolveSystemTheme(): string {
        const isSystemDarkMode = this.window.matchMedia('(prefers-color-scheme: dark)').matches;
        return isSystemDarkMode ? 'cory-mat-theme-dark-matrix' : 'cory-mat-theme-light-forest';
    }

    setTheme(newTheme: string) {
        newTheme = kebabCase(newTheme);

        let resolvedTheme: string;

        if (newTheme === 'auto' || !newTheme || this.all.indexOf(newTheme) === -1) {
            this.selected = 'auto';
            resolvedTheme = this.resolveSystemTheme();
        } else {
            this.selected = newTheme;
            resolvedTheme = newTheme;
        }

        const body = document.getElementsByTagName("body")[0];

        body.classList.remove(this.current);

        this.current = resolvedTheme;
        body.classList.add(this.current);

        this.cookies.set(this.settings.cookie.theme, this.selected);

        if (this.current.startsWith('cory-mat-theme-dark')) {
            this.type = "dark";
            body.classList.add('cory-mat-theme-dark');
            body.classList.remove('cory-mat-theme-light');
        } else {
            this.type = "light";
            body.classList.add('cory-mat-theme-light')
            body.classList.remove('cory-mat-theme-dark');
        }

        this.startBackgroundEffect();
    }

    private recreateCanvas(): HTMLCanvasElement | null {
        const old = document.getElementById("cory-pages-layout-background") as HTMLCanvasElement;
        if (!old) return null;

        const fresh = document.createElement("canvas");
        fresh.id = old.id;
        const existingStyle = old.getAttribute('style') || 'z-index: -1;';
        fresh.setAttribute('style', existingStyle);
        fresh.style.display = 'block';

        old.parentNode!.replaceChild(fresh, old);

        const dpr = Math.min(this.window.devicePixelRatio || 1, 2);
        fresh.width = Math.floor(this.window.innerWidth * dpr);
        fresh.height = Math.floor(this.window.innerHeight * dpr);
        fresh.style.width = this.window.innerWidth + 'px';
        fresh.style.height = this.window.innerHeight + 'px';

        return fresh;
    }

    private startBackgroundEffect() {
        const mine = Symbol('bg-effect');
        this.runningEffect = mine;

        this.teardownGL();

        const canvas = this.recreateCanvas();
        if (!canvas) return;

        if (this.current === 'cory-mat-theme-dark-matrix') {
            this.startMatrixEffect(canvas, mine);
        } else {
            this.startGLWaves(canvas, mine);
        }
    }

    private teardownGL() {
        if (this.gl) {
            if (this.glProgram) this.gl.deleteProgram(this.glProgram);
            if (this.glWaveBuffer) this.gl.deleteBuffer(this.glWaveBuffer);
            if (this.glQuadBuffer) this.gl.deleteBuffer(this.glQuadBuffer);
        }
        this.gl = null;
        this.glProgram = null;
        this.glWaveBuffer = null;
        this.glQuadBuffer = null;
        this.glUniforms = null;
        this.glWaveVertexCount = 0;
        this.glPosLoc = -1;
    }

    private compileShader(gl: WebGLRenderingContext, type: number, src: string): WebGLShader | null {
        const shader = gl.createShader(type);
        if (!shader) return null;
        gl.shaderSource(shader, src);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('Shader compile failed:', gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    private buildWaveVertexBuffer(gl: WebGLRenderingContext, widthCss: number): { buffer: WebGLBuffer, count: number } | null {
        const halfWidthCss = 50;
        const sampleStep = 1;
        const xStart = -halfWidthCss * 2;
        const xEnd = widthCss + halfWidthCss * 2;
        const numSamples = Math.ceil((xEnd - xStart) / sampleStep) + 1;

        const verts = new Float32Array(numSamples * 4);
        let idx = 0;
        for (let i = 0; i < numSamples; i++) {
            const x = xStart + i * sampleStep;
            verts[idx++] = x;  verts[idx++] = 1.0;
            verts[idx++] = x;  verts[idx++] = -1.0;
        }

        const buffer = gl.createBuffer();
        if (!buffer) return null;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);

        return { buffer, count: numSamples * 2 };
    }

    private buildQuadBuffer(gl: WebGLRenderingContext): WebGLBuffer | null {
        const buffer = gl.createBuffer();
        if (!buffer) return null;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            -1, -1,   1, -1,  -1,  1,
            -1,  1,   1, -1,   1,  1,
        ]), gl.STATIC_DRAW);
        return buffer;
    }

    private startGLWaves(canvas: HTMLCanvasElement, token: symbol) {
        const gl = canvas.getContext('webgl', {
            antialias: true,
            alpha: true,
            premultipliedAlpha: false,
            stencil: true,
            depth: false,
        }) as WebGLRenderingContext | null;

        if (!gl) {
            console.warn('WebGL unavailable; sine wave background disabled');
            return;
        }
        this.gl = gl;

        const vs = this.compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER_SRC);
        const fs = this.compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SRC);
        if (!vs || !fs) return;

        const program = gl.createProgram();
        if (!program) return;
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('WebGL program link failed:', gl.getProgramInfoLog(program));
            return;
        }
        gl.useProgram(program);
        this.glProgram = program;

        const widthCss = this.window.innerWidth;
        const heightCss = this.window.innerHeight;

        const waveInfo = this.buildWaveVertexBuffer(gl, widthCss);
        if (!waveInfo) return;
        this.glWaveBuffer = waveInfo.buffer;
        this.glWaveVertexCount = waveInfo.count;

        this.glQuadBuffer = this.buildQuadBuffer(gl);
        if (!this.glQuadBuffer) return;

        this.glPosLoc = gl.getAttribLocation(program, 'a_position');
        gl.enableVertexAttribArray(this.glPosLoc);

        this.glUniforms = {
            resolution: gl.getUniformLocation(program, 'u_resolution'),
            time: gl.getUniformLocation(program, 'u_time'),
            halfWidth: gl.getUniformLocation(program, 'u_halfWidth'),
            amp: gl.getUniformLocation(program, 'u_amp'),
            wave1: gl.getUniformLocation(program, 'u_wave1'),
            wave2: gl.getUniformLocation(program, 'u_wave2'),
            color: gl.getUniformLocation(program, 'u_color'),
            passthrough: gl.getUniformLocation(program, 'u_passthrough'),
        };

        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clearColor(0, 0, 0, 0);
        gl.clearStencil(0);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        const ampCss = heightCss * 0.1;
        const halfWidthCss = 50;

        const drawWaveGroup = (
            wave1: [number, number, number, number],
            wave2: [number, number, number, number],
            color: [number, number, number, number],
        ) => {
            gl.clear(gl.STENCIL_BUFFER_BIT);

            gl.enable(gl.STENCIL_TEST);
            gl.colorMask(false, false, false, false);
            gl.stencilOp(gl.KEEP, gl.KEEP, gl.REPLACE);
            gl.stencilFunc(gl.ALWAYS, 1, 0xFF);
            gl.stencilMask(0xFF);
            gl.disable(gl.BLEND);

            gl.bindBuffer(gl.ARRAY_BUFFER, this.glWaveBuffer);
            gl.vertexAttribPointer(this.glPosLoc, 2, gl.FLOAT, false, 0, 0);
            gl.uniform1f(this.glUniforms!.passthrough, 0.0);
            gl.uniform4f(this.glUniforms!.wave1, wave1[0], wave1[1], wave1[2], wave1[3]);
            gl.uniform4f(this.glUniforms!.wave2, wave2[0], wave2[1], wave2[2], wave2[3]);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.glWaveVertexCount);

            gl.colorMask(true, true, true, true);
            gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
            gl.stencilFunc(gl.EQUAL, 1, 0xFF);
            gl.stencilMask(0x00);
            gl.enable(gl.BLEND);

            gl.bindBuffer(gl.ARRAY_BUFFER, this.glQuadBuffer);
            gl.vertexAttribPointer(this.glPosLoc, 2, gl.FLOAT, false, 0, 0);
            gl.uniform1f(this.glUniforms!.passthrough, 1.0);
            gl.uniform4f(this.glUniforms!.color, color[0], color[1], color[2], color[3]);
            gl.drawArrays(gl.TRIANGLES, 0, 6);

            gl.disable(gl.STENCIL_TEST);
        };

        this.glStartTime = performance.now();

        const draw = () => {
            if (this.runningEffect !== token || !this.gl || !this.glUniforms) return;
            const t = (performance.now() - this.glStartTime) / 1000;

            gl.clear(gl.COLOR_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
            gl.uniform2f(this.glUniforms.resolution, widthCss, heightCss);
            gl.uniform1f(this.glUniforms.time, t);
            gl.uniform1f(this.glUniforms.halfWidth, halfWidthCss);
            gl.uniform1f(this.glUniforms.amp, ampCss);

            drawWaveGroup(
                [0.02, 0.0, 2.7, 1.0],
                [0.0, 0.0, 0.0, 0.0],
                [0.4, 0.8, 0.4, 0.8],
            );

            drawWaveGroup(
                [0.018, 0.0, 2.16, 1.0],
                [0.035, 1.047197, 3.24, 1.0],
                [0.4, 0.8, 0.4, 0.3],
            );

            requestAnimationFrame(draw);
        };
        requestAnimationFrame(draw);
    }

    private startMatrixEffect(canvas: HTMLCanvasElement, token: symbol) {
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const matrix = "安吧八爸百北不大岛的弟地东都对多儿二方港哥个关贵国过海好很会家见叫姐京九可老李零六吗妈么没美妹们名明哪那南你您朋七起千去人认日三上谁什生师十识是四他她台天湾万王我五西息系先香想小谢姓休学也一亿英友月再张这中字".split("");

        const font_size = 8;
        ctx.font = font_size + "px Roboto Mono";

        const columns = canvas.width / font_size;
        const drops: number[] = [];
        for (let x = 0; x < columns; x++) drops[x] = 1;

        const drawFrame = () => {
            const colors = ['#27c027', '#00ff00', '#20b920', '#000000'];
            ctx.fillStyle = "rgba(0, 0, 0, 0.04)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < drops.length; i++) {
                ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
                ctx.fillText(matrix[Math.floor(Math.random() * matrix.length)], i * font_size, drops[i] * font_size);
                if (drops[i] * font_size > canvas.height && Math.random() > 0.975) drops[i] = 0;
                drops[i]++;
            }
        };

        for (let i = 0; i < 200; i++) drawFrame();

        const fps = 18;
        const frameInterval = 1000 / fps;
        let last = 0;
        const loop = (t: number) => {
            if (this.runningEffect !== token) return;
            if (t - last >= frameInterval) {
                drawFrame();
                last = t;
            }
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }

    windowResize: any

    windowResizeRaw() {
        this.startBackgroundEffect();
    }
}
