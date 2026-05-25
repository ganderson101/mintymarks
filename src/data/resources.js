// src/data/resources.js
// Curated learning resources per level and topic category.
// Covers BBC Bitesize, Corbettmaths, MathsGenie/YesGenie, Khan Academy, Topmarks,
// and Maths is Fun — all free, trusted, and UK-syllabus-aligned.
//
// Used in Results and Dashboard to show clickable links for weak topics.
// Keys must exactly match `category` values in questions.js.
//
// URL verification notes (May 2026):
// - BBC Bitesize topic-level IDs are unstable; subject-level pages used instead.
// - MathsGenie has migrated many topics to yesgenie.com — direct links used.
// - Khan Academy deep sub-paths confirmed working.
// - Corbettmaths primary content moved to corbettmathsprimary.com.

export const RESOURCES = {
  // ─── KS2 (Years 3–6) ───────────────────────────────────────────────────────
  ks2: {
    "Number & place value": [
      {
        title: "BBC Bitesize – KS2 Maths",
        url: "https://www.bbc.co.uk/bitesize/subjects/z826n39",
        type: "article",
      },
      {
        title: "Corbettmaths Primary – Videos & Worksheets",
        url: "https://corbettmathsprimary.com/content/",
        type: "video",
      },
      {
        title: "Khan Academy – Place Value (Year 4–5 level)",
        url: "https://www.khanacademy.org/math/cc-fourth-grade-math/imp-place-value",
        type: "interactive",
      },
      {
        title: "Maths is Fun – Place Value",
        url: "https://www.mathsisfun.com/place-value.html",
        type: "article",
      },
      {
        title: "Topmarks – Number & Place Value Games",
        url: "https://www.topmarks.co.uk/maths-games/7-11-years/place-value",
        type: "interactive",
      },
    ],

    "Addition & subtraction": [
      {
        title: "BBC Bitesize – KS2 Maths",
        url: "https://www.bbc.co.uk/bitesize/subjects/z826n39",
        type: "article",
      },
      {
        title: "Corbettmaths Primary – Videos & Worksheets",
        url: "https://corbettmathsprimary.com/content/",
        type: "video",
      },
      {
        title: "Khan Academy – Addition & Subtraction",
        url: "https://www.khanacademy.org/math/arithmetic/arith-review-add-subtract",
        type: "interactive",
      },
      {
        title: "Topmarks – Addition & Subtraction Games (7–11)",
        url: "https://www.topmarks.co.uk/maths-games/7-11-years/addition-and-subtraction",
        type: "interactive",
      },
      {
        title: "Maths is Fun – Adding",
        url: "https://www.mathsisfun.com/numbers/addition.html",
        type: "article",
      },
    ],

    "Multiplication & division": [
      {
        title: "BBC Bitesize – KS2 Maths",
        url: "https://www.bbc.co.uk/bitesize/subjects/z826n39",
        type: "article",
      },
      {
        title: "Corbettmaths Primary – Videos & Worksheets",
        url: "https://corbettmathsprimary.com/content/",
        type: "video",
      },
      {
        title: "Khan Academy – Multiplication & Division",
        url: "https://www.khanacademy.org/math/arithmetic/arith-review-multiply-divide",
        type: "interactive",
      },
      {
        title: "Topmarks – Multiplication & Division Games (7–11)",
        url: "https://www.topmarks.co.uk/maths-games/7-11-years/multiplication-and-division",
        type: "interactive",
      },
      {
        title: "Maths is Fun – Times Tables",
        url: "https://www.mathsisfun.com/tables.html",
        type: "article",
      },
    ],

    "Fractions, decimals & percentages": [
      {
        title: "BBC Bitesize – KS2 Maths",
        url: "https://www.bbc.co.uk/bitesize/subjects/z826n39",
        type: "article",
      },
      {
        title: "Corbettmaths Primary – Videos & Worksheets",
        url: "https://corbettmathsprimary.com/content/",
        type: "video",
      },
      {
        title: "Khan Academy – Fractions",
        url: "https://www.khanacademy.org/math/arithmetic/fraction-arithmetic",
        type: "interactive",
      },
      {
        title: "Maths is Fun – Fractions",
        url: "https://www.mathsisfun.com/fractions.html",
        type: "article",
      },
      {
        title: "Topmarks – Fractions & Decimals Games (7–11)",
        url: "https://www.topmarks.co.uk/maths-games/7-11-years/fractions-and-decimals",
        type: "interactive",
      },
    ],

    "Geometry – shapes": [
      {
        title: "BBC Bitesize – KS2 Maths",
        url: "https://www.bbc.co.uk/bitesize/subjects/z826n39",
        type: "article",
      },
      {
        title: "Corbettmaths Primary – Videos & Worksheets",
        url: "https://corbettmathsprimary.com/content/",
        type: "video",
      },
      {
        title: "Khan Academy – Basic Geometry",
        url: "https://www.khanacademy.org/math/basic-geo",
        type: "interactive",
      },
      {
        title: "Topmarks – Geometry Games (7–11)",
        url: "https://www.topmarks.co.uk/maths-games/7-11-years/geometry",
        type: "interactive",
      },
      {
        title: "Maths is Fun – Geometry",
        url: "https://www.mathsisfun.com/geometry/",
        type: "article",
      },
    ],

    "Geometry – position & direction": [
      {
        title: "BBC Bitesize – KS2 Maths",
        url: "https://www.bbc.co.uk/bitesize/subjects/z826n39",
        type: "article",
      },
      {
        title: "Corbettmaths Primary – Videos & Worksheets",
        url: "https://corbettmathsprimary.com/content/",
        type: "video",
      },
      {
        title: "Topmarks – Geometry & Coordinates Games (7–11)",
        url: "https://www.topmarks.co.uk/maths-games/7-11-years/geometry",
        type: "interactive",
      },
      {
        title: "Maths is Fun – Cartesian Coordinates",
        url: "https://www.mathsisfun.com/data/cartesian-coordinates.html",
        type: "article",
      },
    ],

    "Measurement": [
      {
        title: "BBC Bitesize – KS2 Maths",
        url: "https://www.bbc.co.uk/bitesize/subjects/z826n39",
        type: "article",
      },
      {
        title: "Corbettmaths Primary – Videos & Worksheets",
        url: "https://corbettmathsprimary.com/content/",
        type: "video",
      },
      {
        title: "Khan Academy – Measurement & Data",
        url: "https://www.khanacademy.org/math/cc-fourth-grade-math/imp-measurement-and-data",
        type: "interactive",
      },
      {
        title: "Topmarks – Measures Games (7–11)",
        url: "https://www.topmarks.co.uk/maths-games/7-11-years/measures",
        type: "interactive",
      },
      {
        title: "Maths is Fun – Measurement",
        url: "https://www.mathsisfun.com/measure/",
        type: "article",
      },
    ],

    "Statistics": [
      {
        title: "BBC Bitesize – KS2 Maths",
        url: "https://www.bbc.co.uk/bitesize/subjects/z826n39",
        type: "article",
      },
      {
        title: "Corbettmaths Primary – Videos & Worksheets",
        url: "https://corbettmathsprimary.com/content/",
        type: "video",
      },
      {
        title: "Khan Academy – Data & Statistics (Primary level)",
        url: "https://www.khanacademy.org/math/cc-sixth-grade-math/cc-6th-data-statistics",
        type: "interactive",
      },
      {
        title: "Topmarks – Data Handling Games (7–11)",
        url: "https://www.topmarks.co.uk/maths-games/7-11-years/data-handling",
        type: "interactive",
      },
      {
        title: "Maths is Fun – Data",
        url: "https://www.mathsisfun.com/data/",
        type: "article",
      },
    ],

    "Algebra": [
      {
        title: "BBC Bitesize – KS2 Maths",
        url: "https://www.bbc.co.uk/bitesize/subjects/z826n39",
        type: "article",
      },
      {
        title: "Corbettmaths Primary – Videos & Worksheets",
        url: "https://corbettmathsprimary.com/content/",
        type: "video",
      },
      {
        title: "Khan Academy – Algebra Basics",
        url: "https://www.khanacademy.org/math/algebra-basics",
        type: "interactive",
      },
      {
        title: "Maths is Fun – Introduction to Algebra",
        url: "https://www.mathsisfun.com/algebra/introduction.html",
        type: "article",
      },
    ],

    "Ratio & proportion": [
      {
        title: "BBC Bitesize – KS2 Maths",
        url: "https://www.bbc.co.uk/bitesize/subjects/z826n39",
        type: "article",
      },
      {
        title: "Corbettmaths Primary – Videos & Worksheets",
        url: "https://corbettmathsprimary.com/content/",
        type: "video",
      },
      {
        title: "Khan Academy – Ratios & Proportions",
        url: "https://www.khanacademy.org/math/pre-algebra/pre-algebra-ratios-rates",
        type: "interactive",
      },
      {
        title: "Maths is Fun – Ratios",
        url: "https://www.mathsisfun.com/numbers/ratio.html",
        type: "article",
      },
    ],
  },

  // ─── KS3 (Years 7–9) ───────────────────────────────────────────────────────
  ks3: {
    "Number": [
      {
        title: "BBC Bitesize – KS3 Maths",
        url: "https://www.bbc.co.uk/bitesize/subjects/zqhs34j",
        type: "article",
      },
      {
        title: "Corbettmaths – Videos & Worksheets",
        url: "https://corbettmaths.com/contents/",
        type: "video",
      },
      {
        title: "YesGenie – Place Value (Videos & Exam Questions)",
        url: "https://yesgenie.com/gcse/maths/edexcel/grade-1-1-6-place-value",
        type: "article",
      },
      {
        title: "Khan Academy – Arithmetic & Pre-Algebra",
        url: "https://www.khanacademy.org/math/arithmetic",
        type: "interactive",
      },
      {
        title: "Maths is Fun – Numbers",
        url: "https://www.mathsisfun.com/numbers/",
        type: "article",
      },
    ],

    "Algebra": [
      {
        title: "BBC Bitesize – KS3 Maths",
        url: "https://www.bbc.co.uk/bitesize/subjects/zqhs34j",
        type: "article",
      },
      {
        title: "Corbettmaths – Videos & Worksheets",
        url: "https://corbettmaths.com/contents/",
        type: "video",
      },
      {
        title: "MathsGenie – Simplifying Algebra",
        url: "https://www.mathsgenie.co.uk/simplifyingalgebra.php",
        type: "article",
      },
      {
        title: "YesGenie – Solving Equations",
        url: "https://yesgenie.com/gcse/maths/edexcel/grade-3-3-14-solving-equations",
        type: "article",
      },
      {
        title: "Khan Academy – Algebra",
        url: "https://www.khanacademy.org/math/algebra",
        type: "interactive",
      },
      {
        title: "Maths is Fun – Algebra",
        url: "https://www.mathsisfun.com/algebra/",
        type: "article",
      },
    ],

    "Geometry & measures": [
      {
        title: "BBC Bitesize – KS3 Maths",
        url: "https://www.bbc.co.uk/bitesize/subjects/zqhs34j",
        type: "article",
      },
      {
        title: "Corbettmaths – Videos & Worksheets",
        url: "https://corbettmaths.com/contents/",
        type: "video",
      },
      {
        title: "YesGenie – Area & Perimeter",
        url: "https://yesgenie.com/gcse/maths/edexcel/grade-2-2-11-area-and-perimeter",
        type: "article",
      },
      {
        title: "YesGenie – Angles",
        url: "https://yesgenie.com/gcse/maths/edexcel/grade-2-2-10-angles",
        type: "article",
      },
      {
        title: "Khan Academy – Basic Geometry",
        url: "https://www.khanacademy.org/math/basic-geo",
        type: "interactive",
      },
      {
        title: "Maths is Fun – Geometry",
        url: "https://www.mathsisfun.com/geometry/",
        type: "article",
      },
    ],

    "Ratio & proportion": [
      {
        title: "BBC Bitesize – KS3 Maths",
        url: "https://www.bbc.co.uk/bitesize/subjects/zqhs34j",
        type: "article",
      },
      {
        title: "Corbettmaths – Videos & Worksheets",
        url: "https://corbettmaths.com/contents/",
        type: "video",
      },
      {
        title: "YesGenie – Ratio",
        url: "https://yesgenie.com/gcse/maths/edexcel/grade-3-3-5-ratio",
        type: "article",
      },
      {
        title: "YesGenie – Percentages",
        url: "https://yesgenie.com/gcse/maths/edexcel/grade-3-3-7-percentages",
        type: "article",
      },
      {
        title: "Khan Academy – Ratios & Proportions",
        url: "https://www.khanacademy.org/math/pre-algebra/pre-algebra-ratios-rates",
        type: "interactive",
      },
      {
        title: "Maths is Fun – Ratio",
        url: "https://www.mathsisfun.com/numbers/ratio.html",
        type: "article",
      },
    ],

    "Statistics & probability": [
      {
        title: "BBC Bitesize – KS3 Maths",
        url: "https://www.bbc.co.uk/bitesize/subjects/zqhs34j",
        type: "article",
      },
      {
        title: "Corbettmaths – Videos & Worksheets",
        url: "https://corbettmaths.com/contents/",
        type: "video",
      },
      {
        title: "MathsGenie – Averages (Mean, Median, Mode)",
        url: "https://www.mathsgenie.co.uk/averages.php",
        type: "article",
      },
      {
        title: "YesGenie – Probability",
        url: "https://yesgenie.com/gcse/maths/edexcel/grade-2-2-12-probability",
        type: "article",
      },
      {
        title: "Khan Academy – Statistics & Probability",
        url: "https://www.khanacademy.org/math/statistics-probability",
        type: "interactive",
      },
      {
        title: "Maths is Fun – Data",
        url: "https://www.mathsisfun.com/data/",
        type: "article",
      },
    ],
  },

  // ─── GCSE (Edexcel / AQA) ──────────────────────────────────────────────────
  gcse: {
    "Number": [
      {
        title: "BBC Bitesize – GCSE Maths",
        url: "https://www.bbc.co.uk/bitesize/subjects/z38pycw",
        type: "article",
      },
      {
        title: "Corbettmaths – Videos & Practice Papers",
        url: "https://corbettmaths.com/contents/",
        type: "video",
      },
      {
        title: "YesGenie – Place Value & Rounding",
        url: "https://yesgenie.com/gcse/maths/edexcel/grade-1-1-6-place-value",
        type: "article",
      },
      {
        title: "YesGenie – Indices",
        url: "https://yesgenie.com/gcse/maths/edexcel/grade-4-4-2-indices",
        type: "article",
      },
      {
        title: "YesGenie – Standard Form",
        url: "https://yesgenie.com/gcse/maths/edexcel/grade-5-5-4-standard-form",
        type: "article",
      },
      {
        title: "Khan Academy – Arithmetic",
        url: "https://www.khanacademy.org/math/arithmetic",
        type: "interactive",
      },
      {
        title: "Maths is Fun – Numbers",
        url: "https://www.mathsisfun.com/numbers/",
        type: "article",
      },
    ],

    "Algebra": [
      {
        title: "BBC Bitesize – GCSE Maths",
        url: "https://www.bbc.co.uk/bitesize/subjects/z38pycw",
        type: "article",
      },
      {
        title: "Corbettmaths – Videos & Practice Papers",
        url: "https://corbettmaths.com/contents/",
        type: "video",
      },
      {
        title: "MathsGenie – Simplifying Algebra",
        url: "https://www.mathsgenie.co.uk/simplifyingalgebra.php",
        type: "article",
      },
      {
        title: "YesGenie – Solving Equations",
        url: "https://yesgenie.com/gcse/maths/edexcel/grade-3-3-14-solving-equations",
        type: "article",
      },
      {
        title: "MathsGenie – Expanding & Factorising",
        url: "https://www.mathsgenie.co.uk/expanding-and-factorising.php",
        type: "article",
      },
      {
        title: "YesGenie – Sequences (Nth Term)",
        url: "https://yesgenie.com/gcse/maths/edexcel/grade-4-4-7-sequences-nth-term",
        type: "article",
      },
      {
        title: "Khan Academy – Algebra 1",
        url: "https://www.khanacademy.org/math/algebra",
        type: "interactive",
      },
      {
        title: "Khan Academy – Algebra 2",
        url: "https://www.khanacademy.org/math/algebra2",
        type: "interactive",
      },
      {
        title: "Maths is Fun – Algebra",
        url: "https://www.mathsisfun.com/algebra/",
        type: "article",
      },
    ],

    "Geometry & measures": [
      {
        title: "BBC Bitesize – GCSE Maths",
        url: "https://www.bbc.co.uk/bitesize/subjects/z38pycw",
        type: "article",
      },
      {
        title: "Corbettmaths – Videos & Practice Papers",
        url: "https://corbettmaths.com/contents/",
        type: "video",
      },
      {
        title: "YesGenie – Area & Perimeter",
        url: "https://yesgenie.com/gcse/maths/edexcel/grade-2-2-11-area-and-perimeter",
        type: "article",
      },
      {
        title: "MathsGenie – Pythagoras' Theorem",
        url: "https://www.mathsgenie.co.uk/pythagoras.php",
        type: "article",
      },
      {
        title: "MathsGenie – Transformations",
        url: "https://www.mathsgenie.co.uk/transformations.php",
        type: "article",
      },
      {
        title: "MathsGenie – Trigonometry (SOHCAHTOA)",
        url: "https://www.mathsgenie.co.uk/sohcahtoa.php",
        type: "article",
      },
      {
        title: "Khan Academy – Geometry",
        url: "https://www.khanacademy.org/math/geometry",
        type: "interactive",
      },
      {
        title: "Maths is Fun – Geometry",
        url: "https://www.mathsisfun.com/geometry/",
        type: "article",
      },
    ],

    "Ratio, proportion & rates of change": [
      {
        title: "BBC Bitesize – GCSE Maths",
        url: "https://www.bbc.co.uk/bitesize/subjects/z38pycw",
        type: "article",
      },
      {
        title: "Corbettmaths – Videos & Practice Papers",
        url: "https://corbettmaths.com/contents/",
        type: "video",
      },
      {
        title: "YesGenie – Ratio",
        url: "https://yesgenie.com/gcse/maths/edexcel/grade-3-3-5-ratio",
        type: "article",
      },
      {
        title: "YesGenie – Percentages",
        url: "https://yesgenie.com/gcse/maths/edexcel/grade-3-3-7-percentages",
        type: "article",
      },
      {
        title: "YesGenie – Direct & Inverse Proportion",
        url: "https://yesgenie.com/gcse/maths/edexcel/grade-5-5-2-direct-and-inverse-proportion",
        type: "article",
      },
      {
        title: "Khan Academy – Ratios, Proportions & Percentages",
        url: "https://www.khanacademy.org/math/pre-algebra/pre-algebra-ratios-rates",
        type: "interactive",
      },
      {
        title: "Maths is Fun – Ratios",
        url: "https://www.mathsisfun.com/numbers/ratio.html",
        type: "article",
      },
    ],

    "Statistics": [
      {
        title: "BBC Bitesize – GCSE Maths",
        url: "https://www.bbc.co.uk/bitesize/subjects/z38pycw",
        type: "article",
      },
      {
        title: "Corbettmaths – Videos & Practice Papers",
        url: "https://corbettmaths.com/contents/",
        type: "video",
      },
      {
        title: "MathsGenie – Averages (Mean, Median, Mode, Range)",
        url: "https://www.mathsgenie.co.uk/averages.php",
        type: "article",
      },
      {
        title: "YesGenie – Scatter Graphs",
        url: "https://yesgenie.com/gcse/maths/edexcel/grade-4-4-20-scatter-graphs",
        type: "article",
      },
      {
        title: "YesGenie – Averages from Frequency Tables",
        url: "https://yesgenie.com/gcse/maths/edexcel/grade-4-4-18-averages-from-frequency-tables",
        type: "article",
      },
      {
        title: "Khan Academy – Statistics & Probability",
        url: "https://www.khanacademy.org/math/statistics-probability",
        type: "interactive",
      },
      {
        title: "Maths is Fun – Data",
        url: "https://www.mathsisfun.com/data/",
        type: "article",
      },
    ],

    "Probability": [
      {
        title: "BBC Bitesize – GCSE Maths",
        url: "https://www.bbc.co.uk/bitesize/subjects/z38pycw",
        type: "article",
      },
      {
        title: "Corbettmaths – Videos & Practice Papers",
        url: "https://corbettmaths.com/contents/",
        type: "video",
      },
      {
        title: "YesGenie – Probability",
        url: "https://yesgenie.com/gcse/maths/edexcel/grade-2-2-12-probability",
        type: "article",
      },
      {
        title: "YesGenie – Probability Trees",
        url: "https://yesgenie.com/gcse/maths/edexcel/grade-5-5-22-probability-trees",
        type: "article",
      },
      {
        title: "YesGenie – Venn Diagrams",
        url: "https://yesgenie.com/gcse/maths/edexcel/grade-5-5-23-venn-diagrams",
        type: "article",
      },
      {
        title: "Khan Academy – Probability",
        url: "https://www.khanacademy.org/math/statistics-probability/probability-library",
        type: "interactive",
      },
      {
        title: "Maths is Fun – Probability",
        url: "https://www.mathsisfun.com/data/probability.html",
        type: "article",
      },
    ],
  },
};

// ─── Level-wide fallbacks ───────────────────────────────────────────────────
// Shown when no category-specific resources are found.
export const FALLBACK_RESOURCES = {
  ks2: [
    {
      title: "BBC Bitesize KS2 Maths",
      url: "https://www.bbc.co.uk/bitesize/subjects/z826n39",
      type: "article",
    },
    {
      title: "Corbettmaths Primary – Videos & Worksheets",
      url: "https://corbettmathsprimary.com/content/",
      type: "video",
    },
    {
      title: "Topmarks Maths Games (Ages 7–11)",
      url: "https://www.topmarks.co.uk/maths-games/7-11-years/",
      type: "interactive",
    },
    {
      title: "Khan Academy – Primary Maths",
      url: "https://www.khanacademy.org/math/arithmetic",
      type: "interactive",
    },
  ],
  ks3: [
    {
      title: "BBC Bitesize KS3 Maths",
      url: "https://www.bbc.co.uk/bitesize/subjects/zqhs34j",
      type: "article",
    },
    {
      title: "Corbettmaths – Videos & Worksheets",
      url: "https://corbettmaths.com/contents/",
      type: "video",
    },
    {
      title: "MathsGenie – GCSE Revision (covers KS3 topics)",
      url: "https://www.mathsgenie.co.uk/gcse.html",
      type: "article",
    },
    {
      title: "Khan Academy – Pre-Algebra & Algebra",
      url: "https://www.khanacademy.org/math/pre-algebra",
      type: "interactive",
    },
  ],
  gcse: [
    {
      title: "BBC Bitesize GCSE Maths",
      url: "https://www.bbc.co.uk/bitesize/subjects/z38pycw",
      type: "article",
    },
    {
      title: "Corbettmaths GCSE – Videos & Practice Papers",
      url: "https://corbettmaths.com/contents/",
      type: "video",
    },
    {
      title: "MathsGenie – GCSE Revision",
      url: "https://www.mathsgenie.co.uk/gcse.html",
      type: "article",
    },
    {
      title: "Khan Academy – Algebra & Geometry",
      url: "https://www.khanacademy.org/math/algebra-home",
      type: "interactive",
    },
  ],
};

// ─── Public helpers ─────────────────────────────────────────────────────────
// Icon shown next to each resource link, keyed by resource `type`.
// Components fall back to a generic link glyph for any unknown type.
export const TYPE_ICON = {
  article: "📄",
  video: "🎬",
  interactive: "🧩",
};

// Resolve resources for a given level + topic category.
// Order of preference:
//   1. Category-specific links (RESOURCES[level][category])
//   2. Level-wide fallback links (FALLBACK_RESOURCES[level])
//   3. Empty array (never returns undefined — callers rely on .length / .map)
export function getResources(level, category) {
  const byLevel = RESOURCES[level] || {};
  const specific = byLevel[category];
  if (specific && specific.length) return specific;
  return FALLBACK_RESOURCES[level] || [];
}
