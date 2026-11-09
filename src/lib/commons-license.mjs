/** Commons images for a commercial travel website: accept commonly reusable
 * public-domain and Creative Commons licences. An editor must still verify
 * source, photographer and any required attribution or share-alike conditions.
 */
export function permittedCommonsLicense(value){
 const license=String(value||'').trim().toLowerCase();
 if(!license)return false;
 if(/\bnon.?commercial\b|\bnc(?:-|\b)|\bno.?derivatives\b|\bnd(?:-|\b)|all rights reserved|fair use|copyrighted|unknown|unreviewed/.test(license))return false;
 return /\bcc0\b|\bpublic domain\b|\bpd[- ]|\bcc[- ]?by\b|\bcc[- ]?by[- ]sa\b|\battribution\b|\bfree art license\b/.test(license);
}
