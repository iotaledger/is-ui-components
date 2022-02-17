# is-ui-components

Set of reusable components for Integration Service API-based frontends.

## Update theme

You can customize the default Bootstrap 5 theme
using scss with svelete-preprocess.

Example:

```css
/* global.scss or some root component */
$theme-colors: (
	primary: pink
);
@import 'node_modules/bootstrap/scss/bootstrap.scss';
```

[Color reference](https://getbootstrap.com/docs/5.0/customize/color/#theme-colors)

## Generate package

To generate a package to be used as a library in other projects, it is necessary to execute:
`npm run package`

This takes all the files in the src/dist folder and generates a package with them which is saved in package folder.
