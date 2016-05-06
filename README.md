# ag-floating-label

## A Material Design Inspired Floating Label Module for AngularJs Forms
####[Demo](http://stephengardner.github.io/ag-floating-label/examples/)

If you...
* Love floating labels, and want an easy AngularJS directive
* Feel like most floating label designs leave much to be desired
* Or like the Material Design input style, but don't feel like messing with an entire framework

Then we've got you covered.

## Installation.
* `bower install ag-floating-label`
* add `dist/floating-label.js` and `dist/floating-label.css` to your project `<head>`
* add `agFloatingLabel` as a dependency to your Angular module.

## Simplicity.
```javascript
<form>
    <ag-floating-label>
        <label>
            Name
        </label>
        <input type="text" ng-model="name" name="name"/>
    </ag-floating-label>
</form>
````
##Size.
Less than 50KB for the `.js` and `.css` file, compared to Angular Material which is 700KB minified and 1,500KB unminified

## Design.
<img src="http://stephengardner.github.io/ag-floating-label/gh-pages-assets/ag-floating-label-1.png" width="400" />
<br/>
<img src="http://stephengardner.github.io/ag-floating-label/gh-pages-assets/ag-floating-label-3.png" width="400" />

## Flexibility.
We've included the `.scss` files, which make changing the format and colors a breeze.

## Material-Design Approved!
Inspired by Google's [Material Design](https://www.google.com/design/spec/material-design/introduction.html) and [Angular Material](https://material.angularjs.org/latest/demo/input).
####Benefits:
* None of the extra Angular Material fluff/bloat
* **Bootstrap support**, doesn't override anything or add unnecessary classes
* Easily add `<input>` *hints* when an `<input>` is focused
* `Sass` that is actually editable, so you can easily customize your `<input>` elements
* Native `<select>` dropdown menu, instead of hijacking the native `<select>` box
* Improved UI

## Bootstrap / Grid support
You don't need to change your forms to flexbox.
_Ex: A column-oriented form with hints and errors_
```javascript
<form>
    <div class="row">
        <div class="col-xs-12">
            <ag-floating-label>
                <label>Name</label>
                <div class="ag-input-group">
                    <div class="ag-input-group-addon">
                        <i class="material-icons">person</i>
                    </div>
                    <input type="text" required ng-model="iconFormName" name="name"/>
                </div>
                <ag-hints>
                    <ag-hint>
                        What should we call you?
                    </ag-hint>
                </ag-hints>
                <div ng-messages="iconForm.name.$error">
                    <div ng-message="required">Please select a name</div>
                </div>
            </ag-floating-label>
        </div>
    </div>
</form>
```

## Icons
Follow the bootstrap `input-group` convention, we use `<ag-input-group>` and `<ag-input-group-addon>`
```javascript
<ag-floating-label>
    <label>Name</label>
    <div class="ag-input-group">
        <div class="ag-input-group-addon">
            <i class="material-icons">person</i>
        </div>
        <input type="text" required ng-model="iconFormName" name="name"/>
    </div>
</ag-floating-label>
```
Shown here using Google's [Material Design Icon](https://design.google.com/icons/) icon set.

## More Code
See examples in the example folder

# Changelog
[See changelog](CHANGELOG.md)

#Pull Requests Accepted
