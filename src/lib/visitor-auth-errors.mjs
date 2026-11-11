/** Firebase rejects account creation before Firestore Security Rules are evaluated. */
export function visitorAuthErrorMessage(error={}){
 const code=String(error?.code||'');
 if(['auth/admin-restricted-operation','auth/operation-not-allowed'].includes(code))return 'We cannot send your enquiry right now because visitor access is temporarily unavailable. Please contact the TrawellBeyond team directly or try again shortly.';
 if(code==='auth/too-many-requests')return 'There have been too many sign-in attempts. Please try again later or contact the travel team directly.';
 if(code==='auth/network-request-failed')return 'We could not reach our enquiry service. Check your connection and retry, or contact the team directly.';
 if(['auth/invalid-api-key','auth/configuration-not-found','auth/unauthorized-domain'].includes(code))return 'The enquiry service needs a configuration update. Please contact the TrawellBeyond team directly.';
 return 'Visitor sign-in was unsuccessful. Please retry or contact the TrawellBeyond team directly.';
}
