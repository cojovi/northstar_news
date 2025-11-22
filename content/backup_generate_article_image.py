#!/usr/bin/env python3
"""
Article Image Generator
Generates hero images for markdown articles using AI image generation.
"""

import os
import sys
import re
import argparse
from pathlib import Path
import requests
from openai import OpenAI

def parse_markdown_frontmatter(content):
    """Extract frontmatter and body from markdown content."""
    # Match YAML frontmatter between --- markers
    match = re.match(r'^---\s*\n(.*?)\n---\s*\n(.*)', content, re.DOTALL)
    if match:
        frontmatter = match.group(1)
        body = match.group(2)
        return frontmatter, body
    return None, content

def extract_article_info(content):
    """Extract title and key information from markdown content."""
    frontmatter, body = parse_markdown_frontmatter(content)
    
    # Extract title from frontmatter
    title = None
    dek = None
    category = None
    
    if frontmatter:
        title_match = re.search(r'title:\s*(.+)', frontmatter)
        dek_match = re.search(r'dek:\s*(.+)', frontmatter)
        category_match = re.search(r'category:\s*(.+)', frontmatter)
        
        if title_match:
            title = title_match.group(1).strip()
        if dek_match:
            dek = dek_match.group(1).strip()
        if category_match:
            category = category_match.group(1).strip()
    
    # Get first 500 characters of body for context
    body_preview = body[:500] if body else ""
    
    return {
        'title': title,
        'dek': dek,
        'category': category,
        'body_preview': body_preview
    }

def generate_image_prompt(client, article_info):
    """Use OpenAI to generate an image generation prompt based on article content."""
    print("Generating image prompt...")
    
    prompt_text = f"""Based on this article, create a detailed image generation prompt for DALL-E.
The image should be professional, news-worthy, and visually represent the article's theme.

Article Title: {article_info['title']}
Dek: {article_info['dek']}
Category: {article_info['category']}
Preview: {article_info['body_preview']}

Create a prompt that will generate a high-quality, photorealistic image suitable for a news article hero image.
The image should be professional, modern, and relevant to the topic.
Avoid text in the image. Focus on visual representation.
The prompt should be 1-2 sentences maximum.

Image prompt:"""

    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You are a helpful assistant that creates image generation prompts for news articles."},
            {"role": "user", "content": prompt_text}
        ],
        temperature=0.7,
        max_tokens=150
    )
    
    image_prompt = response.choices[0].message.content.strip()
    print(f"Generated prompt: {image_prompt}")
    return image_prompt

def generate_image(client, prompt, output_path):
    """Generate an image using DALL-E and save it."""
    print(f"Generating image with DALL-E...")
    
    response = client.images.generate(
        model="dall-e-3",
        prompt=prompt,
        size="1792x1024",  # Landscape format suitable for hero images
        quality="standard",
        n=1,
    )
    
    image_url = response.data[0].url
    
    # Download the image
    print(f"Downloading image to {output_path}...")
    image_response = requests.get(image_url)
    image_response.raise_for_status()
    
    with open(output_path, 'wb') as f:
        f.write(image_response.content)
    
    print(f"Image saved successfully!")
    return output_path

def create_short_filename(markdown_path):
    """Create a shortened filename from the markdown file path."""
    # Get the stem (filename without extension)
    stem = Path(markdown_path).stem
    
    # Convert to title case and remove common words
    words = stem.split('-')
    # Keep first 3-5 meaningful words, max 40 chars
    short_name = '-'.join(words[:5])
    if len(short_name) > 40:
        short_name = '-'.join(words[:3])
    
    return f"{short_name}.png"

def update_markdown_file(markdown_path, image_filename):
    """Update the hero_image and thumbnail fields in the markdown file."""
    print(f"Updating markdown file...")
    
    with open(markdown_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # GitHub raw URL pattern
    github_url = f"https://github.com/cojovi/northstar_news/blob/main/public/{image_filename}?raw=true"
    
    # Replace hero_image line
    content = re.sub(
        r'hero_image:.*',
        f'hero_image: {github_url}',
        content
    )
    
    # Replace thumbnail line
    content = re.sub(
        r'thumbnail:.*',
        f'thumbnail: {github_url}',
        content
    )
    
    # Write back to file
    with open(markdown_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"Markdown file updated successfully!")

def main():
    parser = argparse.ArgumentParser(
        description='Generate hero images for markdown articles using AI'
    )
    parser.add_argument(
        'markdown_file',
        type=str,
        help='Path to the markdown file'
    )
    parser.add_argument(
        '--output-dir',
        type=str,
        default='../public',
        help='Directory to save generated images (default: ../public)'
    )
    
    args = parser.parse_args()
    
    # Check if API key is set
    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key:
        print("Error: OPENAI_API_KEY environment variable not set")
        print("Please set it with: export OPENAI_API_KEY='your-api-key'")
        sys.exit(1)
    
    # Initialize OpenAI client
    client = OpenAI(api_key=api_key)
    
    # Verify markdown file exists
    markdown_path = Path(args.markdown_file)
    if not markdown_path.exists():
        print(f"Error: File not found: {markdown_path}")
        sys.exit(1)
    
    # Read markdown file
    print(f"Reading markdown file: {markdown_path}")
    with open(markdown_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extract article information
    article_info = extract_article_info(content)
    print(f"Article: {article_info['title']}")
    
    # Generate image prompt
    image_prompt = generate_image_prompt(client, article_info)
    
    # Create output filename
    image_filename = create_short_filename(markdown_path)
    output_dir = Path(__file__).parent / args.output_dir
    output_dir.mkdir(exist_ok=True)
    output_path = output_dir / image_filename
    
    # Generate image
    generate_image(client, image_prompt, output_path)
    
    # Update markdown file
    update_markdown_file(markdown_path, image_filename)
    
    print("\n" + "="*60)
    print("✓ Process completed successfully!")
    print(f"✓ Image saved to: {output_path}")
    print(f"✓ Markdown file updated: {markdown_path}")
    print(f"✓ Image URL: https://github.com/cojovi/northstar_news/blob/main/public/{image_filename}?raw=true")
    print("="*60)

if __name__ == '__main__':
    main()

