/**
 * Standard Slide Renderers – Pensum
 *
 * Renders standard (non-dynamic) slides from the slide library.
 * Uses shared design system helpers for consistency.
 * Content comes from data/standardSlideDefaults.js (later: Admin override).
 */
import {
  COLORS as C, FONT, TYPE, LAYOUT,
  addHeader, addFooter, addKpiCard, addKpiRow, addInfoBox,
  addNumberedCard, addStepItem, createPensumPptx,
} from './pptxDesignSystem.js';
import { getStandardSlide } from '../data/standardSlideDefaults.js';

// ─── OM OSS ─────────────────────────────────────────────────────────
export function renderOmOssSlide(pptx, pageNum) {
  const content = getStandardSlide('om-oss');
  if (!content) return null;

  const slide = pptx.addSlide();
  slide.background = { color: C.white };
  addHeader(pptx, slide, content.title, content.subtitle);

  // KPI row at top
  if (content.kpis?.length > 0) {
    addKpiRow(pptx, slide, content.kpis.map(k => ({
      label: k.label, value: k.value, accentColor: k.color,
    })), 1.3, { h: 0.85 });
  }

  // Text blocks in 3-column layout
  const blocks = content.textBlocks || [];
  const colW = blocks.length <= 2 ? 5.8 : 3.7;
  blocks.forEach((block, i) => {
    const bx = LAYOUT.marginL + i * (colW + 0.2);
    const by = 2.4;

    // Card background
    slide.addShape(pptx.ShapeType.roundRect, {
      x: bx, y: by, w: colW, h: 3.2, rectRadius: 0.06,
      fill: { color: C.lightBlue }, line: { color: C.line, pt: 0.5 },
    });
    // Accent bar
    const accentCol = i === 0 ? C.accent : i === 1 ? C.salmon : C.teal;
    slide.addShape(pptx.ShapeType.rect, {
      x: bx + 0.12, y: by + 0.1, w: 0.05, h: 0.3,
      fill: { color: accentCol },
    });
    // Heading
    slide.addText(block.heading, {
      x: bx + 0.28, y: by + 0.08, w: colW - 0.45, h: 0.3,
      fontFace: FONT, ...TYPE.cardTitle, color: C.navy,
    });
    // Body
    slide.addText(block.body, {
      x: bx + 0.15, y: by + 0.5, w: colW - 0.3, h: 2.5,
      fontFace: FONT, ...TYPE.bodySmall, color: C.text,
      lineSpacingMultiple: 1.3, valign: 'top',
    });
  });

  addFooter(pptx, slide, String(pageNum));
  return slide;
}

// ─── FORVALTNINGSTEAMET ─────────────────────────────────────────────
export function renderTeamSlide(pptx, pageNum) {
  const content = getStandardSlide('forvaltningsteamet');
  if (!content) return null;

  const slide = pptx.addSlide();
  slide.background = { color: C.white };
  addHeader(pptx, slide, content.title, content.subtitle);

  const team = content.teamMembers || [];
  team.forEach((person, i) => {
    const row = Math.floor(i / 2);
    const col = i % 2;
    const px = LAYOUT.marginL + col * 6.2;
    const py = 1.4 + row * 2.2;

    slide.addShape(pptx.ShapeType.roundRect, {
      x: px, y: py, w: 5.9, h: 1.9, rectRadius: 0.08,
      fill: { color: C.lightBlue }, line: { color: C.line, pt: 0.5 },
    });

    const initials = person.name.split(' ').map(n => n[0]).join('').slice(0, 2);
    slide.addShape(pptx.ShapeType.ellipse, {
      x: px + 0.2, y: py + 0.3, w: 0.7, h: 0.7,
      fill: { color: C.navy },
    });
    slide.addText(initials, {
      x: px + 0.2, y: py + 0.3, w: 0.7, h: 0.7,
      fontFace: FONT, fontSize: 16, bold: true, color: C.white,
      align: 'center', valign: 'mid',
    });
    slide.addText(person.name, {
      x: px + 1.1, y: py + 0.2, w: 4.6, h: 0.28,
      fontFace: FONT, fontSize: 12, bold: true, color: C.navy,
    });
    slide.addText(person.rolle, {
      x: px + 1.1, y: py + 0.5, w: 4.6, h: 0.22,
      fontFace: FONT, ...TYPE.body, color: C.accent, bold: true,
    });
    slide.addText(person.area, {
      x: px + 1.1, y: py + 0.8, w: 4.6, h: 0.22,
      fontFace: FONT, ...TYPE.bodySmall, color: C.text,
    });
    slide.addText(person.bg, {
      x: px + 1.1, y: py + 1.1, w: 4.6, h: 0.22,
      fontFace: FONT, ...TYPE.bodySmall, color: C.muted, italic: true,
    });
  });

  // Decision process box
  const processBlock = content.textBlocks?.[0];
  if (processBlock) {
    slide.addShape(pptx.ShapeType.roundRect, {
      x: LAYOUT.marginL, y: 5.9, w: LAYOUT.contentW, h: 0.6, rectRadius: 0.06,
      fill: { color: C.warmGray }, line: { color: C.line, pt: 0.5 },
    });
    slide.addText(processBlock.heading, {
      x: 0.9, y: 5.92, w: 3.5, h: 0.24,
      fontFace: FONT, ...TYPE.body, bold: true, color: C.navy,
    });
    slide.addText(processBlock.body, {
      x: 0.9, y: 6.18, w: 11.5, h: 0.28,
      fontFace: FONT, ...TYPE.caption, color: C.text,
    });
  }

  addFooter(pptx, slide, String(pageNum));
  return slide;
}

// ─── RAPPORTERING ───────────────────────────────────────────────────
export function renderRapporteringSlide(pptx, pageNum) {
  const content = getStandardSlide('rapportering');
  if (!content) return null;

  const slide = pptx.addSlide();
  slide.background = { color: C.white };
  addHeader(pptx, slide, content.title, content.subtitle);

  // Feature cards 2×3 grid
  const features = content.features || [];
  features.forEach((feat, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const fx = LAYOUT.marginL + col * 4.1;
    const fy = 1.35 + row * 1.65;

    slide.addShape(pptx.ShapeType.roundRect, {
      x: fx, y: fy, w: 3.85, h: 1.4, rectRadius: 0.06,
      fill: { color: C.white }, line: { color: C.line, pt: 0.5 },
      shadow: { type: 'outer', blur: 3, offset: 1, opacity: 0.06, color: '000000' },
    });
    slide.addShape(pptx.ShapeType.rect, {
      x: fx + 0.08, y: fy + 0.12, w: 0.05, h: 0.28,
      fill: { color: feat.accent },
    });
    slide.addText(feat.title, {
      x: fx + 0.22, y: fy + 0.1, w: 3.48, h: 0.3,
      fontFace: FONT, ...TYPE.cardTitle, color: C.navy,
    });
    slide.addText(feat.desc, {
      x: fx + 0.15, y: fy + 0.48, w: 3.55, h: 0.82,
      fontFace: FONT, ...TYPE.bodySmall, color: C.text, lineSpacingMultiple: 1.25,
    });
  });

  // Communication cadence strip
  const commItems = content.communicationItems || [];
  if (commItems.length > 0) {
    slide.addShape(pptx.ShapeType.roundRect, {
      x: LAYOUT.marginL, y: 4.8, w: LAYOUT.contentW, h: 1.65, rectRadius: 0.06,
      fill: { color: C.lightBlue }, line: { color: C.line, pt: 0.5 },
    });
    slide.addText('Løpende kommunikasjon og kontaktpunkter', {
      x: 0.9, y: 4.88, w: 11.5, h: 0.28,
      fontFace: FONT, ...TYPE.sectionTitle, color: C.navy,
    });
    commItems.forEach((item, i) => {
      const cx = 0.9 + i * 3.0;
      slide.addText(item.label, {
        x: cx, y: 5.22, w: 2.7, h: 0.24,
        fontFace: FONT, ...TYPE.body, bold: true, color: C.navy,
      });
      slide.addText(item.desc, {
        x: cx, y: 5.5, w: 2.7, h: 0.8,
        fontFace: FONT, ...TYPE.bodySmall, color: C.text, lineSpacingMultiple: 1.2,
      });
    });
  }

  addFooter(pptx, slide, String(pageNum));
  return slide;
}

// ─── NESTE STEG ─────────────────────────────────────────────────────
export function renderNesteStegSlide(pptx, pageNum) {
  const content = getStandardSlide('neste-steg');
  if (!content) return null;

  const slide = pptx.addSlide();
  slide.background = { color: C.white };
  addHeader(pptx, slide, content.title, content.subtitle);

  // Steps - left side
  slide.addShape(pptx.ShapeType.roundRect, {
    x: LAYOUT.marginL, y: 1.3, w: 7.0, h: 4.5, rectRadius: 0.1,
    fill: { color: C.lightBlue }, line: { color: C.accent, pt: 1.5 },
  });

  const steps = content.steps || [];
  steps.forEach((step, i) => {
    const sy = 1.55 + i * 1.02;
    addStepItem(pptx, slide, 1.0, sy, step.num, step.title, step.desc, {
      titleW: 5.8, descW: 5.8, descH: 0.5,
    });
    if (i < steps.length - 1) {
      slide.addShape(pptx.ShapeType.line, {
        x: 1.16, y: sy + 0.42, w: 0, h: 0.5,
        line: { color: C.accent, pt: 1, dashType: 'dash' },
      });
    }
  });

  // Right side: disclaimers
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 8.1, y: 1.3, w: 4.5, h: 4.5, rectRadius: 0.08,
    fill: { color: C.warmGray }, line: { color: C.line, pt: 0.5 },
  });
  slide.addText('Viktig informasjon', {
    x: 8.3, y: 1.4, w: 4.1, h: 0.3,
    fontFace: FONT, ...TYPE.cardTitle, color: C.navy,
  });
  slide.addShape(pptx.ShapeType.line, {
    x: 8.3, y: 1.75, w: 3.8, h: 0,
    line: { color: C.line, pt: 0.5 },
  });

  const disclaimers = content.disclaimers || [];
  disclaimers.forEach((d, i) => {
    const dy = 1.88 + i * 0.48;
    slide.addText(`${i + 1}.`, {
      x: 8.3, y: dy, w: 0.25, h: 0.42,
      fontFace: FONT, ...TYPE.caption, color: C.navy, bold: true, valign: 'top',
    });
    slide.addText(d, {
      x: 8.6, y: dy, w: 3.8, h: 0.44,
      fontFace: FONT, ...TYPE.caption, color: C.text, lineSpacingMultiple: 1.15, valign: 'top',
    });
  });

  // Contact bar
  const contact = content.contactInfo || {};
  slide.addShape(pptx.ShapeType.roundRect, {
    x: LAYOUT.marginL, y: 6.0, w: LAYOUT.contentW, h: 0.55, rectRadius: 0.08,
    fill: { color: C.navy },
  });
  slide.addText(contact.line1 || '', {
    x: 0.9, y: 6.02, w: 7.5, h: 0.25,
    fontFace: FONT, ...TYPE.bodyLarge, bold: true, color: C.white,
  });
  slide.addText(contact.line2 || '', {
    x: 0.9, y: 6.28, w: 11.5, h: 0.2,
    fontFace: FONT, ...TYPE.body, color: C.accent,
  });

  addFooter(pptx, slide, String(pageNum));
  return slide;
}

// ─── VIKTIG INFORMASJON (full-page for fullversjon) ─────────────────
export function renderViktigInformasjonSlide(pptx, pageNum) {
  const content = getStandardSlide('viktig-informasjon');
  if (!content) return null;

  const slide = pptx.addSlide();
  slide.background = { color: C.white };
  addHeader(pptx, slide, content.title, content.subtitle);

  const blocks = content.textBlocks || [];
  blocks.forEach((block, i) => {
    const by = 1.35 + i * 1.25;
    const bgColor = i % 2 === 0 ? C.lightBlue : C.warmGray;

    slide.addShape(pptx.ShapeType.roundRect, {
      x: LAYOUT.marginL, y: by, w: LAYOUT.contentW, h: 1.05, rectRadius: 0.06,
      fill: { color: bgColor }, line: { color: C.line, pt: 0.5 },
    });
    const accentCol = [C.navy, C.salmon, C.teal, C.accent][i % 4];
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.85, y: by + 0.12, w: 0.05, h: 0.28,
      fill: { color: accentCol },
    });
    slide.addText(block.heading, {
      x: 1.05, y: by + 0.08, w: 11.3, h: 0.3,
      fontFace: FONT, ...TYPE.cardTitle, color: C.navy,
    });
    slide.addText(block.body, {
      x: 0.85, y: by + 0.45, w: 11.5, h: 0.52,
      fontFace: FONT, ...TYPE.bodySmall, color: C.text, lineSpacingMultiple: 1.25,
    });
  });

  addFooter(pptx, slide, String(pageNum));
  return slide;
}

// ─── HVORFOR PENSUM ─────────────────────────────────────────────────
export function renderHvorforPensumSlide(pptx, pageNum) {
  const content = getStandardSlide('hvorfor-pensum');
  if (!content) return null;

  const slide = pptx.addSlide();
  slide.background = { color: C.white };
  addHeader(pptx, slide, content.title, content.subtitle);

  // KPI row
  if (content.kpis?.length > 0) {
    addKpiRow(pptx, slide, content.kpis.map(k => ({
      label: k.label, value: k.value, accentColor: k.color,
    })), 1.3, { h: 0.85 });
  }

  // Text blocks as numbered cards
  const blocks = content.textBlocks || [];
  blocks.forEach((block, i) => {
    addNumberedCard(pptx, slide, LAYOUT.marginL + i * 4.1, 2.4, 3.85, 2.8,
      i + 1, block.heading, block.body);
  });

  addFooter(pptx, slide, String(pageNum));
  return slide;
}
