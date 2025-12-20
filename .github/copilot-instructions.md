# AI Coding Agent Instructions

## Overview
This project is a website for "PhotheSense" with a focus on showcasing products and workshops. The codebase is structured to separate concerns between HTML, CSS, JavaScript, and assets like images and JSON data. The following instructions will help AI agents navigate and contribute effectively to this codebase.

## Codebase Structure
- **HTML Files**: Found at the root level, these define the structure of the website. Key files include:
  - `index.html`: The homepage.
  - `product.html`: A generic product page.
  - `product_CoffeeWorkshop.html` and `product_KnifeWorkshop.html`: Specific product pages.
- **CSS Files**: Located in the `style/` directory, these define the styling for different components and pages. Examples:
  - `base.css`: Shared styles across the site.
  - `header.css`, `footer.css`: Styles for specific components.
  - `product.css`, `product-detail.css`: Styles for product pages.
- **JavaScript Files**: The `script.js` file contains client-side interactivity.
- **Components**: Reusable HTML snippets in the `components/` directory, such as `header-hero.html` and `footer.html`.
- **Assets**: Images and JSON data are stored in the `picture/` directory. Each workshop has its own subdirectory with a `gallery.json` file for image metadata.

## Development Conventions
- **Component Reuse**: Use the `components/` directory for shared HTML snippets. For example, include `header-hero.html` for the homepage header.
- **Styling**: Follow the modular CSS structure. Avoid inline styles; instead, add new styles to the appropriate CSS file in `style/`.
- **Data Management**: JSON files in `picture/` are used for gallery metadata. Update these files when adding or removing images.

## Key Workflows
- **Adding a New Product Page**:
  1. Create a new HTML file based on `product.html`.
  2. Add specific content and link it to the appropriate CSS file.
  3. Update navigation in `header-subpage.html` if needed.
- **Updating a Gallery**:
  1. Add images to the appropriate subdirectory in `picture/`.
  2. Update the `gallery.json` file with metadata for the new images.
- **Styling a New Component**:
  1. Create a new CSS file in `style/` if the component is unique.
  2. Follow the naming convention (e.g., `component-name.css`).
  3. Link the CSS file in the relevant HTML files.

## Examples
- **Including a Component**:
  ```html
  <!-- Include the hero header -->
  <div>
    <!--#include virtual="components/header-hero.html" -->
  </div>
  ```
- **Gallery JSON Structure**:
  ```json
  [
    {
      "image": "image1.jpg",
      "caption": "Caption for image 1"
    },
    {
      "image": "image2.jpg",
      "caption": "Caption for image 2"
    }
  ]
  ```

## Notes
- Ensure cross-browser compatibility by testing changes in multiple browsers.
- Maintain consistent formatting and indentation across all files.
- Document any new patterns or workflows in this file.

For further clarification or updates, consult the project owner.