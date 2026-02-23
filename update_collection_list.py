import re

file_path = 'sections/collection-list.liquid'

with open(file_path, 'r') as f:
    content = f.read()

# 1. Update Schema default/max for columns if needed (User asked for "very small" to "very large")
# Current: Mobile 1-5, Desktop 2-12. This seems sufficient. 12 cols = very small. 2 cols = very large.

# 2. Inject CSS into the <style> block
# We look for the closing brace of the #shopify-section-{{ section.id }} rule or the end of the <style> block.
# Actually, let's insert it right after the existing variables in the style block.

style_injection = """
    /* Dynamic Column Variables */
    --mobile-columns: {{ section.settings.mobile_columns }};
    --desktop-columns: {{ section.settings.desktop_columns }};

    /* Font Scaling Based on Columns */
    --font-scale-mobile: clamp(10px, calc(100vw / var(--mobile-columns) * 0.15), 20px);
    --font-scale-desktop: clamp(12px, calc(100vw / var(--desktop-columns) * 0.12), 30px);
  }

  /* Force Square Aspect Ratio */
  #shopify-section-{{ section.id }} .list-collections__item {
    aspect-ratio: 1 / 1 !important;
    height: auto !important; /* Allow aspect-ratio to dictate height */
  }

  #shopify-section-{{ section.id }} .list-collections__item-image-wrapper,
  #shopify-section-{{ section.id }} .list-collections__item-image {
    height: 100% !important;
    width: 100% !important;
    object-fit: cover !important;
    min-height: 0 !important; /* Override theme.css min-height: 120px */
  }

  /* Apply Font Scaling */
  #shopify-section-{{ section.id }} .list-collections__item-info,
  #shopify-section-{{ section.id }} .heading {
    font-size: var(--font-scale-mobile) !important;
  }

  @media screen and (min-width: 768px) {
    #shopify-section-{{ section.id }} .list-collections__item-info,
    #shopify-section-{{ section.id }} .heading {
      font-size: var(--font-scale-desktop) !important;
    }
  }

  /* Override Grid/Carousel Columns */
  /* Mobile */
  @media screen and (max-width: 767px) {
    #shopify-section-{{ section.id }} .list-collections--carousel .list-collections__item-list {
      grid-auto-columns: calc((100vw - 32px) / var(--mobile-columns) - 12px) !important; /* 32px padding approx */
    }
    #shopify-section-{{ section.id }} .list-collections--grid .list-collections__item-list {
      grid-template-columns: repeat(var(--mobile-columns), 1fr) !important;
    }
  }

  /* Desktop */
  @media screen and (min-width: 768px) {
    #shopify-section-{{ section.id }} .list-collections--carousel .list-collections__item-list {
      grid-auto-columns: calc((100vw - 64px) / var(--desktop-columns) - 16px) !important;
    }
    #shopify-section-{{ section.id }} .list-collections--grid .list-collections__item-list {
      grid-template-columns: repeat(var(--desktop-columns), 1fr) !important;
    }
"""

# Replace the end of the main style block (before the media query)
# pattern: matches the closing brace of #shopify-section-{{ section.id }} and the newline before @media
# Note: The file has  then  then .

# Let's find the  before  inside the <style> tag.
# Or simpler, append to the end of the <style> tag.

if "</style>" in content:
    content = content.replace("</style>", style_injection + "\n</style>")
else:
    print("Error: </style> tag not found")

with open(file_path, 'w') as f:
    f.write(content)

print("Successfully updated sections/collection-list.liquid")
