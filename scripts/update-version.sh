set -e
git tag -f latest
git push
git push -f --tags
