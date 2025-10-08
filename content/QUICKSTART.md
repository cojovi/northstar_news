# Quick Start Guide

Get up and running with the Article Image Generator in 5 minutes.

## Prerequisites

- Python 3.7 or higher
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))
- Active OpenAI account with credits

## Installation

### 1. Install Dependencies

```bash
cd content/
pip install -r requirements.txt
```

Or if you prefer a virtual environment:

```bash
cd content/
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Set Your API Key

**Quick method (current session only):**
```bash
export OPENAI_API_KEY='sk-your-actual-api-key-here'
```

**Permanent method (recommended):**

Add to your `~/.zshrc` or `~/.bashrc`:
```bash
echo 'export OPENAI_API_KEY="sk-your-actual-api-key-here"' >> ~/.zshrc
source ~/.zshrc
```

### 3. Verify Installation

```bash
python3 generate_article_image.py --help
```

You should see the help message. If you get a `ModuleNotFoundError`, go back to step 1.

## First Run

### Test with an Existing Article

```bash
python3 generate_article_image.py us/federal-agencies-implement-new-cybersecurity-protocols.md
```

**Expected output:**
```
Reading markdown file: us/federal-agencies-implement-new-cybersecurity-protocols.md
Article: Federal Agencies Implement New Cybersecurity Protocols
Generating image prompt...
Generated prompt: A modern government cybersecurity...
Generating image with DALL-E...
Downloading image to ../public/federal-agencies-implement-new.png...
Image saved successfully!
Updating markdown file...
Markdown file updated successfully!

============================================================
✓ Process completed successfully!
...
============================================================
```

### Check the Results

1. **Image file**: Look in `../public/` for the new PNG file
2. **Updated markdown**: Open the original markdown file and verify the `hero_image` and `thumbnail` fields were updated

## Common Issues

### "OPENAI_API_KEY environment variable not set"

**Fix:**
```bash
export OPENAI_API_KEY='your-key-here'
```

### "ModuleNotFoundError: No module named 'openai'"

**Fix:**
```bash
pip install -r requirements.txt
```

### "Authentication Error" or "Invalid API Key"

**Fix:**
- Double-check your API key is correct
- Ensure there are no extra spaces or quotes
- Verify at [platform.openai.com/api-keys](https://platform.openai.com/api-keys)

### "Rate limit exceeded"

**Fix:**
- Wait 60 seconds and try again
- If processing multiple files, add delays: `sleep 5` between runs

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Process multiple articles in batch
- Customize image generation prompts in the script
- Review costs at [platform.openai.com/usage](https://platform.openai.com/usage)

## Costs

- Standard quality image: ~$0.04 per image
- GPT-4 prompt generation: ~$0.01 per article
- **Total per article: ~$0.05**

## Need Help?

1. Check [README.md](README.md) for detailed troubleshooting
2. Verify OpenAI API status: [status.openai.com](https://status.openai.com)
3. Check your usage and limits: [platform.openai.com/usage](https://platform.openai.com/usage)

