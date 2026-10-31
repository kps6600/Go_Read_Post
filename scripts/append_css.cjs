const fs = require('fs');

const cssPath = 'frontend/src/components/admin/LiveSectionEditor.css';
let css = fs.readFileSync(cssPath, 'utf8');

const additionalStyles = `
/* Hover photo buttons in Hero Banner Studio */
.mhp-hero-card:hover .lse-card-img-overlay,
.lbe-popular-manage-item:hover .lse-card-img-overlay,
.lbe-popular-thumb-wrap:hover .lse-card-img-overlay {
  opacity: 1 !important;
  transform: translateY(0) !important;
}
`;

if (!css.includes('.mhp-hero-card:hover .lse-card-img-overlay')) {
  css += additionalStyles;
  fs.writeFileSync(cssPath, css, 'utf8');
  console.log('Added hero hover styles to LiveSectionEditor.css');
} else {
  console.log('Already present');
}
