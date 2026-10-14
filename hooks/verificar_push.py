import os
import subprocess
import sys
from pathlib import Path


def main() -> int:
    project_dir = Path(__file__).resolve().parents[1]
    npm_command = "npm.cmd" if os.name == "nt" else "npm"
    result = subprocess.run(
        [npm_command, "test", "--workspace=backend"],
        cwd=project_dir,
        check=False,
    )
    if result.returncode:
        print("Push bloqueado: las pruebas no pasan.", file=sys.stderr)
    return result.returncode


if __name__ == "__main__":
    raise SystemExit(main())
