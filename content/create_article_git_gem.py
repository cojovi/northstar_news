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
from google import genai
from google.genai import types
from PIL import Image
from io import BytesIO
import json
import subprocess

# Try to load .env file if python-dotenv is available (optional)
# DISABLED: conflicts with stdin input redirection
# try:
#     from dotenv import load_dotenv
#     load_dotenv()
# except ImportError:
#     pass  # python-dotenv not installed, rely on environment variables


# ========== CONFIGURATION ==========
CONTENT_DIR = Path(__file__).parent
PUBLIC_DIR = CONTENT_DIR.parent / 'public'
GITHUB_REPO_URL = "https://github.com/cojovi/northstar_news/blob/main/public"
GEMINI_IMAGE_MODEL = "imagen-4.0-generate-001"

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
        model="gpt-5.2",
        messages=[
            {"role": "system", "content": "You are an expert editor analyzing publication style and tone."},
            {"role": "user", "content": analysis_prompt}
        ],
        temperature=0.3,
        max_completion_tokens=200
    )

    tone_analysis = response.choices[0].message.content.strip()
    print(f"✓ Tone identified: {tone_analysis}\n")
    return tone_analysis


def detect_input_type(user_input):
    """Detect if input is a URL, file path, structured text, or just an idea."""
    user_input = user_input.strip()
    
    # Check if it's a URL
    if re.match(r'https?://', user_input):
        return 'url'
    
    # Check if it's a file path (only check single-line input, reasonable length)
    # Multi-line input can't be a file path
    if '\n' not in user_input and len(user_input) < 500:
        try:
            file_path = Path(user_input)
            if file_path.exists() and file_path.is_file():
                return 'file'
        except (OSError, ValueError):
            # Path too long or invalid - not a file path
            pass

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


def read_file_content(file_path):
    """Read content from a local file."""
    print(f"📁 Reading content from file: {file_path}")
    try:
        file_path_obj = Path(file_path)
        
        # Handle relative paths - try relative to content directory first, then current working directory
        if not file_path_obj.is_absolute():
            # Try relative to content directory
            content_rel_path = CONTENT_DIR / file_path_obj
            if content_rel_path.exists():
                file_path_obj = content_rel_path
            # If not found, try relative to current working directory (file_path_obj already set)
            elif not file_path_obj.exists():
                # Try with current working directory
                cwd_path = Path.cwd() / file_path_obj
                if cwd_path.exists():
                    file_path_obj = cwd_path
        
        if not file_path_obj.exists():
            print(f"❌ Error: File not found: {file_path}")
            print(f"   Tried: {file_path}")
            if not Path(file_path).is_absolute():
                print(f"   Also tried: {CONTENT_DIR / Path(file_path)}")
            return None
        
        # Read file content
        with open(file_path_obj, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # If it's markdown, try to extract just the body (skip front matter)
        if file_path_obj.suffix == '.md':
            match = re.search(r'^---\s*\n.*?\n---\s*\n(.+)', content, re.DOTALL)
            if match:
                content = match.group(1)
            # If no front matter, use entire content
        
        print(f"✓ Read {len(content)} characters from file")
        return content[:8000]  # Limit to avoid token issues
    except Exception as e:
        print(f"❌ Error reading file: {e}")
        return None


def research_with_tavily(api_key, query, max_results=5):
    """Research a topic using Tavily Search API to gather current, accurate information."""
    if not api_key:
        return None
    
    print(f"🔍 Researching '{query}' using Tavily...")
    
    try:
        # Tavily Search API endpoint
        url = "https://api.tavily.com/search"
        
        payload = {
            "api_key": api_key,
            "query": query,
            "search_depth": "advanced",  # Use advanced search for better results
            "max_results": max_results,
            "include_answer": True,  # Get AI-generated summary
            "include_raw_content": False,  # Don't include full page content to save tokens
            "include_domains": [],  # No domain restrictions
            "exclude_domains": []  # No exclusions
        }
        
        response = requests.post(url, json=payload, timeout=30)
        response.raise_for_status()
        
        data = response.json()
        
        # Extract research results
        research_info = {
            "answer": data.get("answer", ""),  # AI-generated summary
            "results": []
        }
        
        # Extract key information from search results
        for result in data.get("results", [])[:max_results]:
            research_info["results"].append({
                "title": result.get("title", ""),
                "url": result.get("url", ""),
                "content": result.get("content", ""),  # Snippet of the page
                "score": result.get("score", 0)  # Relevance score
            })
        
        print(f"✓ Found {len(research_info['results'])} relevant sources")
        if research_info["answer"]:
            print(f"✓ Research summary: {research_info['answer'][:100]}...")
        
        return research_info
        
    except requests.exceptions.RequestException as e:
        print(f"⚠️  Error researching with Tavily: {e}")
        return None
    except Exception as e:
        print(f"⚠️  Unexpected error during research: {e}")
        return None


def format_research_for_prompt(research_info):
    """Format research results into a prompt-friendly format."""
    if not research_info or not research_info.get("results"):
        return ""
    
    formatted = "\n\nCURRENT RESEARCH AND SOURCES (use this for accurate, up-to-date information):\n"
    
    # Include the AI-generated answer if available
    if research_info.get("answer"):
        formatted += f"Research Summary: {research_info['answer']}\n\n"
    
    formatted += "Sources:\n"
    for i, result in enumerate(research_info["results"][:5], 1):
        formatted += f"{i}. {result['title']}\n"
        formatted += f"   URL: {result['url']}\n"
        formatted += f"   Content: {result['content'][:300]}...\n\n"
    
    formatted += "IMPORTANT: Use the information from these sources to ensure accuracy and relevance. "
    formatted += "Cite facts and statistics from these sources. Ensure all information is current and accurate.\n"
    
    return formatted


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
        model="gpt-5.2",
        messages=[
            {"role": "system", "content": "You are a news editor generating article metadata. Always return valid JSON."},
            {"role": "user", "content": metadata_prompt}
        ],
        temperature=0.5,
        max_completion_tokens=300
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


def create_article_from_idea(client, idea, tone, custom_tone=None, research_info=None):
    """Generate a full article from a simple idea."""
    print("💡 Expanding idea into full article...")

    tone_instruction = custom_tone if custom_tone else tone
    
    # Add research information to prompt if available
    research_section = format_research_for_prompt(research_info) if research_info else ""

    prompt = f"""You are a writer for The Northstar Ledger, a professional news publication.

TONE & STYLE: {tone_instruction}

TASK: Write a complete, publication-ready news article based on this idea:
{idea}
{research_section}

CRITICAL REQUIREMENTS (MANDATORY):
- Length: MUST be at least 1200 words. This is NOT optional. Count your words and ensure you meet this minimum requirement.
- Title: Compelling, newsworthy headline (NO quotes around the title)
- Structure: Professional news article with clear sections
- Include relevant context, analysis, and expert perspectives
- Use engaging, sophisticated prose
- NO placeholder text or [brackets]
- Write as if this is real, researched journalism

FORMATTING REQUIREMENTS (MANDATORY):
- Use Markdown formatting throughout for visual interest:
  * Use ## for major section headers (e.g., ## The Rise of Digital Currency)
  * Use ### for subsections when needed
  * Use **bold** to emphasize key terms, important names, statistics, and critical concepts
  * Use horizontal rules (---) to separate major sections for visual breaks
  * Use > blockquotes for direct quotes from experts or sources
  * Vary formatting to create visual hierarchy and prevent bland, uniform text
  * Make section titles bold and visually distinct
  * Add strategic emphasis with bold text on important facts, figures, and key points

IMPORTANT: The article body MUST be at least 1200 words. Do not stop writing until you reach at least 1200 words. Expand on your points, add depth, include more examples, and provide thorough analysis to meet the minimum word count requirement.

Return ONLY:
TITLE: [your headline - NO quotes]
---
[article content with markdown formatting]"""

    # Retry logic to ensure word count requirement is met
    max_retries = 3
    current_prompt = prompt
    for attempt in range(max_retries):
        response = client.chat.completions.create(
            model="gpt-5.2",
            messages=[
                {"role": "system", "content": "You are an expert journalist writing for a major news publication. You MUST write articles that are 1200-1750 words in length."},
                {"role": "user", "content": current_prompt}
            ],
            temperature=0.7,
            max_completion_tokens=5000
        )

        content = response.choices[0].message.content.strip()

        # Parse title and body
        match = re.match(r'TITLE:\s*(.+?)\s*---\s*(.+)', content, re.DOTALL)
        if match:
            title = match.group(1).strip()
            # Remove surrounding quotes if present
            title = title.strip('"').strip("'")
            body = match.group(2).strip()
        else:
            # Fallback: use first line as title
            lines = content.split('\n', 1)
            title = lines[0].replace('TITLE:', '').replace('#', '').strip()
            # Remove surrounding quotes if present
            title = title.strip('"').strip("'")
            body = lines[1].strip() if len(lines) > 1 else content

        # Validate word count (minimum: 1200 words, buffer: 250 words, acceptable minimum: 950)
        word_count = len(body.split())
        WORD_COUNT_MIN = 1200
        WORD_COUNT_BUFFER = 250
        ACCEPTABLE_MIN = WORD_COUNT_MIN - WORD_COUNT_BUFFER  # 950
        
        if word_count >= ACCEPTABLE_MIN:
            return title, body
        elif attempt < max_retries - 1:
            print(f"⚠️  Word count {word_count} is below minimum ({ACCEPTABLE_MIN}+), retrying...")
            current_prompt = f"""{prompt}

NOTE: Your previous attempt was {word_count} words, which is too short. The minimum is {WORD_COUNT_MIN} words. Please write a longer, more detailed article."""
        else:
            print(f"⚠️  Warning: Final word count {word_count} is below minimum ({ACCEPTABLE_MIN}+)")

    return title, body


def create_article_from_url(client, url, tone, custom_tone=None, research_info=None):
    """Rewrite an article from a URL in our publication's tone."""
    print("🔄 Rewriting article from URL...")

    content = fetch_url_content(url)
    if not content:
        print("❌ Could not fetch URL content")
        sys.exit(1)

    tone_instruction = custom_tone if custom_tone else tone
    
    # Add research information to prompt if available
    research_section = format_research_for_prompt(research_info) if research_info else ""

    prompt = f"""You are a writer for The Northstar Ledger, a professional news publication.

TONE & STYLE: {tone_instruction}

TASK: Completely rewrite this article in our publication's distinctive voice and style:

{content[:6000]}
{research_section}

CRITICAL REQUIREMENTS (MANDATORY):
- Length: MUST be at least 1200 words. This is NOT optional. Count your words and ensure you meet this minimum requirement.
- Title: Create a new, compelling headline (NO quotes around the title)
- Rewrite everything - do NOT copy phrases directly
- Maintain factual accuracy but present in our unique voice
- Use engaging, sophisticated prose with our characteristic style
- Include relevant analysis and commentary
- NO placeholder text or [brackets]

FORMATTING REQUIREMENTS (MANDATORY):
- Use Markdown formatting throughout for visual interest:
  * Use ## for major section headers (e.g., ## The Rise of Digital Currency)
  * Use ### for subsections when needed
  * Use **bold** to emphasize key terms, important names, statistics, and critical concepts
  * Use horizontal rules (---) to separate major sections for visual breaks
  * Use > blockquotes for direct quotes from experts or sources
  * Vary formatting to create visual hierarchy and prevent bland, uniform text
  * Make section titles bold and visually distinct
  * Add strategic emphasis with bold text on important facts, figures, and key points

IMPORTANT: The article body MUST be at least 1200 words. Do not stop writing until you reach at least 1200 words. Expand on your points, add depth, include more examples, and provide thorough analysis to meet the minimum word count requirement.

Return ONLY:
TITLE: [your headline - NO quotes]
---
[article content with markdown formatting]"""

    # Retry logic to ensure word count requirement is met
    max_retries = 3
    current_prompt = prompt
    for attempt in range(max_retries):
        response = client.chat.completions.create(
            model="gpt-5.2",
            messages=[
                {"role": "system", "content": "You are an expert journalist rewriting content for a major news publication. You MUST write articles that are 1200-1750 words in length."},
                {"role": "user", "content": current_prompt}
            ],
            temperature=0.7,
            max_completion_tokens=5000
        )

        content = response.choices[0].message.content.strip()

        # Parse title and body
        match = re.match(r'TITLE:\s*(.+?)\s*---\s*(.+)', content, re.DOTALL)
        if match:
            title = match.group(1).strip()
            # Remove surrounding quotes if present
            title = title.strip('"').strip("'")
            body = match.group(2).strip()
        else:
            lines = content.split('\n', 1)
            title = lines[0].replace('TITLE:', '').replace('#', '').strip()
            # Remove surrounding quotes if present
            title = title.strip('"').strip("'")
            body = lines[1].strip() if len(lines) > 1 else content

        # Validate word count (minimum: 1200 words, buffer: 250 words, acceptable minimum: 950)
        word_count = len(body.split())
        WORD_COUNT_MIN = 1200
        WORD_COUNT_BUFFER = 250
        ACCEPTABLE_MIN = WORD_COUNT_MIN - WORD_COUNT_BUFFER  # 950
        
        if word_count >= ACCEPTABLE_MIN:
            return title, body
        elif attempt < max_retries - 1:
            print(f"⚠️  Word count {word_count} is below minimum ({ACCEPTABLE_MIN}+), retrying...")
            current_prompt = f"""{prompt}

NOTE: Your previous attempt was {word_count} words, which is too short. The minimum is {WORD_COUNT_MIN} words. Please write a longer, more detailed article."""
        else:
            print(f"⚠️  Warning: Final word count {word_count} is below minimum ({ACCEPTABLE_MIN}+)")

    return title, body


def create_article_from_text(client, text, tone, custom_tone=None, research_info=None):
    """Transform unstructured text into a polished article."""
    print("📝 Transforming text into article...")

    tone_instruction = custom_tone if custom_tone else tone
    
    # Add research information to prompt if available
    research_section = format_research_for_prompt(research_info) if research_info else ""

    prompt = f"""You are a writer for The Northstar Ledger, a professional news publication.

TONE & STYLE: {tone_instruction}

TASK: Transform this unstructured text into a polished, publication-ready article:

{text}
{research_section}

CRITICAL REQUIREMENTS (MANDATORY):
- Length: MUST be at least 1200 words. This is NOT optional. Count your words and ensure you meet this minimum requirement.
- Title: Create a compelling, newsworthy headline (NO quotes around the title)
- Organize and expand the content into a coherent narrative
- Add relevant context, analysis, and expert perspectives where needed
- Use engaging, sophisticated prose
- NO placeholder text or [brackets]
- Make it read like professional journalism

FORMATTING REQUIREMENTS (MANDATORY):
- Use Markdown formatting throughout for visual interest:
  * Use ## for major section headers (e.g., ## The Rise of Digital Currency)
  * Use ### for subsections when needed
  * Use **bold** to emphasize key terms, important names, statistics, and critical concepts
  * Use horizontal rules (---) to separate major sections for visual breaks
  * Use > blockquotes for direct quotes from experts or sources
  * Vary formatting to create visual hierarchy and prevent bland, uniform text
  * Make section titles bold and visually distinct
  * Add strategic emphasis with bold text on important facts, figures, and key points

IMPORTANT: The article body MUST be at least 1200 words. Do not stop writing until you reach at least 1200 words. Expand on your points, add depth, include more examples, and provide thorough analysis to meet the minimum word count requirement.

Return ONLY:
TITLE: [your headline - NO quotes]
---
[article content with markdown formatting]"""

    # Retry logic to ensure word count requirement is met
    max_retries = 3
    current_prompt = prompt
    for attempt in range(max_retries):
        response = client.chat.completions.create(
            model="gpt-5.2",
            messages=[
                {"role": "system", "content": "You are an expert journalist writing for a major news publication. You MUST write articles that are 1200-1750 words in length."},
                {"role": "user", "content": current_prompt}
            ],
            temperature=0.7,
            max_completion_tokens=5000
        )

        content = response.choices[0].message.content.strip()

        # Parse title and body
        match = re.match(r'TITLE:\s*(.+?)\s*---\s*(.+)', content, re.DOTALL)
        if match:
            title = match.group(1).strip()
            # Remove surrounding quotes if present
            title = title.strip('"').strip("'")
            body = match.group(2).strip()
        else:
            lines = content.split('\n', 1)
            title = lines[0].replace('TITLE:', '').replace('#', '').strip()
            # Remove surrounding quotes if present
            title = title.strip('"').strip("'")
            body = lines[1].strip() if len(lines) > 1 else content

        # Validate word count (minimum: 1200 words, buffer: 250 words, acceptable minimum: 950)
        word_count = len(body.split())
        WORD_COUNT_MIN = 1200
        WORD_COUNT_BUFFER = 250
        ACCEPTABLE_MIN = WORD_COUNT_MIN - WORD_COUNT_BUFFER  # 950
        
        if word_count >= ACCEPTABLE_MIN:
            return title, body
        elif attempt < max_retries - 1:
            print(f"⚠️  Word count {word_count} is below minimum ({ACCEPTABLE_MIN}+), retrying...")
            current_prompt = f"""{prompt}

NOTE: Your previous attempt was {word_count} words, which is too short. The minimum is {WORD_COUNT_MIN} words. Please write a longer, more detailed article."""
        else:
            print(f"⚠️  Warning: Final word count {word_count} is below minimum ({ACCEPTABLE_MIN}+)")

    return title, body


def create_article_from_file(client, file_path, tone, custom_tone=None, research_info=None):
    """Create article from a local file."""
    print("📄 Processing file content...")
    
    content = read_file_content(file_path)
    if not content:
        print("❌ Could not read file content")
        sys.exit(1)
    
    # Use the same logic as create_article_from_text since we've extracted the content
    return create_article_from_text(client, content, tone, custom_tone, research_info)


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
        model="gpt-5.2",
        messages=[
            {
                "role": "system",
                "content": "You are an expert photo art director who specializes in writing prompts that produce realistic, photographic images for news articles."
            },
            {"role": "user", "content": prompt_text}
        ],
        temperature=0.5,
        max_completion_tokens=200
    )

    image_prompt = response.choices[0].message.content.strip()
    # Preface with "Hyper Realism, Photo realistic" as requested
    image_prompt = f"Hyper Realism, Photo realistic {image_prompt}"
    print(f"✓ Image prompt: {image_prompt}")
    return image_prompt


def generate_image(gemini_client, prompt, output_path):
    """Generate a PHOTOREALISTIC image using Google Gemini Imagen."""
    print(f"🖼️  Generating image with Gemini Imagen (model: {GEMINI_IMAGE_MODEL})...")
    print(f"--- Connecting to Gemini API using model: {GEMINI_IMAGE_MODEL} ---")
    
    try:
        print(f"Generating image for prompt: '{prompt}'...")
        
        # The API Call - matching generate_image.py exactly
        response = gemini_client.models.generate_images(
            model=GEMINI_IMAGE_MODEL,
            prompt=prompt,
            config=types.GenerateImagesConfig(
                number_of_images=1,
            )
        )

        # Handling the Response - matching generate_image.py exactly
        if response.generated_images:
            image_bytes = response.generated_images[0].image.image_bytes
            
            # Convert bytes to an image object (matching generate_image.py)
            image = Image.open(BytesIO(image_bytes))
            
            # Save to file (matching generate_image.py)
            image.save(str(output_path))
            print(f"✓ Success! Image saved to: {os.path.abspath(output_path)}")
            return output_path
        else:
            print("❌ No image was returned. Check safety filters or prompt.")
            raise Exception("No image generated")
            
    except Exception as e:
        print(f"\n❌ An error occurred:\n{e}")
        # Help usage if model is wrong (matching generate_image.py)
        if "404" in str(e) or "not found" in str(e).lower():
            print(f"\nTip: If the model '{GEMINI_IMAGE_MODEL}' is not found, try checking your API key or quota. Available models: imagen-4.0-generate-001")
        raise


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


def commit_and_push_to_github(markdown_path, image_path, title):
    """Commit and push the new article and image to GitHub."""
    print("\n" + "=" * 60)
    print("📤 Committing and pushing to GitHub...")
    print("=" * 60)
    
    # Get the repository root (parent of content directory)
    repo_root = CONTENT_DIR.parent
    
    try:
        # Check if git is available
        subprocess.run(['git', '--version'], check=True, capture_output=True, cwd=repo_root)
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("⚠️  Git not found or not available. Skipping commit/push.")
        return False
    
    try:
        # Check if we're in a git repository
        subprocess.run(['git', 'rev-parse', '--git-dir'], check=True, capture_output=True, cwd=repo_root)
    except subprocess.CalledProcessError:
        print("⚠️  Not in a git repository. Skipping commit/push.")
        return False
    
    try:
        # Get relative paths from repo root
        markdown_rel = markdown_path.relative_to(repo_root)
        image_rel = image_path.relative_to(repo_root)
        
        # Add files to staging
        print(f"📝 Staging files...")
        subprocess.run(['git', 'add', str(markdown_rel)], check=True, cwd=repo_root)
        subprocess.run(['git', 'add', str(image_rel)], check=True, cwd=repo_root)
        
        # Create commit message
        commit_message = f"Add article: {title}"
        
        # Commit
        print(f"💾 Committing changes...")
        result = subprocess.run(
            ['git', 'commit', '-m', commit_message],
            check=True,
            capture_output=True,
            text=True,
            cwd=repo_root
        )
        print(f"✓ Committed: {commit_message}")
        
        # Push to GitHub
        print(f"🚀 Pushing to GitHub...")
        push_result = subprocess.run(
            ['git', 'push'],
            check=True,
            capture_output=True,
            text=True,
            cwd=repo_root
        )
        print(f"✓ Successfully pushed to GitHub!")
        print("=" * 60)
        return True
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Error during git operation: {e.stderr if e.stderr else e.stdout}")
        print("⚠️  Files were created but not committed/pushed.")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        print("⚠️  Files were created but not committed/pushed.")
        return False


def main():
    """Main execution flow."""
    print("=" * 60)
    print("🌟 NORTHSTAR LEDGER - AUTONOMOUS ARTICLE CREATOR 🌟")
    print("=" * 60)
    print()

    # Check OpenAI API key (for text generation)
    openai_api_key = os.getenv('OPENAI_API_KEY')
    if not openai_api_key:
        print("❌ Error: OPENAI_API_KEY environment variable not set")
        print("Please set it with: export OPENAI_API_KEY='your-api-key'")
        sys.exit(1)

    # Check Gemini API key (for image generation)
    gemini_api_key = os.getenv('GEMINI_API_KEY')
    if not gemini_api_key:
        print("❌ Error: GEMINI_API_KEY environment variable not set")
        print("Please set it with: export GEMINI_API_KEY='your-api-key'")
        sys.exit(1)

    client = OpenAI(api_key=openai_api_key)
    gemini_client = genai.Client(api_key=gemini_api_key)
    
    # Check Tavily API key (optional - for web research)
    tavily_api_key = os.getenv('TAVILY_API_KEY')
    if not tavily_api_key:
        print("⚠️  TAVILY_API_KEY not set - web research will be disabled")
        print("   Set it with: export TAVILY_API_KEY='your-api-key' (optional)")
        print()

    # Step 1: Get user input
    print("Enter your blog content (press Enter, then Ctrl+D or Ctrl+Z when done):")
    print("  • A simple idea: 'Rise of AI in healthcare'")
    print("  • A URL: 'https://example.com/article'")
    print("  • A local file path: './path/to/file.md' or 'health/article.md'")
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

    # Step 4a: Perform web research if Tavily API key is available
    research_info = None
    if tavily_api_key:
        # Create a research query based on input type
        if input_type == 'idea':
            research_query = user_input
        elif input_type == 'url':
            # Extract key terms from URL or use the URL content
            research_query = user_input
        elif input_type == 'text':
            # Extract key terms from text (first 200 chars or first sentence)
            sentences = re.split(r'[.!?]+', user_input)
            research_query = sentences[0] if sentences else user_input[:200]
        else:  # file
            # For files, we'll research after reading content
            research_query = None
        
        if research_query:
            research_info = research_with_tavily(tavily_api_key, research_query, max_results=5)
            if research_info:
                print()
    
    # Step 4b: Generate article with research context
    if input_type == 'url':
        title, body = create_article_from_url(client, user_input, default_tone, custom_tone, research_info)
    elif input_type == 'file':
        # For files, research using filename or first line of content
        if tavily_api_key and not research_info:
            # Create research query from filename (remove path and extension)
            file_stem = Path(user_input).stem
            research_query = file_stem.replace('-', ' ').replace('_', ' ')
            research_info = research_with_tavily(tavily_api_key, research_query, max_results=5)
        title, body = create_article_from_file(client, user_input, default_tone, custom_tone, research_info)
    elif input_type == 'text':
        title, body = create_article_from_text(client, user_input, default_tone, custom_tone, research_info)
    else:  # idea
        title, body = create_article_from_idea(client, user_input, default_tone, custom_tone, research_info)

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
    generate_image(gemini_client, image_prompt, image_path)
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
    
    # Step 9: Commit and push to GitHub (optional, controlled by env var)
    auto_commit = os.getenv('AUTO_COMMIT', 'true').lower() == 'true'
    if auto_commit:
        commit_and_push_to_github(markdown_path, image_path, title)
    else:
        print("\n💡 Tip: Set AUTO_COMMIT=true to automatically commit and push to GitHub")


if __name__ == '__main__':
    main()
