set -e
git tag --delete latest
git tag latest
git push --delete origin tags/latest
git push
git push --tags
