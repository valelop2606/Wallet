import json
import os
import subprocess
import sys
from pathlib import Path


def main() -> None:
    json.load(sys.stdin)
    project_dir = Path(os.environ["CLAUDE_PROJECT_DIR"]).resolve()
    npm_command = "npm.cmd" if os.name == "nt" else "npm"
    result = subprocess.run(
        [npm_command, "test", "--workspace=backend"],
        cwd=project_dir,
        check=False,
    )
    if result.returncode:
        print("Las pruebas fallaron después de la modificación.", file=sys.stderr)
        raise SystemExit(result.returncode)


if __name__ == "__main__":
    main()
