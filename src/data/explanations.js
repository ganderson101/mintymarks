// src/data/explanations.js
// Pedagogical concept explanations — one per level + category combination.
// Displayed in-app alongside (not replacing) the external resource links.
// Keys must exactly match `level` and `category` values in questions.js.
//
// Each entry contains:
//   title         — display heading
//   keyIdea       — one-sentence mental model / hook
//   body          — main explanation (plain prose, ~250–350 words)
//   workedExample — { problem, solution } — mirrors the style of actual questions
//   commonMistakes — array of 2–3 strings
//   keyFacts      — array of 3–5 short rules or formulas to remember

export const EXPLANATIONS = {

  // ─── KS2 Maths ─────────────────────────────────────────────────────────────
  ks2: {

    "Number & place value": {
      title: "Rounding & Place Value",
      keyIdea: "Every digit in a number has a position — its place — and rounding means replacing a number with the nearest 'clean' value at that place.",
      body: `Numbers are built from digits arranged in columns: thousands, hundreds, tens, and ones (units). The position of a digit tells you its value — the 4 in 4,700 is worth four thousand, not just four.

Rounding simplifies a number to a given place value. The golden rule is simple: look at the digit immediately to the RIGHT of the place you are rounding to.

• If that digit is 5 or more → round UP (increase the target digit by 1).
• If that digit is 4 or less → round DOWN (keep the target digit the same).

Then replace every digit to the right of the target place with a zero.

Example — Round 5,483 to the nearest 1,000:
The thousands digit is 5. Look one place right: the hundreds digit is 4. Because 4 < 5, round down. Answer: 5,000.

Example — Round 6,572 to the nearest 10:
The tens digit is 7. Look one place right: the ones digit is 2. Because 2 < 5, round down. Answer: 6,570.

A useful trick: draw a vertical line after the place you are rounding to. Everything to the left stays (or goes up by 1). Everything to the right becomes zero.

Rounding is used constantly in real life — estimating shopping costs, reading data on a graph, or reporting population figures. It also helps you check whether your calculator answer is sensible: "Is 6,572 rounded to the nearest 1,000 closer to 6,000 or 7,000?" Running that quick check prevents errors.`,
      workedExample: {
        problem: "Round 7,468 to the nearest 100.",
        solution: "Target place: hundreds (the 4). Digit to its right: 6. Since 6 ≥ 5, round up: 4 becomes 5. Digits to the right become 0. Answer: 7,500."
      },
      commonMistakes: [
        "Rounding the wrong digit — always look ONE place to the RIGHT of where you are rounding to.",
        "Forgetting to replace digits after the target with zeros (e.g., writing 7,568 instead of 7,500).",
        "When rounding up causes a 9 to become 10, forgetting to carry — e.g., 4,950 rounded to the nearest 100 is 5,000, not 4,1000."
      ],
      keyFacts: [
        "Digit to the right is 5 or more → round UP.",
        "Digit to the right is 4 or less → round DOWN (keep the same).",
        "All digits after the target place become zeros.",
        "Place value order (right to left): ones, tens, hundreds, thousands, ten-thousands."
      ]
    },

    "Addition & subtraction": {
      title: "Addition & Subtraction",
      keyIdea: "Addition combines amounts together; subtraction finds the difference — and both can be done reliably with column methods when numbers get large.",
      body: `For large numbers, the column method is the most reliable strategy. Line numbers up so that digits with the same place value sit in the same column (ones under ones, tens under tens, and so on).

ADDITION — column method:
Add each column starting from the RIGHT (ones first). If a column adds to 10 or more, write down the units digit and carry the tens digit to the next column on the left.

Example: 865 + 7,534
    7 5 3 4
  +   8 6 5
  ─────────
    8 3 9 9

Work right to left: 4+5=9, 3+6=9, 5+8=13 (write 3 carry 1), 7+0+1=8. Answer: 8,399.

SUBTRACTION — column method:
Subtract each column from right to left. If the top digit is smaller than the bottom, borrow 10 from the column to its left (reduce that column's top digit by 1).

Checking your answer: always add your answer back to the number you subtracted — it should give you the starting number. This 30-second check catches most errors.

Mental strategies for smaller calculations:
• Near-doubles: 46 + 48 = 2 × 47 = 94
• Bridging through 10/100: 376 + 58 = 376 + 24 + 34 = 400 + 34 = 434
• Counting up for subtraction: 503 − 478 → count up 2 to 480, then 23 to 503 = 25`,
      workedExample: {
        problem: "What is 2,520 + 5,032?",
        solution: "Line up columns: ones: 0+2=2, tens: 2+3=5, hundreds: 5+0=5, thousands: 2+5=7. Answer: 7,552."
      },
      commonMistakes: [
        "Misaligning columns when one number has more digits than the other — always right-align.",
        "Forgetting to carry after a column sum reaches 10 or more.",
        "In subtraction, not borrowing when the top digit is smaller than the bottom digit."
      ],
      keyFacts: [
        "Always line up digits by place value (right-align).",
        "Add/subtract right to left.",
        "If a column total ≥ 10, carry the tens digit leftward.",
        "Check subtraction by adding your answer to the smaller number — you should get the larger."
      ]
    },

    "Multiplication & division": {
      title: "Multiplication & Division",
      keyIdea: "Multiplication is repeated addition; division is splitting into equal groups — and knowing your times tables makes both dramatically faster.",
      body: `MULTIPLICATION
Times tables (2× to 12×) are the foundation. Every multiplication problem, no matter how large, relies on them. Practise until they are instant recall.

For multiplying larger numbers, use the grid method or the standard short multiplication algorithm.

Grid method for 34 × 6:
Split 34 into 30 + 4.
30 × 6 = 180
 4 × 6 =  24
Total: 180 + 24 = 204

For two-digit × two-digit (e.g., 34 × 26), use a 2×2 grid:
      30      4
20 | 600  |  80 |  → 680
 6 | 180  |  24 |  → 204
Total: 680 + 204 = 884

DIVISION
Short division (bus stop method) works for dividing by a single digit. Write the dividend inside the 'bus stop', divisor outside. Divide each digit left to right, carrying any remainder to the next digit.

Example: 96 ÷ 4
4 into 9 = 2 remainder 1. Carry the 1. 4 into 16 = 4. Answer: 24.

The connection to multiplication: division is the inverse of multiplication. If 6 × 7 = 42, then 42 ÷ 7 = 6 and 42 ÷ 6 = 7. Use this fact to check every division answer.

Remainders: if a division doesn't work out exactly, express the leftover as a remainder (e.g., 29 ÷ 4 = 7 remainder 1).`,
      workedExample: {
        problem: "What is 11 × 12?",
        solution: "Split: 11 × 12 = 11 × 10 + 11 × 2 = 110 + 22 = 132. Or from times tables: 11 × 12 = 132."
      },
      commonMistakes: [
        "Misremembering times table facts — especially 6×7, 7×8, and 8×9. These are worth drilling specifically.",
        "Forgetting to carry a remainder in short division, causing every subsequent digit to be wrong.",
        "In the grid method, missing one of the partial products (especially when splitting into three parts)."
      ],
      keyFacts: [
        "Know all times tables from 2× to 12× by heart.",
        "Multiplication is commutative: 4 × 9 = 9 × 4.",
        "Division is the inverse of multiplication — use it to check your answers.",
        "Grid method: partition, multiply each part, then add the partial products.",
        "Short division: work left to right, carry remainders forward."
      ]
    },

    "Fractions, decimals & percentages": {
      title: "Fractions, Decimals & Percentages",
      keyIdea: "Fractions, decimals, and percentages are three different ways to write the same idea — a part of a whole.",
      body: `FRACTIONS
A fraction has a numerator (top) and a denominator (bottom). The denominator tells you how many equal parts the whole is split into; the numerator tells you how many of those parts you have.

Finding a fraction of an amount:
Step 1: Divide by the denominator.
Step 2: Multiply by the numerator.
Memory trick: "Divide by the bottom, times by the top."

Example: 2/5 of 40
Step 1: 40 ÷ 5 = 8
Step 2: 8 × 2 = 16 ✓

Example: 8/10 of 100
Step 1: 100 ÷ 10 = 10
Step 2: 10 × 8 = 80 ✓

DECIMALS
Decimals extend the place value system past the decimal point: tenths, hundredths, thousandths. 0.3 = 3/10, 0.25 = 25/100 = 1/4.

PERCENTAGES
Per cent means "out of 100". To find a percentage of an amount, convert to a decimal and multiply, OR use the divide-then-multiply method: 30% of 400 → find 10% first (÷10 = 40), then multiply (×3 = 120).

KEY CONVERSIONS to memorise:
1/2 = 0.5 = 50%
1/4 = 0.25 = 25%
3/4 = 0.75 = 75%
1/5 = 0.2 = 20%
1/10 = 0.1 = 10%

Equivalence: 4/10 = 0.4 = 40%. These three always represent the same quantity.`,
      workedExample: {
        problem: "What is 2/5 of 40?",
        solution: "Divide by the denominator: 40 ÷ 5 = 8. Multiply by the numerator: 8 × 2 = 16."
      },
      commonMistakes: [
        "Dividing by the numerator and multiplying by the denominator — it must always be ÷ bottom, × top.",
        "Confusing 1/4 = 25% with 1/4 = 0.25 — they are the same value, just written differently.",
        "Mixing up the decimal point position: 0.3 is 3 tenths (= 30%), not 3 hundredths."
      ],
      keyFacts: [
        "Fraction of an amount: ÷ denominator, then × numerator.",
        "1/2 = 0.5 = 50%,  1/4 = 0.25 = 25%,  1/5 = 0.2 = 20%,  1/10 = 0.1 = 10%.",
        "To find 10% of any number, divide by 10. Build other percentages from there.",
        "Equivalent fractions: multiply or divide numerator AND denominator by the same number."
      ]
    },

    "Geometry – shapes": {
      title: "Properties of 2D Shapes",
      keyIdea: "Every 2D shape is defined by the number of its sides and angles — learn the names and their properties once, and you have them for life.",
      body: `A polygon is any 2D shape made from straight sides. The name tells you the number of sides.

NAMES TO KNOW:
Triangle         3 sides
Quadrilateral    4 sides   (square, rectangle, parallelogram, rhombus, trapezium, kite)
Pentagon         5 sides
Hexagon          6 sides
Heptagon         7 sides
Octagon          8 sides
Nonagon          9 sides
Decagon         10 sides

REGULAR vs IRREGULAR:
A regular polygon has all sides equal AND all angles equal (e.g., a regular hexagon has 6 equal sides and six 120° angles). An irregular polygon has sides or angles that differ.

KEY QUADRILATERAL PROPERTIES:
• Square: 4 equal sides, 4 right angles (90°), all sides parallel in pairs.
• Rectangle: opposite sides equal, 4 right angles.
• Parallelogram: opposite sides equal and parallel, opposite angles equal.
• Rhombus: 4 equal sides, opposite sides parallel, opposite angles equal.
• Trapezium: exactly one pair of parallel sides.
• Kite: two pairs of adjacent equal sides, one pair of equal angles.

ANGLES IN POLYGONS:
Angles inside any triangle add to 180°.
Angles inside any quadrilateral add to 360°.
General rule: sum of interior angles = (n − 2) × 180°, where n is the number of sides.

LINES OF SYMMETRY:
A square has 4 lines of symmetry. An equilateral triangle has 3. A rectangle has 2. A regular pentagon has 5. A shape with no lines of symmetry (like a scalene triangle) is asymmetric.`,
      workedExample: {
        problem: "How many sides does a decagon have?",
        solution: "Deca = 10. A decagon has 10 sides. (Memory: 'decade' = 10 years.)"
      },
      commonMistakes: [
        "Confusing hexagon (6) and heptagon (7) — remember 'hex' means six (as in hexadecimal).",
        "Thinking a square is not a rectangle — a square is a special rectangle (all sides equal).",
        "Forgetting that interior angles of a quadrilateral sum to 360°, not 180°."
      ],
      keyFacts: [
        "Triangle = 3, Quad = 4, Pentagon = 5, Hexagon = 6, Heptagon = 7, Octagon = 8, Nonagon = 9, Decagon = 10.",
        "Angles in a triangle sum to 180°; in a quadrilateral, 360°.",
        "Regular polygon: all sides equal AND all angles equal.",
        "A square is a special rectangle (and also a special rhombus)."
      ]
    },

    "Geometry – position & direction": {
      title: "Coordinates & Translations",
      keyIdea: "A coordinate is an address for a point on a grid — always read along the corridor (x-axis) first, then up the stairs (y-axis).",
      body: `COORDINATES
A coordinate pair (x, y) gives the exact position of a point on a grid.
• x is the horizontal distance from the origin (0, 0) — read left or right.
• y is the vertical distance from the origin — read up or down.

Memory trick: "Along the corridor, then up the stairs" → x first, then y.

Positive x → right of origin. Negative x → left.
Positive y → above origin. Negative y → below.

Example: The point (4, 7) is 4 units right and 7 units up from the origin.

TRANSLATIONS
A translation slides a shape to a new position without rotating or flipping it. Every point moves the same distance in the same direction.

A translation is described as "a right/left and b up/down."
To find the new coordinates of a point (x, y) translated a right and b up:
New coordinates = (x + a, y + b)

If the translation is to the LEFT, subtract from x.
If the translation is DOWN, subtract from y.

Example: Point (4, 7) translated 1 right and 4 up:
New x = 4 + 1 = 5
New y = 7 + 4 = 11
New coordinates: (5, 11)

REFLECTIONS AND ROTATIONS (brief overview):
• Reflection: mirror image across a mirror line.
• Rotation: turn around a fixed centre point, described by angle (90°, 180°, 270°) and direction (clockwise or anti-clockwise).

When plotting coordinates, always use a sharp pencil and mark with a small × rather than a dot — it is more precise.`,
      workedExample: {
        problem: "A point at (2, 2) is translated 5 right and 1 up. What are its new coordinates?",
        solution: "New x = 2 + 5 = 7. New y = 2 + 1 = 3. New coordinates: (7, 3)."
      },
      commonMistakes: [
        "Reading y first and x second — it is always (x, y): horizontal before vertical.",
        "Adding when you should subtract for left/down translations.",
        "Plotting a point at (3, 5) on a y = 3, x = 5 position — x is horizontal, y is vertical."
      ],
      keyFacts: [
        "Coordinate format: (x, y) — always horizontal first.",
        "Translation right → add to x. Left → subtract from x.",
        "Translation up → add to y. Down → subtract from y.",
        "Translations do NOT change the size or orientation of a shape.",
        "Origin = (0, 0)."
      ]
    },

    "Measurement": {
      title: "Units of Measurement & Conversion",
      keyIdea: "Measurement only makes sense when you know the unit — and converting between units is just multiplication or division by a fixed scale factor.",
      body: `Measurements fall into categories: length, mass, capacity, and time. Each has a set of units connected by conversion factors.

LENGTH
10 mm = 1 cm
100 cm = 1 m
1,000 m = 1 km

To convert from a LARGER unit to a SMALLER unit → MULTIPLY.
To convert from a SMALLER unit to a LARGER unit → DIVIDE.

Examples:
109 cm to mm: multiply by 10 → 1,090 mm
283 cm to mm: multiply by 10 → 2,830 mm
3.5 km to m: multiply by 1,000 → 3,500 m
4,500 m to km: divide by 1,000 → 4.5 km

MASS
1,000 g = 1 kg
1,000 kg = 1 tonne

CAPACITY
1,000 ml = 1 litre

TIME
60 seconds = 1 minute
60 minutes = 1 hour
24 hours = 1 day
7 days = 1 week
365 days = 1 year (366 in a leap year)

AREA AND PERIMETER
Perimeter = total distance around the outside of a shape.
Area of a rectangle = length × width (measured in cm², m², etc.)

CHOOSING UNITS
Use common sense: a door is about 2 metres tall (not 200 cm in everyday speech). A paperclip is about 3 cm long. Always quote the unit with your answer — "1,090" is meaningless; "1,090 mm" is correct.`,
      workedExample: {
        problem: "How many millimetres are in 109 cm?",
        solution: "Converting cm → mm: multiply by 10. 109 × 10 = 1,090 mm."
      },
      commonMistakes: [
        "Dividing when you should multiply (going from a larger unit to a smaller unit always means the number gets bigger).",
        "Forgetting that there are 100 cm in a metre but 1,000 m in a kilometre — different scale factors.",
        "Leaving off the unit in the answer — always include mm, cm, kg, etc."
      ],
      keyFacts: [
        "Larger → smaller unit: MULTIPLY. Smaller → larger unit: DIVIDE.",
        "10 mm = 1 cm,  100 cm = 1 m,  1,000 m = 1 km.",
        "1,000 g = 1 kg,  1,000 ml = 1 litre.",
        "Area of rectangle = length × width.",
        "Perimeter = sum of all side lengths."
      ]
    },

    "Statistics": {
      title: "Averages & Data",
      keyIdea: "The mean is the 'fair share' average — add all the values together, then divide equally among the number of values.",
      body: `Statistics at KS2 focuses on reading data from charts and calculating the mean.

THE MEAN (average)
The mean is the most common measure of average. It represents the value you would get if all the data were shared out equally.

How to calculate the mean:
Step 1: Add all the values together (find the total).
Step 2: Divide the total by how many values there are (the count).

Mean = Total ÷ Count

Example: Mean of 24, 24, 18, 6
Total: 24 + 24 + 18 + 6 = 72
Count: 4 values
Mean: 72 ÷ 4 = 18

Example: Mean of 37, 28, 7
Total: 37 + 28 + 7 = 72
Count: 3 values
Mean: 72 ÷ 3 = 24

The mean does not have to be one of the original values in the data set — and it does not have to be a whole number.

READING CHARTS
Bar charts: the height (or length) of each bar shows the frequency for that category.
Pictograms: each symbol represents a fixed number — always check the key.
Line graphs: used to show change over time.
Tally charts: each tally mark = 1; groups of 5 are written as four vertical marks and one diagonal.

Always ask: "Does my answer make sense?" The mean should always be between the smallest and largest value in the data set.`,
      workedExample: {
        problem: "What is the mean of 37, 28, 7?",
        solution: "Total = 37 + 28 + 7 = 72. Count = 3. Mean = 72 ÷ 3 = 24."
      },
      commonMistakes: [
        "Dividing by the wrong count — count the number of values carefully, not the total.",
        "Adding the values incorrectly — take care with the addition step before dividing.",
        "Confusing mean with mode (most common) or median (middle value when ordered)."
      ],
      keyFacts: [
        "Mean = Total ÷ Count.",
        "The mean should always lie between the smallest and largest data value.",
        "Mode = most common value. Median = middle value (when ordered). Mean = fair-share average.",
        "Check bar charts by reading the exact value at the top of each bar against the scale."
      ]
    },

    "Algebra": {
      title: "Sequences & Simple Algebra",
      keyIdea: "A sequence follows a rule — find the rule and you can predict any term; algebra uses letters to express rules that work for any number.",
      body: `SEQUENCES
A sequence is a list of numbers that follow a pattern. To continue a sequence, identify the rule first.

LINEAR SEQUENCES (add or subtract the same amount each time):
Example: 5, 7, 9, 11, …
Each term increases by +2. Rule: "add 2". Next term: 11 + 2 = 13.

Example: 4, 6, 8, 10, …
Common difference: +2. Next term: 12.

To describe any linear sequence: find the first term and the common difference.

OTHER PATTERNS:
Doubling sequences: 2, 4, 8, 16, … (multiply by 2 each time)
Halving sequences: 80, 40, 20, 10, … (divide by 2 each time)
Fibonacci-style: 1, 1, 2, 3, 5, 8, … (add the two previous terms)

SIMPLE ALGEBRA
A letter (variable) stands for an unknown number. Algebra is just arithmetic with an unknown.

If 3 + x = 10, then x = 7 (because 3 + 7 = 10).
If 2 × n = 14, then n = 7.

The idea: whatever operation was done to x, do the inverse to both sides to find x.
"Balance the equation" — both sides must always be equal.

FUNCTION MACHINES
A function machine applies a rule to an input to produce an output.
Input → [× 3] → [+ 2] → Output
If input = 5: 5 × 3 = 15 → 15 + 2 = 17.
To find the input from the output, reverse the machine and use inverse operations.`,
      workedExample: {
        problem: "What is the next number in the sequence: 5, 7, 9, 11, …?",
        solution: "The common difference is +2 (each term increases by 2). Next term = 11 + 2 = 13."
      },
      commonMistakes: [
        "Assuming all sequences increase by adding — check whether it could be multiplication or a different operation.",
        "Continuing a sequence by writing the common difference instead of the next term.",
        "In algebra, assuming a letter always represents the same number across different problems."
      ],
      keyFacts: [
        "Find the rule in a sequence before writing the next term.",
        "Linear sequence: constant common difference (add or subtract the same amount each time).",
        "A letter in algebra stands for an unknown number.",
        "To solve for an unknown, use inverse operations (+↔−, ×↔÷).",
        "Function machine: trace input → output forward; reverse operations to go backwards."
      ]
    },

    "Ratio & proportion": {
      title: "Ratio & Proportion",
      keyIdea: "A ratio compares two quantities; to simplify, divide both parts by their highest common factor.",
      body: `RATIO
A ratio compares two (or more) quantities of the same type. It is written with a colon: 4 : 2 means "4 parts to 2 parts."

SIMPLIFYING RATIOS
A ratio is in its simplest form when the numbers share no common factor other than 1. To simplify, find the HCF (highest common factor) of both numbers and divide both by it.

Example: Simplify 4 : 2
HCF of 4 and 2 is 2. Divide both: 4 ÷ 2 = 2, 2 ÷ 2 = 1.
Simplified: 2 : 1.

Example: Simplify 15 : 5
HCF is 5. 15 ÷ 5 = 3, 5 ÷ 5 = 1.
Simplified: 3 : 1.

SHARING IN A RATIO
To share an amount in a ratio:
Step 1: Find the total number of parts (add the ratio numbers).
Step 2: Divide the amount by the total number of parts to find the value of one part.
Step 3: Multiply each ratio number by the value of one part.

Example: Share £30 in the ratio 2 : 1.
Total parts = 2 + 1 = 3.
One part = £30 ÷ 3 = £10.
Shares: £10 × 2 = £20 and £10 × 1 = £10.

PROPORTION
Proportion is about equivalent relationships — if 3 pencils cost 90p, then 1 pencil costs 30p (÷3) and 6 pencils cost 180p (×2). This is the unitary method: find the value of one unit first.

CHECK: the parts of a shared ratio must add back to the original total (£20 + £10 = £30 ✓).`,
      workedExample: {
        problem: "Simplify the ratio 15 : 5.",
        solution: "HCF of 15 and 5 is 5. Divide both by 5: 15 ÷ 5 = 3, 5 ÷ 5 = 1. Simplified ratio: 3 : 1."
      },
      commonMistakes: [
        "Only dividing one side of the ratio — both numbers must be divided by the same HCF.",
        "When sharing in a ratio, forgetting to find the total number of parts before dividing.",
        "Confusing ratio with fraction: the ratio 3 : 1 means 3/4 of the total is in the first share, not 3/1."
      ],
      keyFacts: [
        "Simplify a ratio by dividing BOTH parts by their HCF.",
        "Sharing: total parts = sum of ratio; one part = total ÷ number of parts.",
        "Always check: shares must add back to the original total.",
        "Unitary method (proportion): find the value of 1 unit first, then scale up or down."
      ]
    },

  }, // end ks2

  // ─── KS3 Maths & Physics ───────────────────────────────────────────────────
  ks3: {

    "Number": {
      title: "Number: Percentages, Factors & Negative Numbers",
      keyIdea: "Percentages, factors, and negative numbers are the three number skills that unlock almost everything in KS3 — master the 10% trick and the rest follows.",
      body: `PERCENTAGES OF AMOUNTS
The fastest method: find 10% first (divide by 10), then build the percentage you need from that.

Examples:
10% of 160 = 160 ÷ 10 = 16
30% of 400 → 10% = 40, so 30% = 40 × 3 = 120
15% of 200 → 10% = 20, 5% = 10, so 15% = 30

For any percentage: convert to a decimal and multiply.
35% of 80 = 0.35 × 80 = 28.

FACTORS, MULTIPLES & PRIMES
Factor: a whole number that divides exactly into another. Factors of 12: 1, 2, 3, 4, 6, 12.
Multiple: the result of multiplying a number by a positive integer. Multiples of 7: 7, 14, 21, 28 ...
Prime: a number with exactly two factors — 1 and itself. Primes: 2, 3, 5, 7, 11, 13, 17, 19 ... (1 is NOT prime).
HCF (Highest Common Factor): the largest factor shared by two numbers.
LCM (Lowest Common Multiple): the smallest multiple common to both numbers.

NEGATIVE NUMBERS
Number line: negative numbers are to the left of zero. −5 < −2 < 0 < 3.
Adding a negative: same as subtracting. 8 + (−3) = 8 − 3 = 5.
Subtracting a negative: same as adding. 8 − (−3) = 8 + 3 = 11.
Multiplying/dividing: same signs → positive. Different signs → negative.
(−4) × (−3) = +12.   (−4) × 3 = −12.

ORDER OF OPERATIONS — BIDMAS
Brackets → Indices → Division/Multiplication (left to right) → Addition/Subtraction (left to right).`,
      workedExample: {
        problem: "What is 30% of 400?",
        solution: "Find 10%: 400 ÷ 10 = 40. Multiply by 3: 40 × 3 = 120."
      },
      commonMistakes: [
        "Finding 10% and forgetting to multiply — 10% of 400 is 40, so 30% is 3 × 40 = 120, not just 40.",
        "Subtracting a negative incorrectly — two negatives make a positive: 5 − (−2) = 7.",
        "Thinking 1 is a prime number — it has only one factor, so it does not qualify."
      ],
      keyFacts: [
        "10% of any number = divide by 10. Build other percentages from this.",
        "Percentage as decimal: 35% = 0.35. Multiply by the amount.",
        "Same signs when multiplying/dividing → positive. Different signs → negative.",
        "BIDMAS: Brackets, Indices, Division/Multiplication, Addition/Subtraction.",
        "Prime numbers have exactly 2 factors: 1 and themselves. 1 is not prime."
      ]
    },

    "Algebra": {
      title: "Solving Equations & Forming Expressions",
      keyIdea: "An equation is a balance — whatever you do to one side, you must do to the other side to keep it equal.",
      body: `SOLVING ONE-STEP EQUATIONS
To find the unknown, apply the inverse (opposite) operation to both sides.
x + 7 = 12  →  x = 12 − 7 = 5
3x = 21     →  x = 21 ÷ 3 = 7

SOLVING TWO-STEP EQUATIONS
Undo the operations in reverse order (BIDMAS in reverse):
First undo + or −, then undo × or ÷.

Example: 2x + 17 = 31
Step 1: Subtract 17 from both sides: 2x = 31 − 17 = 14
Step 2: Divide both sides by 2:       x = 14 ÷ 2 = 7

Example: 3x + 14 = 47
Step 1: 3x = 47 − 14 = 33
Step 2: x = 33 ÷ 3 = 11

Always CHECK: substitute your answer back into the original equation.
2(7) + 17 = 14 + 17 = 31 ✓

COLLECTING LIKE TERMS
Like terms share the same letter part. Combine their coefficients.
3x + 5x = 8x      4a + 2b − a = 3a + 2b      x² and x are NOT like terms.

EXPANDING BRACKETS
Multiply everything inside the bracket by the term outside.
3(x + 4) = 3x + 12        −2(y − 5) = −2y + 10

SUBSTITUTION
Replace the letter with its value and calculate.
If x = 4: 3x + 5 = 3(4) + 5 = 12 + 5 = 17.

FORMING EQUATIONS FROM WORDS
"I think of a number, double it, and add 5. The result is 17."
→ 2n + 5 = 17 → n = 6.`,
      workedExample: {
        problem: "Solve for x: 2x + 17 = 31",
        solution: "Subtract 17: 2x = 14. Divide by 2: x = 7. Check: 2(7) + 17 = 31 ✓"
      },
      commonMistakes: [
        "Subtracting before dividing but forgetting to undo ALL operations — work in reverse BIDMAS order.",
        "Sign errors when expanding brackets with a negative outside: −2(x − 3) = −2x + 6, not −2x − 6.",
        "Combining unlike terms — 3x + 4y cannot be simplified because x and y are different variables."
      ],
      keyFacts: [
        "To solve an equation: apply inverse operations to both sides, undoing in reverse order.",
        "Always check your answer by substituting back into the original equation.",
        "Expanding: multiply each term inside the bracket by the term outside.",
        "Like terms: same letter and same power only.",
        "Form an equation by translating the word problem, then solve normally."
      ]
    },

    "Geometry & measures": {
      title: "Area, Perimeter & Angles",
      keyIdea: "Perimeter is the distance around a shape; area is the space inside — and angles in polygons always add to a fixed, predictable total.",
      body: `PERIMETER
The total length of all sides added together.
Rectangle: P = 2(l + w)
Example: 17 cm × 13 cm → P = 2(17 + 13) = 2 × 30 = 60 cm.

AREA
Rectangle: A = length × width
Triangle: A = ½ × base × height  (height must be perpendicular to the base)
Parallelogram: A = base × perpendicular height

Example — rectangle 17 cm × 13 cm: A = 17 × 13 = 221 cm²
Example — triangle, base 10 cm, height 6 cm: A = ½ × 10 × 6 = 30 cm²

Always include the correct units: cm², m², etc.

ANGLES
Angles on a straight line: sum to 180°.
Angles around a point: sum to 360°.
Vertically opposite angles (formed where two lines cross): are equal.
Angles in a triangle: sum to 180°.
Angles in a quadrilateral: sum to 360°.
Interior angles of a regular polygon: sum = (n − 2) × 180°, so each = (n − 2) × 180° ÷ n.

PARALLEL LINES (crossed by a transversal):
Alternate angles (Z-angles): equal.
Corresponding angles (F-angles): equal.
Co-interior angles (C-angles): add to 180°.

VOLUME (cuboid)
V = length × width × height. Units: cm³ or m³.

Tip: in any geometry problem, write down the rule you are using before calculating.`,
      workedExample: {
        problem: "A rectangle is 17 cm by 13 cm. What is its area in cm²?",
        solution: "Area = length × width = 17 × 13 = 221 cm²."
      },
      commonMistakes: [
        "Confusing perimeter (distance around) with area (space inside) — perimeter is in cm, area is in cm².",
        "Using the slant height instead of the perpendicular height in the triangle area formula.",
        "Forgetting to square the units for area (write cm², not cm)."
      ],
      keyFacts: [
        "Area of rectangle = l × w.  Area of triangle = ½ × b × h.",
        "Perimeter of rectangle = 2(l + w).",
        "Angles in a triangle = 180°. Angles in a quadrilateral = 360°.",
        "Alternate angles are equal; co-interior angles add to 180°.",
        "Volume of cuboid = l × w × h."
      ]
    },

    "Ratio & proportion": {
      title: "Ratio, Proportion & Percentage Change",
      keyIdea: "Ratio compares parts to parts; proportion compares a part to the whole — both are solved by finding the value of one unit first.",
      body: `SHARING IN A RATIO
Step 1: Add the ratio parts to find the total number of shares.
Step 2: Divide the amount by the total number of shares (value of 1 part).
Step 3: Multiply each ratio number by the value of 1 part.

Example: Share £36 in the ratio 2 : 1.
Total parts: 2 + 1 = 3. One part: £36 ÷ 3 = £12.
Shares: £24 and £12. (Check: 24 + 12 = 36 ✓)

Example: Share £35 in the ratio 4 : 1.
Total: 5 parts. One part: £35 ÷ 5 = £7.
Shares: £28 and £7.

EQUIVALENT RATIOS
Ratios scale like fractions — multiply or divide both parts by the same number.
2 : 3 = 4 : 6 = 10 : 15.
Simplify by dividing by the HCF: 18 : 24 → HCF = 6 → 3 : 4.

THE UNITARY METHOD (proportion)
Find the value of ONE, then scale.
5 items cost £8.50 → 1 item costs £1.70 → 9 items cost £15.30.

DIRECT PROPORTION
As one quantity increases, the other increases at the same rate (y = kx). Graph: straight line through the origin.

PERCENTAGE INCREASE AND DECREASE
% increase = (increase ÷ original) × 100
New value after increase = original × (1 + rate/100)
New value after decrease = original × (1 − rate/100)

Example: increase £80 by 15%.
Multiplier = 1.15. New value = 80 × 1.15 = £92.`,
      workedExample: {
        problem: "Share £36 in the ratio 2 : 1. How much is the smaller share?",
        solution: "Total parts: 2 + 1 = 3. One part: £36 ÷ 3 = £12. Smaller share (1 part): £12."
      },
      commonMistakes: [
        "Dividing the total by one of the ratio numbers instead of the sum of the ratio parts.",
        "Giving the larger share when the question asks for the smaller — read the question carefully.",
        "Forgetting to verify: the two shares must add back to the original total."
      ],
      keyFacts: [
        "Sharing in a ratio: find total parts first (add ratio numbers), divide, then multiply.",
        "Simplify ratios by dividing both parts by the HCF.",
        "Unitary method: find the value of 1 unit, then scale to any amount.",
        "% increase multiplier = 1 + (rate/100). % decrease multiplier = 1 − (rate/100)."
      ]
    },

    "Statistics & probability": {
      title: "Averages, Spread & Probability",
      keyIdea: "Averages summarise data with a single representative value; probability measures how likely an event is on a scale from 0 (impossible) to 1 (certain).",
      body: `THE FOUR AVERAGES
Mean: total ÷ count. Best for numerical data with no extreme outliers.
Median: middle value when data is ordered. For an even count, average the two middle values.
Mode: the most frequently occurring value. A data set can have more than one mode, or none.
Range: max − min. Measures spread, not average.

Example: 12, 10, 12, 2
Mean: (12 + 10 + 12 + 2) ÷ 4 = 36 ÷ 4 = 9
Median: order → 2, 10, 12, 12. Middle two: 10 and 12. Median = (10 + 12) ÷ 2 = 11.
Mode: 12 (appears twice).
Range: 12 − 2 = 10.

CHOOSING THE RIGHT AVERAGE
Use mean for most numerical data. Use median when there are outliers (extreme values that skew the mean). Use mode for categorical data (e.g., most popular shoe size).

PROBABILITY
Probability of an event = (number of favourable outcomes) ÷ (total number of equally likely outcomes).
P(event) is always between 0 and 1.
P(event does not happen) = 1 − P(event).

Example: A bag has 3 red and 7 blue balls. P(red) = 3/10.

LISTING OUTCOMES
For combined events (e.g., two coins), list all outcomes systematically:
HH, HT, TH, TT → 4 outcomes. P(exactly one head) = 2/4 = 1/2.

Relative frequency (experimental probability):
Relative frequency = number of successful trials ÷ total trials.
As the number of trials increases, relative frequency approaches the true probability.`,
      workedExample: {
        problem: "Find the mean of 12, 10, 12, 2.",
        solution: "Total = 12 + 10 + 12 + 2 = 36. Count = 4. Mean = 36 ÷ 4 = 9."
      },
      commonMistakes: [
        "Finding the median without ordering the data first — always sort from smallest to largest.",
        "Confusing mean and median — mean is total ÷ count; median is the physical middle value.",
        "Writing probability greater than 1 — it is always between 0 and 1 inclusive."
      ],
      keyFacts: [
        "Mean = total ÷ count. Median = middle (order first). Mode = most frequent. Range = max − min.",
        "For even-count median: average the two middle values.",
        "P(event) = favourable outcomes ÷ total outcomes.",
        "P(not A) = 1 − P(A).",
        "Probability is always between 0 and 1."
      ]
    },

    // ── KS3 Physics ────────────────────────────────────────────────────────────

    "Forces": {
      title: "Forces & Weight",
      keyIdea: "A force is a push or pull measured in newtons — weight is the gravitational force on a mass, and they are connected by a single formula.",
      body: `WHAT IS A FORCE?
A force is a push or pull that can change an object's speed, direction, or shape. Forces are measured in newtons (N) and are drawn as arrows showing direction and magnitude.

WEIGHT vs MASS
Mass is the amount of matter in an object, measured in kilograms (kg). Mass does not change wherever you are.
Weight is the gravitational force pulling an object downward, measured in newtons (N). Weight depends on gravitational field strength (g).

W = m × g

On Earth: g = 10 N/kg (use whichever value the question gives).
On the Moon: g ≈ 1.6 N/kg. A 60 kg person weighs 600 N on Earth but only 96 N on the Moon — same mass, different weight.

Example: mass = 46 kg, g = 10 N/kg.
Weight = 46 × 10 = 460 N.

BALANCED AND UNBALANCED FORCES
If all forces on an object balance (resultant force = 0 N), the object is either stationary or moving at constant velocity (Newton's First Law).
If the resultant force is non-zero, the object accelerates in the direction of the resultant force (Newton's Second Law: F = ma).

FORCE DIAGRAMS (free body diagrams)
Draw one arrow per force. Arrow length is proportional to force size. Label each arrow with its name and magnitude.

Common forces:
Friction: opposes motion, acts along the contact surface.
Normal (contact) force: acts perpendicular to a surface.
Air resistance (drag): opposes motion through air; increases with speed.`,
      workedExample: {
        problem: "An object has a mass of 46 kg. What is its weight on Earth? (g = 10 N/kg)",
        solution: "W = m × g = 46 × 10 = 460 N."
      },
      commonMistakes: [
        "Saying mass and weight are the same — mass is in kg, weight is in N; they are different quantities.",
        "Using g = 9.8 when the question specifies g = 10, or vice versa — always use the value given.",
        "Forgetting that a stationary object on a table has balanced forces, not zero forces."
      ],
      keyFacts: [
        "Weight (N) = mass (kg) × gravitational field strength (N/kg). W = mg.",
        "On Earth g = 10 N/kg (or 9.8 — use value given in question).",
        "Mass is fixed; weight depends on gravitational field.",
        "Balanced forces → constant velocity (or stationary). Unbalanced → acceleration.",
        "Newton's Second Law: F = ma."
      ]
    },

    "Energy": {
      title: "Energy, Power & Energy Transfer",
      keyIdea: "Energy cannot be created or destroyed — it is transferred between stores; power tells you how quickly that transfer happens.",
      body: `ENERGY STORES
Energy exists in different stores: kinetic, gravitational potential, elastic potential, thermal, chemical, nuclear, and electromagnetic. Energy is measured in joules (J).

ENERGY TRANSFERS
Energy is transferred by:
• Mechanical work (a force moving through a distance): W = F × d
• Heating (conduction, convection, radiation)
• Electrical current
• Waves (light, sound)

POWER
Power is the rate of energy transfer — how much energy is transferred per second.

P = E ÷ t

P = power (watts, W)
E = energy (joules, J)
t = time (seconds, s)

1 watt = 1 joule per second.

Example: A 25 W device runs for 4 s.
Energy transferred = P × t = 25 × 4 = 100 J.

Example: A device uses 700 J at 50 W.
Time = E ÷ P = 700 ÷ 50 = 14 s.

EFFICIENCY
Efficiency = (useful energy output ÷ total energy input) × 100%.
No device is 100% efficient — some energy is always dissipated as thermal energy (wasted heat).

CONSERVATION OF ENERGY
Total energy in a closed system is always conserved. Energy cannot be created or destroyed, only transferred from one store to another.

GRAVITATIONAL POTENTIAL ENERGY (GPE)
GPE = m × g × h   (mass × gravitational field strength × height)`,
      workedExample: {
        problem: "A 25 W device runs for 4 s. How much energy does it transfer?",
        solution: "E = P × t = 25 × 4 = 100 J."
      },
      commonMistakes: [
        "Confusing energy (J) and power (W) — power is the RATE of energy transfer, not energy itself.",
        "Using minutes instead of seconds in the power formula — always convert time to seconds first.",
        "Saying energy is 'used up' — energy is conserved; it is transferred or dissipated, never destroyed."
      ],
      keyFacts: [
        "P = E ÷ t  (power = energy ÷ time). Rearranges to E = P × t and t = E ÷ P.",
        "Power is in watts (W); energy is in joules (J); time is in seconds (s).",
        "1 W = 1 J/s.",
        "Efficiency = (useful output ÷ total input) × 100%.",
        "Energy is conserved — never created or destroyed."
      ]
    },

    "Waves": {
      title: "Wave Properties & the Wave Equation",
      keyIdea: "All waves transfer energy without transferring matter — and speed, frequency, and wavelength are always connected by one equation: v = fλ.",
      body: `TYPES OF WAVES
Transverse waves: oscillations are perpendicular to the direction of energy transfer.
Examples: light, water waves, all electromagnetic waves.
Longitudinal waves: oscillations are parallel to the direction of energy transfer (compressions and rarefactions).
Example: sound.

KEY WAVE PROPERTIES
Wavelength (λ): distance between two consecutive identical points on a wave (e.g., crest to crest). Measured in metres (m).
Frequency (f): number of complete waves passing a point per second. Measured in hertz (Hz). 1 Hz = 1 wave/second.
Amplitude: maximum displacement from the rest position. Determines energy/loudness.
Wave speed (v): how fast the wave travels through a medium. Measured in m/s.

THE WAVE EQUATION
v = f × λ

Rearranged:
f = v ÷ λ
λ = v ÷ f

Example: frequency = 5 Hz, wavelength = 2 m.
Wave speed = 5 × 2 = 10 m/s.

Example: speed = 1,000 m/s, frequency = 1,000 Hz.
Wavelength = 1,000 ÷ 1,000 = 1 m.

THE ELECTROMAGNETIC SPECTRUM (increasing frequency):
Radio → Microwave → Infrared → Visible light → Ultraviolet → X-rays → Gamma rays.
All travel at the speed of light in a vacuum: c = 3 × 10⁸ m/s.

REFLECTION AND REFRACTION
Reflection: angle of incidence = angle of reflection (both from the normal).
Refraction: bending of a wave as it crosses a boundary due to a change in speed.`,
      workedExample: {
        problem: "A wave travels at 10 m/s with wavelength 2 m. What is its frequency?",
        solution: "f = v ÷ λ = 10 ÷ 2 = 5 Hz."
      },
      commonMistakes: [
        "Mixing up frequency and wavelength — higher frequency means shorter wavelength (inversely proportional at constant speed).",
        "Measuring wavelength from crest to trough — wavelength is crest to crest (one full cycle).",
        "Forgetting to convert units before using v = fλ — speed in m/s, wavelength in m, frequency in Hz."
      ],
      keyFacts: [
        "v = f × λ  (speed = frequency × wavelength).",
        "Frequency (Hz) = waves per second. Wavelength (m) = length of one full cycle.",
        "Transverse: oscillation perpendicular to travel. Longitudinal: oscillation parallel to travel.",
        "Higher frequency → shorter wavelength (at constant speed).",
        "All EM waves travel at 3 × 10⁸ m/s in a vacuum."
      ]
    },

    "Electricity": {
      title: "Electrical Circuits & Ohm's Law",
      keyIdea: "Voltage pushes current through resistance — and Ohm's Law (V = IR) is the single equation that ties all three together.",
      body: `KEY QUANTITIES
Voltage (V): the electrical 'push' that drives current around a circuit. Measured in volts (V). Also called potential difference.
Current (I): the rate of flow of electric charge. Measured in amperes (amps, A).
Resistance (R): how much a component opposes the flow of current. Measured in ohms (Ω).

OHM'S LAW
V = I × R

Rearranged:
I = V ÷ R
R = V ÷ I

Memory triangle: write V on top, I and R on the bottom. Cover the quantity you want to find.

Example: V = 25 V, R = 5 Ω. Find current.
I = V ÷ R = 25 ÷ 5 = 5 A.

Example: V = 16 V, R = 8 Ω.
I = 16 ÷ 8 = 2 A.

SERIES CIRCUITS
• Same current flows through every component.
• Total resistance = sum of individual resistances.
• Voltage is shared between components.

PARALLEL CIRCUITS
• Voltage is the same across every branch.
• Total current = sum of branch currents.
• Total resistance is less than the smallest individual resistance.

POWER IN A CIRCUIT
P = I × V   (power = current × voltage)

CHARGE, CURRENT, AND TIME
Q = I × t   (charge = current × time)
Charge is measured in coulombs (C).

Circuit symbols to know: cell, battery, switch (open/closed), bulb, resistor, voltmeter, ammeter.`,
      workedExample: {
        problem: "A voltage of 25 V is applied across a 5 Ω resistor. What is the current?",
        solution: "I = V ÷ R = 25 ÷ 5 = 5 A."
      },
      commonMistakes: [
        "Inverting the formula — I = V ÷ R, not I = R ÷ V. Use the memory triangle.",
        "Confusing voltage and current — voltage is measured across components (voltmeter in parallel); current is measured in series (ammeter in series).",
        "In a series circuit, adding voltages rather than resistances when finding total resistance."
      ],
      keyFacts: [
        "V = I × R  (Ohm's Law). Rearranges to I = V/R and R = V/I.",
        "Series: current same everywhere; voltages add; resistances add.",
        "Parallel: voltage same across each branch; currents add.",
        "P = IV  (power in watts).",
        "Q = It  (charge in coulombs)."
      ]
    },

    "Matter & Space": {
      title: "Density, States of Matter & Space",
      keyIdea: "Density tells you how much mass is packed into a given volume — and the three states of matter differ in how tightly particles are packed and how freely they move.",
      body: `DENSITY
Density = mass ÷ volume

ρ = m ÷ V

ρ = density (g/cm³ or kg/m³)
m = mass (g or kg)
V = volume (cm³ or m³)

Rearranged:
m = ρ × V
V = m ÷ ρ

Example: density = 2 g/cm³, mass = 8 g.
Volume = 8 ÷ 2 = 4 cm³.

Example: density = 4 g/cm³, volume = 19 cm³.
Mass = 4 × 19 = 76 g.

Objects float if their density is less than the fluid they are in. Ice (≈ 0.92 g/cm³) floats on water (1.0 g/cm³) because it is less dense.

STATES OF MATTER
Solid: particles tightly packed in a fixed regular arrangement. Vibrate in place. Fixed shape and volume.
Liquid: particles close together but free to move past each other. Fixed volume, no fixed shape.
Gas: particles far apart, moving rapidly and randomly. No fixed shape or volume.

Changes of state: melting (solid → liquid), freezing (liquid → solid), evaporation/boiling (liquid → gas), condensation (gas → liquid), sublimation (solid → gas directly).

THE PARTICLE MODEL
Temperature reflects the average kinetic energy of particles. Heating increases kinetic energy — particles move faster, causing expansion or a change of state.

THE SOLAR SYSTEM AND SPACE
Order from the Sun: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune.
A galaxy is a vast collection of stars. Our galaxy is the Milky Way. The universe contains billions of galaxies.
Light-year: the distance light travels in one year (≈ 9.5 × 10¹⁵ m).`,
      workedExample: {
        problem: "An object of density 2 g/cm³ has mass 8 g. What is its volume?",
        solution: "V = m ÷ ρ = 8 ÷ 2 = 4 cm³."
      },
      commonMistakes: [
        "Inverting the density formula — density = mass ÷ volume, so volume = mass ÷ density (use the formula triangle).",
        "Using inconsistent units — if density is in g/cm³, mass must be in g and volume in cm³.",
        "Confusing mass (kg) with weight (N) — density uses mass, not weight."
      ],
      keyFacts: [
        "ρ = m ÷ V. Rearranges to m = ρV and V = m ÷ ρ.",
        "Units: g/cm³ or kg/m³. Keep units consistent throughout.",
        "Objects less dense than a fluid float; denser objects sink.",
        "Solid → fixed shape and volume. Liquid → fixed volume. Gas → neither fixed.",
        "Temperature measures average kinetic energy of particles."
      ]
    },

  }, // end ks3


  // ─── GCSE Maths & Physics ──────────────────────────────────────────────────
  gcse: {

    "Number": {
      title: "Number: Standard Form, Indices & Surds",
      keyIdea: "Standard form is a compact way to write very large or very small numbers — and indices are the rules that make it all work.",
      body: `STANDARD FORM
Standard form (scientific notation) writes any number as:
A × 10ⁿ  where  1 ≤ A < 10  and n is an integer.

To convert a large number: count how many places the decimal point moves left.
3,000 = 3.0 × 10³     (point moves 3 places left)
1,300 = 1.3 × 10³

To convert a small number: count how many places the decimal point moves right.
0.0045 = 4.5 × 10⁻³   (point moves 3 places right)

Multiplying in standard form: multiply the A-parts, add the powers.
(3 × 10⁴) × (2 × 10³) = 6 × 10⁷

Dividing: divide the A-parts, subtract the powers.
(6 × 10⁸) ÷ (2 × 10³) = 3 × 10⁵

INDICES (LAWS OF POWERS)
aᵐ × aⁿ = aᵐ⁺ⁿ       (multiply → add powers)
aᵐ ÷ aⁿ = aᵐ⁻ⁿ       (divide → subtract powers)
(aᵐ)ⁿ = aᵐⁿ          (power of a power → multiply)
a⁰ = 1                (anything to the power 0 = 1)
a⁻ⁿ = 1/aⁿ           (negative power → reciprocal)
a^(1/n) = ⁿ√a         (fraction power → nth root)

HCF AND LCM (using prime factorisation)
Write each number as a product of primes (factor tree or repeated division).
HCF = product of shared prime factors (lowest powers).
LCM = product of all prime factors (highest powers).

Example: HCF and LCM of 12 and 18.
12 = 2² × 3    18 = 2 × 3²
HCF = 2¹ × 3¹ = 6     LCM = 2² × 3² = 36`,
      workedExample: {
        problem: "Write 3,000 in standard form.",
        solution: "3,000 = 3.0 × 10³. (The decimal point moves 3 places to the left, so the power is +3.)"
      },
      commonMistakes: [
        "Writing A outside the range 1 ≤ A < 10 — e.g., 13 × 10² is NOT standard form; it should be 1.3 × 10³.",
        "Adding powers when you should multiply the A-parts — multiplying in standard form: multiply A-values AND add powers.",
        "Confusing negative powers with negative numbers — 3 × 10⁻² = 0.03, not −300."
      ],
      keyFacts: [
        "Standard form: A × 10ⁿ where 1 ≤ A < 10.",
        "Large numbers → positive power; small numbers (< 1) → negative power.",
        "aᵐ × aⁿ = aᵐ⁺ⁿ.  aᵐ ÷ aⁿ = aᵐ⁻ⁿ.  (aᵐ)ⁿ = aᵐⁿ.",
        "a⁰ = 1.  a⁻ⁿ = 1/aⁿ.  a^(1/2) = √a.",
        "HCF: shared prime factors (lowest powers). LCM: all prime factors (highest powers)."
      ]
    },

    "Algebra": {
      title: "Algebra: Expanding, Factorising & Solving",
      keyIdea: "Expanding removes brackets; factorising puts them back — and both are essential tools for solving quadratics and simplifying expressions.",
      body: `EXPANDING DOUBLE BRACKETS
Use FOIL (First, Outer, Inner, Last) or the grid method.
(x + 6)(x + 1) = x² + x + 6x + 6 = x² + 7x + 6
(x + 5)(x + 2) = x² + 2x + 5x + 10 = x² + 7x + 10
(x − 3)(x + 4) = x² + 4x − 3x − 12 = x² + x − 12

Difference of two squares: (a + b)(a − b) = a² − b²
(x + 5)(x − 5) = x² − 25

FACTORISING QUADRATICS (form x² + bx + c)
Find two numbers that multiply to c AND add to b.
x² + 7x + 6 → find two numbers × to 6, + to 7: they are 1 and 6.
x² + 7x + 6 = (x + 1)(x + 6)

For ax² + bx + c (a ≠ 1), use the ac method or completing the square.

COMPLETING THE SQUARE
x² + bx + c = (x + b/2)² − (b/2)² + c
x² − 4x + 11 = (x − 2)² − 4 + 11 = (x − 2)² + 7

SOLVING QUADRATICS
By factorising: set each bracket = 0.
x² + 7x + 6 = 0 → (x + 1)(x + 6) = 0 → x = −1 or x = −6

Quadratic formula: x = (−b ± √(b² − 4ac)) / 2a

SIMULTANEOUS EQUATIONS
Elimination: multiply to make coefficients equal, then add or subtract.
Substitution: rearrange one equation, substitute into the other.

NTH TERM OF A SEQUENCE
Linear: nth term = dn + (a − d), where d = common difference, a = first term.
Example: 3, 7, 11, 15 … → d = 4, a = 3 → nth term = 4n − 1.`,
      workedExample: {
        problem: "Expand and simplify: (x + 6)(x + 1)",
        solution: "F: x×x = x². O: x×1 = x. I: 6×x = 6x. L: 6×1 = 6. Combine: x² + x + 6x + 6 = x² + 7x + 6."
      },
      commonMistakes: [
        "Forgetting the middle terms when expanding — FOIL produces FOUR terms before simplifying.",
        "Sign errors when factorising — always check by expanding your answer back out.",
        "In completing the square, subtracting (b/2)² twice instead of once — write (x + b/2)² then adjust the constant."
      ],
      keyFacts: [
        "(x + a)(x + b) = x² + (a+b)x + ab.",
        "Difference of two squares: (a+b)(a−b) = a² − b².",
        "Completing the square: x² + bx = (x + b/2)² − (b/2)².",
        "Quadratic formula: x = (−b ± √(b²−4ac)) / 2a.",
        "nth term of linear sequence = dn + (a − d) where d = common difference."
      ]
    },

    "Geometry & measures": {
      title: "Geometry: Pythagoras, Trigonometry & Circle Theorems",
      keyIdea: "Pythagoras links the three sides of a right-angled triangle; SOHCAHTOA links sides to angles — together they solve almost any triangle problem.",
      body: `PYTHAGORAS' THEOREM
In a right-angled triangle: a² + b² = c²
where c is the hypotenuse (longest side, opposite the right angle).

Finding the hypotenuse: c = √(a² + b²)
Finding a shorter side: a = √(c² − b²)

Example: hypotenuse 41 cm, one side 9 cm.
Other side = √(41² − 9²) = √(1681 − 81) = √1600 = 40 cm.

TRIGONOMETRY — SOHCAHTOA
Label sides relative to the angle θ: Opposite (O), Adjacent (A), Hypotenuse (H).
sin θ = O/H     cos θ = A/H     tan θ = O/A

To find a side: rearrange (e.g., O = H × sin θ).
To find an angle: use the inverse function (e.g., θ = sin⁻¹(O/H)).

AREA FORMULAS
Triangle: ½ab sin C  (when two sides and included angle are known)
Circle: A = πr²      Circumference: C = 2πr
Sector area: (θ/360) × πr²     Arc length: (θ/360) × 2πr
Trapezium: ½(a + b)h

VOLUMES
Cylinder: V = πr²h     Cone: V = ⅓πr²h     Sphere: V = (4/3)πr³

CIRCLE THEOREMS (key ones)
• Angle in a semicircle = 90°.
• Angles in the same segment are equal.
• Opposite angles of a cyclic quadrilateral sum to 180°.
• Tangent to a circle is perpendicular to the radius at the point of contact.

TRANSFORMATIONS
Enlargement: all lengths multiplied by scale factor k; area multiplied by k².
Vectors describe translations: (a/b) means a right, b up.`,
      workedExample: {
        problem: "A right-angled triangle has hypotenuse 41 cm and one side 9 cm. Find the other side.",
        solution: "a = √(41² − 9²) = √(1681 − 81) = √1600 = 40 cm."
      },
      commonMistakes: [
        "Adding a² + b² when finding a shorter side — for a shorter side you must SUBTRACT: a² = c² − b².",
        "Labelling Opposite and Adjacent incorrectly — they swap depending on which angle you are working from.",
        "Using diameter instead of radius in circle formulae — always halve the diameter first."
      ],
      keyFacts: [
        "Pythagoras: a² + b² = c² (c = hypotenuse).",
        "SOHCAHTOA: sin = O/H, cos = A/H, tan = O/A.",
        "Circle: area = πr², circumference = 2πr.",
        "Cylinder volume = πr²h. Cone = ⅓πr²h. Sphere = (4/3)πr³.",
        "Angle in a semicircle = 90°."
      ]
    },

    "Ratio, proportion & rates of change": {
      title: "Ratio, Proportion & Rates of Change",
      keyIdea: "Any ratio or proportion problem reduces to finding the value of one part — do that first and every other quantity follows immediately.",
      body: `THREE-PART RATIOS
Exactly the same method as two-part ratios — add all the parts first.

Example: Share £27 in the ratio 1 : 3 : 5.
Total parts: 1 + 3 + 5 = 9. One part: £27 ÷ 9 = £3.
Shares: £3, £9, £15. Largest share = £15.
Check: 3 + 9 + 15 = 27 ✓

DIRECT AND INVERSE PROPORTION
Direct proportion: y = kx. As x doubles, y doubles. Graph: straight line through origin.
Inverse proportion: y = k/x. As x doubles, y halves. Graph: reciprocal curve.

To find k, substitute one known pair of values, then use k to answer the question.

PERCENTAGE CHANGE
% change = (change ÷ original) × 100
Percentage increase/decrease — multiplier method:
Increase by 15% → multiply by 1.15
Decrease by 20% → multiply by 0.80
Reverse percentage: if £92 is after a 15% increase, original = 92 ÷ 1.15

COMPOUND INTEREST
Amount = P × (1 + r/100)ⁿ
P = principal, r = rate %, n = number of periods.
This is different from simple interest (which is P × r × n ÷ 100).

RATES OF CHANGE
Speed = distance ÷ time.  Density = mass ÷ volume.  Pressure = force ÷ area.
On a distance-time graph: gradient = speed.
On a velocity-time graph: gradient = acceleration; area under graph = distance.

BEST BUY / UNIT RATE
Find the price per unit for each option, then compare.
400 g for £2.40 → 0.6p/g.  600 g for £3.30 → 0.55p/g → 600 g is better value.`,
      workedExample: {
        problem: "Share £27 in the ratio 1 : 3 : 5. What is the largest share?",
        solution: "Total parts: 1+3+5 = 9. One part: £27 ÷ 9 = £3. Largest share (5 parts): 5 × £3 = £15."
      },
      commonMistakes: [
        "Forgetting to add ALL ratio parts before dividing — with three parts, add all three.",
        "Using the wrong base for percentage change — always divide by the ORIGINAL value, not the new one.",
        "Applying simple interest logic to compound interest — after year 1 the principal grows, so year 2 interest is larger."
      ],
      keyFacts: [
        "Share in ratio: total parts = sum of all ratio numbers; one part = total ÷ total parts.",
        "% change = (change ÷ original) × 100.",
        "Increase multiplier = 1 + r/100. Decrease multiplier = 1 − r/100.",
        "Compound interest: A = P(1 + r/100)ⁿ.",
        "Direct proportion: y = kx (line through origin). Inverse: y = k/x (reciprocal curve)."
      ]
    },

    "Statistics": {
      title: "Statistics: Averages, Graphs & Interpretation",
      keyIdea: "Statistics is about extracting meaningful information from data — always link your calculation back to what it tells you about the real-world context.",
      body: `AVERAGES FROM LISTED DATA
Mean = total ÷ count.
Median = middle value when ordered (average the two middle values for even count).
Mode = most frequent value. Range = max − min.

Example: 24, 20, 28, 8, 32, 8
Ordered: 8, 8, 20, 24, 28, 32
Mean: (24+20+28+8+32+8) ÷ 6 = 120 ÷ 6 = 20
Median: middle two are 20 and 24 → (20+24) ÷ 2 = 22
Mode: 8   Range: 32 − 8 = 24

AVERAGES FROM FREQUENCY TABLES
Mean = Σ(fx) ÷ Σf  (sum of frequency × midpoint, divided by total frequency)
For grouped data, use the midpoint of each class interval.

SCATTER GRAPHS
Correlation describes the relationship between two variables:
Positive correlation: as x increases, y increases.
Negative correlation: as x increases, y decreases.
No correlation: no pattern.

Line of best fit: drawn through the mean point, with roughly equal numbers of points on each side. Use it to estimate values (interpolation = within data range; extrapolation = outside, less reliable).

CUMULATIVE FREQUENCY & BOX PLOTS
Cumulative frequency: running total of frequencies.
Median = value at n/2. Lower quartile (LQ) = n/4. Upper quartile (UQ) = 3n/4.
Interquartile range (IQR) = UQ − LQ. Measures spread; unaffected by outliers.
Box plot: shows min, LQ, median, UQ, max.

HISTOGRAMS (unequal class widths)
Frequency density = frequency ÷ class width. Area of bar = frequency.`,
      workedExample: {
        problem: "Calculate the mean of 24, 20, 28, 8, 32, 8.",
        solution: "Total = 24+20+28+8+32+8 = 120. Count = 6. Mean = 120 ÷ 6 = 20."
      },
      commonMistakes: [
        "Using frequency not frequency × midpoint when calculating the mean from a frequency table.",
        "Drawing the line of best fit through the origin rather than the mean point.",
        "Reading cumulative frequency at n/2 for the median but forgetting to find the corresponding x-value on the graph."
      ],
      keyFacts: [
        "Mean from frequency table: Σ(fx) ÷ Σf.",
        "IQR = upper quartile − lower quartile. More robust to outliers than range.",
        "Histogram: plot frequency DENSITY (= frequency ÷ class width), not frequency.",
        "Line of best fit should pass through (x̄, ȳ) — the mean point.",
        "Interpolation (within data range) is more reliable than extrapolation (outside it)."
      ]
    },

    "Probability": {
      title: "Probability: Single, Combined & Conditional Events",
      keyIdea: "Probability measures chance on a scale from 0 to 1 — for combined events, tree diagrams and Venn diagrams make the structure visible and the arithmetic reliable.",
      body: `BASIC PROBABILITY
P(event) = favourable outcomes ÷ total equally likely outcomes.
P(A) always satisfies 0 ≤ P(A) ≤ 1.
P(not A) = 1 − P(A).   (Complementary events — they cover all possibilities.)

Example: P(event) = 0.57 → P(not event) = 1 − 0.57 = 0.43.

COMBINED EVENTS
AND rule (independent events): P(A and B) = P(A) × P(B)
OR rule (mutually exclusive events): P(A or B) = P(A) + P(B)
General OR rule: P(A or B) = P(A) + P(B) − P(A and B)

TREE DIAGRAMS
Draw one branch per stage. Multiply along branches (AND). Add between branches (OR).
With replacement: probabilities are the same at every stage.
Without replacement: probabilities change at each stage (conditional probability).

Example: bag with 3 red, 7 blue. Draw two without replacement.
P(both red) = (3/10) × (2/9) = 6/90 = 1/15.

VENN DIAGRAMS
Two overlapping circles in a rectangle (the universal set).
The overlap represents elements in BOTH sets (A ∩ B).
P(A ∪ B) = P(A) + P(B) − P(A ∩ B).

CONDITIONAL PROBABILITY
P(A | B) = P(A and B) ÷ P(B).  "Probability of A given B has occurred."
On a tree diagram: read along the correct branch only.

RELATIVE FREQUENCY (experimental probability)
Relative frequency = successes ÷ trials. Approaches theoretical probability as trials → ∞.`,
      workedExample: {
        problem: "The probability of an event is 0.57. What is the probability it does NOT happen?",
        solution: "P(not happening) = 1 − 0.57 = 0.43."
      },
      commonMistakes: [
        "Adding probabilities for AND events (should multiply) and multiplying for OR events (should add for mutually exclusive events).",
        "Forgetting to adjust probabilities after the first draw in without-replacement problems.",
        "Leaving probabilities greater than 1 — this is always wrong; go back and check your working."
      ],
      keyFacts: [
        "P(not A) = 1 − P(A).",
        "Independent AND: P(A and B) = P(A) × P(B). Mutually exclusive OR: P(A or B) = P(A) + P(B).",
        "Tree diagram: multiply along branches; add end probabilities for the same outcome.",
        "Without replacement: reduce numerator and denominator after each pick.",
        "Conditional: P(A|B) = P(A ∩ B) ÷ P(B)."
      ]
    },

    // ── GCSE Physics ──────────────────────────────────────────────────────────

    "Forces & Motion": {
      title: "Forces & Motion: SUVAT and Newton's Laws",
      keyIdea: "Every motion problem — however complex it looks — reduces to connecting displacement, velocity, acceleration, and time through the SUVAT equations.",
      body: `THE SUVAT EQUATIONS
s = displacement (m)
u = initial velocity (m/s)
v = final velocity (m/s)
a = acceleration (m/s²)
t = time (s)

The four equations:
v = u + at
s = ut + ½at²
v² = u² + 2as
s = ½(u + v)t

Strategy: write down what you know, identify what you need, choose the equation that contains only those variables.

Example: u = 20 m/s, a = 9 m/s², t = 4 s. Find v.
v = u + at = 20 + (9 × 4) = 20 + 36 = 56 m/s.

ACCELERATION
a = (v − u) ÷ t    (change in velocity ÷ time)
Deceleration is negative acceleration (a is negative when slowing down).

NEWTON'S LAWS
1st: An object remains stationary or moves at constant velocity unless acted on by a resultant force.
2nd: F = ma. A resultant force causes acceleration in its direction.
3rd: For every action there is an equal and opposite reaction.

WEIGHT, FRICTION AND TERMINAL VELOCITY
Weight = mg (always downward). Friction and air resistance oppose motion.
At terminal velocity: weight = air resistance (resultant force = 0, so acceleration = 0, constant speed).

MOMENTUM
p = mv  (kg m/s). Conservation: total momentum before = total momentum after a collision (in a closed system).
Impulse = F × t = change in momentum.`,
      workedExample: {
        problem: "A car starts at 20 m/s and accelerates at 9 m/s² for 4 s. What is its final velocity?",
        solution: "v = u + at = 20 + (9 × 4) = 20 + 36 = 56 m/s."
      },
      commonMistakes: [
        "Confusing speed (scalar) with velocity (vector) — velocity has a direction; deceleration means a is negative.",
        "Choosing the wrong SUVAT equation — list all known variables first, then pick the equation that fits.",
        "Forgetting that terminal velocity means zero resultant force (not zero force) — forces are balanced, not absent."
      ],
      keyFacts: [
        "v = u + at.  s = ut + ½at².  v² = u² + 2as.  s = ½(u+v)t.",
        "F = ma (Newton's Second Law).",
        "At terminal velocity: driving force = resistive force (net force = 0).",
        "Momentum p = mv. Conserved in all collisions.",
        "Impulse = Ft = Δp (change in momentum)."
      ]
    },

    "Energy": {
      title: "Energy: Kinetic, Potential & Power",
      keyIdea: "Every energy calculation at GCSE uses one of three core equations — KE, GPE, or power — and the skill is knowing which one applies.",
      body: `KINETIC ENERGY (KE)
KE = ½ × m × v²
m = mass (kg), v = speed (m/s), KE in joules (J).

Example: mass = 1 kg, v = 6 m/s.
KE = ½ × 1 × 6² = ½ × 36 = 18 J.

Example: mass = 18 kg, v = 10 m/s.
KE = ½ × 18 × 100 = 900 J.

GRAVITATIONAL POTENTIAL ENERGY (GPE)
GPE = m × g × h
m = mass (kg), g = gravitational field strength (N/kg), h = height (m).
On Earth: g = 10 N/kg (or 9.8 — use value given).

CONSERVATION OF ENERGY
GPE lost = KE gained (for a falling object, ignoring air resistance).
½mv² = mgh → v = √(2gh)

POWER
P = E ÷ t   (energy transferred per second, watts).
P = F × v   (force × velocity — useful for moving objects).

EFFICIENCY
Efficiency = (useful energy output ÷ total energy input) × 100%.
Or using power: efficiency = (useful power output ÷ total power input) × 100%.

SPECIFIC HEAT CAPACITY
E = mcΔT
m = mass (kg), c = specific heat capacity (J/kg°C), ΔT = temperature change (°C).
Water: c = 4,200 J/kg°C.

ELASTIC POTENTIAL ENERGY
Ee = ½ke²
k = spring constant (N/m), e = extension (m). (Hooke's Law: F = ke.)`,
      workedExample: {
        problem: "An object of mass 1 kg moves at 6 m/s. Find its kinetic energy.",
        solution: "KE = ½mv² = ½ × 1 × 6² = ½ × 36 = 18 J."
      },
      commonMistakes: [
        "Forgetting to square the velocity in KE — it is ½mv², not ½mv.",
        "Using weight (N) instead of mass (kg) in energy equations — always check units.",
        "Confusing GPE = mgh with KE = ½mv² — GPE involves height; KE involves speed."
      ],
      keyFacts: [
        "KE = ½mv².  GPE = mgh.  Ee = ½ke².",
        "P = E/t  (and also P = Fv).",
        "Efficiency = (useful output ÷ total input) × 100%.",
        "E = mcΔT (specific heat capacity).",
        "Conservation: energy converts between stores but total is constant."
      ]
    },

    "Waves": {
      title: "Waves: Properties, EM Spectrum & Sound",
      keyIdea: "All waves obey the same equation (v = fλ) and transfer energy — the difference between types is what oscillates and what medium they need.",
      body: `WAVE EQUATION (revision)
v = f × λ    (speed = frequency × wavelength)
f = v ÷ λ    λ = v ÷ f

All EM waves travel at c = 3 × 10⁸ m/s in a vacuum.

THE ELECTROMAGNETIC SPECTRUM
In order of increasing frequency (decreasing wavelength):
Radio → Microwave → Infrared → Visible → Ultraviolet → X-ray → Gamma

Uses:
Radio: broadcasting. Microwave: satellites, cooking. Infrared: thermal imaging, TV remotes.
Visible: sight, photography. UV: sterilisation, detecting fake notes.
X-ray: medical imaging (bone). Gamma: cancer treatment, sterilising equipment.

Hazards: UV causes skin cancer; X-rays and gamma rays ionise cells, damaging DNA.

SOUND WAVES
Longitudinal waves (particles oscillate parallel to direction of travel).
Cannot travel through a vacuum — need a medium (solid, liquid, or gas).
Speed in air ≈ 340 m/s. Speed in solids > speed in liquids > speed in gases.
Frequency determines pitch. Amplitude determines loudness.
Ultrasound (f > 20,000 Hz): used in medical imaging and sonar.

REFLECTION, REFRACTION AND DIFFRACTION
Reflection: angle of incidence = angle of reflection (from the normal).
Refraction: change of speed at a boundary causes bending. Light bends towards the normal when slowing down (entering a denser medium).
Diffraction: waves spread out after passing through a gap or around an obstacle. Most pronounced when gap width ≈ wavelength.

WAVE BEHAVIOUR
Interference: superposition of two waves. Constructive (crests align) or destructive (crest meets trough).`,
      workedExample: {
        problem: "A wave has frequency 5 Hz and wavelength 2 m. What is its speed?",
        solution: "v = f × λ = 5 × 2 = 10 m/s."
      },
      commonMistakes: [
        "Assuming all waves travel at 3 × 10⁸ m/s — only EM waves do; sound travels at ≈ 340 m/s in air.",
        "Confusing transverse (EM, water) and longitudinal (sound) — the distinction often appears in exam questions.",
        "Mixing up refraction and reflection — refraction involves a change in medium and speed; reflection does not."
      ],
      keyFacts: [
        "v = fλ. All EM waves: v = 3 × 10⁸ m/s in vacuum.",
        "EM spectrum (low→high frequency): Radio, Micro, IR, Visible, UV, X-ray, Gamma.",
        "Sound is longitudinal; EM waves are transverse.",
        "Refraction: wave bends toward normal when entering denser medium (slowing down).",
        "Diffraction is greatest when gap width ≈ wavelength."
      ]
    },

    "Electricity": {
      title: "Electricity: Circuits, Power & Domestic Use",
      keyIdea: "Ohm's Law (V = IR) and the power equations (P = IV = I²R = V²/R) are the complete toolkit for any circuit calculation.",
      body: `OHM'S LAW REVISION
V = I × R    I = V/R    R = V/I
(Ohmic conductors obey this at constant temperature.)

POWER EQUATIONS
P = I × V
P = I² × R
P = V² ÷ R

Any two of these give the same answer — choose whichever fits the information given.

Example: current 14 A, voltage 12 V.
P = I × V = 14 × 12 = 168 W.

ENERGY IN CIRCUITS
E = P × t    (energy = power × time, in joules)
E = I × V × t

For electricity bills: energy in kilowatt-hours (kWh) = power (kW) × time (h).
Cost = energy (kWh) × price per kWh.

SERIES AND PARALLEL (revision with numbers)
Series: Iₜₒₜₐₗ = same. Vₜₒₜₐₗ = V₁ + V₂. Rₜₒₜₐₗ = R₁ + R₂.
Parallel: Vₜₒₜₐₗ = same. Iₜₒₜₐₗ = I₁ + I₂. 1/Rₜₒₜₐₗ = 1/R₁ + 1/R₂.

DOMESTIC ELECTRICITY
Mains supply: 230 V AC, 50 Hz in the UK.
AC (alternating current): direction reverses 50 times per second.
DC (direct current): flows in one direction (e.g., batteries).

Three-pin plug wiring:
Live (brown): carries the high-voltage current.
Neutral (blue): completes the circuit at 0 V.
Earth (green/yellow): safety wire — carries current if there is a fault.

Fuses and circuit breakers protect against excessive current. Fuse rating should be just above normal operating current.

CHARGE AND CURRENT
Q = I × t    (coulombs = amps × seconds)`,
      workedExample: {
        problem: "A device draws a current of 14 A from a 12 V supply. What is its power?",
        solution: "P = I × V = 14 × 12 = 168 W."
      },
      commonMistakes: [
        "Forgetting there are three power equations — use P = I²R when voltage is unknown; P = V²/R when current is unknown.",
        "Confusing kWh and joules — for electricity bills use kWh; in circuit calculations use J.",
        "Wiring the plug incorrectly in questions — Live = brown, Neutral = blue, Earth = green/yellow."
      ],
      keyFacts: [
        "P = IV = I²R = V²/R.",
        "E = Pt (joules). Energy in kWh = P(kW) × t(h).",
        "Series: resistances add. Parallel: 1/R = 1/R₁ + 1/R₂.",
        "Mains: 230 V AC, 50 Hz. Plug: Live=brown, Neutral=blue, Earth=green/yellow.",
        "Q = It (charge in coulombs)."
      ]
    },

    "Magnetism & Electromagnetism": {
      title: "Magnetism & Electromagnetism",
      keyIdea: "A current in a magnetic field experiences a force — and that force is the principle behind every electric motor, generator, and transformer.",
      body: `MAGNETIC FIELDS
Magnetic field lines run from north to south outside a magnet. The closer the lines, the stronger the field.
A current-carrying wire creates a circular magnetic field around it.
A solenoid (coil of wire) creates a field like a bar magnet when current flows — the right-hand grip rule gives the north pole direction.

FORCE ON A CURRENT-CARRYING CONDUCTOR
When a current-carrying wire is placed in an external magnetic field:
F = B × I × L

F = force (N), B = magnetic flux density (T), I = current (A), L = length of conductor in the field (m).

This force is maximum when the current is perpendicular to the field.
Fleming's Left-Hand Rule: point the thumb (force/motion), index finger (field), and middle finger (current) at right angles to each other.

Example: length = 1 m, current = 9 A, B = 1 T.
F = 1 × 9 × 1 = 9 N.

THE MOTOR EFFECT
An electric motor uses the force on a current-carrying conductor in a magnetic field. The split-ring commutator reverses current direction every half-turn to keep the coil spinning.

ELECTROMAGNETIC INDUCTION (the generator effect)
Moving a conductor in a magnetic field (or changing the flux through a coil) induces an EMF — and a current if the circuit is complete.
Fleming's Right-Hand Rule gives the direction of induced current.
Increase EMF by: faster movement, stronger magnet, more turns on the coil.

TRANSFORMERS
Step-up transformer: more turns on secondary → higher voltage.
Step-down transformer: fewer turns on secondary → lower voltage.
Vp/Vs = Np/Ns    (voltage ratio = turns ratio)
For an ideal transformer: Vp × Ip = Vs × Is   (power in = power out).`,
      workedExample: {
        problem: "A wire of length 1 m carries current 9 A in a magnetic field of flux density 1 T. Find the force on the wire.",
        solution: "F = BIL = 1 × 9 × 1 = 9 N."
      },
      commonMistakes: [
        "Using Fleming's Left-Hand Rule for generators — left hand is for motors (current → force); right hand is for generators (movement → current).",
        "Forgetting the condition for maximum force — the wire must be perpendicular to the field for F = BIL to give maximum force.",
        "Reversing the transformer ratio — more turns = higher voltage on that side; fewer turns = lower voltage."
      ],
      keyFacts: [
        "F = BIL (force on a current-carrying conductor).",
        "Fleming's Left-Hand Rule: thumb = force, index = field (B), middle = current.",
        "Generator effect: moving conductor in B-field induces EMF.",
        "Transformer: Vp/Vs = Np/Ns. Ideal: VpIp = VsIs.",
        "Increasing coil turns, field strength, or speed increases induced EMF."
      ]
    },

    "Atomic Structure": {
      title: "Atomic Structure & Radioactive Decay",
      keyIdea: "The nucleus contains protons and neutrons; proton number defines the element; mass number counts all nucleons — and unstable nuclei shed particles to become stable.",
      body: `ATOMIC STRUCTURE
Atom: a nucleus (protons + neutrons) surrounded by electrons in shells.
Proton: charge +1, relative mass 1.
Neutron: charge 0, relative mass 1.
Electron: charge −1, relative mass ≈ 0 (negligible).

KEY NUMBERS
Atomic number (proton number, Z): number of protons. Defines the element.
Mass number (nucleon number, A): total number of protons + neutrons.
Number of neutrons = A − Z.

Example: mass number 134, 67 neutrons → atomic number = 134 − 67 = 67.
Example: 21 protons, 36 neutrons → mass number = 21 + 36 = 57.

ISOTOPES
Atoms of the same element with different numbers of neutrons.
Same atomic number, different mass number. E.g., ¹²C and ¹⁴C are both carbon.

RADIOACTIVE DECAY
Alpha (α) decay: emits an alpha particle (⁴₂He). A decreases by 4; Z decreases by 2.
Beta (β⁻) decay: a neutron converts to a proton + electron; emits the electron. A unchanged; Z increases by 1.
Gamma (γ) emission: high-energy electromagnetic radiation released after alpha or beta decay. A and Z unchanged.

PENETRATING POWER AND IONISATION
Alpha: stopped by paper or a few cm of air. Highly ionising. Most dangerous if inhaled.
Beta: stopped by a few mm of aluminium. Moderately ionising.
Gamma: reduced (but not stopped) by thick lead or concrete. Weakly ionising.

HALF-LIFE
The time taken for half the radioactive nuclei in a sample to decay.
After n half-lives: remaining activity = initial × (1/2)ⁿ.
Half-life is constant and unaffected by temperature, pressure, or chemical state.`,
      workedExample: {
        problem: "An atom has mass number 134 and 67 neutrons. What is its atomic number?",
        solution: "Atomic number = mass number − neutrons = 134 − 67 = 67."
      },
      commonMistakes: [
        "Confusing mass number (protons + neutrons) with atomic number (protons only).",
        "Forgetting that beta decay increases the atomic number by 1 — a neutron becomes a proton.",
        "Thinking half-life means the sample is gone after 2 half-lives — after each half-life half of what remains decays."
      ],
      keyFacts: [
        "Atomic number Z = protons. Mass number A = protons + neutrons. Neutrons = A − Z.",
        "Alpha: A−4, Z−2. Beta⁻: A unchanged, Z+1. Gamma: no change to A or Z.",
        "Alpha stopped by paper. Beta by aluminium. Gamma reduced by lead.",
        "Half-life: time for activity to halve. After n half-lives: fraction remaining = (½)ⁿ.",
        "Isotopes: same Z, different A (different neutron count)."
      ]
    },

    "Space Physics": {
      title: "Space Physics: Orbits, Stars & the Universe",
      keyIdea: "Gravity keeps every orbit going — orbital speed depends on the radius and period, and the same gravitational laws govern everything from satellites to galaxy clusters.",
      body: `ORBITAL SPEED
An object in a circular orbit travels at a constant speed but is continuously changing direction — gravity provides the centripetal force.

v = 2πr ÷ T

v = orbital speed (m/s), r = orbital radius (m), T = orbital period (s).

Example: r = 13 × 10⁶ m, T = 2 hours = 7,200 s.
v = 2π × 13 × 10⁶ ÷ 7,200 ≈ 11,345 m/s.

FACTORS AFFECTING ORBITS
Closer orbit → higher speed, shorter period.
Geostationary orbit: T = 24 h, remains above the same point on Earth. Used for communication satellites.
Low Earth orbit: lower altitude, faster, used for imaging.

THE LIFE CYCLE OF STARS
Nebula (gas and dust cloud) → Protostar (gravitational collapse) → Main sequence star (hydrogen fusion, stable for billions of years) → Red giant / red supergiant (hydrogen exhausted, expands).
Low/medium mass stars → White dwarf → Black dwarf.
High mass stars → Supernova → Neutron star or Black hole.

Our Sun is a medium-mass main sequence star.

THE UNIVERSE
Big Bang theory: the universe began ≈ 13.8 billion years ago as an extremely hot, dense point.
Evidence: cosmic microwave background radiation; red-shift of distant galaxies.
Red-shift: light from galaxies is shifted to longer wavelengths, showing they are moving away. More distant galaxies show greater red-shift → universe is expanding.

GRAVITATIONAL FORCES IN SPACE
Gravity attracts all masses. Planets orbit stars; moons orbit planets; stars orbit galactic centres.
Artificial satellites: speed and altitude determine orbital period.`,
      workedExample: {
        problem: "A satellite orbits at radius 13 × 10⁶ m with period 2 hours. Find the orbital speed.",
        solution: "Convert: T = 2 × 3600 = 7,200 s. v = 2πr ÷ T = 2π × 13×10⁶ ÷ 7,200 ≈ 11,345 m/s."
      },
      commonMistakes: [
        "Forgetting to convert the orbital period to seconds — always convert hours or minutes to seconds before calculating.",
        "Thinking a geostationary satellite is stationary in space — it is orbiting at the same rate the Earth rotates, so it appears stationary from the ground.",
        "Confusing red-shift with the Doppler effect for sound — both are the same principle, but red-shift applies to light from receding sources."
      ],
      keyFacts: [
        "Orbital speed: v = 2πr ÷ T (convert T to seconds).",
        "Closer orbit → greater speed, shorter period.",
        "Geostationary orbit: T = 24 h; stays above the same point on Earth.",
        "Star life cycle: Nebula → Protostar → Main sequence → Red giant → White dwarf / Neutron star / Black hole.",
        "Red-shift of galaxies is evidence for the expanding universe and the Big Bang."
      ]
    },

  }, // end gcse


  // ─── A-level Maths & Physics ───────────────────────────────────────────────
  alevel: {

    "Algebra & Functions": {
      title: "Algebra & Functions: Quadratics, Inequalities & Partial Fractions",
      keyIdea: "Completing the square converts any quadratic into a form that reveals its vertex, roots, and range — it is the single most versatile algebraic technique at A-level.",
      body: `COMPLETING THE SQUARE
For x² + bx + c:
x² + bx + c = (x + b/2)² − (b/2)² + c

The value q = c − (b/2)² is the minimum value of the expression (when a = 1).

Example: x² − 4x + 11
= (x − 2)² − 4 + 11 = (x − 2)² + 7   → q = 7

Example: x² + 10x − 5
= (x + 5)² − 25 − 5 = (x + 5)² − 30  → q = −30

For ax² + bx + c (a ≠ 1): factor out a first, then complete the square inside.

USES OF COMPLETING THE SQUARE
• Finding the vertex of a parabola: y = (x − h)² + k has vertex (h, k).
• Solving quadratics: (x + b/2)² = (b/2)² − c → x = −b/2 ± √((b/2)² − c).
• Proving minimum/maximum values.

DISCRIMINANT
For ax² + bx + c = 0, the discriminant Δ = b² − 4ac determines the number of real roots.
Δ > 0: two distinct real roots.
Δ = 0: one repeated real root (tangent to the x-axis).
Δ < 0: no real roots (complex only).

PARTIAL FRACTIONS
Split a rational expression into simpler fractions before integrating or expanding.
For distinct linear factors: (3x + 1)/((x+1)(x−2)) ≡ A/(x+1) + B/(x−2).
Multiply both sides by the denominator, then substitute the roots of each factor to find A and B.

FUNCTIONS AND TRANSFORMATIONS
f(x + a): shift left by a.  f(x − a): shift right by a.
f(x) + a: shift up by a.   −f(x): reflect in x-axis.  f(−x): reflect in y-axis.
af(x): stretch vertically by factor a.   f(ax): compress horizontally by factor a.`,
      workedExample: {
        problem: "Complete the square: x² − 4x + 11. What is q (the constant term after completing the square)?",
        solution: "x² − 4x + 11 = (x − 2)² − 4 + 11 = (x − 2)² + 7. So q = 7."
      },
      commonMistakes: [
        "Halving b incorrectly when b is odd — e.g., x² + 5x → (x + 2.5)² − 6.25, not (x + 5)² − 25.",
        "Forgetting to subtract (b/2)² after squaring — always subtract it to keep the expression equivalent.",
        "With a ≠ 1, not factoring out a before completing the square — the formula only applies directly when the leading coefficient is 1."
      ],
      keyFacts: [
        "x² + bx + c = (x + b/2)² − (b/2)² + c.",
        "Vertex of y = a(x−h)² + k is at (h, k); minimum if a > 0, maximum if a < 0.",
        "Discriminant: b²−4ac > 0 (two roots), = 0 (one root), < 0 (no real roots).",
        "Partial fractions: multiply out, then substitute roots of each factor.",
        "f(x+a) shifts left; f(x)+a shifts up; af(x) stretches vertically."
      ]
    },

    "Calculus": {
      title: "Calculus: Differentiation & Integration",
      keyIdea: "Differentiation finds the rate of change (gradient) at any point; integration finds the accumulated area — and they are exact inverses of each other.",
      body: `DIFFERENTIATION — POWER RULE
d/dx (axⁿ) = naxⁿ⁻¹

Multiply by the power, then reduce the power by 1.

Examples:
d/dx (2x³) = 6x²
d/dx (7x⁵) = 35x⁴
d/dx (x) = 1    d/dx (constant) = 0

CHAIN RULE  (composite functions)
d/dx [f(g(x))] = f'(g(x)) × g'(x)
Example: d/dx (3x+2)⁵ = 5(3x+2)⁴ × 3 = 15(3x+2)⁴

PRODUCT RULE
d/dx [u·v] = u·v' + v·u'

QUOTIENT RULE
d/dx [u/v] = (v·u' − u·v') / v²

TANGENTS AND NORMALS
Gradient of tangent at x = a: substitute a into dy/dx.
Gradient of normal = −1 / (gradient of tangent).
Equation of line: y − y₁ = m(x − x₁).

STATIONARY POINTS
Set dy/dx = 0 and solve. Then find d²y/dx² (second derivative):
d²y/dx² > 0 → minimum.  d²y/dx² < 0 → maximum.

INTEGRATION — POWER RULE (reverse of differentiation)
∫axⁿ dx = axⁿ⁺¹/(n+1) + C    (n ≠ −1)
Add 1 to the power, divide by the new power, add constant C.

Example: ∫6x² dx = 2x³ + C

DEFINITE INTEGRALS (area under a curve)
∫[a to b] f(x) dx = [F(x)] from a to b = F(b) − F(a)

Area below the x-axis gives a negative value — take the modulus for physical area.

INTEGRATION BY SUBSTITUTION and BY PARTS are key further techniques.`,
      workedExample: {
        problem: "Differentiate 2x³ with respect to x.",
        solution: "d/dx (2x³) = 3 × 2x² = 6x²."
      },
      commonMistakes: [
        "Reducing the power without multiplying by it first — the coefficient must be multiplied by the original power.",
        "Forgetting the constant of integration +C in indefinite integrals — every indefinite integral has a family of solutions.",
        "Treating area below the x-axis as positive in definite integration — split the integral at x-axis crossings and take the modulus of each part."
      ],
      keyFacts: [
        "d/dx (axⁿ) = naxⁿ⁻¹. ∫axⁿ dx = axⁿ⁺¹/(n+1) + C.",
        "Chain rule: d/dx[f(g(x))] = f'(g(x))·g'(x).",
        "Product rule: (uv)' = uv' + vu'.",
        "Stationary point: dy/dx = 0. Min if d²y/dx² > 0; max if < 0.",
        "Definite integral = F(b) − F(a). Area below x-axis is negative — take modulus."
      ]
    },

    "Coordinate Geometry": {
      title: "Coordinate Geometry: Lines, Circles & Parametric Curves",
      keyIdea: "Every geometric property of a line or circle — gradient, midpoint, distance, intersection — follows from one core formula applied carefully.",
      body: `STRAIGHT LINES
Gradient: m = (y₂ − y₁) / (x₂ − x₁)

Example: points (−3, −4) and (1, 16).
m = (16 − (−4)) / (1 − (−3)) = 20 / 4 = 5.

Distance: d = √((x₂−x₁)² + (y₂−y₁)²)
Midpoint: M = ((x₁+x₂)/2, (y₁+y₂)/2)

Equation of a line: y − y₁ = m(x − x₁)
Slope-intercept: y = mx + c

Parallel lines: same gradient (m₁ = m₂).
Perpendicular lines: m₁ × m₂ = −1  (gradients are negative reciprocals).

CIRCLES
General equation: (x − a)² + (y − b)² = r²
Centre (a, b), radius r.

Expanded form: x² + y² + 2gx + 2fy + c = 0
Centre: (−g, −f),  radius: √(g² + f² − c).

To find the equation: complete the square on both x and y terms.

Key circle theorems (coordinate geometry versions):
• Tangent at point P is perpendicular to the radius at P.
• Angle in a semicircle = 90° → if AB is a diameter, ∠APB = 90° for any point P on the circle.
• Perpendicular from the centre to a chord bisects the chord.

PARAMETRIC EQUATIONS
x = f(t), y = g(t). Eliminate t to get the Cartesian equation.
Gradient: dy/dx = (dy/dt) / (dx/dt).

PROOF OF COLLINEARITY
Three points are collinear if the gradient between any two pairs is equal.`,
      workedExample: {
        problem: "Find the gradient of the line through (−3, −4) and (1, 16).",
        solution: "m = (16 − (−4)) / (1 − (−3)) = 20 / 4 = 5."
      },
      commonMistakes: [
        "Subtracting coordinates in different orders for numerator and denominator — keep the same point 'first' in both.",
        "Using the expanded circle equation with the wrong sign for the centre — centre is (−g, −f), not (+g, +f).",
        "Forgetting that perpendicular gradients multiply to −1, not +1."
      ],
      keyFacts: [
        "Gradient m = (y₂−y₁)/(x₂−x₁). Midpoint = ((x₁+x₂)/2, (y₁+y₂)/2).",
        "Perpendicular gradients: m₁m₂ = −1.",
        "Circle: (x−a)² + (y−b)² = r². Centre (a,b), radius r.",
        "Tangent to circle is perpendicular to radius at the point of contact.",
        "Parametric gradient: dy/dx = (dy/dt)/(dx/dt)."
      ]
    },

    "Exponentials & Logarithms": {
      title: "Exponentials & Logarithms",
      keyIdea: "A logarithm is simply an exponent written differently — logₐ(x) = n means aⁿ = x — and the log laws are just the index laws in disguise.",
      body: `DEFINITION
logₐ(x) = n  ⟺  aⁿ = x

Special values: logₐ(a) = 1,  logₐ(1) = 0,  logₐ(aⁿ) = n.

THE LOG LAWS
log(AB) = log A + log B          (product → sum)
log(A/B) = log A − log B         (quotient → difference)
log(Aⁿ) = n log A               (power → coefficient)

These hold for any consistent base.

Example: Write 2log(2) as a single logarithm.
2log(2) = log(2²) = log(4).

Example: Write 4log(4) as a single log.
4log(4) = log(4⁴) = log(256).

THE NATURAL LOGARITHM
ln(x) = logₑ(x), where e ≈ 2.718 (Euler's number).
ln(eˣ) = x.   e^(ln x) = x.   d/dx(eˣ) = eˣ.   d/dx(ln x) = 1/x.

SOLVING EXPONENTIAL EQUATIONS
Take logs of both sides to bring the power down.
2ˣ = 15 → x ln 2 = ln 15 → x = ln 15 / ln 2 ≈ 3.91.

SOLVING EQUATIONS IN LOG FORM
Combine logs first using the laws, then convert to exponential form.
log₂(x) + log₂(3) = 5 → log₂(3x) = 5 → 3x = 2⁵ = 32 → x = 32/3.

EXPONENTIAL MODELS
Growth: y = Aeᵏᵗ (k > 0).  Decay: y = Ae⁻ᵏᵗ (k > 0).
Plotting ln y against t gives a straight line if the model is exponential.

CHANGE OF BASE
logₐ(x) = ln(x) / ln(a).`,
      workedExample: {
        problem: "Write 2log(2) as a single logarithm.",
        solution: "Using the power law: 2log(2) = log(2²) = log(4)."
      },
      commonMistakes: [
        "Writing log(A + B) = log A + log B — this is WRONG. log(AB) = log A + log B (product, not sum).",
        "Dividing inside the log instead of subtracting logs: log(A/B) ≠ log(A) / log(B).",
        "Forgetting to check for invalid solutions — log is only defined for positive arguments, so always verify x > 0 in the original equation."
      ],
      keyFacts: [
        "logₐx = n ⟺ aⁿ = x.",
        "log(AB) = logA + logB.  log(A/B) = logA − logB.  log(Aⁿ) = n·logA.",
        "ln is log base e. d/dx(eˣ) = eˣ. d/dx(ln x) = 1/x.",
        "To solve aˣ = b: take ln both sides → x = ln b / ln a.",
        "Exponential model: y = Aeᵏᵗ. Plot ln y vs t for a straight line."
      ]
    },

    "Trigonometry": {
      title: "Trigonometry: Exact Values, Identities & Solving Equations",
      keyIdea: "Exact trig values, the two Pythagorean identities, and the double-angle formulae are the three tools that unlock every A-level trig problem.",
      body: `EXACT VALUES (must be memorised)
θ:        0°      30°     45°      60°      90°
sin θ:    0      1/2    √2/2     √3/2      1
cos θ:    1      √3/2   √2/2     1/2       0
tan θ:    0      1/√3    1       √3      undefined

Key: sin(45°) = cos(45°) = √2/2 ≈ 0.707.  tan(0°) = 0.

RADIANS
π radians = 180°. Convert: degrees × π/180 = radians.
Key values: π/6 = 30°, π/4 = 45°, π/3 = 60°, π/2 = 90°, π = 180°.

PYTHAGOREAN IDENTITIES
sin²θ + cos²θ = 1   (fundamental — derives from Pythagoras)
1 + tan²θ = sec²θ
1 + cot²θ = cosec²θ

DOUBLE ANGLE FORMULAE
sin 2θ = 2 sin θ cos θ
cos 2θ = cos²θ − sin²θ = 1 − 2sin²θ = 2cos²θ − 1
tan 2θ = 2tan θ / (1 − tan²θ)

ADDITION FORMULAE
sin(A ± B) = sin A cos B ± cos A sin B
cos(A ± B) = cos A cos B ∓ sin A sin B
tan(A ± B) = (tan A ± tan B) / (1 ∓ tan A tan B)

SOLVING TRIG EQUATIONS
1. Find the principal value using inverse trig.
2. Use symmetry of the trig graph to find all solutions in the given interval.
   sin θ = k: second solution = 180° − θ (or π − θ).
   cos θ = k: second solution = 360° − θ (or 2π − θ).
   tan θ = k: add 180° (or π) repeatedly.

R-METHOD: a sin θ + b cos θ = R sin(θ + φ), where R = √(a²+b²), tan φ = b/a.`,
      workedExample: {
        problem: "What is the exact value of sin(45°)?",
        solution: "sin(45°) = √2/2 (equivalently 1/√2). Derived from the isosceles right-angled triangle with legs 1, 1 and hypotenuse √2."
      },
      commonMistakes: [
        "Confusing sin and cos exact values at 30° and 60° — remember: sin30° = 1/2 (small angle, small value); sin60° = √3/2 (larger).",
        "Forgetting the second solution when solving trig equations — always sketch the graph or use the symmetry rules.",
        "Using degrees in a formula that requires radians (or vice versa) — check the required form in the question."
      ],
      keyFacts: [
        "sin(30°)=½, cos(30°)=√3/2, tan(30°)=1/√3. sin(45°)=cos(45°)=√2/2. sin(60°)=√3/2, cos(60°)=½.",
        "sin²θ + cos²θ = 1 always.",
        "sin 2θ = 2 sin θ cos θ.  cos 2θ = cos²θ − sin²θ.",
        "180° = π rad. Multiply degrees by π/180 to convert.",
        "R sin(θ+φ): R = √(a²+b²), tan φ = b/a."
      ]
    },

    "Vectors": {
      title: "Vectors: Magnitude, Direction & Geometric Proof",
      keyIdea: "A vector has both size and direction — every vector operation (adding, scaling, finding magnitude) follows directly from its component form.",
      body: `VECTOR NOTATION
A vector can be written as a column vector (a/b) or as ai + bj (using unit vectors i and j).
In 3D: ai + bj + ck or (a/b/c).

MAGNITUDE
|v| = √(a² + b²)    (2D)
|v| = √(a² + b² + c²)    (3D)

Example: v = (16, −30). |v| = √(16² + (−30)²) = √(256 + 900) = √1156 = 34.
Example: v = (40, 42). |v| = √(1600 + 1764) = √3364 = 58.

UNIT VECTOR: v̂ = v / |v|. Has magnitude 1, same direction as v.

ADDING AND SCALING VECTORS
(a/b) + (c/d) = (a+c / b+d).   k(a/b) = (ka / kb).
To subtract: add the negative. PQ = Q − P (position vectors).

POSITION VECTORS AND MIDPOINTS
If A has position vector a and B has position vector b:
Midpoint M of AB: m = (a + b) / 2.
Point dividing AB in ratio m:n: p = (na + mb) / (m + n).

SCALAR (DOT) PRODUCT
a · b = a₁b₁ + a₂b₂ + a₃b₃ = |a||b|cosθ
If a · b = 0 → vectors are perpendicular.
cosθ = (a · b) / (|a||b|) → find the angle between two vectors.

GEOMETRIC PROOFS USING VECTORS
Express all points in terms of position vectors. Show vectors are parallel (one is a scalar multiple of the other) or collinear (share a common point and are parallel).

EQUATIONS OF LINES
r = a + λb  (λ ∈ ℝ): a is a point on the line, b is the direction vector.`,
      workedExample: {
        problem: "Find the magnitude of vector (16, −30).",
        solution: "|v| = √(16² + (−30)²) = √(256 + 900) = √1156 = 34."
      },
      commonMistakes: [
        "Forgetting to square the negative component — (−30)² = +900, not −900.",
        "Confusing AB = B − A with AB = A − B — the vector from A to B always points toward B, so it is position of B minus position of A.",
        "Concluding two vectors are parallel just because their magnitudes are equal — parallel means one is a scalar multiple of the other."
      ],
      keyFacts: [
        "|v| = √(a² + b²) in 2D; √(a²+b²+c²) in 3D.",
        "AB = b − a (position vector of B minus position vector of A).",
        "Dot product: a·b = |a||b|cosθ. Zero dot product → perpendicular.",
        "Unit vector: v̂ = v/|v|.",
        "Line equation: r = a + λb."
      ]
    },

    "Proof & Binomial": {
      title: "Proof & the Binomial Theorem",
      keyIdea: "Proof is about establishing truth beyond doubt — structure your argument so every step follows inevitably from the last; the binomial theorem is a formula for expanding (1+x)ⁿ without multiplying out bracket by bracket.",
      body: `TYPES OF PROOF
Proof by deduction: use known facts and algebra to reach the conclusion directly. Most common in A-level.
Proof by exhaustion: check every possible case (only feasible when cases are finite).
Proof by contradiction: assume the opposite of what you want to prove, derive a logical impossibility.
Disproof by counter-example: find ONE example where the statement fails. A single counter-example is sufficient to disprove a universal claim.

Example proof by deduction: "The product of two odd numbers is always odd."
Let the two odd numbers be 2m+1 and 2n+1 (m, n ∈ ℤ).
Product = (2m+1)(2n+1) = 4mn + 2m + 2n + 1 = 2(2mn+m+n) + 1.
Since 2mn+m+n is an integer, the product is of the form 2k+1 → it is odd. ∎

THE BINOMIAL THEOREM
(1 + x)ⁿ = 1 + nx + n(n−1)/2! x² + n(n−1)(n−2)/3! x³ + ...

For (a + b)ⁿ:
(a + b)ⁿ = Σ ⁿCᵣ aⁿ⁻ʳ bʳ   (r from 0 to n)

BINOMIAL COEFFICIENTS
ⁿCᵣ = n! / (r!(n−r)!)

Key values: ⁿC₀ = 1,  ⁿC₁ = n,  ⁿCₙ = 1.
Pascal's triangle gives the same coefficients row by row.

Finding a specific term: the (r+1)th term of (a+b)ⁿ is ⁿCᵣ × aⁿ⁻ʳ × bʳ.

Example: Coefficient of x¹ in (1+x)⁶.
r = 1: ⁶C₁ × 1⁵ × x¹ = 6x → coefficient = 6.

BINOMIAL EXPANSION FOR |x| < 1 (fractional/negative n)
(1 + x)ⁿ ≈ 1 + nx + n(n−1)/2! x² + ...   valid for |x| < 1.
Used for approximations.`,
      workedExample: {
        problem: "Find the coefficient of x¹ in the expansion of (1 + x)⁶.",
        solution: "Term with x¹: ⁶C₁ × 1⁵ × x¹ = 6x. Coefficient = 6."
      },
      commonMistakes: [
        "Using examples as proof — showing the statement works for 5 cases does NOT prove it works for all cases.",
        "Miscounting the term number — the coefficient of xʳ corresponds to ⁿCᵣ (r starts at 0).",
        "In (a+bx)ⁿ, forgetting to raise both a and b to the appropriate powers — the term is ⁿCᵣ × aⁿ⁻ʳ × (bx)ʳ."
      ],
      keyFacts: [
        "(a+b)ⁿ = Σ ⁿCᵣ aⁿ⁻ʳ bʳ. Coefficient of xʳ term is ⁿCᵣ.",
        "ⁿCᵣ = n! / (r!(n−r)!). ⁿC₁ = n.",
        "Proof by contradiction: assume ¬P, derive a contradiction, conclude P.",
        "Disproof: one counter-example is sufficient.",
        "(1+x)ⁿ valid for |x|<1 with any real n — gives an infinite series."
      ]
    },

    "Statistics": {
      title: "Statistics: Probability Distributions & Hypothesis Testing",
      keyIdea: "The binomial distribution models repeated independent trials; the normal distribution models continuous symmetric data — and hypothesis testing uses both to decide whether evidence is strong enough to reject a claim.",
      body: `THE BINOMIAL DISTRIBUTION
X ~ B(n, p): n independent trials, probability p of success in each.
P(X = r) = ⁿCᵣ pʳ (1−p)ⁿ⁻ʳ
E(X) = np    (expected value / mean)
Var(X) = np(1−p)

Example: X ~ B(10, 2/5). E(X) = 10 × 2/5 = 4.
Example: X ~ B(15, 1/5). E(X) = 15 × 1/5 = 3.

Conditions for binomial: fixed n, two outcomes (success/failure), constant p, independent trials.

THE NORMAL DISTRIBUTION
X ~ N(μ, σ²): continuous, symmetric, bell-shaped.
Standardise: Z = (X − μ) / σ,  where Z ~ N(0, 1).
Use the standard normal table (Φ table) to find probabilities.
P(X < a) → P(Z < (a−μ)/σ) → read from table.

Symmetry: P(Z < −z) = 1 − P(Z < z).

HYPOTHESIS TESTING (one-tailed, binomial)
1. State H₀ (null hypothesis) and H₁ (alternative hypothesis).
2. Assume H₀ is true and calculate P(result at least as extreme).
3. If p-value < significance level (e.g., 5%) → reject H₀.
4. State conclusion in context.

Example: H₀: p = 0.3. Observed 12 successes in 20 trials. Test at 5%.
P(X ≥ 12 | X~B(20,0.3)) — calculate using binomial and compare to 0.05.

CORRELATION AND REGRESSION
Product-moment correlation coefficient r: measures strength and direction of linear association (−1 ≤ r ≤ 1).
Regression line y = a + bx: minimises the sum of squared residuals. Only valid to predict within the data range.`,
      workedExample: {
        problem: "X ~ B(10, 2/5). Find E(X).",
        solution: "E(X) = np = 10 × 2/5 = 4."
      },
      commonMistakes: [
        "Using the binomial distribution when trials are not independent or p is not constant — check all four conditions.",
        "Forgetting to standardise before using the normal table — Z = (X − μ)/σ.",
        "Stating 'accept H₀' instead of 'insufficient evidence to reject H₀' — you never prove a null hypothesis, you only fail to disprove it."
      ],
      keyFacts: [
        "B(n,p): E(X) = np, Var(X) = np(1−p).",
        "N(μ,σ²): standardise with Z = (X−μ)/σ before using tables.",
        "Hypothesis test: p-value < significance level → reject H₀.",
        "r = ±1: perfect linear correlation. r = 0: no linear correlation.",
        "Regression line passes through (x̄, ȳ); use only within data range."
      ]
    },

    "Mechanics": {
      title: "Mechanics: Kinematics, Forces & Moments",
      keyIdea: "Every mechanics problem is F = ma applied carefully — identify all forces, resolve them into components, and the motion follows from Newton's second law.",
      body: `SUVAT EQUATIONS (revision)
v = u + at.  s = ut + ½at².  v² = u² + 2as.  s = ½(u+v)t.

VARIABLE ACCELERATION (calculus)
v = ds/dt  (velocity is rate of change of displacement)
a = dv/dt = d²s/dt²  (acceleration is rate of change of velocity)
s = ∫v dt.  v = ∫a dt.  (integrate to go from a to v to s)

Example: v = u + at is the integrated form of a = constant.

RESOLVING FORCES
Split each force into horizontal and vertical components using sin and cos.
On a slope at angle θ: component along slope = F cos θ, component perpendicular = F sin θ (or vice versa — draw a diagram every time).

NEWTON'S LAWS IN A-LEVEL CONTEXTS
Connected particles (Atwood machine, pulleys): treat each particle separately; tension T is the same throughout an inextensible string.
Friction: F_friction = μN (limiting friction), where μ is the coefficient of friction and N is the normal reaction.

PROJECTILE MOTION
Horizontal: uniform velocity (no force horizontally). x = u cos θ × t.
Vertical: uniformly accelerated under gravity. y = u sin θ × t − ½gt².
Time of flight, range, and maximum height follow from applying SUVAT to each direction separately.

MOMENTS
Moment = Force × perpendicular distance from pivot.
For equilibrium: sum of clockwise moments = sum of anticlockwise moments.
Also: resultant force = 0.

IMPULSE AND MOMENTUM
Impulse = Ft = mv − mu (change in momentum).
Conservation of momentum: m₁u₁ + m₂u₂ = m₁v₁ + m₂v₂.`,
      workedExample: {
        problem: "A particle starts with velocity 2 m/s and has acceleration 1 m/s². Find its velocity after 3 s.",
        solution: "v = u + at = 2 + (1 × 3) = 5 m/s."
      },
      commonMistakes: [
        "Using SUVAT when acceleration is NOT constant — if a varies with t, use calculus (v = ∫a dt).",
        "Resolving forces incorrectly on a slope — always draw a clear diagram and label which component is parallel vs perpendicular to the surface.",
        "Forgetting that for connected particles the tension is the same throughout the string but the equations of motion are written separately for each particle."
      ],
      keyFacts: [
        "v = ds/dt, a = dv/dt. Integrate to find displacement and velocity from acceleration.",
        "Friction: F = μN at the point of sliding (limiting friction).",
        "Projectile: horizontal uniform, vertical under g. Treat independently.",
        "Moments equilibrium: sum of clockwise = sum of anticlockwise moments.",
        "Momentum conserved in all collisions: m₁u₁ + m₂u₂ = m₁v₁ + m₂v₂."
      ]
    },

    // ── A-level Physics ───────────────────────────────────────────────────────

    "Mechanics": {
      title: "A-level Mechanics: Kinematics, Circular Motion & Momentum",
      keyIdea: "Mechanics connects forces to motion through Newton's laws — SUVAT handles constant acceleration, calculus handles variable acceleration, and circular motion adds the centripetal twist.",
      body: `KINEMATICS — SUVAT (constant acceleration)
v = u + at.  s = ut + ½at².  v² = u² + 2as.  s = ½(u+v)t.
Strategy: list known variables, pick the equation containing only those.

Example: u = 2 m/s, a = 1 m/s², t = 3 s → v = 2 + 3 = 5 m/s.

VARIABLE ACCELERATION (calculus)
v = ds/dt.  a = dv/dt = d²s/dt².
Integrate to move from a → v → s. Differentiate to move from s → v → a.

PROJECTILE MOTION
Horizontal: constant velocity (no air resistance). x = u cosθ × t.
Vertical: uniform acceleration under g. y = u sinθ × t − ½gt².
Treat the two directions completely independently.

CIRCULAR MOTION
Centripetal acceleration: a = v²/r = ω²r (directed toward centre).
Centripetal force: F = mv²/r = mω²r.
Angular velocity: ω = 2π/T = 2πf.  Linear speed: v = ωr.

Example: m = 8 kg, r = 6 m, v = 6 m/s → F = 8 × 36 / 6 = 48 N.

The centripetal force is not a new force — it is the net inward resultant of existing forces (gravity, tension, friction, etc.).

SIMPLE HARMONIC MOTION (SHM)
a = −ω²x. Displacement: x = A cos(ωt).  v_max = Aω (at x = 0).

FORCES, FRICTION & MOMENTS
F = ma (Newton's 2nd Law). Friction: F = μN (limiting).
Moment = force × perpendicular distance. Equilibrium: ΣF = 0, Στ = 0.

MOMENTUM & COLLISIONS
p = mv. Impulse = Ft = Δp.
Conservation: total momentum is constant in a closed system.
Elastic: KE conserved. Inelastic: KE not conserved. Perfectly inelastic: objects stick.`,
      workedExample: {
        problem: "A 8 kg object moves in a circle of radius 6 m at 6 m/s. Find the centripetal force.",
        solution: "F = mv²/r = 8 × 6² / 6 = 8 × 36 / 6 = 48 N."
      },
      commonMistakes: [
        "Using SUVAT when acceleration varies — if a is a function of t, use v = ∫a dt instead.",
        "Treating centripetal force as an extra force — it is the label for the net inward force provided by existing forces.",
        "Forgetting to resolve forces into components before applying F = ma on a slope or in a circular-motion problem."
      ],
      keyFacts: [
        "SUVAT: v=u+at, s=ut+½at², v²=u²+2as, s=½(u+v)t.",
        "Circular motion: F=mv²/r. ω=2π/T. v=ωr.",
        "SHM: a=−ω²x. v_max=Aω at equilibrium.",
        "Momentum conserved in all closed-system collisions.",
        "Variable acceleration: use calculus (integrate/differentiate)."
      ]
    },

    "Materials": {
      title: "Materials: Stress, Strain & the Young Modulus",
      keyIdea: "Stress is force per unit area; strain is fractional extension — their ratio is the Young modulus, the stiffness fingerprint of a material.",
      body: `STRESS
Stress (σ) = Force / Cross-sectional area
σ = F / A   (units: Pa or N/m²)

Example: F = 1,000 N, A = 2 × 10⁻⁴ m².
σ = 1,000 / (2 × 10⁻⁴) = 5 × 10⁶ Pa = 5 MPa.

STRAIN
Strain (ε) = Extension / Original length
ε = ΔL / L₀   (dimensionless — no units)

YOUNG MODULUS
E = σ / ε = (F/A) / (ΔL/L₀) = FL₀ / (AΔL)   (units: Pa or N/m²)

The Young modulus is a material property — it tells you how stiff a material is, independent of the sample's dimensions. Steel: ~200 GPa. Rubber: ~0.01 GPa.

On a stress-strain graph:
• Linear region (Hooke's Law): stress ∝ strain.
• Limit of proportionality: beyond here, stress-strain is no longer linear.
• Elastic limit: beyond here, permanent deformation occurs.
• Yield point: material stretches with little extra force.
• Ultimate tensile stress (UTS): maximum stress the material can sustain.
• Fracture point: material breaks.

ENERGY STORED IN A STRETCHED WIRE
E_stored = ½ × F × ΔL = ½ × stress × strain × volume
On a force-extension graph: energy = area under the graph.

HOOKE'S LAW (springs)
F = kx, where k = spring constant (N/m).
Elastic potential energy = ½kx².

BRITTLENESS vs DUCTILITY
Brittle material: breaks with little or no plastic deformation (e.g., glass).
Ductile material: undergoes significant plastic deformation before fracture (e.g., copper).`,
      workedExample: {
        problem: "A wire carries a force of 1,000 N and has cross-sectional area 2 × 10⁻⁴ m². Find the stress.",
        solution: "σ = F/A = 1,000 / (2 × 10⁻⁴) = 5 × 10⁶ Pa."
      },
      commonMistakes: [
        "Using diameter instead of cross-sectional area — A = π(d/2)² = πr². Always find A before calculating stress.",
        "Confusing extension ΔL with original length L₀ in the strain formula — strain = extension / original length.",
        "Thinking Young's modulus changes with the dimensions of the sample — it is a fixed property of the material itself."
      ],
      keyFacts: [
        "Stress σ = F/A (Pa). Strain ε = ΔL/L₀ (no units). Young modulus E = σ/ε.",
        "E = FL₀/(AΔL). Gradient of linear part of stress-strain graph = E.",
        "Energy stored = area under force-extension graph = ½FΔL.",
        "Limit of proportionality, elastic limit, yield point, UTS, fracture — know all five.",
        "Brittle: little plastic deformation. Ductile: large plastic deformation."
      ]
    },

    "Waves & Optics": {
      title: "Waves & Optics: Superposition, Interference & Diffraction",
      keyIdea: "When two waves occupy the same space, their displacements add — constructive interference amplifies, destructive cancels — and this principle explains everything from rainbow colours to radio dead zones.",
      body: `SUPERPOSITION PRINCIPLE
When two waves meet, the resultant displacement equals the vector sum of the individual displacements.
Constructive interference: waves in phase → amplitude doubles.
Destructive interference: waves 180° out of phase → amplitude cancels to zero.

Path difference determines the type of interference:
Constructive: path difference = nλ (n = 0, 1, 2, ...)
Destructive: path difference = (n + ½)λ

YOUNG'S DOUBLE-SLIT EXPERIMENT
Fringe spacing: w = λD / d

w = fringe spacing (m), λ = wavelength (m), D = distance to screen (m), d = slit separation (m).

Example: λ = 500 nm = 5 × 10⁻⁷ m, d = 0.5 mm = 5 × 10⁻⁴ m, D = 2.5 m.
w = (5×10⁻⁷ × 2.5) / (5×10⁻⁴) = 1.25×10⁻⁶ / 5×10⁻⁴ = 2.5 × 10⁻³ m = 2.5 mm.

DIFFRACTION GRATING
d sin θ = nλ
d = grating spacing = 1 / (lines per metre), n = order, θ = angle of maximum.
More lines per mm → smaller d → larger θ (orders spread further).

STATIONARY WAVES
Formed by two identical waves travelling in opposite directions.
Nodes: points of zero displacement (destructive interference). Fixed in space.
Antinodes: points of maximum displacement. Fixed in space.
Distance between adjacent nodes = λ/2.

POLARISATION
Transverse waves can be polarised (oscillations restricted to one plane).
Longitudinal waves (sound) cannot be polarised.
Polarisation proves that light is a transverse wave.

REFRACTIVE INDEX
n = c / v = sin θ₁ / sin θ₂ (Snell's Law).
Total internal reflection occurs when θ > critical angle: sin θ_c = 1/n (going from denser to less dense medium).`,
      workedExample: {
        problem: "Young's double slit: λ = 500 nm, slit separation = 0.5 mm, screen distance = 2.5 m. Find the fringe spacing in mm.",
        solution: "w = λD/d = (500×10⁻⁹ × 2.5) / (0.5×10⁻³) = 1.25×10⁻⁶ / 5×10⁻⁴ = 2.5×10⁻³ m = 2.5 mm."
      },
      commonMistakes: [
        "Mixing up d and D in the Young's slits formula — d is the small slit separation; D is the large screen distance.",
        "Forgetting to convert nm to m before substituting into w = λD/d.",
        "Confusing nodes and antinodes — nodes are zero displacement (destructive); antinodes are maximum displacement (constructive)."
      ],
      keyFacts: [
        "Young's slits: w = λD/d.",
        "Diffraction grating: d sin θ = nλ.",
        "Constructive: path difference = nλ. Destructive: path difference = (n+½)λ.",
        "Stationary wave: nodes (zero amplitude) spaced λ/2 apart.",
        "Refractive index: n = c/v = sin θ₁/sin θ₂ (Snell's Law)."
      ]
    },

    "Electricity": {
      title: "A-level Electricity: Resistivity, EMF & Kirchhoff's Laws",
      keyIdea: "Resistivity is a material property that predicts resistance from geometry — and every circuit, however complex, yields to Kirchhoff's two laws applied systematically.",
      body: `RESISTIVITY
R = ρL / A

R = resistance (Ω), ρ = resistivity (Ω·m), L = length (m), A = cross-sectional area (m²).

Example: ρ = 1×10⁻⁶ Ω·m, L = 3 m, A = 4×10⁻⁶ m².
R = (1×10⁻⁶ × 3) / (4×10⁻⁶) = 3×10⁻⁶ / 4×10⁻⁶ = 0.75 Ω.

Resistivity is a material property (unlike resistance, which depends on the wire's geometry).
Resistivity increases with temperature for metals (more lattice vibrations impede electron flow).

EMF AND INTERNAL RESISTANCE
A real battery has EMF (ε) and internal resistance (r).
Terminal voltage: V = ε − Ir
where I is the current drawn.

When a load R is connected: I = ε / (R + r).
Power wasted internally: P_internal = I²r.
Maximum power is transferred when R = r.

KIRCHHOFF'S LAWS
1st Law (current law): the sum of currents entering a junction = sum of currents leaving. (Conservation of charge.)
2nd Law (voltage law): the sum of EMFs around any closed loop = sum of potential drops (IR) around that loop. (Conservation of energy.)

Apply systematically: label all currents with assumed directions; write equations for each junction and loop; solve simultaneously.

POTENTIAL DIVIDER
V_out = V_in × R₂ / (R₁ + R₂)

Used in sensor circuits (thermistor, LDR) where resistance changes with physical conditions.

CAPACITORS
Charge: Q = CV. Energy: E = ½CV² = ½QV = Q²/2C.
In series: 1/C_total = 1/C₁ + 1/C₂.
In parallel: C_total = C₁ + C₂.
Capacitors in DC circuits: charge exponentially. Time constant τ = RC.`,
      workedExample: {
        problem: "A wire has resistivity 1×10⁻⁶ Ω·m, length 3 m, cross-sectional area 4×10⁻⁶ m². Find its resistance.",
        solution: "R = ρL/A = (1×10⁻⁶ × 3) / (4×10⁻⁶) = 0.75 Ω."
      },
      commonMistakes: [
        "Confusing resistivity ρ (material property, Ω·m) with resistance R (circuit property, Ω) — doubling a wire's length doubles R but does not change ρ.",
        "Forgetting internal resistance when finding terminal voltage — V_terminal = ε − Ir, not just ε.",
        "Misapplying Kirchhoff's 2nd law by not accounting for the sign of EMFs (direction around the loop matters)."
      ],
      keyFacts: [
        "R = ρL/A. ρ is the material's resistivity in Ω·m.",
        "Terminal voltage V = ε − Ir. Current I = ε/(R+r).",
        "Kirchhoff's 1st: ΣI_in = ΣI_out at a junction.",
        "Kirchhoff's 2nd: ΣEMF = ΣIR around a closed loop.",
        "Capacitor energy: E = ½CV². Series: 1/C = Σ(1/Cᵢ). Parallel: C = ΣCᵢ."
      ]
    },

    "Fields": {
      title: "Fields: Gravitational, Electric & Magnetic",
      keyIdea: "Gravitational and electric fields share exactly the same mathematical structure — inverse-square force laws — making them easier to learn as a pair.",
      body: `GRAVITATIONAL FIELDS
Field strength g = F/m = GM/r² (N/kg)
Gravitational force: F = GMm/r²  (Newton's law of gravitation)
G = 6.67 × 10⁻¹¹ N m² kg⁻²
Force is always attractive.
Gravitational potential: V_g = −GM/r   (negative; work done bringing mass from infinity)

ELECTRIC FIELDS
Field strength E = F/Q = kQ/r²  (N/C or V/m)
Coulomb's law: F = kQ₁Q₂/r²
k = 1/(4πε₀) = 9 × 10⁹ N m² C⁻²
Force is attractive (opposite charges) or repulsive (like charges).
Electric potential: V = kQ/r

Example (Coulomb's law): Q₁ = 3 μC, Q₂ = 2 μC, r = 30 cm = 0.3 m.
F = (9×10⁹ × 3×10⁻⁶ × 2×10⁻⁶) / 0.3² = (9×10⁹ × 6×10⁻¹²) / 0.09 = 0.054/0.09 = 0.6 N.

COMPARING GRAVITATIONAL AND ELECTRIC FIELDS
Both: inverse-square law, field lines show direction of force, field strength ∝ 1/r².
Difference: gravity is always attractive; electric can be repulsive. Electric fields can be shielded; gravity cannot.

MAGNETIC FIELDS
Force on a moving charge: F = BQv sin θ
Force on a wire: F = BIL sin θ
Magnetic flux: Φ = BA cos θ (Wb)
Faraday's law: EMF = −dΦ/dt = −N dΦ/dt for N turns.
Lenz's law: induced current opposes the change causing it.

PARTICLE IN A FIELD
Charged particle in a magnetic field (perpendicular to v): moves in a circle.
BQv = mv²/r → r = mv/(BQ).`,
      workedExample: {
        problem: "Two charges of 3 μC and 2 μC are 30 cm apart. Find the force between them. (k = 9×10⁹)",
        solution: "F = kQ₁Q₂/r² = (9×10⁹ × 3×10⁻⁶ × 2×10⁻⁶) / (0.3)² = 54×10⁻³ / 0.09 = 0.6 N."
      },
      commonMistakes: [
        "Using r in cm instead of metres in Coulomb's law — always convert to SI units before substituting.",
        "Forgetting the negative sign in gravitational potential V = −GM/r — gravitational potential is always negative.",
        "Confusing field strength (force per unit mass/charge) with force — field strength is a property of the field at a point, independent of the test mass/charge."
      ],
      keyFacts: [
        "F = GMm/r² (gravity). F = kQ₁Q₂/r² (electric). Both inverse-square.",
        "k = 9×10⁹ N m² C⁻². G = 6.67×10⁻¹¹ N m² kg⁻².",
        "Gravitational potential: V = −GM/r. Electric potential: V = kQ/r.",
        "F = BQv sin θ (moving charge). F = BIL sin θ (wire).",
        "Faraday: EMF = −NdΦ/dt. Lenz: induced effect opposes change."
      ]
    },

    "Thermal Physics": {
      title: "Thermal Physics: Ideal Gases & Heat Transfer",
      keyIdea: "The ideal gas law connects pressure, volume, and temperature in one equation — and the internal energy of a gas is simply the total kinetic energy of its particles.",
      body: `IDEAL GAS LAW
pV = nRT

p = pressure (Pa), V = volume (m³), n = amount of gas (mol), R = 8.31 J mol⁻¹ K⁻¹, T = temperature (K).

Temperature must be in KELVIN: T(K) = T(°C) + 273.

Example: n = 2 mol, V = 19 L = 19×10⁻³ m³, T = 273 K.
p = nRT/V = (2 × 8.31 × 273) / (19×10⁻³) = 4537.26 / 0.019 ≈ 238,803 Pa ≈ 2.39 × 10⁵ Pa.

COMBINED GAS LAW (fixed amount of gas)
p₁V₁/T₁ = p₂V₂/T₂

Useful for comparing two states of the same gas.

KINETIC THEORY
pV = ⅓Nm<c²>
N = number of molecules, m = mass per molecule, <c²> = mean square speed.

Internal energy of an ideal gas = total KE of all molecules.
For a monatomic ideal gas: U = (3/2)nRT.
Average KE per molecule = (3/2)k_BT, where k_B = 1.38×10⁻²³ J K⁻¹.

FIRST LAW OF THERMODYNAMICS
ΔU = Q + W
ΔU = change in internal energy, Q = heat added to system, W = work done ON the system.
(Some textbooks define W as work done BY the system: ΔU = Q − W. Check the convention used.)

SPECIFIC HEAT CAPACITY AND LATENT HEAT
Q = mcΔT (heating without change of state).
Q = mL (change of state at constant temperature).
L = specific latent heat (J/kg). Lf = latent heat of fusion (melting). Lv = latent heat of vaporisation.`,
      workedExample: {
        problem: "An ideal gas: n = 2 mol, V = 19 L, T = 273 K. Find the pressure. (R = 8.31 J mol⁻¹ K⁻¹)",
        solution: "p = nRT/V = (2 × 8.31 × 273) / (19×10⁻³) = 4537.3 / 0.019 ≈ 2.39 × 10⁵ Pa."
      },
      commonMistakes: [
        "Using Celsius instead of Kelvin — always add 273 to convert. A temperature of 0°C is 273 K, not 0 K.",
        "Using litres instead of m³ — 1 litre = 1×10⁻³ m³. Multiply litres by 10⁻³ before substituting.",
        "Confusing Q = mcΔT (temperature change, no state change) with Q = mL (state change, constant temperature)."
      ],
      keyFacts: [
        "pV = nRT. R = 8.31 J mol⁻¹ K⁻¹. T in Kelvin (T_K = T_°C + 273).",
        "1 litre = 1×10⁻³ m³.",
        "Average KE per molecule = (3/2)k_BT.",
        "First law: ΔU = Q + W (W = work done on system).",
        "Q = mcΔT (temp change). Q = mL (state change)."
      ]
    },

    "Nuclear Physics": {
      title: "Nuclear Physics: Radioactive Decay & Mass-Energy Equivalence",
      keyIdea: "Mass and energy are interchangeable — nuclear reactions release energy because the products have less mass than the reactants, and that mass difference multiplied by c² gives the energy released.",
      body: `MASS-ENERGY EQUIVALENCE
E = mc²
c = 3 × 10⁸ m/s. A tiny mass defect releases an enormous amount of energy.

Working in atomic mass units (u):
1 u = 1.66 × 10⁻²⁷ kg
Energy equivalent of 1 u = 931.5 MeV.

Example: mass defect = 0.001 u.
E = 0.001 × 931.5 = 0.9315 MeV.

BINDING ENERGY
The binding energy of a nucleus is the energy required to completely separate all nucleons.
Binding energy per nucleon: peaks around iron-56 (most stable nucleus).
Fusion (light nuclei joining) and fission (heavy nuclei splitting) both release energy when the products have higher binding energy per nucleon.

RADIOACTIVE DECAY EQUATIONS
Activity: A = −dN/dt = λN
N = N₀ e^(−λt)     (exponential decay)
Half-life: t½ = ln2 / λ ≈ 0.693 / λ

After time t: N = N₀ × (½)^(t/t½)

The decay constant λ is fixed for each isotope — unaffected by temperature, pressure, or chemical state.

NUCLEAR REACTIONS
Write equations balancing: mass number (top) and atomic number (bottom) on both sides.
Alpha: ₂₃₈₉₂U → ₂₃₄₉₀Th + ₄₂He
Beta⁻: ₁₄₆C → ₁₄₇N + ₀₋₁e (+ antineutrino)
Fission: ²³⁵U + n → daughter nuclei + 2–3 neutrons + energy.

NUCLEAR RADIUS
R = R₀ A^(1/3), where R₀ ≈ 1.2 × 10⁻¹⁵ m and A = mass number.
Volume ∝ A → nuclear density is approximately constant for all nuclei.`,
      workedExample: {
        problem: "A mass defect of 0.001 u is converted to energy. Find the energy in MeV. (1 u = 1.66×10⁻²⁷ kg, c = 3×10⁸ m/s)",
        solution: "E = mc² = 0.001 × 1.66×10⁻²⁷ × (3×10⁸)² = 1.494×10⁻¹³ J. Convert: 1.494×10⁻¹³ / 1.6×10⁻¹³ ≈ 0.934 MeV. (Equivalently: 0.001 × 931.5 = 0.9315 MeV.)"
      },
      commonMistakes: [
        "Forgetting to square c in E = mc² — c² = 9×10¹⁶, which is enormous.",
        "Confusing binding energy (energy to pull a nucleus apart) with mass defect (the mass equivalent of that energy).",
        "Using half-life directly in the decay equation instead of the decay constant λ — use λ = ln2/t½ first."
      ],
      keyFacts: [
        "E = mc². 1 u = 931.5 MeV.",
        "Binding energy per nucleon peaks at iron-56 — fusion and fission both 'move toward' iron.",
        "N = N₀e^(−λt). t½ = ln2/λ.",
        "Activity A = λN (decays per second, in Bq).",
        "Nuclear radius R = R₀A^(1/3). Density is approx. constant for all nuclei."
      ]
    },

    "Quantum Physics": {
      title: "Quantum Physics: Photoelectric Effect & Wave-Particle Duality",
      keyIdea: "Light comes in discrete packets called photons — and the photoelectric effect proves it, because classical wave theory cannot explain the threshold frequency.",
      body: `PHOTONS
Light (and all EM radiation) travels as discrete packets of energy called photons.
Energy of one photon: E = hf = hc/λ
h = Planck's constant = 6.63 × 10⁻³⁴ J·s.
f = frequency (Hz), λ = wavelength (m).

THE PHOTOELECTRIC EFFECT
When light shines on a metal surface, electrons are emitted — but only if the frequency exceeds a threshold frequency f₀.

Einstein's photoelectric equation:
hf = Φ + KE_max
where Φ = work function (minimum energy to free an electron from the metal).

KE_max = hf − Φ

Work function in eV: 1 eV = 1.6 × 10⁻¹⁹ J.

Example: f = 0.8 × 10¹⁵ Hz, Φ = 1 eV = 1.6×10⁻¹⁹ J.
E_photon = hf = 6.63×10⁻³⁴ × 0.8×10¹⁵ = 5.30×10⁻¹⁹ J = 3.31 eV.
KE_max = 3.31 − 1 = 2.31 eV.

Key observations that classical wave theory CANNOT explain:
• Below threshold frequency f₀: no electrons emitted, regardless of intensity.
• Above f₀: electrons emitted instantly, even at low intensity.
• Increasing intensity increases the number of electrons (not their KE).
• Increasing frequency increases KE_max of emitted electrons.

WAVE-PARTICLE DUALITY
de Broglie wavelength: λ = h / (mv) = h / p
Any particle with momentum p has an associated wavelength λ.
Electrons show diffraction (wave behaviour) and can be detected as discrete particles.

ENERGY LEVELS IN ATOMS
Electrons exist in discrete energy levels. Photon emitted when electron drops to lower level: hf = E₁ − E₂.`,
      workedExample: {
        problem: "A photon of frequency 0.8×10¹⁵ Hz hits a metal with work function 1 eV. Find KE_max in eV. (h = 6.63×10⁻³⁴ J·s)",
        solution: "E = hf = 6.63×10⁻³⁴ × 0.8×10¹⁵ = 5.304×10⁻¹⁹ J = 5.304×10⁻¹⁹/1.6×10⁻¹⁹ = 3.315 eV. KE_max = 3.315 − 1 = 2.315 eV ≈ 2.31 eV."
      },
      commonMistakes: [
        "Mixing up eV and joules — convert work function to joules (× 1.6×10⁻¹⁹) before subtracting, OR convert photon energy to eV (÷ 1.6×10⁻¹⁹) first.",
        "Thinking higher intensity means higher KE of photoelectrons — intensity controls the NUMBER of electrons; frequency controls their KE.",
        "Forgetting the threshold condition: if hf < Φ, no photoelectric effect occurs regardless of intensity."
      ],
      keyFacts: [
        "E = hf = hc/λ. h = 6.63×10⁻³⁴ J·s.",
        "hf = Φ + KE_max. Threshold: f₀ = Φ/h.",
        "1 eV = 1.6×10⁻¹⁹ J.",
        "de Broglie: λ = h/p = h/(mv).",
        "Intensity → number of photons. Frequency → energy per photon."
      ]
    },

  }, // end alevel

}; // end EXPLANATIONS


// ─── Public helper ──────────────────────────────────────────────────────────
// Returns the explanation object for a given level + category,
// or null if none exists yet.
export function getExplanation(level, category) {
  const byLevel = EXPLANATIONS[level];
  if (!byLevel) return null;
  return byLevel[category] || null;
}
