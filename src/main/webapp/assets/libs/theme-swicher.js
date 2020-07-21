!function(){"use strict";Element.prototype.matches||(Element.prototype.matches=Element.prototype.msMatchesSelector);var e=window;e.c1||(e.c1={});var t,r=[],n=document;function i(e,t){var r,i=0,o=[];for(t&&t.matches(e.selector)&&o.push(t),d&&Array.prototype.push.apply(o,(t||n).querySelectorAll(e.selector));r=o[i++];)e.elements.has(r)||(e.elements.set(r,!0),e.parsed&&e.parsed.call(r,r),e.immediate&&e.immediate.call(r,r))}function o(e){for(var t,n=0;t=r[n++];)i(t,e)}function s(e){for(var t,r,n,i,s=0;r=e[s++];)for(n=r.addedNodes,t=0;i=n[t++];)1===i.nodeType&&o(i)}c1.onElement=function(e,o){"function"==typeof o&&(o={parsed:o});var a={selector:e,immediate:o.immediate,elements:new WeakMap};o.parsed&&(a.parsed=function(e){requestAnimationFrame(function(){o.parsed(e)})});for(var c,u=n.querySelectorAll(a.selector),l=0;c=u[l++];)a.elements.set(c,!0),a.parsed&&a.parsed.call(c,c),a.immediate&&a.immediate.call(c,c);r.push(a),t||(t=new MutationObserver(s)).observe(n,{childList:!0,subtree:!0}),i(a)};var a,c,u,l,d=!1;document.addEventListener("DOMContentLoaded",function(){d=!0}),"classList"in Element.prototype||(a="classList",c=HTMLElement.prototype,u=Element.prototype,l=Object.getOwnPropertyDescriptor(c,a),Object.defineProperty(u,a,l))}(),function(){"use strict";var e=document.createElement("i");if(e.style.setProperty("--x","y"),"y"===e.style.getPropertyValue("--x")||!e.msMatchesSelector)return;const t=/([\s{;])(--([^;}]+:[^;!}]+)(!important)?)/g,r=/([{;]\s*)([^;}{]+:[^;}]*var\([^!;}]+)(!important)?/g,n=/-ieVar-([^:]+):/g,i=/-ie-([^};]+)/g,o=/var\(/,s=/:(hover|active|focus|target|:before|:after)/;function a(e){return(e=e.replace(t,function(e,t,r,n,i){return t+"-ie-"+(i?"❗":"")+n})).replace(r,function(e,t,r,n){return t+"-ieVar-"+(n?"❗":"")+r+"; "+r})}function c(e){var t=e.match(n);if(t)for(var r=[],o=0;a=t[o++];){let e=a.slice(7,-1);"❗"===e[0]&&(e=e.substr(1)),r.push(e)}var s=e.match(i);if(s){var a,c={};for(o=0;a=s[o++];){let e=a.substr(4).split(":"),t=e[0],r=e[1];"❗"===t[0]&&(t=t.substr(1)),c[t]=r}}return{getters:r,setters:c}}function u(e,t){e.innerHTML=t,e.setAttribute("ie-polyfilled",!0);for(var r,n=e.sheet.rules||e.sheet.cssRules,i=0;r=n[i++];){const e=c(r.cssText);e.getters&&l(r.selectorText,e.getters),e.setters&&f(r.selectorText,e.setters);const t=r.parentRule&&r.parentRule.media&&r.parentRule.media.mediaText;t&&(e.getters||e.setters)&&matchMedia(t).addListener(function(){P(document.documentElement)})}}function l(e,t){v(e),c1.onElement(y(e),function(r){d(r,t,e),w(r)})}function d(e,t,r){e.setAttribute("iecp-needed",!0),e.ieCPSelectors||(e.ieCPSelectors={});for(var n,i=0;n=t[i++];){const t=r.trim().split("::");e.ieCPSelectors[n]||(e.ieCPSelectors[n]=[]),e.ieCPSelectors[n].push({selector:t[0],pseudo:t[1]?"::"+t[1]:""})}}function f(e,t){v(e),c1.onElement(y(e),function(e){p(e,t),P(e)})}function p(e,t){for(var r in e.ieCP_setters||(e.ieCP_setters={}),t)e.ieCP_setters["--"+r]=1}c1.onElement('link[rel="stylesheet"]',{immediate:function(e){var t,r,n;t=e.href,r=function(t){var r=a(t);if(t!==r){e.disabled=!0;var n=document.createElement("style");e.parentNode.insertBefore(n,e),u(n,r)}},(n=new XMLHttpRequest).open("GET",t),n.overrideMimeType("text/css"),n.onload=function(){n.status>=200&&n.status<400&&r(n.responseText)},n.send()}}),c1.onElement("style",{immediate:function(e){if(!e.hasAttribute("ie-polyfilled")){var t=e.innerHTML,r=a(t);t!==r&&u(e,r)}}}),c1.onElement("[ie-style]",{immediate:function(e){var t=a("{"+e.getAttribute("ie-style")).substr(1);e.style.cssText+=";"+t;var r=c(t);r.getters&&d(e,r.getters,"%styleAttr"),r.setters&&p(e,r.setters)}});const m={hover:{on:"mouseenter",off:"mouseleave"},focus:{on:"focusin",off:"focusout"},active:{on:"CSSActivate",off:"CSSDeactivate"}};function v(e){for(var t in e=e.split(",")[0],m){var r=e.split(":"+t);if(r.length>1){var n=r[1].match(/^[^\s]*/);let e=y(r[0]+n);const i=m[t];c1.onElement(e,function(e){e.addEventListener(i.on,L),e.addEventListener(i.off,L)})}}}let h=null;function y(e){return e.replace(s,"").replace(":not()","")}document.addEventListener("mousedown",function(e){setTimeout(function(){if(e.target===document.activeElement){var t=document.createEvent("Event");t.initEvent("CSSActivate",!0,!0),(h=e.target).dispatchEvent(t)}})}),document.addEventListener("mouseup",function(){if(h){var e=document.createEvent("Event");e.initEvent("CSSDeactivate",!0,!0),h.dispatchEvent(e),h=null}});var E=0;function C(e){if(e.ieCP_unique||(e.ieCP_unique=++E,e.classList.add("iecp-u"+e.ieCP_unique)),!e.ieCP_sheet){var t=document.createElement("style");document.head.appendChild(t),e.ieCP_sheet=t.sheet}for(var r=getComputedStyle(e);e.ieCP_sheet.rules[0];)e.ieCP_sheet.deleteRule(0);for(var n in e.ieCPSelectors){var i=r["-ieVar-❗"+n];let t=i||r["-ieVar-"+n];if(t){var o=A(r,t);i&&(o+=" !important");for(var s,a=0;s=e.ieCPSelectors[n][a++];)"%styleAttr"===s.selector?e.style[n]=o:e.ieCP_sheet.insertRule(s.selector+".iecp-u"+e.ieCP_unique+s.pseudo+" {"+n+":"+o+"}",0)}}}function P(e){if(e){var t=e.querySelectorAll("[iecp-needed]");e.hasAttribute&&e.hasAttribute("iecp-needed")&&w(e);for(var r,n=0;r=t[n++];)w(r)}}let g={},S=!1,b=!1;function w(e){g[e.uniqueNumber]=e,S||(S=!0,requestAnimationFrame(function(){for(var e in S=!1,b=!0,g)C(g[e]);requestAnimationFrame(function(){b=!1}),g={}}))}function L(e){P(e.target)}const T=/var\(([^),]+)(\,(.+))?\)/g;function A(e,t){return t.replace(T,function(t,r,n,i){r=r.trim();var o=e.getPropertyValue(r);return""===o&&void 0!==i&&(o=i.trim()),o})}var _=new MutationObserver(function(e){if(!b)for(var t,r=0;t=e[r++];)"ie-polyfilled"!==t.attributeName&&"iecp-needed"!==t.attributeName&&P(t.target)});setTimeout(function(){_.observe(document,{attributes:!0,subtree:!0})});var M=location.hash;addEventListener("hashchange",function(e){var t=document.getElementById(location.hash.substr(1));if(t){var r=document.getElementById(M.substr(1));P(t),P(r)}else P(document);M=location.hash});var q=Object.getOwnPropertyDescriptor(HTMLElement.prototype,"style"),O=q.get;q.get=function(){const e=O.call(this);return e.owningElement=this,e},Object.defineProperty(HTMLElement.prototype,"style",q);var x=getComputedStyle;window.getComputedStyle=function(e){var t=x.apply(this,arguments);return t.computedFor=e,t};var V=CSSStyleDeclaration.prototype;const N=/^--/;var R=V.getPropertyValue;Object.defineProperty(V,"getPropertyValue",{value:function(e){if(e.match(N)){const n=e.replace(N,"-ie-"),i=e.replace(N,"-ie-❗");let s=this[i]||this[n];if(this.computedFor)if(void 0!==s)o.test(s)&&(s=A(this,s));else if(!D[e]||D[e].inherits){let a=this.computedFor.parentNode;for(;1===a.nodeType;){if(a.ieCP_setters&&a.ieCP_setters[e]){var t=getComputedStyle(a),r=t[i]||t[n];if(void 0!==r){s=r,o.test(s)&&(s=A(this,s));break}}a=a.parentNode}}return void 0===s&&D[e]&&(s=D[e].initialValue),void 0===s&&(s=""),s}return R.apply(this,arguments)}});var j=V.setProperty;Object.defineProperty(V,"setProperty",{value:function(e,t,r){if(e.match(N)){if(this.owningElement){const t=this.owningElement;t.ieCP_setters||(t.ieCP_setters={}),t.ieCP_setters[e]=1,P(t)}e=e.replace(N,"-ie-"+("important"===r?"❗":"")),this.cssText+="; "+e+":"+t+";"}return j.apply(this,arguments)}}),window.CSS||(window.CSS={});let D={};CSS.registerProperty=function(e){D[e.name]=e}}();