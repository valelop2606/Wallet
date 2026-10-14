import json
import re
import sys


BLOCKED_PATTERNS = (
    r"\bgit\s+reset\s+--hard\b",
    r"\bgit\s+clean\s+-[^\n]*f",
    r"\brm\s+-[^\n]*r[^\n]*f",
    r"\bRemove-Item\b[^\n]*-Recurse",
)


def main() -> None:
    payload = json.load(sys.stdin)
    tool_input = payload.get("tool_input", {})
    command = tool_input.get("command", "")
    if any(re.search(pattern, command, re.IGNORECASE) for pattern in BLOCKED_PATTERNS):
        print("Comando bloqueado por seguridad.", file=sys.stderr)
        print(json.dumps({"decision": "block"}))
        raise SystemExit(2)


if __name__ == "__main__":
    main()
