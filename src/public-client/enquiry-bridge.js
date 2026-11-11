/** Shared Firebase Web SDK bridge for legacy approved HTML templates and the V8.2 assistant. */
import {submitEnquiry} from '../lib/enquiries-web';
import {publishedList} from '../lib/content-server';
import {rankPublished,createLeadSummary,normalizeJourneyPreferences} from '../lib/journey-assistant.mjs';
window.TrawellBeyondEnquiries={submit:submitEnquiry};
window.TrawellBeyondCatalog={list:publishedList,rank:rankPublished,summary:createLeadSummary,normalize:normalizeJourneyPreferences};
window.dispatchEvent(new Event('tb:v82-bridge-ready'));
