"""Standalone protocol tests; no Windows or DLSS-Swapper installation required."""
import json
from pathlib import Path
import struct
import subprocess
import sys
import tempfile
import unittest

BASE = Path(__file__).resolve().parents[1]
HOST = BASE / 'bridge-windows' / 'host.py'

def ask(message):
    blob = json.dumps(message).encode()
    packet = struct.pack('<I', len(blob)) + blob
    proc = subprocess.run([sys.executable, str(HOST)], input=packet,
                          capture_output=True, timeout=5, check=True)
    assert len(proc.stdout) >= 4, proc.stderr
    size, = struct.unpack('<I', proc.stdout[:4])
    assert len(proc.stdout) == 4 + size
    return json.loads(proc.stdout[4:].decode())

class NativeBridgeTest(unittest.TestCase):
    def test_status(self):
        result = ask({'action':'status'})
        self.assertTrue(result['ok'])
        self.assertEqual(result['capability'], 'launcher_only')
        self.assertIsInstance(result['available'], bool)

    def test_denies_unsupported_actions(self):
        for action in ('execute', 'apply_dlss', 'download', 'inject', 'run_command', None):
            result = ask({'action':action})
            self.assertFalse(result['ok'])
            self.assertEqual(result['error'], 'unsupported_action')

    def test_denies_url_and_executable_arguments(self):
        result = ask({'action':'status', 'exe':'C:\\Windows\\System32\\cmd.exe', 'url':'https://youtube.com'})
        self.assertEqual(result['capability'], 'launcher_only')
        self.assertTrue(result['ok'])

    def test_launch_no_windows(self):
        if sys.platform != 'win32':
            result = ask({'action':'launch'})
            self.assertFalse(result['ok'])

if __name__ == '__main__':
    unittest.main()
