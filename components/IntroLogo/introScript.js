// Se ejecuta en el <head> antes de pintar: la primera carga de la sesión
// muestra la intro; las siguientes (recargas) la ocultan desde el CSS.
export const INTRO_LOGO_SCRIPT = `try{var k="introLogoVisto";if(sessionStorage.getItem(k)){document.documentElement.setAttribute("data-intro-visto","")}else{sessionStorage.setItem(k,"1")}}catch(e){}`;
