#!/usr/bin/env python3
"""
Northstar Ledger Article Creator
Fully autonomous blog post generator with integrated image generation.
"""

import os
import sys
import re
import random
import argparse
from pathlib import Path
from datetime import datetime, timezone
import requests
from openai import OpenAI
import json


# ========== CONFIGURATION ==========
CONTENT_DIR = Path(__file__).parent
PUBLIC_DIR = CONTENT_DIR.parent / 'public'
GITHUB_REPO_URL = "https://github.com/cojovi/northstar_news/blob/main/public"

CATEGORIES = {
    'us': 'U.S. News',
    'world': 'World News',
    'politics': 'Politics',
    'business': 'Business',
    'tech': 'Technology',
    'health': 'Health',
    'entertainment': 'Entertainment',
    'sports': 'Sports',
    'opinion': 'Opinion',
    'lifestyle': 'Lifestyle',
    'travel': 'Travel'
}

# Author name pools for randomization
FIRST_NAMES = [
    'Elena', 'Marcus', 'Sophia', 'James', 'Olivia', 'Lucas', 'Emma', 'Noah',
    'Isabella', 'Ethan', 'Ava', 'Mason', 'Charlotte', 'Logan', 'Amelia',
    'Alexander', 'Harper', 'Benjamin', 'Evelyn', 'Samuel', 'Abigail', 'Daniel',
    'Emily', 'Matthew', 'Elizabeth', 'David', 'Sofia', 'Joseph', 'Avery', 'Carter'
]

LAST_NAMES = [
    'Chen', 'Rodriguez', 'Kim', 'Petrov', 'Johnson', 'Williams', 'Brown', 'Jones',
    'Garcia', 'Martinez', 'Davis', 'Lopez', 'Wilson', 'Anderson', 'Thomas',
    'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Thompson', 'White', 'Harris',
    'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young'
]

PREFIXES = ['Dr.', '', '', '', '']  # 20% chance of Dr. prefix


# ========== HELPER FUNCTIONS ==========

def slugify(text):
    """Convert text to URL-friendly slug."""
    text = text.lower()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[-\s]+', '-', text)
    return text.strip('-')


def generate_random_author():
    """Generate a random author name and slug."""
    prefix = random.choice(PREFIXES)
    first = random.choice(FIRST_NAMES)
    last = random.choice(LAST_NAMES)

    if prefix:
        full_name = f"{prefix} {first} {last}"
    else:
        full_name = f"{first} {last}"

    author_slug = slugify(f"{first}-{last}")

    return full_name, author_slug


def calculate_reading_time(word_count):
    """Calculate reading time based on word count (200 words per minute)."""
    return max(1, round(word_count / 200))


def analyze_existing_tone(client):
    """Analyze existing articles to learn the publication's tone and style."""
    print("📚 Analyzing existing articles to learn tone...")

    # Read several existing articles
    sample_articles = []
    article_files = list(CONTENT_DIR.glob('**/*.md'))

    # Filter out non-article files
    article_files = [f for f in article_files if f.stem not in ['README', 'QUICKSTART', 'VERSION_COMPARISON']
                     and not f.stem.endswith('-saved')]

    # Sample up to 5 random articles
    samples = random.sample(article_files, min(5, len(article_files)))

    for article_path in samples:
        try:
            with open(article_path, 'r', encoding='utf-8') as f:
                content = f.read()
                # Extract just the article body (after front matter)
                match = re.search(r'^---\s*\n.*?\n---\s*\n(.+)', content, re.DOTALL)
                if match:
                    sample_articles.append(match.group(1)[:1000])  # First 1000 chars
        except Exception as e:
            print(f"⚠️  Could not read {article_path}: {e}")

    if not sample_articles:
        return "Professional news journalism with a satirical edge, witty commentary, and engaging long-form style."

    # Use AI to analyze the tone
    analysis_prompt = f"""Analyze these excerpts from The Northstar Ledger to identify the publication's unique tone, voice, and writing style:

{chr(10).join(f"--- Sample {i+1} ---{chr(10)}{sample}" for i, sample in enumerate(sample_articles))}

Describe the tone, voice, style, and key characteristics in 2-3 sentences. Be specific about what makes this publication unique."""

    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You are an expert editor analyzing publication style and tone."},
            {"role": "user", "content": analysis_prompt}
        ],
        temperature=0.3,
        max_tokens=200
    )

    tone_analysis = response.choices[0].message.content.strip()
    print(f"✓ Tone identified: {tone_analysis}\n")
    return tone_analysis


def detect_input_type(user_input):
    """Detect if input is a URL, structured text, or just an idea."""
    # Check if it's a URL
    if re.match(r'https?://', user_input.strip()):
        return 'url'

    # Check if it has multiple sentences and structure (likely an article or detailed text)
    sentences = re.split(r'[.!?]+', user_input)
    if len(sentences) > 5 and len(user_input) > 300:
        return 'text'

    # Otherwise, it's just an idea
    return 'idea'


def fetch_url_content(url):
    """Fetch and extract main content from a URL."""
    print(f"🌐 Fetching content from URL...")
    try:
        response = requests.get(url, timeout=10, headers={
            'User-Agent': 'Mozilla/5.0 (compatible; NorthstarLedger/1.0)'
        })
        response.raise_for_status()

        # Simple text extraction (you could use BeautifulSoup for better parsing)
        text = response.text
        # Remove HTML tags
        text = re.sub(r'<script[^>]*>.*?</script>', '', text, flags=re.DOTALL)
        text = re.sub(r'<style[^>]*>.*?</style>', '', text, flags=re.DOTALL)
        text = re.sub(r'<[^>]+>', ' ', text)
        text = re.sub(r'\s+', ' ', text)

        return text[:8000]  # Limit to avoid token issues
    except Exception as e:
        print(f"❌ Error fetching URL: {e}")
        return None


def generate_article_metadata(client, article_content, title):
    """Generate category, tags, location, and other metadata."""
    print("🏷️  Generating metadata...")

    metadata_prompt = f"""Based on this article, generate metadata:

Title: {title}

Article excerpt: {article_content[:1000]}

Provide a JSON response with:
1. "category": one of {list(CATEGORIES.keys())} that best fits this article
2. "tags": array of 3-5 relevant tags (keep them concise, 1-3 words each)
3. "location": a relevant geographic location if applicable, or null if not geography-specific
4. "dek": a compelling subheading (10-15 words) that expands on the title

Return ONLY valid JSON, no other text."""

    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You are a news editor generating article metadata. Always return valid JSON."},
            {"role": "user", "content": metadata_prompt}
        ],
        temperature=0.5,
        max_tokens=300
    )

    try:
        metadata = json.loads(response.choices[0].message.content.strip())
        return metadata
    except json.JSONDecodeError:
        # Fallback
        print("⚠️  Using fallback metadata")
        return {
            "category": "us",
            "tags": ["news", "analysis", "current events"],
            "location": None,
            "dek": "Analysis and commentary on recent developments"
        }


def create_article_from_idea(client, idea, tone, custom_tone=None):
    """Generate a full article from a simple idea."""
    print("💡 Expanding idea into full article...")

    tone_instruction = custom_tone if custom_tone else tone

    prompt = f"""You are a writer for The Northstar Ledger, a professional news publication.

TONE & STYLE: {tone_instruction}

TASK: Write a complete, publication-ready news article based on this idea:
{idea}

REQUIREMENTS:
- Length: 1200-1750 words
- Title: Compelling, newsworthy headline
- Structure: Professional news article with clear sections
- Include relevant context, analysis, and expert perspectives
- Use engaging, sophisticated prose
- NO placeholder text or [brackets]
- Write as if this is real, researched journalism

Return ONLY:
TITLE: [your headline]
---
[article content]"""

    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You are an expert journalist writing for a major news publication."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.7,
        max_tokens=3000
    )

    content = response.choices[0].message.content.strip()

    # Parse title and body
    match = re.match(r'TITLE:\s*(.+?)\s*---\s*(.+)', content, re.DOTALL)
    if match:
        title = match.group(1).strip()
        body = match.group(2).strip()
    else:
        # Fallback: use first line as title
        lines = content.split('\n', 1)
        title = lines[0].replace('TITLE:', '').replace('#', '').strip()
        body = lines[1].strip() if len(lines) > 1 else content

    return title, body


def create_article_from_url(client, url, tone, custom_tone=None):
    """Rewrite an article from a URL in our publication's tone."""
    print("🔄 Rewriting article from URL...")

    content = fetch_url_content(url)
    if not content:
        print("❌ Could not fetch URL content")
        sys.exit(1)

    tone_instruction = custom_tone if custom_tone else tone

    prompt = f"""You are a writer for The Northstar Ledger, a professional news publication.

TONE & STYLE: {tone_instruction}

TASK: Completely rewrite this article in our publication's distinctive voice and style:

{content[:6000]}

REQUIREMENTS:
- Length: 1200-1750 words
- Title: Create a new, compelling headline
- Rewrite everything - do NOT copy phrases directly
- Maintain factual accuracy but present in our unique voice
- Use engaging, sophisticated prose with our characteristic style
- Include relevant analysis and commentary
- NO placeholder text or [brackets]

Return ONLY:
TITLE: [your headline]
---
[article content]"""

    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You are an expert journalist rewriting content for a major news publication."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.7,
        max_tokens=3000
    )

    content = response.choices[0].message.content.strip()

    # Parse title and body
    match = re.match(r'TITLE:\s*(.+?)\s*---\s*(.+)', content, re.DOTALL)
    if match:
        title = match.group(1).strip()
        body = match.group(2).strip()
    else:
        lines = content.split('\n', 1)
        title = lines[0].replace('TITLE:', '').replace('#', '').strip()
        body = lines[1].strip() if len(lines) > 1 else content

    return title, body


def create_article_from_text(client, text, tone, custom_tone=None):
    """Transform unstructured text into a polished article."""
    print("📝 Transforming text into article...")

    tone_instruction = custom_tone if custom_tone else tone

    prompt = f"""You are a writer for The Northstar Ledger, a professional news publication.

TONE & STYLE: {tone_instruction}

TASK: Transform this unstructured text into a polished, publication-ready article:

{text}

REQUIREMENTS:
- Length: 1200-1750 words
- Title: Create a compelling, newsworthy headline
- Organize and expand the content into a coherent narrative
- Add relevant context, analysis, and expert perspectives where needed
- Use engaging, sophisticated prose
- NO placeholder text or [brackets]
- Make it read like professional journalism

Return ONLY:
TITLE: [your headline]
---
[article content]"""

    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You are an expert journalist writing for a major news publication."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.7,
        max_tokens=3000
    )

    content = response.choices[0].message.content.strip()

    # Parse title and body
    match = re.match(r'TITLE:\s*(.+?)\s*---\s*(.+)', content, re.DOTALL)
    if match:
        title = match.group(1).strip()
        body = match.group(2).strip()
    else:
        lines = content.split('\n', 1)
        title = lines[0].replace('TITLE:', '').replace('#', '').strip()
        body = lines[1].strip() if len(lines) > 1 else content

    return title, body


def generate_image_prompt(client, title, dek, category, body_preview):
    """Use OpenAI to generate a PHOTOREALISTIC image generation prompt."""
    print("🎨 Generating image prompt...")

    prompt_text = f"""You are an expert photo art director for a major news outlet.

Your job is to write a single, ready-to-use prompt for DALL·E 3 that will create an ULTRA-REALISTIC PHOTOGRAPH (not an illustration) to use as the hero image for the following news article.

Article context:
- Title: {title}
- Dek: {dek}
- Category: {category}
- Excerpt: {body_preview}

Hard requirements:
- Medium: real-world photograph / photo-realistic image only
- Style: hyperrealistic, lifelike news/editorial photography
- Camera: mention professional camera terms (e.g. DSLR or mirrorless, 35mm or 50mm lens, shallow depth of field)
- Lighting: natural, cinematic, believable lighting (no neon cartoon look unless clearly appropriate)
- Composition: modern editorial / documentary composition that would appear on a reputable news site
- Quality: high-resolution, detailed, realistic textures and skin tones
- Content: no text, no logos, no UI, no watermarks

Negative requirements (explicitly avoid):
- Do NOT mention: illustration, painting, drawing, concept art, 3D render, CGI, cartoon, anime, comic, pixel art, clip art.

Now write ONE concise prompt (1–2 sentences) that:
- clearly describes the main subject(s), setting, mood, time of day, and camera angle
- explicitly uses words like "photo", "photograph", or "photo-realistic"
- is ready to send directly to the image model.

Return ONLY the prompt text, with no explanation or extra wording."""

    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {
                "role": "system",
                "content": "You are an expert photo art director who specializes in writing prompts that produce realistic, photographic images for news articles."
            },
            {"role": "user", "content": prompt_text}
        ],
        temperature=0.5,
        max_tokens=200
    )

    image_prompt = response.choices[0].message.content.strip()
    print(f"✓ Image prompt: {image_prompt}")
    return image_prompt


def generate_image(client, prompt, output_path):
    """Generate a PHOTOREALISTIC image using DALL-E."""
    print("🖼️  Generating image with DALL-E...")

    response = client.images.generate(
        model="dall-e-3",
        prompt=prompt,
        size="1792x1024",
        quality="hd",
        style="natural",
        n=1
    )

    image_url = response.data[0].url

    # Download the image
    print(f"💾 Downloading image...")
    image_response = requests.get(image_url)
    image_response.raise_for_status()

    with open(output_path, 'wb') as f:
        f.write(image_response.content)

    print(f"✓ Image saved: {output_path.name}")
    return output_path


def yaml_escape(value):
    """Properly escape a string for YAML, returning quoted string if needed."""
    if not value:
        return '""'

    # Convert to string if not already
    value = str(value)

    # Replace any internal double quotes with escaped quotes
    value = value.replace('"', '\\"')

    # Always wrap in double quotes for safety
    return f'"{value}"'


def create_markdown_file(title, dek, slug, category, tags, author, author_slug,
                        location, body, image_filename):
    """Create the markdown file with proper front matter."""

    # Calculate reading time
    word_count = len(body.split())
    reading_time = calculate_reading_time(word_count)

    # Generate timestamps
    now = datetime.now(timezone.utc)
    published = now.isoformat()
    updated = now.isoformat()

    # Excerpt (first 150 chars or first sentence)
    excerpt_match = re.match(r'^(.+?[.!?])\s', body)
    if excerpt_match:
        excerpt = excerpt_match.group(1)
    else:
        excerpt = body[:150].strip()
        if len(body) > 150:
            excerpt += "..."

    # Image URLs
    image_url = f"{GITHUB_REPO_URL}/{image_filename}?raw=true"

    # Format tags - use array format with proper quoting
    tags_formatted = "[" + ", ".join(f"'{tag}'" for tag in tags) + "]"

    # Properly escape all string values for YAML
    title_escaped = yaml_escape(title)
    dek_escaped = yaml_escape(dek)
    author_escaped = yaml_escape(author)
    excerpt_escaped = yaml_escape(excerpt)

    # Build front matter
    location_line = f"location: {yaml_escape(location)}\n" if location else ""

    front_matter = f"""---
title: {title_escaped}
dek: {dek_escaped}
slug: {slug}
category: {category}
tags: {tags_formatted}
author: {author_escaped}
author_slug: {author_slug}
published: {published}
updated: {updated}
hero_image: {image_url}
hero_credit: Photo via Pexels
thumbnail: {image_url}
excerpt: {excerpt_escaped}
reading_time: {reading_time}
{location_line}status: published
is_satire: false
---

{body}
"""

    # Save to appropriate category folder
    category_dir = CONTENT_DIR / category
    category_dir.mkdir(exist_ok=True)

    markdown_path = category_dir / f"{slug}.md"

    with open(markdown_path, 'w', encoding='utf-8') as f:
        f.write(front_matter)

    print(f"✓ Article saved: {markdown_path}")
    return markdown_path


def main():
    """Main execution flow."""
    print("=" * 60)
    print("🌟 NORTHSTAR LEDGER - AUTONOMOUS ARTICLE CREATOR 🌟")
    print("=" * 60)
    print()

    # Check API key
    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key:
        print("❌ Error: OPENAI_API_KEY environment variable not set")
        print("Please set it with: export OPENAI_API_KEY='your-api-key'")
        sys.exit(1)

    client = OpenAI(api_key=api_key)

    # Step 1: Get user input
    print("Enter your blog content (press Enter, then Ctrl+D or Ctrl+Z when done):")
    print("  • A simple idea: 'Rise of AI in healthcare'")
    print("  • A URL: 'https://example.com/article'")
    print("  • Unstructured text: Paste any text/notes you have")
    print()

    try:
        user_input = sys.stdin.read().strip()
    except KeyboardInterrupt:
        print("\n❌ Cancelled by user")
        sys.exit(0)

    if not user_input:
        print("❌ No input provided")
        sys.exit(1)

    print()
    print("=" * 60)
    print()

    # Step 2: Analyze tone
    default_tone = analyze_existing_tone(client)

    # Step 3: Ask for custom tone
    print(f"Default tone: {default_tone}")
    print("\nEnter custom tone/style (press Enter to use default):")
    custom_tone_input = input("> ").strip()
    custom_tone = custom_tone_input if custom_tone_input else None

    print()
    print("=" * 60)
    print()

    # Step 4: Detect input type and generate article
    input_type = detect_input_type(user_input)
    print(f"📋 Input type detected: {input_type.upper()}")
    print()

    if input_type == 'url':
        title, body = create_article_from_url(client, user_input, default_tone, custom_tone)
    elif input_type == 'text':
        title, body = create_article_from_text(client, user_input, default_tone, custom_tone)
    else:  # idea
        title, body = create_article_from_idea(client, user_input, default_tone, custom_tone)

    print(f"✓ Article generated: {title}")
    print(f"✓ Word count: {len(body.split())} words")
    print()

    # Step 5: Generate metadata
    metadata = generate_article_metadata(client, body, title)
    category = metadata['category']
    tags = metadata['tags']
    location = metadata.get('location')
    dek = metadata['dek']

    # Step 6: Generate author and slug
    author, author_slug = generate_random_author()
    slug = slugify(title)

    print(f"✓ Category: {category}")
    print(f"✓ Tags: {', '.join(tags)}")
    print(f"✓ Location: {location or 'N/A'}")
    print(f"✓ Author: {author}")
    print()

    # Step 7: Generate image
    image_filename = f"{slug[:50]}.png"  # Limit filename length
    image_path = PUBLIC_DIR / image_filename
    PUBLIC_DIR.mkdir(exist_ok=True)

    image_prompt = generate_image_prompt(client, title, dek, category, body[:500])
    generate_image(client, image_prompt, image_path)
    print()

    # Step 8: Create markdown file
    markdown_path = create_markdown_file(
        title, dek, slug, category, tags, author, author_slug,
        location, body, image_filename
    )

    print()
    print("=" * 60)
    print("✨ ARTICLE CREATION COMPLETE! ✨")
    print("=" * 60)
    print(f"📄 Markdown: {markdown_path}")
    print(f"🖼️  Image: {image_path}")
    print(f"🔗 URL: /{category}/{slug}")
    print("=" * 60)


if __name__ == '__main__':
    main()
