# Article Image Generator

Automatically generate hero images for markdown articles using AI image generation (DALL-E).

## Overview

This script automates the process of creating custom hero images for your news articles:

1. **Analyzes** the markdown article content (title, description, body)
2. **Generates** an image prompt using GPT-4
3. **Creates** a professional hero image using DALL-E 3
4. **Saves** the image to the `public/` directory
5. **Updates** the markdown file's `hero_image` and `thumbnail` fields automatically

## Requirements

### Python Dependencies

Install required packages:

```bash
pip install openai requests
```

Or create a virtual environment:

```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install openai requests
```

### API Keys

You need an OpenAI API key with access to:
- GPT-4 (for prompt generation)
- DALL-E 3 (for image generation)

**Get your API key:**
1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (you won't be able to see it again!)

**Note:** DALL-E 3 image generation costs approximately $0.04 per image (1792x1024 size).

## Setup

### 1. Set Environment Variable

**On macOS/Linux:**
```bash
export OPENAI_API_KEY='your-api-key-here'
```

To make it permanent, add to your `~/.bashrc`, `~/.zshrc`, or `~/.bash_profile`:
```bash
echo 'export OPENAI_API_KEY="your-api-key-here"' >> ~/.zshrc
source ~/.zshrc
```

**On Windows (PowerShell):**
```powershell
$env:OPENAI_API_KEY='your-api-key-here'
```

To make it permanent:
```powershell
[System.Environment]::SetEnvironmentVariable('OPENAI_API_KEY', 'your-api-key-here', 'User')
```

**On Windows (Command Prompt):**
```cmd
set OPENAI_API_KEY=your-api-key-here
```

### 2. Make Script Executable (macOS/Linux)

```bash
chmod +x generate_article_image.py
```

## Usage

### Basic Usage

```bash
python3 generate_article_image.py path/to/your/article.md
```

### Example

```bash
cd content/
python3 generate_article_image.py us/federal-agencies-implement-new-cybersecurity-protocols.md
```

### Custom Output Directory

By default, images are saved to `../public/`. You can specify a different directory:

```bash
python3 generate_article_image.py article.md --output-dir /path/to/images
```

## What It Does

### Step-by-Step Process

1. **Reads** the markdown file and extracts:
   - Article title
   - Dek (subtitle)
   - Category
   - First 500 characters of content

2. **Analyzes** the content using GPT-4 to create a detailed, contextual image generation prompt

3. **Generates** a high-quality 1792x1024 image using DALL-E 3
   - Professional, photorealistic style
   - Landscape orientation (perfect for hero images)
   - No text in images (purely visual)

4. **Saves** the image as `shortened-article-name.png` in the `public/` directory

5. **Updates** your markdown file automatically:
   ```yaml
   hero_image: https://github.com/cojovi/northstar_news/blob/main/public/shortened-article-name.png?raw=true
   thumbnail: https://github.com/cojovi/northstar_news/blob/main/public/shortened-article-name.png?raw=true
   ```

### Filename Generation

The script creates shortened filenames from your markdown file:
- Original: `federal-agencies-implement-new-cybersecurity-protocols.md`
- Generated: `federal-agencies-implement-new.png`

Maximum 5 words or 40 characters, ensuring clean, manageable filenames.

## Output Example

```
Reading markdown file: us/federal-agencies-implement-new-cybersecurity-protocols.md
Article: Federal Agencies Implement New Cybersecurity Protocols
Generating image prompt...
Generated prompt: A modern government cybersecurity command center with multiple monitors...
Generating image with DALL-E...
Downloading image to ../public/federal-agencies-implement-new.png...
Image saved successfully!
Updating markdown file...
Markdown file updated successfully!

============================================================
✓ Process completed successfully!
✓ Image saved to: ../public/federal-agencies-implement-new.png
✓ Markdown file updated: us/federal-agencies-implement-new-cybersecurity-protocols.md
✓ Image URL: https://github.com/cojovi/northstar_news/blob/main/public/federal-agencies-implement-new.png?raw=true
============================================================
```

## Batch Processing

Process multiple articles:

```bash
# Process all articles in a category
for file in us/*.md; do
    python3 generate_article_image.py "$file"
    sleep 2  # Add delay to avoid rate limits
done
```

## Troubleshooting

### "OPENAI_API_KEY environment variable not set"
- Ensure you've exported the API key in your current terminal session
- Check that the key is correct and has no extra spaces
- Try setting it again: `export OPENAI_API_KEY='your-key'`

### "Rate limit exceeded"
- DALL-E 3 has rate limits (typically 5 requests per minute for free tier)
- Add delays between batch requests
- Upgrade to a paid tier for higher limits

### "Insufficient credits"
- Check your OpenAI account balance at platform.openai.com
- Add payment method or purchase credits

### "File not found"
- Ensure you're running from the `content/` directory
- Use correct relative or absolute paths
- Verify the markdown file exists

### Image quality issues
- The script uses DALL-E 3 with "standard" quality
- For higher quality, edit the script and change `quality="standard"` to `quality="hd"` (costs ~$0.08 per image)

## Cost Estimation

- **Per image**: ~$0.04 (standard quality, 1792x1024)
- **Per image**: ~$0.08 (HD quality, 1792x1024)
- **GPT-4 prompt generation**: <$0.01 per article

Example: Processing 10 articles ≈ $0.50

## Tips

1. **Review before committing**: Check the generated image before committing to Git
2. **Customize prompts**: Edit the `generate_image_prompt()` function to adjust the style
3. **Backup originals**: Keep a backup of markdown files before bulk processing
4. **Test first**: Run on one article first to ensure everything works
5. **Git workflow**: Don't forget to commit both the markdown changes and new images

## Support

For issues or questions:
- Check the OpenAI API status: [status.openai.com](https://status.openai.com)
- Review OpenAI documentation: [platform.openai.com/docs](https://platform.openai.com/docs)
- Check your API usage: [platform.openai.com/usage](https://platform.openai.com/usage)

## License

Part of the northstar_news project.

