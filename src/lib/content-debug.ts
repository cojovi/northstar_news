export function testContentLoading() {
  try {
    const modules = import.meta.glob('/content/**/*.md', {
      query: '?raw',
      import: 'default',
      eager: true
    });

    console.log('Modules found:', Object.keys(modules).length);
    console.log('First 5 paths:', Object.keys(modules).slice(0, 5));

    return {
      count: Object.keys(modules).length,
      paths: Object.keys(modules)
    };
  } catch (error) {
    console.error('Error loading modules:', error);
    return { count: 0, paths: [], error: String(error) };
  }
}
