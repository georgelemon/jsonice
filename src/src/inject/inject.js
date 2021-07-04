/**
 * JSONice | Browser extension 🍋 Lemonify JSON responses
 * while working on REST APIs. Auto Dark & Light mode included.
 * Works in Chrome, Brave and Chromium
 * 
 * JSONice contains some work from @dpilafian.
 * 
 * @author George Lemon <georgelemon@protonmail.com
 * @author dpilafian
 * @license GPLv3
 */
const beautify = {
    version: '1.0.1',
    toHtml(thing, options) {
        const defaults = { indent: 4, linkUrls: true, quoteKeys: false };
        const settings = { ...defaults, ...options };
        const htmlEntities = (text) => {
            return text
                .replace(/&/g, '&amp;')
                .replace(/\\"/g, '&bsol;&quot;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
        };
        const spanTag = (type, display) => display ? '<span class=json-' + type + '>' + display + '</span>' : '';
        const buildValueHtml = (value) => {
            let strType = /^"/.test(value) && 'string';
            let boolType = ['true', 'false'].includes(value) && 'boolean';
            let nullType = value === 'null' && 'null';
            let type = boolType || nullType || strType || 'number';
            let urlRegex = /https?:\/\/[^\s"]+/g;
            let makeLink = (link) => '<a class=json-link target="_blank" href="' + link + '">' + link + '</a>';
            let display = strType && settings.linkUrls ? value.replace(urlRegex, makeLink) : value;
            return spanTag(type, display);
        };
        const replacer = (match, p1, p2, p3, p4) => {
            let part = { indent: p1, key: p2, value: p3, end: p4 };
            let findName = settings.quoteKeys ? /(.*)(): / : /"([\w$]+)": |(.*): /;
            let indentHtml = part.indent || '';
            let keyName = part.key && part.key.replace(findName, '$1$2');
            let keyHtml = part.key ? spanTag('key', keyName) + spanTag('mark', ': ') : '';
            let valueHtml = part.value ? buildValueHtml(part.value) : '';
            let endHtml = spanTag('mark', part.end);
            return indentHtml + keyHtml + valueHtml + endHtml;
        };
        const jsonLine = /^( *)("[^"]+": )?("[^"]*"|[\w.+-]*)?([{}[\],]*)?$/mg;
        const json = JSON.stringify(thing, null, settings.indent) || 'undefined';
        return htmlEntities(json).replace(jsonLine, replacer);
    },
};

/**
 * Add a CSS class to html to reflect current OS color scheme.
 * @return {Void}
 */
const getColorScheme = function(isDark) {
    if( isDark === true ) return 'dark-mode'
    if( isDark === false ) return 'light-mode'
    return (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark-mode' : 'light-mode')
}

const initThemeMode = function(mode) {
    let htmlTag = document.getElementsByTagName('html')[0]
    if(mode === 'dark-mode') {
        htmlTag.classList.remove('light-mode')
        htmlTag.classList.add('dark-mode')
    } else {
        htmlTag.classList.remove('dark-mode')
        htmlTag.classList.add('light-mode')
    }
}

chrome.extension.sendMessage({}, function(resp) {
    if( document.contentType !== 'application/json' ) return

    initThemeMode(getColorScheme())
    window.matchMedia('(prefers-color-scheme: dark)')
          .addEventListener('change', e => initThemeMode(getColorScheme(e.matches)))

    let initpre = document.querySelector('pre')
    try {
        let parsed = JSON.parse(initpre.textContent)
        initpre.innerHTML = beautify.toHtml(parsed)
    } catch (error) {
        initpre.innerHTML = ''
        let warning = document.createElement('div')
            warning.classList.add('jsonice-error')
            warning.textContent = error
        document.body.appendChild(warning)
    }
});