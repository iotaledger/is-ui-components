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
@import "node_modules/bootstrap/scss/bootstrap.scss";
```

[Color reference](https://getbootstrap.com/docs/5.0/customize/color/#theme-colors)