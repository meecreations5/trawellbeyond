/**
 * The approved V5.1 homepage footer is the single footer for ALL public routes.
 * This pure renderer is shared by HTML route handlers and the React PublicShell.
 * Input MUST be a siteConfig() result: links have already been path-validated.
 */
const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,char=>({
 '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
}[char]));

export function renderGlobalFooter(cfg){
 const nav=cfg.footerLinks.map(([name,href])=>
  `<a href="${escapeHtml(href)}">${escapeHtml(name)}</a>`
 ).join('');
 const email=cfg.email?`<a class="tbgf-contact-link" href="mailto:${escapeHtml(cfg.email)}">${escapeHtml(cfg.email)}</a>`:'';
 const phone=cfg.phone?`<a class="tbgf-contact-link" href="tel:${escapeHtml(cfg.phone.replace(/[^+0-9]/g,''))}">${escapeHtml(cfg.phone)}</a>`:'';
 return `<footer class="tb-global-footer" data-tb-footer="global" aria-label="TrawellBeyond footer">
  <div class="tbgf-wrap">
   <div class="tbgf-top">
    <a class="tbgf-logo" href="/" aria-label="TrawellBeyond homepage"><img src="/assets/trawellbeyond-display.svg" alt="TrawellBeyond" /></a>
    <p class="tbgf-copy" id="tbFooterCopy">${escapeHtml(cfg.footerLine1)}<br/><span>${escapeHtml(cfg.footerLine2)}</span></p>
   </div>
   <nav class="tbgf-links" id="tbFooterLinks" aria-label="Footer navigation">${nav}</nav>
   <div class="tbgf-contact" id="tbFooterContact">
    <a class="tbgf-create" href="/create">${escapeHtml(cfg.footerCta)} <span aria-hidden="true">↗</span></a>
    ${email}${phone}
   </div>
   <div class="tbgf-bottom">
    <span id="tbFooterCompany">${escapeHtml(cfg.footerCompany)}</span>
    <span id="tbFooterBottom">${escapeHtml(cfg.footerBottom)}</span>
    <a href="#top">Back to top <span aria-hidden="true">↑</span></a>
   </div>
  </div>
 </footer>`;
}

/** Remove any of the legacy footers and inject exactly one canonical footer. */
export function replaceGlobalFooter(html,footerMarkup){
 const footer=/<footer\b[^>]*>[\s\S]*?<\/footer>/gi;
 let count=0;
 const result=html.replace(footer,()=>++count===1?footerMarkup:'');
 if(count)return result;
 if(!/<\/body>/i.test(result))throw new Error('The public template must contain a closing body tag');
 return result.replace(/<\/body>/i,footerMarkup+'\n</body>');
}
