publish:
	-rm -rf QuickStats-darwin-x64.zip QuickStats-darwin-x64
	npm run build
	zip QuickStats-darwin-x64.zip QuickStats-darwin-x64
	npm run publish
.PHONY: publish

