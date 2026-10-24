"""
Clicky GitHub Push Utility
Supports pushing using either a Personal Access Token or full repository URL.
"""
import sys
import os
from dulwich import porcelain
from dulwich.repo import Repo

def push_to_github(repo_name: str, token: str = None, username: str = "Alanntony669"):
    repo = Repo(".")
    branch = "main"

    if token:
        remote_url = f"https://{username}:{token}@github.com/{username}/{repo_name}.git"
    elif repo_name.startswith("http"):
        remote_url = repo_name
    else:
        remote_url = f"https://github.com/{username}/{repo_name}.git"

    print(f"Pushing to GitHub: https://github.com/{username}/{repo_name}...")
    try:
        porcelain.push(".", remote_url, refspecs=[b"refs/heads/main"])
        print("🎉 SUCCESS! Code has been pushed to your GitHub repository!")
        print(f"View it at: https://github.com/{username}/{repo_name}")
    except Exception as e:
        print(f"❌ Push failed: {e}")
        print("\nTip: GitHub requires authentication. You can generate a Personal Access Token at:")
        print("https://github.com/settings/tokens (classic) with 'repo' scope.")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python push_to_github.py <repo_name> [personal_access_token]")
        print("Example:")
        print("  python push_to_github.py heyclicky-windows ghp_YourTokenHere")
        sys.exit(1)

    repo_arg = sys.argv[1]
    token_arg = sys.argv[2] if len(sys.argv) > 2 else None
    push_to_github(repo_arg, token_arg)
