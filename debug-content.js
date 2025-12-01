// Quick debug script to test if content loads
import { getAllArticles } from './src/lib/content.ts';

try {
  console.log('Testing content loading...');
  const articles = getAllArticles();
  console.log(`✅ Loaded ${articles.length} articles`);
  
  if (articles.length > 0) {
    const first = articles[0];
    console.log('First article:', {
      title: first.title,
      category: first.categoryPath,
      slug: first.slug
    });
  }
  
  // Check categories
  const categories = ['us', 'world', 'politics', 'business', 'tech', 'sports'];
  categories.forEach(cat => {
    const catArticles = articles.filter(a => a.categoryPath === cat);
    console.log(`${cat}: ${catArticles.length} articles`);
  });
  
} catch (error) {
  console.error('❌ Error loading articles:', error);
}
