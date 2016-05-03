ag-floating-label
======================

Angular directive to create a floating label inspired by [Angular material](https://material.angularjs.org/latest/demo/input).

* None of the extra Angular Material fluff/bloat
* Simple directive support to add hints on focus
* Scss that is actually editable, so you can customize your inputs
* Native `<select>` dropdown menu, instead of hijacking the native `<select>` box
* Improved UI
* Works well with bootstrap, doesn't override anything or add unnecessary classes



# Usage
Add the js file to your html file, optionally add the css file as well.

Add `components` to your angular dependencies and then just add `floating-label` as an attribute on your input fields.
 
`floating-label` requires a placeholder attribute, which will be used as label. 
Optionally you can specify an `ng-model`, if you don't specify it, you are required to add the `id` or the `name` attribute.
  
# Examples
See examples in the example folder

# Changelog
[See changelog](CHANGELOG.md)