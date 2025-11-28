# Article Creator - Usage Guide

## Overview

`create_article.py` is a fully autonomous script that creates complete blog posts for The Northstar Ledger, including article generation and image creation.

## Features

✨ **Fully Autonomous** - No manual intervention needed
🎨 **Auto Image Generation** - Creates hero images using DALL-E 3
🏷️ **Smart Metadata** - Auto-generates tags, category, location, and more
👤 **Random Authors** - Generates realistic author names
📝 **1200-1750 Words** - Professional-length articles
🎭 **Tone Matching** - Analyzes existing articles to match publication style

## Prerequisites

```bash
# Set your OpenAI API key
export OPENAI_API_KEY='your-api-key-here'

# Install required packages (if not already installed)
pip install openai requests
```

## Usage

### Basic Usage

```bash
cd content
python3 create_article.py
```

Then enter your content when prompted. You can provide:

1. **A Simple Idea**
   ```
   Rise of AI in healthcare and its impact on patient care
   ```

2. **A URL to Rewrite**
   ```
   https://techcrunch.com/2024/01/15/some-article
   ```

3. **Unstructured Text**
   ```
   Yesterday there was a major announcement about quantum computing.
   Scientists at MIT developed a new method that could revolutionize
   the field. The implications are huge for cryptography...
   ```

### Input Methods

**Method 1: Direct Input**
```bash
python3 create_article.py
# Type or paste your content, then press Ctrl+D (Mac/Linux) or Ctrl+Z (Windows)
```

**Method 2: Pipe from File**
```bash
echo "Your article idea here" | python3 create_article.py
```

**Method 3: From File**
```bash
cat my-notes.txt | python3 create_article.py
```

## What It Does

1. **Analyzes Tone** - Reads 5 random existing articles to learn the publication's style
2. **Prompts for Custom Tone** (optional) - Override default tone if desired
3. **Detects Input Type** - Automatically determines if input is URL/idea/text
4. **Generates Article** - Creates 1200-1750 word article in publication style
5. **Creates Metadata** - Auto-generates:
   - Category (from 11 options)
   - 3-5 relevant tags
   - Geographic location (if applicable)
   - Compelling subheading (dek)
   - Random author name and slug
   - Reading time
   - Excerpt
   - Timestamps
6. **Generates Image** - Creates photorealistic hero image using DALL-E 3
7. **Saves Everything** - Creates markdown file in correct category folder

## Output

The script creates:

1. **Markdown File**: `content/{category}/{slug}.md` with complete front matter
2. **Hero Image**: `public/{slug}.png`
3. **Console Output**: Summary with file locations and URLs

## Configuration

Edit the script to customize:

- `FIRST_NAMES` / `LAST_NAMES` - Author name pools
- `CATEGORIES` - Available categories
- Image size, quality settings
- Word count range

## Tone Customization

**Default Behavior:**
- Analyzes 5 random existing articles
- Learns publication's unique voice
- Prompts you to override (press Enter to use default)

**Example Custom Tones:**
- "More humorous and lighthearted"
- "Strictly professional, no satire"
- "Investigative journalism style"
- "Opinion piece with strong point of view"

## Troubleshooting

### API Key Not Found
```bash
export OPENAI_API_KEY='sk-...'
```

### Permission Denied
```bash
chmod +x create_article.py
```

### Module Not Found
```bash
pip install openai requests
```

### Image Not Generating
- Check API key has DALL-E access
- Verify `public/` directory exists
- Check network connection

## Integration with Existing Workflow

This script **replaces** the need to:
1. Manually write articles
2. Create front matter
3. Run `generate_article_image.py` separately

Everything happens in one command!

## Examples

### Example 1: Quick Idea
```bash
$ python3 create_article.py
Enter your blog content:
New regulations on cryptocurrency trading in the EU
[Press Ctrl+D]

📚 Analyzing existing articles to learn tone...
✓ Tone identified: Professional journalism with satirical edge...

Default tone: Professional journalism with satirical edge...
Enter custom tone/style (press Enter to use default):
[Press Enter]

💡 Expanding idea into full article...
✓ Article generated: EU Cryptocurrency Regulations: A New Era of Digital Finance Control
✓ Word count: 1456 words

🏷️  Generating metadata...
✓ Category: business
✓ Tags: cryptocurrency, regulation, finance, EU
✓ Location: Brussels, Belgium
✓ Author: Dr. Sophia Martinez

🎨 Generating image prompt...
🖼️  Generating image with DALL-E...
✓ Image saved: eu-cryptocurrency-regulations-new-era.png

✓ Article saved: content/business/eu-cryptocurrency-regulations-new-era.md

✨ ARTICLE CREATION COMPLETE! ✨
```

### Example 2: Rewrite from URL
```bash
$ echo "https://www.nytimes.com/2024/01/tech-article" | python3 create_article.py
🌐 Fetching content from URL...
🔄 Rewriting article from URL...
[... rest of process ...]
```

## Notes

- **Always Published**: Articles are set to `status: published` by default
- **Satire Flag**: Always set to `false` as requested
- **Random Authors**: New random author for each article
- **GitHub URLs**: Image URLs point to your GitHub repo
- **No Preview**: Runs completely autonomously (no confirmation step)

## Advanced Usage

### Batch Creation
```bash
# Create multiple articles from a list
cat ideas.txt | while read line; do
    echo "$line" | python3 create_article.py
done
```

### Scheduled Creation
```bash
# Add to cron for daily article generation
0 9 * * * cd /path/to/content && echo "Daily news roundup" | python3 create_article.py
```

## Support

For issues or questions, review the script comments or check the main CLAUDE.md documentation.
