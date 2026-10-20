#!/usr/bin/env python3
"""Create an UNSIGNED Firefox extension archive for Mozilla review/signing."""
from __future__ import annotations

import json
from pathlib import Path
import zipfile

ROOT = Path(__file__).resolve().parents[1]
EXTENSION = ROOT / "extension"
DIST = ROOT / "dist"


def build() -> Path:
    manifest = json.loads((EXTENSION / "manifest.json").read_text(encoding="utf-8"))
    version = manifest["version"]
    DIST.mkdir(exist_ok=True)
    output = DIST / f"rtx-video-companion-firefox-v{version}-unsigned.zip"
    with zipfile.ZipFile(output, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        for item in sorted(EXTENSION.rglob("*")):
            if item.is_file():
                archive.write(item, item.relative_to(EXTENSION).as_posix())
    with zipfile.ZipFile(output) as archive:
        assert "manifest.json" in archive.namelist()
        assert archive.testzip() is None
    print(output)
    return output


if __name__ == "__main__":
    build()
