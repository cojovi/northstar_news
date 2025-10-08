export const mockArticles = [
  {
    category: 'us',
    slug: 'states-debate-daylight-savings-reform',
    title: 'States Push for Year-Round Daylight Saving Time as Federal Bill Stalls',
    dek: 'Bipartisan support grows for ending seasonal clock changes, but Congress remains deadlocked',
    author: 'Sarah Mitchell',
    author_slug: 'sarah-mitchell',
    tags: ['legislation', 'health', 'states'],
    published: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    hero_image: 'https://images.pexels.com/photos/1183434/pexels-photo-1183434.jpeg?auto=compress&cs=tinysrgb&w=1200',
    thumbnail: 'https://images.pexels.com/photos/1183434/pexels-photo-1183434.jpeg?auto=compress&cs=tinysrgb&w=400',
    excerpt: 'Lawmakers across the nation are pushing for permanent daylight saving time, citing sleep health and economic benefits.',
    reading_time: 6,
    location: 'Washington, D.C.',
    content: `More than 30 states have passed resolutions or legislation expressing support for year-round daylight saving time, but a federal bill remains trapped in congressional gridlock.

The Sunshine Protection Act, which would make daylight saving time permanent nationwide, passed the Senate unanimously in 2022 but never received a vote in the House. Proponents argue that eliminating the biannual clock change would improve public health, reduce car accidents, and boost economic activity.

"The evidence is clear that these time changes disrupt sleep patterns and increase health risks," said Dr. Jennifer Walsh, a sleep researcher at Stanford University. Studies have shown spikes in heart attacks, strokes, and workplace injuries in the days following time changes.

Business groups have also rallied behind the measure, noting that extended evening daylight hours encourage consumer spending and outdoor recreation. The retail industry estimates an additional $1 billion in annual revenue if the change were implemented.

However, critics point out that permanent daylight saving time would mean darker mornings during winter months, potentially affecting school children commuting in darkness. Some sleep experts argue that permanent standard time would be healthier, as it aligns better with human circadian rhythms.

The issue has created unusual political alliances, with both conservative and progressive lawmakers supporting reform. Yet the bill's fate remains uncertain as Congress focuses on other priorities.`
  },
  {
    category: 'us',
    slug: 'california-wildfire-preparedness',
    title: 'California Unveils Ambitious Wildfire Prevention Plan Ahead of Peak Season',
    dek: 'State allocates $2.8 billion for forest management and firefighting resources',
    author: 'Marcus Rodriguez',
    author_slug: 'marcus-rodriguez',
    tags: ['environment', 'climate', 'california'],
    published: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    hero_image: 'https://images.pexels.com/photos/212324/pexels-photo-212324.jpeg?auto=compress&cs=tinysrgb&w=1200',
    thumbnail: 'https://images.pexels.com/photos/212324/pexels-photo-212324.jpeg?auto=compress&cs=tinysrgb&w=400',
    excerpt: 'Gov. Newsom announces comprehensive strategy combining controlled burns, technology, and community preparedness.',
    reading_time: 5,
    location: 'Sacramento, CA',
    content: `California officials announced a comprehensive wildfire prevention strategy on Tuesday, committing $2.8 billion to forest management, firefighting equipment, and community protection measures.

Governor Gavin Newsom unveiled the plan at a press conference in Sacramento, emphasizing the urgent need for proactive measures as climate change intensifies fire seasons. The initiative represents the largest single investment in wildfire prevention in state history.

Key components include expanding controlled burn operations to 400,000 acres annually, deploying AI-powered fire detection cameras across high-risk regions, and creating 15 new firefighting bases in rural areas. The state will also hire 1,200 additional seasonal firefighters.

"We're shifting from reactive to proactive," Newsom stated. "Every dollar spent on prevention saves ten dollars in suppression costs and immeasurable losses in lives and property."

The plan also addresses home hardening in wildfire-prone communities, offering grants to homeowners for fire-resistant improvements. Local fire departments will receive funding to establish neighborhood evacuation coordinators.

Environmental groups have praised the increased focus on prescribed burns but caution that implementation must respect indigenous burning practices and ecosystem health. Some rural residents have expressed concerns about smoke impacts from controlled fires.

Cal Fire officials project the measures could reduce major wildfire incidents by 30% over five years if combined with favorable weather conditions and continued federal support.`
  },
  {
    category: 'world',
    slug: 'antarctic-ice-shelf-collapse',
    title: 'Antarctic Ice Shelf Shows Unprecedented Fracturing Pattern',
    dek: 'Scientists document rapid changes in Thwaites Glacier, raising sea level concerns',
    author: 'Dr. Elena Petrov',
    author_slug: 'elena-petrov',
    tags: ['climate', 'science', 'antarctica'],
    published: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    hero_image: 'https://images.pexels.com/photos/2440024/pexels-photo-2440024.jpeg?auto=compress&cs=tinysrgb&w=1200',
    thumbnail: 'https://images.pexels.com/photos/2440024/pexels-photo-2440024.jpeg?auto=compress&cs=tinysrgb&w=400',
    excerpt: 'International research team observes accelerating cracks in critical ice formation.',
    reading_time: 7,
    location: 'Antarctica',
    content: `An international team of glaciologists has documented alarming fracture patterns in the Thwaites Glacier ice shelf, suggesting the massive formation may be approaching a critical tipping point.

The research, published today in Nature Geoscience, reveals that the eastern ice shelf of Thwaites Glacier has developed an extensive network of cracks over the past 18 months, a pattern not observed in previous decades of monitoring.

"What we're seeing is fundamentally different from historical behavior," said lead researcher Dr. Elena Petrov of the British Antarctic Survey. "The fracture density and propagation speed indicate the ice shelf may lose structural integrity within the next decade."

Thwaites Glacier, roughly the size of Florida, acts as a natural dam holding back a vast reservoir of inland ice. Its collapse could eventually contribute up to 10 feet of sea level rise over centuries, though immediate impacts would be measured in inches.

The research team used satellite imagery, underwater robots, and on-ice surveys to map the shelf's condition. They found that warming ocean water flowing beneath the ice has created cavities that reduce stability, while surface meltwater exploits existing cracks.

Climate models suggest that even aggressive emissions reductions may not prevent the glacier's eventual collapse, though they could slow the process significantly. Coastal cities worldwide are incorporating these projections into long-term infrastructure planning.

The findings underscore the urgency of climate action, scientists say, even as some changes become irreversible.`
  }
];

export function generateMockArticles() {
  // These could be used for future article generation
  // const categories = { us: 8, world: 7, politics: 8, business: 7, tech: 7, health: 6, entertainment: 6, sports: 7, opinion: 6, lifestyle: 5, travel: 5 };
  // const authors = [{ name: 'Sarah Mitchell', slug: 'sarah-mitchell' }, ...];
  // const images = { politics: '...', business: '...', ... };

  return mockArticles;
}
