import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path


def main() -> None:
    payload = json.load(sys.stdin)
    project_dir = Path(os.environ["CLAUDE_PROJECT_DIR"]).resolve()
    audit_file = project_dir / ".claude" / "audit.log"
    record = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "event": payload.get("hook_event_name"),
        "tool": payload.get("tool_name"),
    }
    with audit_file.open("a", encoding="utf-8") as stream:
        stream.write(json.dumps(record, ensure_ascii=True) + "\n")


if __name__ == "__main__":
    main()
