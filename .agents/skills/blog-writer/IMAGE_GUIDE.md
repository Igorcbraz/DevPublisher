# Guide: Professional Tech Blog Visuals with Nanobanana

This guide explains how to generate, organize, and reference high-quality, editorial-grade technical images for your blog posts using the **Nanobanana** extension.

---

## 💡 Why Visuals Matter for Dev Blog Posts

Whether publishing on Dev.to, Hackernoon, or TabNews, readers scan content before reading. High-quality visuals serve several functions:
1. **Higher CTR**: Engaging hero covers stand out on platform feeds.
2. **Reduced Cognitive Load**: Complex architectural decisions are easier to explain with abstract diagrams than with blocks of text alone.
3. **Professional Aesthetics**: Custom-tailored graphics build trust and authority.

---

## 🎨 Creative Prompts for Tech Graphics

Avoid generic stock-image prompts. Instead, use specific design tokens, dark themes, and high-contrast accents matching your product's branding.

### 1. Hero / Cover Images (16:9 Aspect Ratio)
These are meant to be eye-catching and establish the theme of your post.

*   **Example Prompt (Serverless Edge Rendering):**
    > "A futuristic cloud infrastructure diagram. Glowing edge server nodes scattered globally, streaming dynamic SVG code to a developer profile README. Dark theme, high-tech aesthetic, matrix patterns, signal lime neon lines, ultra premium."

*   **Example Prompt (Tool Comparison):**
    > "A comparison illustration. On one side, messy red URL query strings. On the other side, a clean drag-and-drop dashboard showing terminal-style widgets and ASCII arts with bright green highlights. Dark theme, high-tech, futuristic developer workspace style."

### 2. Conceptual Diagrams & Data Flows
Diagrams explain architectural decisions, such as data flows, caching strategies, or client-server decoupling.

*   **Example Prompt (Data Flow / Proxy Bypass):**
    > "A technical abstract diagram showing a web browser requesting a profile README, routing through the GitHub Camo caching proxy, hitting an Edge serverless function, and returning a cached SVG. Clean, vector, dark mode UI style, with bright green and blue glowing path lines."

*   **Example Prompt (Client-Server Decoupling):**
    > "Minimalist graphic explaining browser-side canvas rendering (HTML5 Canvas analyzing a face photo to generate ASCII characters) vs edge server rendering. Neon green lines on deep carbon grey background. Tech schema style."

*   **Example Prompt (Adaptive Themes):**
    > "A single graphical layout split down the middle. Left side is clean and white with dark grey font (light mode), right side is deep dark carbon grey with bright green signal lime font (dark mode). Perfect symmetry, futuristic SVG UI."

---

## 🛠️ Step-by-Step Workflow

1.  **Generate the Image:** Use the command `/nanobanana:generate` or call the `generate_image` tool directly with a highly descriptive prompt. Ensure you set the `AspectRatio` parameter to `'16:9'` for covers.
2.  **Organize in Your Repo:**
    *   Create a dedicated assets directory: `blog/assets/` or `assets/`.
    *   Rename the generated images using **kebab-case** (e.g., `decoupling-canvas.jpg`).
3.  **Reference in Markdown:**
    *   Use relative paths: `![Alt Text](assets/decoupling-canvas.jpg)`.
4.  **Configure Frontmatter:**
    *   **Dev.to**: Add `cover_image: "assets/filename.jpg"`.
    *   **Hackernoon**: Add `main_image: "assets/filename.jpg"` and `cover_image: "assets/filename.jpg"`.
