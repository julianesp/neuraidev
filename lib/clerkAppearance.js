// Apariencia compartida de Clerk (sign-in / sign-up).
export const clerkAppearance = {
  layout: { socialButtonsVariant: "blockButton" },
  elements: {
    rootBox: "mx-auto",
    card: "shadow-xl",
  },
};

// Botones de Google y Facebook: cuadrados y grandes, en dos columnas
// (icono arriba, nombre abajo). Cada botón vive en su propio contenedor
// .cl-socialButtons, por eso la cuadrícula va en .cl-socialButtonsRoot.
export const clerkSocialCss = `
.cl-socialButtonsRoot{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:12px!important}
.cl-socialButtons{display:block!important;min-width:0!important}
.cl-socialButtonsBlockButton{aspect-ratio:1/1!important;height:auto!important;min-height:0!important;width:100%!important;padding:12px!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;border-radius:16px!important;border-width:2px!important;position:relative!important}
.cl-socialButtonsBlockButton>span:not(.cl-lastAuthenticationStrategyBadge){display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:10px!important;width:100%!important;height:auto!important}
.cl-socialButtonsBlockButton>span:not(.cl-lastAuthenticationStrategyBadge)>span:first-child{width:auto!important;height:auto!important;margin:0!important;display:flex!important}
.cl-socialButtonsProviderIcon{width:44px!important;height:44px!important;margin:0!important}
.cl-socialButtonsBlockButtonText{white-space:normal!important;text-align:center!important;font-size:.95rem!important;font-weight:600!important;line-height:1.2!important}
`;
