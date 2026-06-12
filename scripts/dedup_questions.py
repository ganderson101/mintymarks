"""Remove duplicate question IDs from questions.json (keep first occurrence)."""
import json, pathlib

path = pathlib.Path("C:/Users/G/Documents/Claude/Projects/MintyMarks-min133/backend/questions.json")
data = json.loads(path.read_text(encoding="utf-8"))
before = len(data)
seen = set()
deduped = []
for q in data:
    if q["id"] not in seen:
        seen.add(q["id"])
        deduped.append(q)
path.write_text(json.dumps(deduped, ensure_ascii=False, indent=2), encoding="utf-8")
print(f"Removed {before - len(deduped)} duplicates. Total: {before} -> {len(deduped)}")
