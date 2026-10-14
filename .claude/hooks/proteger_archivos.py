import json
import os
import sys
from pathlib import Path


PROTECTED_NAMES = {".env", ".env.local", "schema.sql"}


def main() -> None:
    payload = json.load(sys.stdin)
    tool_input = payload.get("tool_input", {})
    raw_path = tool_input.get("file_path") or tool_input.get("path")
    if not raw_path:
        return

    project_dir = Path(os.environ["CLAUDE_PROJECT_DIR"]).resolve()
    target = Path(raw_path)
    if not target.is_absolute():
        target = project_dir / target

    if target.name in PROTECTED_NAMES:
        print(f"Archivo protegido: {target}", file=sys.stderr)
        print(json.dumps({"decision": "block"}))
        raise SystemExit(2)


if __name__ == "__main__":
    main()
