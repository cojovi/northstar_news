import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const authors = [
  { name: 'Sarah Mitchell', slug: 'sarah-mitchell' },
  { name: 'Marcus Rodriguez', slug: 'marcus-rodriguez' },
  { name: 'Dr. Elena Petrov', slug: 'elena-petrov' },
  { name: 'James Chen', slug: 'james-chen' },
  { name: 'Amanda Foster', slug: 'amanda-foster' },
  { name: 'David Washington', slug: 'david-washington' },
  { name: 'Lisa Thompson', slug: 'lisa-thompson' },
  { name: 'Michael O\'Brien', slug: 'michael-obrien' },
  { name: 'Rachel Kim', slug: 'rachel-kim' },
  { name: 'Thomas Anderson', slug: 'thomas-anderson' },
];

const images = {
  us: 'https://images.pexels.com/photos/1112048/pexels-photo-1112048.jpeg?auto=compress&cs=tinysrgb&w=1200',
  world: 'https://images.pexels.com/photos/1566837/pexels-photo-1566837.jpeg?auto=compress&cs=tinysrgb&w=1200',
  politics: 'https://images.pexels.com/photos/1550337/pexels-photo-1550337.jpeg?auto=compress&cs=tinysrgb&w=1200',
  business: 'https://images.pexels.com/photos/936722/pexels-photo-936722.jpeg?auto=compress&cs=tinysrgb&w=1200',
  tech: 'https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=1200',
  health: 'https://images.pexels.com/photos/356040/pexels-photo-356040.jpeg?auto=compress&cs=tinysrgb&w=1200',
  entertainment: 'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=1200',
  sports: 'https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?auto=compress&cs=tinysrgb&w=1200',
  opinion: 'https://images.pexels.com/photos/261510/pexels-photo-261510.jpeg?auto=compress&cs=tinysrgb&w=1200',
  lifestyle: 'https://images.pexels.com/photos/1571458/pexels-photo-1571458.jpeg?auto=compress&cs=tinysrgb&w=1200',
  travel: 'https://images.pexels.com/photos/2166559/pexels-photo-2166559.jpeg?auto=compress&cs=tinysrgb&w=1200',
};

const articleTemplates = {
  us: [
    {
      title: 'National Infrastructure Bill Faces Regional Opposition',
      dek: 'Rural communities voice concerns over funding allocation priorities',
      tags: ['infrastructure', 'congress', 'economy'],
      location: 'Washington, D.C.',
    },
    {
      title: 'Housing Market Shows Signs of Stabilization in Major Cities',
      dek: 'Economists point to interest rate adjustments and increased supply',
      tags: ['housing', 'economy', 'cities'],
      location: 'New York, NY',
    },
    {
      title: 'Federal Agencies Implement New Cybersecurity Protocols',
      dek: 'Government response follows series of high-profile data breaches',
      tags: ['cybersecurity', 'government', 'technology'],
      location: 'Washington, D.C.',
    },
    {
      title: 'Education Department Proposes Changes to Student Loan Forgiveness',
      dek: 'New income-based repayment structure aims to address accessibility concerns',
      tags: ['education', 'policy', 'economy'],
      location: 'Washington, D.C.',
    },
    {
      title: 'Border States Coordinate on Immigration Processing Improvements',
      dek: 'Governors announce bipartisan framework to reduce wait times',
      tags: ['immigration', 'states', 'bipartisan'],
      location: 'El Paso, TX',
    },
    {
      title: 'National Parks Report Record Visitor Numbers Despite Entry Fee Increases',
      dek: 'Interior Department cites pent-up demand and improved facilities',
      tags: ['parks', 'tourism', 'environment'],
      location: 'Denver, CO',
    },
    {
      title: 'Veterans Affairs Modernizes Healthcare System with Digital Tools',
      dek: 'Telehealth expansion reaches rural communities across the nation',
      tags: ['veterans', 'healthcare', 'technology'],
      location: 'Phoenix, AZ',
    },
    {
      title: 'Midwest Regions Invest Heavily in Renewable Energy Infrastructure',
      dek: 'Wind and solar projects promise economic revitalization for farming communities',
      tags: ['energy', 'economy', 'climate'],
      location: 'Des Moines, IA',
    },
  ],
  world: [
    {
      title: 'European Union Announces Unified Digital Currency Framework',
      dek: 'Member states agree on regulatory standards for digital euro implementation',
      tags: ['europe', 'economy', 'currency'],
      location: 'Brussels, Belgium',
    },
    {
      title: 'Southeast Asian Nations Form New Trade Alliance',
      dek: 'Partnership aims to counter economic pressures and enhance regional cooperation',
      tags: ['trade', 'asia', 'economy'],
      location: 'Singapore',
    },
    {
      title: 'International Space Station Welcomes Record Number of Astronauts',
      dek: 'Collaboration marks new era of multinational space exploration',
      tags: ['space', 'science', 'international'],
      location: 'Low Earth Orbit',
    },
    {
      title: 'Middle East Water Shortage Prompts Regional Cooperation',
      dek: 'Historic agreement addresses shared resource management',
      tags: ['middle-east', 'environment', 'diplomacy'],
      location: 'Dubai, UAE',
    },
    {
      title: 'Latin American Countries Strengthen Anti-Corruption Measures',
      dek: 'New transparency protocols adopted across seven nations',
      tags: ['latin-america', 'governance', 'reform'],
      location: 'Buenos Aires, Argentina',
    },
    {
      title: 'African Union Launches Continental Free Trade Implementation',
      dek: 'Historic economic integration enters active phase across 54 nations',
      tags: ['africa', 'trade', 'economy'],
      location: 'Addis Ababa, Ethiopia',
    },
    {
      title: 'Arctic Council Members Reach Climate Research Agreement',
      dek: 'Joint monitoring stations to track rapid environmental changes',
      tags: ['arctic', 'climate', 'research'],
      location: 'Reykjavik, Iceland',
    },
  ],
  politics: [
    {
      title: 'Senate Committee Advances Bipartisan Ethics Reform Package',
      dek: 'Proposal includes stricter disclosure rules and independent oversight',
      tags: ['senate', 'ethics', 'reform'],
      location: 'Washington, D.C.',
    },
    {
      title: 'Gubernatorial Races Show Shift in Voter Priorities',
      dek: 'Economic concerns dominate messaging across both parties',
      tags: ['elections', 'governors', 'economy'],
      location: 'Atlanta, GA',
    },
    {
      title: 'Federal Agencies Face Restructuring Under New Efficiency Initiative',
      dek: 'Administration promises streamlined operations without service reductions',
      tags: ['government', 'reform', 'efficiency'],
      location: 'Washington, D.C.',
    },
    {
      title: 'Congressional Leaders Negotiate Balanced Budget Framework',
      dek: 'Rare cooperation emerges on fiscal responsibility measures',
      tags: ['budget', 'congress', 'fiscal-policy'],
      location: 'Washington, D.C.',
    },
    {
      title: 'State Legislatures Adopt Model Transparency Legislation',
      dek: 'Grassroots movement pushes for open government standards',
      tags: ['states', 'transparency', 'legislation'],
      location: 'Austin, TX',
    },
    {
      title: 'Supreme Court Clarifies Administrative Law Boundaries',
      dek: 'Unanimous decision establishes clearer regulatory framework',
      tags: ['supreme-court', 'law', 'regulation'],
      location: 'Washington, D.C.',
    },
    {
      title: 'Local Governments Pioneer Participatory Budgeting Models',
      dek: 'Citizens gain direct input on municipal spending priorities',
      tags: ['local-government', 'democracy', 'innovation'],
      location: 'Seattle, WA',
    },
    {
      title: 'Campaign Finance Reform Gains Momentum in Key States',
      dek: 'Ballot initiatives seek to limit special interest influence',
      tags: ['campaign-finance', 'elections', 'reform'],
      location: 'Boston, MA',
    },
  ],
  business: [
    {
      title: 'Manufacturing Sector Reports Strongest Growth in Five Years',
      dek: 'Automation investments and reshoring drive productivity gains',
      tags: ['manufacturing', 'economy', 'jobs'],
      location: 'Detroit, MI',
    },
    {
      title: 'Small Business Lending Reaches Pre-Pandemic Levels',
      dek: 'Community banks credit improved economic outlook and policy support',
      tags: ['small-business', 'finance', 'banking'],
      location: 'Chicago, IL',
    },
    {
      title: 'Corporate Sustainability Initiatives Show Measurable Results',
      dek: 'Major firms report progress on carbon reduction and waste elimination',
      tags: ['sustainability', 'corporate', 'environment'],
      location: 'San Francisco, CA',
    },
    {
      title: 'Retail Industry Adapts to Omnichannel Consumer Behavior',
      dek: 'Integration of online and physical stores drives customer satisfaction',
      tags: ['retail', 'e-commerce', 'consumer'],
      location: 'Minneapolis, MN',
    },
    {
      title: 'Supply Chain Disruptions Ease as Logistics Networks Modernize',
      dek: 'Technology investments reduce bottlenecks and improve efficiency',
      tags: ['supply-chain', 'logistics', 'technology'],
      location: 'Memphis, TN',
    },
    {
      title: 'Labor Market Tightness Spurs Innovation in Employee Benefits',
      dek: 'Companies compete with flexible work arrangements and wellness programs',
      tags: ['labor', 'employment', 'benefits'],
      location: 'Austin, TX',
    },
    {
      title: 'Regional Banks Navigate Interest Rate Environment Successfully',
      dek: 'Community-focused institutions demonstrate resilience amid market shifts',
      tags: ['banking', 'finance', 'interest-rates'],
      location: 'Charlotte, NC',
    },
  ],
  tech: [
    {
      title: 'Open Source AI Models Gain Enterprise Adoption',
      dek: 'Companies cite transparency and customization as key advantages',
      tags: ['ai', 'open-source', 'enterprise'],
      location: 'Mountain View, CA',
    },
    {
      title: 'Quantum Computing Breakthrough Achieved in Error Correction',
      dek: 'Research team demonstrates stable qubit operations at room temperature',
      tags: ['quantum', 'research', 'computing'],
      location: 'Boston, MA',
    },
    {
      title: 'Cybersecurity Firms Report Decline in Ransomware Success Rates',
      dek: 'Improved detection and employee training reduce vulnerability',
      tags: ['cybersecurity', 'ransomware', 'business'],
      location: 'Washington, D.C.',
    },
    {
      title: 'Satellite Internet Services Expand to Remote Regions',
      dek: 'Low Earth orbit constellations bridge digital divide in rural areas',
      tags: ['satellite', 'internet', 'connectivity'],
      location: 'Seattle, WA',
    },
    {
      title: 'Battery Technology Advances Enable Longer-Range Electric Vehicles',
      dek: 'Solid-state batteries promise faster charging and greater capacity',
      tags: ['batteries', 'electric-vehicles', 'innovation'],
      location: 'Detroit, MI',
    },
    {
      title: 'Data Privacy Regulations Drive Architecture Changes',
      dek: 'Tech companies redesign systems to prioritize user control',
      tags: ['privacy', 'regulation', 'data'],
      location: 'San Francisco, CA',
    },
    {
      title: 'Agricultural Technology Improves Crop Yields and Sustainability',
      dek: 'Precision farming tools help farmers optimize resource use',
      tags: ['agtech', 'farming', 'sustainability'],
      location: 'Des Moines, IA',
    },
  ],
  health: [
    {
      title: 'Telemedicine Platforms Report Sustained Usage Post-Pandemic',
      dek: 'Patients appreciate convenience as doctors refine virtual care protocols',
      tags: ['telemedicine', 'healthcare', 'technology'],
      location: 'Houston, TX',
    },
    {
      title: 'New Cancer Screening Guidelines Emphasize Earlier Detection',
      dek: 'Medical associations update recommendations based on recent research',
      tags: ['cancer', 'screening', 'prevention'],
      location: 'Baltimore, MD',
    },
    {
      title: 'Mental Health Services Integration Expands in Primary Care',
      dek: 'Collaborative care model shows promise in addressing treatment gaps',
      tags: ['mental-health', 'primary-care', 'healthcare'],
      location: 'Portland, OR',
    },
    {
      title: 'Hospital Systems Invest in Workforce Development Programs',
      dek: 'Partnerships with community colleges aim to address staffing shortages',
      tags: ['healthcare', 'workforce', 'education'],
      location: 'Cleveland, OH',
    },
    {
      title: 'Vaccine Development Timelines Shortened by New Platform Technologies',
      dek: 'mRNA and vector-based methods promise faster response to emerging threats',
      tags: ['vaccines', 'research', 'public-health'],
      location: 'Boston, MA',
    },
    {
      title: 'Rural Healthcare Access Improved Through Mobile Clinic Networks',
      dek: 'Regional partnerships bring specialists to underserved communities',
      tags: ['rural-health', 'access', 'healthcare'],
      location: 'Bozeman, MT',
    },
  ],
  entertainment: [
    {
      title: 'Streaming Platforms Shift Focus to Quality Over Quantity',
      dek: 'Industry consolidation leads to more selective content strategies',
      tags: ['streaming', 'television', 'media'],
      location: 'Los Angeles, CA',
    },
    {
      title: 'Independent Films Find New Audiences Through Digital Distribution',
      dek: 'Filmmakers bypass traditional gatekeepers with direct-to-consumer releases',
      tags: ['film', 'independent', 'distribution'],
      location: 'Austin, TX',
    },
    {
      title: 'Music Industry Adapts to Creator Economy Dynamics',
      dek: 'Artists leverage social platforms to build direct fan relationships',
      tags: ['music', 'creator-economy', 'social-media'],
      location: 'Nashville, TN',
    },
    {
      title: 'Theater Districts Rebound with Innovative Programming',
      dek: 'Diverse offerings and flexible ticketing attract new demographics',
      tags: ['theater', 'performing-arts', 'culture'],
      location: 'New York, NY',
    },
    {
      title: 'Video Game Industry Embraces Cross-Platform Play Standards',
      dek: 'Players enjoy seamless experiences across devices and ecosystems',
      tags: ['gaming', 'technology', 'entertainment'],
      location: 'Seattle, WA',
    },
    {
      title: 'Podcast Advertising Revenue Reaches New Milestone',
      dek: 'Targeted audio content proves effective for brand messaging',
      tags: ['podcasts', 'advertising', 'media'],
      location: 'Los Angeles, CA',
    },
  ],
  sports: [
    {
      title: 'College Athletics Programs Adapt to Name, Image, and Likeness Rules',
      dek: 'Universities develop frameworks to support student-athlete opportunities',
      tags: ['college-sports', 'nil', 'athletics'],
      location: 'Indianapolis, IN',
    },
    {
      title: 'Professional Leagues Invest in Player Health and Safety Technology',
      dek: 'Wearable sensors and AI analysis help prevent injuries and optimize performance',
      tags: ['sports-science', 'health', 'technology'],
      location: 'New York, NY',
    },
    {
      title: 'Minor League Teams Experience Attendance Surge',
      dek: 'Affordable family entertainment drives growth in smaller markets',
      tags: ['minor-league', 'baseball', 'attendance'],
      location: 'Durham, NC',
    },
    {
      title: 'Women\'s Sports Viewership Reaches Record Highs',
      dek: 'Increased media coverage and marketing investment pay dividends',
      tags: ['womens-sports', 'viewership', 'media'],
      location: 'Bristol, CT',
    },
    {
      title: 'Youth Sports Organizations Emphasize Participation Over Competition',
      dek: 'Programs focus on skill development and lifelong fitness habits',
      tags: ['youth-sports', 'development', 'health'],
      location: 'Kansas City, MO',
    },
    {
      title: 'Esports Tournaments Draw Mainstream Sponsorship Deals',
      dek: 'Traditional brands recognize valuable demographics in competitive gaming',
      tags: ['esports', 'gaming', 'sponsorship'],
      location: 'Los Angeles, CA',
    },
    {
      title: 'Olympic Training Centers Incorporate Mental Performance Coaching',
      dek: 'Athletes credit psychological preparation for competitive edge',
      tags: ['olympics', 'mental-health', 'performance'],
      location: 'Colorado Springs, CO',
    },
  ],
  opinion: [
    {
      title: 'The Case for Rebuilding Local News Infrastructure',
      dek: 'Democracy depends on informed communities, and we\'re failing at it',
      tags: ['media', 'journalism', 'democracy'],
      location: '',
    },
    {
      title: 'Why Education Reform Should Start with Teacher Compensation',
      dek: 'We can\'t attract talent to a profession that doesn\'t value expertise',
      tags: ['education', 'teachers', 'policy'],
      location: '',
    },
    {
      title: 'Infrastructure Investment Is Economic Investment',
      dek: 'Short-term thinking costs us far more than building for the future',
      tags: ['infrastructure', 'economy', 'policy'],
      location: '',
    },
    {
      title: 'The Forgotten Benefits of Boring Competence',
      dek: 'In an age of disruption, steady governance deserves appreciation',
      tags: ['governance', 'politics', 'leadership'],
      location: '',
    },
    {
      title: 'Climate Adaptation Is Not Surrender',
      dek: 'We need both mitigation and realistic preparation for changes ahead',
      tags: ['climate', 'policy', 'environment'],
      location: '',
    },
    {
      title: 'Rethinking Success in an Automated Economy',
      dek: 'Technology eliminates jobs, but it doesn\'t have to eliminate purpose',
      tags: ['technology', 'economy', 'work'],
      location: '',
    },
  ],
  lifestyle: [
    {
      title: 'Minimalist Living Trends Reshape Home Design Industry',
      dek: 'Consumers prioritize quality, functionality, and sustainable materials',
      tags: ['design', 'minimalism', 'sustainability'],
      location: 'Portland, OR',
    },
    {
      title: 'Community Gardens Flourish as Urban Spaces Evolve',
      dek: 'Residents find connection and fresh produce in shared green spaces',
      tags: ['gardening', 'community', 'urban'],
      location: 'Seattle, WA',
    },
    {
      title: 'Remote Work Sparks Relocation to Secondary Cities',
      dek: 'Affordable living and quality of life attract digital professionals',
      tags: ['remote-work', 'cities', 'lifestyle'],
      location: 'Boise, ID',
    },
    {
      title: 'Wellness Industry Shifts Focus to Evidence-Based Practices',
      dek: 'Consumers demand scientific backing for health claims and products',
      tags: ['wellness', 'health', 'science'],
      location: 'Boulder, CO',
    },
    {
      title: 'Local Food Movements Transform Regional Cuisines',
      dek: 'Farm-to-table partnerships showcase seasonal and heritage ingredients',
      tags: ['food', 'local', 'sustainability'],
      location: 'Burlington, VT',
    },
  ],
  travel: [
    {
      title: 'Sustainable Tourism Practices Gain Traction in Popular Destinations',
      dek: 'Communities balance economic benefits with environmental preservation',
      tags: ['sustainable-travel', 'environment', 'tourism'],
      location: 'Costa Rica',
    },
    {
      title: 'Train Travel Renaissance Offers Scenic Alternative to Flying',
      dek: 'Upgraded rail services attract travelers seeking leisurely journeys',
      tags: ['trains', 'rail', 'travel'],
      location: 'Chicago, IL',
    },
    {
      title: 'National Parks Implement Reservation Systems to Manage Crowds',
      dek: 'Timed entry preserves visitor experience and protects natural resources',
      tags: ['national-parks', 'tourism', 'conservation'],
      location: 'Yosemite, CA',
    },
    {
      title: 'Cultural Heritage Sites Adopt Virtual Reality Preservation',
      dek: 'Technology creates digital archives while managing physical tourism',
      tags: ['heritage', 'technology', 'preservation'],
      location: 'Rome, Italy',
    },
    {
      title: 'Adventure Travel Outfitters Prioritize Safety and Sustainability',
      dek: 'Industry standards evolve to protect both travelers and environments',
      tags: ['adventure-travel', 'safety', 'sustainability'],
      location: 'Queenstown, New Zealand',
    },
  ],
};

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateArticleContent(template, category) {
  const paragraphs = [
    `Recent developments in ${category} have drawn significant attention from policymakers, industry leaders, and community stakeholders across the nation. The implications of these changes extend beyond immediate impacts, suggesting broader shifts in how institutions and individuals approach long-standing challenges.`,

    `Experts interviewed for this report emphasized the complexity of the situation, noting that multiple factors have converged to create current conditions. "We're seeing a unique moment where technological capability, economic pressure, and social demand align," explained one analyst familiar with the matter.`,

    `The response from affected communities has been mixed, with some embracing the changes as overdue progress while others express concern about unintended consequences. Local officials report fielding increased inquiries from constituents seeking clarity on how developments will affect their daily lives.`,

    `Data collected over the past eighteen months reveals measurable trends that support both optimistic and cautious interpretations. Researchers caution against drawing premature conclusions, emphasizing the need for longitudinal studies to assess lasting impacts.`,

    `Industry representatives have begun adapting their strategies in response to shifting dynamics. Several major organizations announced initiatives aimed at positioning themselves favorably amid evolving circumstances, while smaller operators focus on maintaining flexibility.`,

    `Looking ahead, observers anticipate continued evolution as stakeholders refine their approaches based on real-world feedback. The coming months will likely prove critical in determining whether current trajectories represent sustainable progress or require further adjustment.`,
  ];

  const numParagraphs = getRandomInt(4, 6);
  const selectedParagraphs = paragraphs.slice(0, numParagraphs);

  return selectedParagraphs.join('\n\n');
}

function generateArticle(template, category, index) {
  const author = authors[index % authors.length];
  const daysAgo = getRandomInt(1, 28);
  const published = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();
  const updated = new Date(Date.now() - (daysAgo - 1) * 24 * 60 * 60 * 1000).toISOString();

  const slug = slugify(template.title);
  const heroImage = images[category];
  const thumbnail = heroImage.replace('w=1200', 'w=400');

  const content = generateArticleContent(template, category);

  return `---
title: ${template.title}
dek: ${template.dek}
slug: ${slug}
category: ${category}
tags: [${template.tags.map(t => `'${t}'`).join(', ')}]
author: ${author.name}
author_slug: ${author.slug}
published: ${published}
updated: ${updated}
hero_image: ${heroImage}
hero_credit: Photo via Pexels
thumbnail: ${thumbnail}
excerpt: ${template.dek}
reading_time: ${getRandomInt(4, 7)}
location: ${template.location}
status: published
is_satire: false
---

${content}`;
}

function generateAllArticles() {
  const contentDir = path.join(__dirname, '..', 'content');

  Object.entries(articleTemplates).forEach(([category, templates]) => {
    const categoryDir = path.join(contentDir, category);

    if (!fs.existsSync(categoryDir)) {
      fs.mkdirSync(categoryDir, { recursive: true });
    }

    templates.forEach((template, index) => {
      const article = generateArticle(template, category, index);
      const slug = slugify(template.title);
      const filename = `${slug}.md`;
      const filepath = path.join(categoryDir, filename);

      fs.writeFileSync(filepath, article);
      console.log(`Generated: ${category}/${filename}`);
    });
  });

  console.log('\nArticle generation complete!');
}

generateAllArticles();
