# Skill: Add New AI Project

## Description
How to add a new AI project card to the portfolio.

## Steps

1. **Create the project page** in `src/pages/<project-name>.html`
   - Copy the structure from `vlm.html` as a template
   - Update header title and content

2. **Create project-specific CSS** in `src/styles/<project-name>.css`

3. **Create project JS** in `src/<project-name>-app.js`
   - Import necessary Transformers.js pipelines or other browser-based AI libraries

4. **Add a card to the landing page** (`index.html`)
   - Duplicate an `arcade-card` div
   - Remove the `coming-soon` class
   - Update icon, title, description, tags
   - Set the button link to the new page

5. **Build and test** to verify everything works

## Card Template
```html
<div class="arcade-card" data-project="new-project">
  <div class="card-screen">
    <div class="card-preview">
      <div class="preview-icon">ICON</div>
      <div class="scan-line"></div>
    </div>
  </div>
  <div class="card-info">
    <h2 class="card-title">PROJECT NAME</h2>
    <p class="card-desc">Short description</p>
    <div class="card-tags">
      <span class="tag">Tag1</span>
    </div>
  </div>
  <div class="card-slot">
    <button class="insert-coin" onclick="location.href='src/pages/new-project.html'">
      ▶ START
    </button>
  </div>
</div>
```
