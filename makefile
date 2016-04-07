publish:
	rm -rf iStats-darwin-x64.zip iStats-darwin-x64
	npm run build
	zip -ryX iStats-darwin-x64.zip iStats-darwin-x64
	npm run publish
.PHONY: publish

