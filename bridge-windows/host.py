"""Minimal Firefox Native Messaging host for launching DLSS5-Swapper.

No DLSS injection, no downloading or processing YouTube frames, and no network.
"""
from __future__ import annotations
import json
import os
from pathlib import Path
import struct
import subprocess
import sys

MAX_MESSAGE = 65536
CAPABILITY = "launcher_only"
APPNAME = "org.rtx_companion.dlss5swapper"
BASE = Path(__file__).resolve().parent


def read_message():
    header = sys.stdin.buffer.read(4)
    if not header:
        return None
    if len(header) != 4:
        raise ValueError("incomplete header")
    length, = struct.unpack("<I", header)
    if length == 0 or length > MAX_MESSAGE:
        raise ValueError("invalid message length")
    payload = sys.stdin.buffer.read(length)
    if len(payload) != length:
        raise ValueError("incomplete message")
    return json.loads(payload.decode("utf-8"))


def send_message(message):
    blob = json.dumps(message, separators=(",", ":"), ensure_ascii=False).encode("utf-8")
    sys.stdout.buffer.write(struct.pack("<I", len(blob)) + blob)
    sys.stdout.buffer.flush()


def find_swapper():
    # Only known EXE names, from the user-managed configuration or known install paths.
    custom = BASE / "swapper_path.txt"
    if custom.exists():
        value = custom.read_text(encoding="utf-8-sig").strip().strip('"')
        if value:
            path = Path(value)
            if path.is_file() and path.suffix.lower() == '.exe' and (
                'dlss' in path.name.lower() and 'swapper' in path.name.lower()
            ):
                return path.resolve()
    local = Path(os.environ.get("LOCALAPPDATA", str(BASE)))
    program = Path(os.environ.get("PROGRAMFILES", str(BASE)))
    bases = [
        local / "Programs" / "DLSS 5 Swapper",
        local / "Programs" / "dlss5-swapper",
        program / "DLSS 5 Swapper",
        program / "DLSS5-Swapper",
        local / "DLSS 5 Swapper",
    ]
    known_names = ("DLSS 5 Swapper.exe", "DLSS5-Swapper.exe")
    for folder in bases:
        for name in known_names:
            path = folder / name
            if path.is_file():
                return path.resolve()
    return None


def handle(message):
    if not isinstance(message, dict):
        return {"ok": False, "error": "expected_json_object", "capability": CAPABILITY}
    action = message.get("action")
    if action not in ("status", "launch"):
        return {"ok": False, "error": "unsupported_action", "capability": CAPABILITY}
    exe = find_swapper()
    if action == "status":
        return {"ok": True, "available": exe is not None, "capability": CAPABILITY}
    if not exe:
        return {"ok": False, "error": "swapper_not_found", "capability": CAPABILITY}
    if os.name != "nt":
        return {"ok": False, "error": "windows_required", "capability": CAPABILITY}
    # Launched ONLY after the user presses the dedicated button in the popup.
    try:
        flags = (getattr(subprocess, "DETACHED_PROCESS", 0) |
                 getattr(subprocess, "CREATE_NEW_PROCESS_GROUP", 0))
        subprocess.Popen([str(exe)], cwd=str(exe.parent), stdin=subprocess.DEVNULL,
                         stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
                         creationflags=flags, close_fds=True)
        return {"ok": True, "launched": True, "capability": CAPABILITY}
    except OSError:
        return {"ok": False, "error": "launch_failed", "capability": CAPABILITY}


def main():
    try:
        message = read_message()
        if message is None:
            return
        send_message(handle(message))
    except Exception:
        # Avoid writing diagnostics to stdout: stdout is the native protocol channel.
        try:
            send_message({"ok": False, "error": "invalid_request", "capability": CAPABILITY})
        except (OSError, ValueError):
            pass

if __name__ == "__main__":
    main()
