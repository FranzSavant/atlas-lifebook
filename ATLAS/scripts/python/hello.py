#!/usr/bin/env python3
"""Ejemplo para pi — llamado desde una skill."""
import sys
def main():
    name = sys.argv[1] if len(sys.argv) > 1 else "Francisco"
    print(f"Hola {name} desde Atlas/scripts/python/hello.py — vivo en tu vault y sobreviviré al push a GitHub.")
if __name__ == "__main__":
    main()
