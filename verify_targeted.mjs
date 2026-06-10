// Targeted formula verification for MIN-69
// Directly computes each formula type and checks against the stored answer
import { QUESTIONS } from './src/data/questions.js';

const TARGET_CATEGORIES = ['Energy', 'Waves', 'Electricity', 'Matter', 'Space'];

const physicsWithSolutions = QUESTIONS.filter(q =>
  q.subject === 'physics' &&
  q.solution &&
  TARGET_CATEGORIES.some(cat => q.category && q.category.toLowerCase().includes(cat.toLowerCase()))
);

function num(s) { return parseFloat(s); }
function close(a, b, tol = 0.02) {
  if (b === 0) return Math.abs(a) < tol;
  return Math.abs(a - b) / Math.abs(b) < tol;
}

const failures = [];
const checked = [];

for (const q of physicsWithSolutions) {
  const sol = q.solution;
  const text = q.text;
  let computed = null;
  let formula = '';

  // Extract claimed answer value
  const ansMatch = sol.match(/So the answer is ([A-D])\s*\(([^)]+)\)/i);
  if (!ansMatch) continue;
  const claimedKey = ansMatch[1];
  const claimedStr = ansMatch[2].trim();
  const claimed = parseFloat(claimedStr);
  if (isNaN(claimed)) continue; // skip non-numeric (string answers)

  // --- KS3 Energy: E=P×t or P=E/t or t=E/P ---
  if (q.id.startsWith('ks3') && sol.includes('E = P × t')) {
    const m = text.match(/(\d+(?:\.\d+)?)\s*W.*?(\d+(?:\.\d+)?)\s*s/);
    const m2 = sol.match(/E = P × t = (\d+(?:\.\d+)?) W × (\d+(?:\.\d+)?) s = (\d+(?:\.\d+)?)/);
    if (m2) {
      computed = num(m2[1]) * num(m2[2]);
      formula = 'E=Pt';
      if (!close(computed, num(m2[3]))) {
        failures.push({ id: q.id, formula, computed, claimed: num(m2[3]), sol });
      } else checked.push(q.id);
    }
  } else if (q.id.startsWith('ks3') && sol.includes('t = E ÷ P')) {
    const m2 = sol.match(/t = E ÷ P = (\d+(?:\.\d+)?) J ÷ (\d+(?:\.\d+)?) W = (\d+(?:\.\d+)?)/);
    if (m2) {
      computed = num(m2[1]) / num(m2[2]);
      formula = 't=E/P';
      if (!close(computed, num(m2[3]))) {
        failures.push({ id: q.id, formula, computed, claimed: num(m2[3]), sol });
      } else checked.push(q.id);
    }
  }

  // --- KS3 Waves: v=fλ ---
  else if (q.id.startsWith('ks3_ph_waves') && sol.includes('v = f × λ')) {
    const m2 = sol.match(/v = f × λ = (\d+(?:\.\d+)?) Hz × (\d+(?:\.\d+)?) m = (\d+(?:\.\d+)?)/);
    if (m2) {
      computed = num(m2[1]) * num(m2[2]);
      formula = 'v=fλ';
      if (!close(computed, num(m2[3]))) {
        failures.push({ id: q.id, formula, computed, claimed: num(m2[3]), sol });
      } else checked.push(q.id);
    }
  } else if (q.id.startsWith('ks3_ph_waves') && sol.includes('f = v ÷ λ')) {
    const m2 = sol.match(/f = v ÷ λ = (\d+(?:\.\d+)?) m\/s ÷ (\d+(?:\.\d+)?) m = (\d+(?:\.\d+)?)/);
    if (m2) {
      computed = num(m2[1]) / num(m2[2]);
      formula = 'f=v/λ';
      if (!close(computed, num(m2[3]))) {
        failures.push({ id: q.id, formula, computed, claimed: num(m2[3]), sol });
      } else checked.push(q.id);
    }
  } else if (q.id.startsWith('ks3_ph_waves') && sol.includes('λ = v ÷ f')) {
    const m2 = sol.match(/λ = v ÷ f = (\d+(?:\.\d+)?) m\/s ÷ (\d+(?:\.\d+)?) Hz = (\d+(?:\.\d+)?)/);
    if (m2) {
      computed = num(m2[1]) / num(m2[2]);
      formula = 'λ=v/f';
      if (!close(computed, num(m2[3]))) {
        failures.push({ id: q.id, formula, computed, claimed: num(m2[3]), sol });
      } else checked.push(q.id);
    }
  }

  // --- KS3 Electricity: V=IR ---
  else if (q.id.startsWith('ks3_ph_elec') && sol.match(/I = V ÷ R/)) {
    const m2 = sol.match(/I = V ÷ R = (\d+(?:\.\d+)?) V ÷ (\d+(?:\.\d+)?) Ω = (\d+(?:\.\d+)?)/);
    if (m2) {
      computed = num(m2[1]) / num(m2[2]);
      formula = 'I=V/R';
      if (!close(computed, num(m2[3]))) {
        failures.push({ id: q.id, formula, computed, claimed: num(m2[3]), sol });
      } else checked.push(q.id);
    }
  } else if (q.id.startsWith('ks3_ph_elec') && sol.match(/V = I × R/)) {
    const m2 = sol.match(/V = I × R = (\d+(?:\.\d+)?) A × (\d+(?:\.\d+)?) Ω = (\d+(?:\.\d+)?)/);
    if (m2) {
      computed = num(m2[1]) * num(m2[2]);
      formula = 'V=IR';
      if (!close(computed, num(m2[3]))) {
        failures.push({ id: q.id, formula, computed, claimed: num(m2[3]), sol });
      } else checked.push(q.id);
    }
  }

  // --- KS3 Matter: density = m/V ---
  else if (q.id.startsWith('ks3_ph_matter') && sol.includes('density × volume')) {
    const m2 = sol.match(/= (\d+(?:\.\d+)?) g\/cm³ × (\d+(?:\.\d+)?) cm³ = (\d+(?:\.\d+)?)/);
    if (m2) {
      computed = num(m2[1]) * num(m2[2]);
      formula = 'mass=ρV';
      if (!close(computed, num(m2[3]))) {
        failures.push({ id: q.id, formula, computed, claimed: num(m2[3]), sol });
      } else checked.push(q.id);
    }
  } else if (q.id.startsWith('ks3_ph_matter') && sol.includes('mass ÷ density')) {
    const m2 = sol.match(/= (\d+(?:\.\d+)?) g ÷ (\d+(?:\.\d+)?) g\/cm³ = (\d+(?:\.\d+)?)/);
    if (m2) {
      computed = num(m2[1]) / num(m2[2]);
      formula = 'V=m/ρ';
      if (!close(computed, num(m2[3]))) {
        failures.push({ id: q.id, formula, computed, claimed: num(m2[3]), sol });
      } else checked.push(q.id);
    }
  }

  // --- GCSE Energy: KE = ½mv² ---
  else if (q.id.startsWith('gcse_ph_energy_ke')) {
    const m2 = sol.match(/½ × (\d+(?:\.\d+)?) × (\d+(?:\.\d+)?)² = ½ × \d+(?:\.\d+)? × (\d+(?:\.\d+)?) = (\d+(?:\.\d+)?)/);
    if (m2) {
      computed = 0.5 * num(m2[1]) * num(m2[2]) * num(m2[2]);
      formula = 'KE=½mv²';
      if (!close(computed, num(m2[4]))) {
        failures.push({ id: q.id, formula, computed, claimed: num(m2[4]), sol });
      } else checked.push(q.id);
    }
  }

  // --- GCSE Energy: GPE = mgh ---
  else if (q.id.startsWith('gcse_ph_energy_gpe')) {
    const m2 = sol.match(/= (\d+(?:\.\d+)?) kg × (\d+(?:\.\d+)?) N\/kg × (\d+(?:\.\d+)?) m = (\d+(?:\.\d+)?)/);
    if (m2) {
      computed = num(m2[1]) * num(m2[2]) * num(m2[3]);
      formula = 'GPE=mgh';
      if (!close(computed, num(m2[4]))) {
        failures.push({ id: q.id, formula, computed, claimed: num(m2[4]), sol });
      } else checked.push(q.id);
    }
  }

  // --- GCSE Energy: Q = mcΔT ---
  else if (q.id.startsWith('gcse_ph_energy_ht')) {
    const m2 = sol.match(/= (\d+(?:\.\d+)?) kg × (\d+(?:\.\d+)?) J\/\(kg·K\) × (\d+(?:\.\d+)?) K = (\d+(?:\.\d+)?)/);
    if (m2) {
      computed = num(m2[1]) * num(m2[2]) * num(m2[3]);
      formula = 'Q=mcΔT';
      if (!close(computed, num(m2[4]))) {
        failures.push({ id: q.id, formula, computed, claimed: num(m2[4]), sol });
      } else checked.push(q.id);
    }
  }

  // --- GCSE Energy: P = E/t ---
  else if (q.id.startsWith('gcse_ph_energy_pow')) {
    if (sol.includes('P = E ÷ t')) {
      const m2 = sol.match(/P = E ÷ t = (\d+(?:\.\d+)?) J ÷ (\d+(?:\.\d+)?) s = (\d+(?:\.\d+)?)/);
      if (m2) {
        computed = num(m2[1]) / num(m2[2]);
        formula = 'P=E/t';
        if (!close(computed, num(m2[3]))) {
          failures.push({ id: q.id, formula, computed, claimed: num(m2[3]), sol });
        } else checked.push(q.id);
      }
    }
  }

  // --- GCSE Electricity: P = IV ---
  else if (q.id.startsWith('gcse_ph_elec_power')) {
    const m2 = sol.match(/P = IV = (\d+(?:\.\d+)?) A × (\d+(?:\.\d+)?) V = (\d+(?:\.\d+)?)/);
    if (m2) {
      computed = num(m2[1]) * num(m2[2]);
      formula = 'P=IV';
      if (!close(computed, num(m2[3]))) {
        failures.push({ id: q.id, formula, computed, claimed: num(m2[3]), sol });
      } else checked.push(q.id);
    }
  }

  // --- GCSE Electricity: Q = It ---
  else if (q.id.startsWith('gcse_ph_elec_charge')) {
    const m2 = sol.match(/Q = It = (\d+(?:\.\d+)?) A × (\d+(?:\.\d+)?) s = (\d+(?:\.\d+)?)/);
    if (m2) {
      computed = num(m2[1]) * num(m2[2]);
      formula = 'Q=It';
      if (!close(computed, num(m2[3]))) {
        failures.push({ id: q.id, formula, computed, claimed: num(m2[3]), sol });
      } else checked.push(q.id);
    }
  }

  // --- GCSE Electricity: E = Pt ---
  else if (q.id.startsWith('gcse_ph_elec_energy')) {
    const m2 = sol.match(/E = Pt = (\d+(?:\.\d+)?) W × (\d+(?:\.\d+)?) s = (\d+(?:\.\d+)?)/);
    if (m2) {
      computed = num(m2[1]) * num(m2[2]);
      formula = 'E=Pt';
      if (!close(computed, num(m2[3]))) {
        failures.push({ id: q.id, formula, computed, claimed: num(m2[3]), sol });
      } else checked.push(q.id);
    }
  }

  // --- GCSE Waves: v = fλ ---
  else if (q.id.startsWith('gcse_ph_waves')) {
    if (sol.includes('v = f × λ')) {
      const m2 = sol.match(/v = f × λ = (\d+(?:\.\d+)?) Hz × (\d+(?:\.\d+)?) m = (\d+(?:\.\d+)?)/);
      if (m2) {
        computed = num(m2[1]) * num(m2[2]);
        formula = 'v=fλ';
        if (!close(computed, num(m2[3]))) {
          failures.push({ id: q.id, formula, computed, claimed: num(m2[3]), sol });
        } else checked.push(q.id);
      }
    } else if (sol.includes('λ = v ÷ f')) {
      const m2 = sol.match(/λ = v ÷ f = (\d+(?:\.\d+)?) m\/s ÷ (\d+(?:\.\d+)?) Hz = (\d+(?:\.\d+)?)/);
      if (m2) {
        computed = num(m2[1]) / num(m2[2]);
        formula = 'λ=v/f';
        if (!close(computed, num(m2[3]))) {
          failures.push({ id: q.id, formula, computed, claimed: num(m2[3]), sol });
        } else checked.push(q.id);
      }
    } else if (sol.includes('f = v ÷ λ')) {
      const m2 = sol.match(/f = v ÷ λ = (\d+(?:\.\d+)?) m\/s ÷ (\d+(?:\.\d+)?) m = (\d+(?:\.\d+)?)/);
      if (m2) {
        computed = num(m2[1]) / num(m2[2]);
        formula = 'f=v/λ';
        if (!close(computed, num(m2[3]))) {
          failures.push({ id: q.id, formula, computed, claimed: num(m2[3]), sol });
        } else checked.push(q.id);
      }
    }
  }

  // --- GCSE Space: v = 2πr/T ---
  else if (q.id.startsWith('gcse_ph_space_orbit')) {
    const m2 = sol.match(/= 2π × (\d+(?:\.\d+)?) × 10⁶ m ÷ (\d+(?:\.\d+)?) s = (\d+(?:\.\d+)?)/);
    if (m2) {
      computed = Math.round(2 * Math.PI * num(m2[1]) * 1e6 / num(m2[2]));
      formula = 'v=2πr/T';
      if (!close(computed, num(m2[3]), 0.005)) {
        failures.push({ id: q.id, formula, computed, claimed: num(m2[3]), sol });
      } else checked.push(q.id);
    }
  }

  // --- A-level Electricity: R = ρL/A ---
  else if (q.id.startsWith('alevel_ph_elec_resistivity')) {
    const m2 = sol.match(/R = ρL ÷ A = ([\d.e+-]+) × (\d+(?:\.\d+)?) ÷ ([\d.e+-]+) = (\d+(?:\.\d+)?)/);
    if (m2) {
      computed = num(m2[1]) * num(m2[2]) / num(m2[3]);
      formula = 'R=ρL/A';
      if (!close(computed, num(m2[4]))) {
        failures.push({ id: q.id, formula, computed, claimed: num(m2[4]), sol });
      } else checked.push(q.id);
    }
  }

  // --- A-level Electricity: Q = CV ---
  else if (q.id.startsWith('alevel_ph_elec_cap_charge')) {
    const m2 = sol.match(/Q = CV = ([\d.e+-]+) F × (\d+(?:\.\d+)?) V = ([\d.e+-]+)/);
    if (m2) {
      computed = num(m2[1]) * num(m2[2]);
      formula = 'Q=CV';
      if (!close(computed, num(m2[3]))) {
        failures.push({ id: q.id, formula, computed, claimed: num(m2[3]), sol });
      } else checked.push(q.id);
    }
  }

  // --- A-level Electricity: E = ½CV² ---
  else if (q.id.startsWith('alevel_ph_elec_cap_energy')) {
    const m2 = sol.match(/E = ½CV² = ½ × ([\d.e+-]+) F × (\d+(?:\.\d+)?)² = ([\d.e+-]+)/);
    if (m2) {
      computed = 0.5 * num(m2[1]) * num(m2[2]) * num(m2[2]);
      formula = 'E=½CV²';
      if (!close(computed, num(m2[3]))) {
        failures.push({ id: q.id, formula, computed, claimed: num(m2[3]), sol });
      } else checked.push(q.id);
    }
  }

  // --- A-level Waves: YDSE w = λD/s ---
  else if (q.id.startsWith('alevel_ph_wav_ydse')) {
    // w = λD ÷ s = Xnm × Ym ÷ (Zmm) = result mm
    const m2 = sol.match(/= (\d+) × 10⁻⁹ m × (\d+(?:\.\d+)?) m ÷ \((\d+(?:\.\d+)?) × 10⁻³ m\) = (\d+(?:\.\d+)?)/);
    if (m2) {
      computed = (num(m2[1]) * 1e-9 * num(m2[2])) / (num(m2[3]) * 1e-3) * 1e3; // in mm
      formula = 'w=λD/s';
      if (!close(computed, num(m2[4]))) {
        failures.push({ id: q.id, formula, computed, claimed: num(m2[4]), sol });
      } else checked.push(q.id);
    }
  }

  // --- A-level Waves: grating nλ = d sinθ ---
  else if (q.id.startsWith('alevel_ph_wav_grat')) {
    // sinθ = nλ/d = n × λ_nm / (1/lines_per_mm * 1e6 nm)
    // Just verify the final sinθ or θ value
    const m2 = sol.match(/sin θ = nλ ÷ d = (\d+) × (\d+) × 10⁻⁹ ÷ ([\d.e+-]+) = ([\d.e+-]+)/);
    if (m2) {
      computed = num(m2[1]) * num(m2[2]) * 1e-9 / num(m2[3]);
      formula = 'sinθ=nλ/d';
      if (!close(computed, num(m2[4]))) {
        failures.push({ id: q.id, formula, computed, claimed: num(m2[4]), sol });
      } else checked.push(q.id);
    }
  }
}

console.log(`\n=== TARGETED FORMULA ARITHMETIC VERIFICATION ===`);
console.log(`Questions with parseable formulas verified: ${checked.length}`);
console.log(`Arithmetic failures: ${failures.length}`);

if (failures.length > 0) {
  console.log(`\n=== FAILURES ===`);
  for (const f of failures) {
    console.log(`  ${f.id}: formula=${f.formula} computed=${f.computed} claimed=${f.claimed}`);
    console.log(`    Sol: ${f.sol}`);
  }
} else {
  console.log(`All targeted formula checks PASS.`);
}
