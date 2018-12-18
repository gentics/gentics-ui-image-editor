# Gentics UI Image Editor Changelog

## 0.4.0 (2018-12-14)

### Features

* Allow passing custom aspect ratios for cropping.
* Allow disable built-in aspect ratios for cropping.
* Allow set custom label and display mode (radio or select) for aspect ratios.
* Add mobile view for aspect ratios.

## 0.3.5 (2018-10-11)

### Fixes

* Fix image cropper preview image not spanning the full width with extreme portrait aspect ratios.

## 0.3.4 (2018-10-10)

### Fixes

* Fix image cropper preview image being too big in Firefox and Edge.
* Fix crop mode not respecting the intitially set aspect ratio.

## 0.3.3 (2018-09-27)

### Fixes

* Fix initial misplacement of focal point selector when displaying the image editor inside a Gentics UI Core modal (GitHub issue #2).

## 0.3.2 (2018-07-17)

### Fixes

* Fix undefined CropperConstructor token when in AoT mode.

## 0.3.1 (2017-07-13)

### Fixes

* Correctly export declarations & services to make this lib AoT-compatible.

## 0.3.0 (2017-04-19)

### Features

* Export the `gentics-ui-image-preview` component.
* Expose editing state with the `editing` output.

### Fixes

* Disable text select in editor controls

## 0.2.1 (2017-04-06)

### Features

* Allow setting the transform with the `transform` input.

### Fixes

* Fixed visual jitter caused by resize loop at certain screen heights.

## 0.1.2 (2017-04-05)

Initial release
