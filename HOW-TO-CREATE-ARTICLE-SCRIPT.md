# Autonomous Blog Article Generator - Functional Specification

## Context for Implementation

This document describes an autonomous blog post generation system created for a Markdown-based static site (Vite + React). You are being asked to create an equivalent system for a Hexo blog platform. This specification describes WHAT the system does and WHY, not HOW to code it.

---

## System Overview

**Purpose**: Create a fully autonomous Python script that generates complete, publication-ready blog posts from minimal user input (idea, URL, or unstructured text) with zero manual intervention.

**Key Principle**: One command execution should result in a complete, published article with image, requiring no further user action.

---

## Core Functionality Requirements

### 1. Input Versatility (Multi-Mode Detection)

**Requirement**: The script must intelligently handle three distinct input types without requiring the user to specify which type they're providing.

**Input Types**:
- **Simple Idea**: Brief concept or topic (e.g., "AI in healthcare")
- **URL**: Full article URL to rewrite in publication's voice
- **Unstructured Text**: Any length text, notes, or draft content

**Detection Logic**:
- URL: Detect by regex pattern matching (https?://)
- Structured Text: Detect by sentence count and length (>5 sentences, >300 chars)
- Simple Idea: Everything else (default)

**Why This Matters**: Users work in different modes - sometimes they have a full article to adapt, sometimes just a spark of an idea. The system should adapt to their workflow, not force them into a specific input format.

---

### 2. Tone Analysis & Matching

**Requirement**: Automatically analyze existing blog posts to learn the publication's unique voice, then replicate it in new articles.

**Process**:
1. On each run, randomly sample 5 existing articles from the blog
2. Extract article body content (skip front matter/metadata)
3. Send samples to LLM with prompt: "Analyze the tone, voice, and writing style of this publication"
4. Cache the tone analysis result
5. Use this analysis as a style guide for article generation

**User Override**: After analysis, prompt user: "Default tone: [analyzed tone]. Press Enter to use default, or type custom tone:"
- If Enter: Use analyzed tone
- If text entered: Use custom tone for this run only

**Why This Matters**: Each publication has a unique voice. Manual tone instructions are imprecise and inconsistent. Learning from existing content ensures brand consistency.

---

### 3. Content Generation (Three Pathways)

**Common Requirements for All Pathways**:
- Output length: 750-1150 words (strict requirement)
- Professional news journalism structure
- No placeholder text or [brackets]
- No repetition of instructions in output
- Parse response to extract: TITLE and BODY

#### Pathway A: From Simple Idea
- LLM prompt: "Expand this idea into a full article"
- Include: context, analysis, expert perspectives (synthesized)
- Ensure: article reads as researched journalism

#### Pathway B: From URL
- Fetch URL content (HTTP request with user agent)
- Extract text content (strip HTML tags)
- Limit to 8000 chars to avoid token limits
- LLM prompt: "Completely rewrite this article in our voice"
- Critical: Must NOT copy phrases directly, maintain factual accuracy but rewrite entirely

#### Pathway C: From Unstructured Text
- LLM prompt: "Transform this text into a polished article"
- Organize and expand content
- Add structure, context, and professional narrative flow

**Why Three Pathways**: Different inputs require different processing. A URL needs fetching and aggressive rewriting. An idea needs expansion. Text needs organization. Each pathway optimizes for its input type.

---

### 4. Metadata Generation (AI-Powered)

**Requirement**: Automatically generate ALL article metadata without user input.

**Metadata Fields to Generate**:

1. **Category Selection**
   - Analyze article content
   - Choose from predefined category list (11 categories in original: us, world, politics, business, tech, health, entertainment, sports, opinion, lifestyle, travel)
   - Use LLM to determine best-fit category

2. **Tags Generation**
   - Generate 3-5 relevant tags
   - Keep concise (1-3 words each)
   - Based on article content and title

3. **Subheading (Dek)**
   - Create compelling subheading (10-15 words)
   - Expands on title, provides context
   - Should entice readers

4. **Geographic Location**
   - Analyze article content for geographic relevance
   - If article has clear location context: extract it (e.g., "Washington, D.C.", "Brussels, Belgium")
   - If no geographic relevance: null/omit
   - Critical: Must be educated guess, not forced

5. **Excerpt**
   - Extract first complete sentence from article body
   - Or: first 150 characters if sentence is too long
   - Used for article listings/previews

6. **Reading Time**
   - Calculate: word_count / 200 (words per minute)
   - Round to nearest minute
   - Minimum: 1 minute

**Implementation**: Single LLM call requesting JSON response with all metadata fields. This is more efficient than multiple calls.

**Why AI-Generated**: Manual metadata creation is tedious and inconsistent. AI can analyze the full article context and generate appropriate, SEO-optimized metadata.

---

### 5. Author Generation (Randomization)

**Requirement**: Generate realistic, diverse author names automatically.

**Implementation Details**:
- Maintain pools of first names, last names
- Include diverse cultural names (not just Western)
- Optional prefix: 20% chance of "Dr." prefix
- Generate author_slug: lowercase, hyphenated version (e.g., "dr-elena-martinez" or "james-wilson")

**Example Pools**:
- First: Elena, Marcus, Sophia, James, etc. (~30 names)
- Last: Chen, Rodriguez, Kim, Petrov, Johnson, etc. (~30 names)
- Random selection creates variety

**Why Random Authors**: The blog is satire/news parody. Random professional-sounding names add authenticity. User doesn't want to maintain an author database.

---

### 6. Slug Generation

**Requirement**: Create URL-friendly identifiers from article titles.

**Process**:
1. Convert title to lowercase
2. Remove special characters (keep letters, numbers, spaces, hyphens)
3. Replace spaces and multiple hyphens with single hyphen
4. Strip leading/trailing hyphens

**Example**: "AI's Impact: The Future?" → "ais-impact-the-future"

**Why This Matters**: Clean URLs are essential for SEO and user experience.

---

### 7. Image Generation (DALL-E Integration)

**Requirement**: Generate photorealistic hero images that match article content.

**Two-Step Process**:

**Step 1: Generate Image Prompt**
- Send article title, dek, category, and first 500 chars to LLM
- Request: "Write a DALL-E prompt for a photorealistic news hero image"
- Critical instructions to LLM:
  - Must specify "photograph" or "photo-realistic"
  - Must mention professional camera terms (DSLR, 50mm lens, etc.)
  - Must specify natural/cinematic lighting
  - Must describe editorial/documentary composition
  - Must NEVER mention: illustration, painting, cartoon, CGI, 3D render
- This generates a ~2 sentence prompt optimized for realism

**Step 2: Generate Image**
- DALL-E 3 API call with:
  - Size: 1792x1024 (landscape, optimal for hero images)
  - Quality: "hd"
  - Style: "natural" (biases toward photorealism)
  - n: 1
- Download resulting image
- Save to public/images directory
- Filename: shortened version of slug (max 50 chars) + .png

**Why Two Steps**: DALL-E often produces illustrations if not carefully prompted. The LLM acts as a "prompt engineer" to ensure photorealistic output. This is more reliable than hardcoding prompts.

---

### 8. Front Matter Construction (Critical Section)

**Requirement**: Generate syntactically perfect front matter that the static site generator can parse.

**Format Requirements** (specific to original platform):
- Uses YAML front matter between `---` delimiters
- Field order matters for some parsers
- String escaping is CRITICAL

**Fields Required**:
- title: string (quoted)
- dek: string (quoted)
- slug: string (unquoted, alphanumeric + hyphens only)
- category: string (unquoted, predefined value)
- tags: array format `['tag1', 'tag2', 'tag3']`
- author: string (quoted)
- author_slug: string (unquoted)
- published: ISO 8601 datetime
- updated: ISO 8601 datetime
- hero_image: full URL (unquoted)
- hero_credit: string (quoted)
- thumbnail: full URL (unquoted)
- excerpt: string (quoted)
- reading_time: integer (unquoted)
- location: string (quoted) [optional - only if present]
- status: string (unquoted, always "published")
- is_satire: boolean (unquoted, always false)

**Critical: YAML String Escaping**
- Problem: Colons (`:`) in titles break YAML parsers
- Problem: Apostrophes (`'`) in text break YAML parsers
- Problem: Quotes (`"`) in text break YAML parsers
- Solution: ALWAYS wrap title, dek, author, excerpt, location in double quotes
- Solution: Escape internal double quotes: `"` → `\"`

**Function Required**: `yaml_escape(value)` that:
1. Converts to string
2. Replaces `"` with `\"`
3. Wraps entire value in double quotes
4. Returns: `"escaped value"`

**Example Output**:
```yaml
---
title: "Zelensky's Right Hand Man Steps Down: A Wrench in Ukraine's Power Machinery?"
dek: "Andrii Yermak's resignation marks a significant fallout in the administration."
slug: zelenskys-right-hand-man-steps-down
category: world
tags: ['Ukraine', 'Politics', 'Zelensky']
author: "Dr. Elena Chen"
author_slug: elena-chen
published: 2025-11-28T18:49:33.896870+00:00
updated: 2025-11-28T18:49:33.896870+00:00
hero_image: https://github.com/user/repo/blob/main/public/image.png?raw=true
hero_credit: "Photo via Pexels"
thumbnail: https://github.com/user/repo/blob/main/public/image.png?raw=true
excerpt: "In what can only be described as a high-stakes political drama..."
reading_time: 8
location: "Ukraine"
status: published
is_satire: false
---
```

**Why This Is Critical**: A single unescaped colon will break the entire site build. YAML parsers are extremely strict. This was the primary bug in the original implementation.

---

### 9. File Operations

**Requirements**:

1. **Determine Category Directory**: Based on AI-selected category
2. **Create Directory**: If category folder doesn't exist, create it
3. **Generate File Path**: `{category}/{slug}.md`
4. **Write File**: Complete markdown with front matter + body
5. **Image Path**: `public/{slug}.png` (or equivalent public directory)

**File Structure**:
```
---
[front matter]
---

[article body]
```

**No blank lines between front matter closing `---` and article body start.**

---

### 10. User Experience Flow

**Command Execution**:
```
python create_article.py
```

**Console Output Sequence**:
1. "Enter your blog content (Ctrl+D when done):"
2. User pastes content, presses Ctrl+D
3. "Analyzing existing articles to learn tone..."
4. "✓ Tone identified: [description]"
5. "Default tone: [tone]. Enter custom tone or press Enter:"
6. User presses Enter or types custom tone
7. "Input type detected: [URL/IDEA/TEXT]"
8. "Generating article..." (with appropriate verb for input type)
9. "✓ Article generated: [title]"
10. "✓ Word count: [count] words"
11. "Generating metadata..."
12. "✓ Category: [category]"
13. "✓ Tags: [tags]"
14. "✓ Location: [location]"
15. "✓ Author: [author name]"
16. "Generating image prompt..."
17. "✓ Image prompt: [prompt]"
18. "Generating image with DALL-E..."
19. "✓ Image saved: [filename]"
20. "✓ Article saved: [filepath]"
21. Final summary with all file paths

**Why This Matters**: Clear progress indicators build user confidence. Each step shows the autonomous system is working. No silent gaps.

---

### 11. Error Handling Requirements

**Required Error Catches**:

1. **No API Key**: Check environment variable, exit gracefully with setup instructions
2. **URL Fetch Failure**: Catch network errors, provide clear message
3. **LLM API Failures**: Catch rate limits, timeout errors
4. **Duplicate Email Detection**: Catch database unique constraint errors (for newsletter)
5. **File Write Failures**: Catch permission errors, disk full errors
6. **Invalid Input**: Validate email format, URL format

**Error Message Format**:
- "❌ Error: [clear description]"
- "Suggestion: [what user should do]"
- Exit gracefully (don't crash)

---

### 12. Configuration Constants

**Define at Top of Script**:

1. **Content Directory Path**: Where articles are stored
2. **Public Directory Path**: Where images are stored
3. **Categories List**: All valid categories with display names
4. **GitHub Repo URL**: For constructing image URLs (original uses GitHub raw URLs)
5. **Author Name Pools**: Lists of first/last names
6. **Image Size**: DALL-E size parameter
7. **Word Count Range**: Min/max article length
8. **Reading Speed**: Words per minute for time calculation

**Why Configuration Section**: Makes adaptation to different blogs easy. All customization in one place.

---

### 13. Timestamp Generation

**Requirements**:
- Use UTC timezone (not local time)
- ISO 8601 format with timezone: `2025-11-28T18:49:33.896870+00:00`
- Both published and updated fields get same timestamp (it's a new article)

**Why UTC**: Prevents timezone inconsistencies across deployments.

---

### 14. Integration Points

**External Services Required**:
1. **OpenAI API**:
   - GPT-4 for text generation (article, metadata, tone analysis)
   - DALL-E 3 for image generation
   - Requires: OPENAI_API_KEY environment variable

**File System Requirements**:
1. Read access: To sample existing articles
2. Write access: To create new articles and images
3. Directory creation: Ability to mkdir if needed

---

### 15. Success Criteria

**An Article is Successfully Generated When**:
1. Markdown file exists in correct category folder
2. Image file exists in public folder
3. Front matter is syntactically valid (no YAML errors)
4. Article body is 1200-1750 words
5. All required front matter fields are present
6. Author name is realistic
7. Image is photorealistic (not illustration)
8. No error messages in console
9. User receives confirmation with file paths

---

### 16. Original Platform Specifics (For Context)

**Platform**: Vite + React static site
**Content Format**: Markdown with YAML front matter
**Image Hosting**: GitHub repo (public folder)
**Category Structure**: Folder-based (us/, world/, tech/, etc.)
**Article URL Pattern**: `/{category}/{slug}`

**Hexo Differences to Consider**:
- Hexo uses `source/_posts/` directory
- Hexo has different front matter format (YAML but different fields)
- Hexo has `hexo new post` command (might want to use or bypass)
- Hexo might have asset folder structure
- Hexo deployment process differs

---

### 17. Performance Considerations

**Optimization Points**:
1. Sample only 5 articles for tone (not all articles)
2. Limit URL fetch to 8000 chars (avoid token limits)
3. Use single LLM call for all metadata (not multiple calls)
4. Cache tone analysis within session (if running multiple times)
5. Use GPT-4 not GPT-4-turbo (better quality for this use case)

---

### 18. Testing Recommendations

**Test Cases**:
1. Simple idea input: "Quantum computing advances"
2. URL input: Real article URL from another site
3. Text input: 500-word unstructured draft
4. Title with colons: Ensure YAML doesn't break
5. Title with apostrophes: Ensure YAML doesn't break
6. Multiple runs: Ensure different authors/variations
7. Network failure: Ensure graceful error handling

---

### 19. Extension Points (Future Considerations)

**Possible Enhancements**:
1. Batch mode: Process multiple ideas at once
2. Scheduled execution: Cron job for daily articles
3. Source citation: Track if generated from URL
4. Image alternatives: Allow user to provide image URL
5. Draft mode: Create as draft instead of published
6. Category override: Allow user to specify category
7. Multi-language: Support article generation in other languages

---

### 20. Critical Implementation Notes

**Must-Have Features**:
- ✅ YAML escaping (prevents site breaks)
- ✅ Tone matching (maintains brand voice)
- ✅ Input type detection (improves UX)
- ✅ Photorealistic images (brand consistency)
- ✅ Progress indicators (user confidence)
- ✅ Error handling (graceful failures)

**Nice-to-Have Features**:
- Preview mode (show before saving)
- Undo last article (delete generated files)
- Statistics (articles generated count)
- Template selection (different article types)

---

## Implementation Strategy for Hexo

**Key Differences to Account For**:

1. **Front Matter Format**: Research Hexo's required/optional fields
2. **Directory Structure**: Hexo uses `source/_posts/`, not category folders
3. **Image Handling**: Hexo has asset folders, might need different approach
4. **Categories/Tags**: Hexo has specific category/tag syntax
5. **Permalinks**: Hexo generates URLs differently
6. **Metadata**: Hexo might require different fields (layout, date format, etc.)

**Recommended Approach**:
1. Read several existing Hexo articles to understand format
2. Identify ALL front matter fields Hexo uses
3. Test YAML escaping with Hexo parser
4. Determine image storage location
5. Verify category/tag syntax
6. Test with one article before full implementation

---

## Expected Deliverable

**Final Script Should**:
- Be a single Python file
- Require only: `python create_article.py`
- Accept input via stdin
- Generate complete article + image
- Save to correct Hexo directories
- Exit with clear success/failure message
- Work without modification after initial setup

**User Setup Steps**:
1. Set OPENAI_API_KEY environment variable
2. Run script
3. That's it

**Goal**: Zero-friction blog post creation.
