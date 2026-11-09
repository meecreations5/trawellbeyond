# TrawellBeyond CMS — where to edit each page

| Public URL | CMS | Content controlled |
|---|---|---|
| `/` | Website Pages → `homepage` and `site-settings`; Destinations; Journeys | Hero, section headings/copy, CREATE image, destination highlights, journey carousel |
| `/destinations` | Destinations | Published destination cards |
| `/destinations/[slug]` | Destinations; Experiences; Journeys | V5.1 destination design; intro, 3 storytelling panels, experience tiles, linked journey, FAQs |
| `/journeys` | Journeys | Published journey cards |
| `/journeys/[slug]` | Journeys; Experiences | V5.1 journey design; title, photos, days, highlights, enquiry |
| `/experiences` and detail | Experiences | Published experiences and details |
| `/offers` and detail | Offers | Published offers |
| `/our-story` | Website Pages → `our-story` | Title, introduction, full editorial copy |
| `/services` | Website Pages → `services` | Title, intro and services list (one `Service | Description` per line in Highlights) |
| `/faq` | Website Pages → `faq` | Title, intro and FAQ list (one `Question | Answer` per line in Highlights) |
| `/contact`, `/create`, `/enquire` | Website Pages → matching slug | Title and intro copy; actual forms submit customer enquiries |
| `/journal` | Website Pages → `journal` | Title, intro and page editorial copy |
| `/privacy`, `/terms` | Website Pages → matching slug | Full legal copy in Description; `## Heading` creates an editorial subheading |
| `Global header and footer` | Website Pages → `site-settings` | Top strip, navigation, CTA, footer copy and links across public routes |
| `/admin` | Private Content Studio | Manage content, photos and enquiries |

**Only two statuses:** Draft / Published. A published record directly powers its public page. There is no editorial approval queue or `publicExperiences` copy.

**Destination form:** Title, region, summary, description, hero image, optional gallery image URLs (up to six), highlights and destination FAQs. For FAQs use `Question | Answer` per line.

**Experience/Journey forms:** Select an existing destination from the dropdown. Journey itinerary uses `Day N: Title | Description | Optional tag` per line. Related content appears only after being published.

**Homepage form:** Use the Homepage preset in Website Pages. Hero summary and photo are the `summary` and `heroImage` fields. Special Homepage fields control selected section copy while the approved V5.1 visual layout stays untouched. The three motion-story chapters and the Worlds heading are now also editable. The nine Ways to Travel product labels remain part of the locked brand architecture and are not individual CMS fields.

**Image rights:** Media Library supports manual uploads and Wikimedia Commons import, with permission confirmation and attribution. It does not automatically clear commercial rights for you; verify each photo is relevant and licensed.

**Enquiries:** The public form signs in anonymously through Firebase Authentication and writes a validated enquiry directly to Firestore using the Web SDK. An ID is returned and the Admin Enquiries section can read it. Enable Anonymous sign-in before testing. Browser-only local drafts are not treated as submitted enquiries.

## V4 homepage completion

The Homepage preset also controls the three scroll motion chapter headings, descriptions and photo URLs, the Ways to Travel heading and lead, plus its existing hero, introduction, featured destinations, featured journeys, CREATE and closing CTA. The permanent nine travel-type names remain the brand architecture and their interactions are unchanged. Header/footer data is in the separate published `site-settings` record.
