#!/usr/bin/env python3
"""Sync espejo legible -> Pi, convirtiendo metadatos base a formato Pi. Estructura nueva: ATLAS/skills -> .pi/skills"""
import pathlib

BASE = pathlib.Path("C:/Users/usuario/Desktop/Atlas")
SRC = BASE / "ATLAS" / "skills"
DST = BASE / ".pi" / "skills"

def parse_frontmatter(text):
    if not text.startswith("---"):
        return {}, text
    end = text.find("---", 3)
    if end == -1:
        return {}, text
    fm = text[3:end]
    body = text[end+3:]
    data = {}
    for line in fm.splitlines():
        if ":" in line:
            k,v = line.split(":",1)
            data[k.strip()] = v.strip().strip('"').strip("'")
    return data, body

for src_file in SRC.rglob("SKILL.md"):
    rel = src_file.relative_to(SRC)
    dst_file = DST / rel
    dst_file.parent.mkdir(parents=True, exist_ok=True)
    text = src_file.read_text(encoding="utf-8")
    data, body = parse_frontmatter(text)
    name = data.get("id") or data.get("name") or src_file.parent.name
    desc = data.get("descripcion") or data.get("description") or data.get("utilidad") or "Skill"
    pi_fm = f"---\nname: {name}\ndescription: {desc}\n---\n"
    new_text = pi_fm + body.lstrip("\n")
    dst_file.write_text(new_text, encoding="utf-8")
    print(f"sync {rel} : id:{name} -> name:{name}")

print("done sync with conversion")
