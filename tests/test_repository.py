"""Lightweight tests for source packaging and Firefox bridge ID consistency."""
import json
from pathlib import Path
import re
import unittest

ROOT = Path(__file__).resolve().parents[1]
EXT = ROOT / "extension"
MANIFEST = json.loads((EXT / "manifest.json").read_text(encoding="utf-8"))


class RepositoryTest(unittest.TestCase):
    def test_author_credit(self):
        self.assertEqual(MANIFEST["author"], "Andr995")
        self.assertEqual(MANIFEST["developer"]["name"], "Andr995")
        self.assertIn("Andr995", (ROOT / "LICENSE").read_text(encoding="utf-8"))

    def test_firefox_manifest_and_privacy(self):
        self.assertEqual(MANIFEST["manifest_version"], 3)
        self.assertIn("nativeMessaging", MANIFEST["permissions"])
        self.assertEqual(MANIFEST["browser_specific_settings"]["gecko"]["data_collection_permissions"]["required"], ["none"])
        self.assertTrue(MANIFEST["browser_specific_settings"]["gecko"]["id"])

    def test_host_id_consistency(self):
        popup = (EXT / "popup.js").read_text(encoding="utf-8")
        native = (ROOT / "bridge-windows" / "install.ps1").read_text(encoding="utf-8")
        self.assertIn("org.rtx_companion.dlss5swapper", popup)
        self.assertIn("org.rtx_companion.dlss5swapper", native)
        self.assertIn(MANIFEST["browser_specific_settings"]["gecko"]["id"], native)

    def test_all_manifest_assets_exist(self):
        assets = ["popup.html", "popup.css", "popup.js", "content.js"]
        assets.extend(MANIFEST["icons"].values())
        assets.extend([MANIFEST["action"]["default_icon"]])
        for asset in assets:
            with self.subTest(asset=asset):
                self.assertTrue((EXT / asset).is_file())

    def test_no_local_config_in_repository(self):
        self.assertFalse((ROOT / "bridge-windows" / "swapper_path.txt").exists())
        self.assertIn("bridge-windows/swapper_path.txt", (ROOT / ".gitignore").read_text(encoding="utf-8"))


if __name__ == "__main__":
    unittest.main()
