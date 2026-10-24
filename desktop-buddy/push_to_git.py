"""
Helper script to push the Clicky repository to GitHub or any remote Git repository.
Usage:
    .venv\\Scripts\\python.exe push_to_git.py <remote_url> [branch]
Example:
    .venv\\Scripts\\python.exe push_to_git.py https://github.com/username/clicky-windows.git main
"""
import sys
from dulwich import porcelain

def push_repo(remote_url: str, branch: str = "main"):
    print(f"Pushing Clicky repository to {remote_url} (branch: {branch})...")
    try:
        porcelain.push(".", remote_url, refspecs=[f"refs/heads/{branch}".encode()])
        print("✓ Successfully pushed to remote Git repository!")
    except Exception as e:
        print(f"Push failed: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Please provide your Git remote repository URL.")
        print("Usage: python push_to_git.py <remote_url>")
        sys.exit(1)

    url = sys.argv[1]
    br = sys.argv[2] if len(sys.argv) > 2 else "main"
    push_repo(url, br)
