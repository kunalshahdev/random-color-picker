var presetColors = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#3b82f6', '#6366f1', '#a855f7', '#ec4899', '#1a1a1a'
];

var currentMode = 'rgb';

var red = 26;
var green = 26;
var blue = 26;

var hue = 0;
var saturation = 0;
var lightness = 15;

var previewBox = document.getElementById('preview');
var hexLabel = document.getElementById('hexLabel');
var hexInput = document.getElementById('hexInput');
var copyButton = document.getElementById('copyBtn');
var slidersContainer = document.getElementById('sliders');
var paletteContainer = document.getElementById('palette');

function rgbToHex(redValue, greenValue, blueValue) {
  var redHex = redValue.toString(16);
  var greenHex = greenValue.toString(16);
  var blueHex = blueValue.toString(16);

  if (redHex.length === 1) {
    redHex = '0' + redHex;
  }
  if (greenHex.length === 1) {
    greenHex = '0' + greenHex;
  }
  if (blueHex.length === 1) {
    blueHex = '0' + blueHex;
  }

  return '#' + redHex + greenHex + blueHex;
}

function hexToRgb(hexCode) {
  var hexWithoutHash = hexCode.slice(1);
  var fullNumber = parseInt(hexWithoutHash, 16);

  var extractedRed = (fullNumber >> 16) & 255;
  var extractedGreen = (fullNumber >> 8) & 255;
  var extractedBlue = fullNumber & 255;

  return {
    red: extractedRed,
    green: extractedGreen,
    blue: extractedBlue
  };
}

function rgbToHsl(redValue, greenValue, blueValue) {
  var normalizedRed = redValue / 255;
  var normalizedGreen = greenValue / 255;
  var normalizedBlue = blueValue / 255;

  var max = Math.max(normalizedRed, normalizedGreen, normalizedBlue);
  var min = Math.min(normalizedRed, normalizedGreen, normalizedBlue);

  var calculatedLightness = (max + min) / 2;

  if (max === min) {
    return {
      hue: 0,
      saturation: 0,
      lightness: Math.round(calculatedLightness * 100)
    };
  }

  var difference = max - min;
  var calculatedSaturation;

  if (calculatedLightness > 0.5) {
    calculatedSaturation = difference / (2 - max - min);
  } else {
    calculatedSaturation = difference / (max + min);
  }

  var calculatedHue;

  if (max === normalizedRed) {
    calculatedHue = (normalizedGreen - normalizedBlue) / difference;
    if (normalizedGreen < normalizedBlue) {
      calculatedHue = calculatedHue + 6;
    }
    calculatedHue = calculatedHue / 6;
  } else if (max === normalizedGreen) {
    calculatedHue = ((normalizedBlue - normalizedRed) / difference + 2) / 6;
  } else {
    calculatedHue = ((normalizedRed - normalizedGreen) / difference + 4) / 6;
  }

  return {
    hue: Math.round(calculatedHue * 360),
    saturation: Math.round(calculatedSaturation * 100),
    lightness: Math.round(calculatedLightness * 100)
  };
}

function hslToRgb(hueValue, saturationValue, lightnessValue) {
  var normalizedHue = hueValue / 360;
  var normalizedSaturation = saturationValue / 100;
  var normalizedLightness = lightnessValue / 100;

  function hueToRgb(color1, color2, huePosition) {
    if (huePosition < 0) {
      huePosition = huePosition + 1;
    }
    if (huePosition > 1) {
      huePosition = huePosition - 1;
    }

    if (huePosition < 1 / 6) {
      return color1 + (color2 - color1) * 6 * huePosition;
    }
    if (huePosition < 1 / 2) {
      return color2;
    }
    if (huePosition < 2 / 3) {
      return color1 + (color2 - color1) * (2 / 3 - huePosition) * 6;
    }
    return color1;
  }

  if (normalizedSaturation === 0) {
    var grayValue = Math.round(normalizedLightness * 255);
    return {
      red: grayValue,
      green: grayValue,
      blue: grayValue
    };
  }

  var factor2;
  if (normalizedLightness < 0.5) {
    factor2 = normalizedLightness * (1 + normalizedSaturation);
  } else {
    factor2 = normalizedLightness + normalizedSaturation - normalizedLightness * normalizedSaturation;
  }
  var factor1 = 2 * normalizedLightness - factor2;

  var finalRed = Math.round(hueToRgb(factor1, factor2, normalizedHue + 1 / 3) * 255);
  var finalGreen = Math.round(hueToRgb(factor1, factor2, normalizedHue) * 255);
  var finalBlue = Math.round(hueToRgb(factor1, factor2, normalizedHue - 1 / 3) * 255);

  return {
    red: finalRed,
    green: finalGreen,
    blue: finalBlue
  };
}

function updateUI() {
  var hexCode = rgbToHex(red, green, blue);

  previewBox.style.background = hexCode;
  hexLabel.textContent = hexCode;
  hexInput.value = hexCode;

  buildSliders();
}

function makeSliderRow(labelText, sliderId, minValue, maxValue, currentValue) {
  var html = '';

  html = html + '<div class="slider-row">';
  html = html +   '<label>' + labelText + '</label>';
  html = html +   '<input type="range" min="' + minValue + '" max="' + maxValue + '" value="' + currentValue + '" data-id="' + sliderId + '" />';
  html = html +   '<input type="number" min="' + minValue + '" max="' + maxValue + '" value="' + currentValue + '" data-id="' + sliderId + '" />';
  html = html + '</div>';

  return html;
}

function buildSliders() {
  var sliderHtml = '';

  if (currentMode === 'rgb') {
    sliderHtml = sliderHtml + makeSliderRow('R', 'red',      0, 255, red);
    sliderHtml = sliderHtml + makeSliderRow('G', 'green',    0, 255, green);
    sliderHtml = sliderHtml + makeSliderRow('B', 'blue',     0, 255, blue);
  } else {
    sliderHtml = sliderHtml + makeSliderRow('H', 'hue',       0, 360, hue);
    sliderHtml = sliderHtml + makeSliderRow('S', 'saturation', 0, 100, saturation);
    sliderHtml = sliderHtml + makeSliderRow('L', 'lightness',  0, 100, lightness);
  }

  slidersContainer.innerHTML = sliderHtml;

  var rangeSliders = slidersContainer.querySelectorAll('input[type="range"]');
  for (var i = 0; i < rangeSliders.length; i++) {
    setupSlider(rangeSliders[i]);
  }

  var numberInputs = slidersContainer.querySelectorAll('input[type="number"]');
  for (var j = 0; j < numberInputs.length; j++) {
    setupNumberInput(numberInputs[j]);
  }
}

function setupSlider(rangeSlider) {
  rangeSlider.addEventListener('input', function() {
    var matchingNumber = slidersContainer.querySelector(
      'input[type="number"][data-id="' + rangeSlider.dataset.id + '"]'
    );

    matchingNumber.value = rangeSlider.value;
    updateColorFromSlider(rangeSlider.dataset.id, rangeSlider.value);
  });
}

function setupNumberInput(numberField) {
  numberField.addEventListener('input', function() {
    var minValue = Number(numberField.min);
    var maxValue = Number(numberField.max);
    var enteredValue = Number(numberField.value);

    if (numberField.value === '') {
      enteredValue = minValue;
    }
    if (isNaN(enteredValue)) {
      enteredValue = minValue;
    }

    if (enteredValue < minValue) {
      enteredValue = minValue;
    }
    if (enteredValue > maxValue) {
      enteredValue = maxValue;
    }

    numberField.value = enteredValue;

    var matchingSlider = slidersContainer.querySelector(
      'input[type="range"][data-id="' + numberField.dataset.id + '"]'
    );
    matchingSlider.value = enteredValue;

    updateColorFromSlider(numberField.dataset.id, enteredValue);
  });
}

function updateColorFromSlider(sliderId, newValue) {
  if (currentMode === 'rgb') {
    if (sliderId === 'red') {
      red = Number(newValue);
    } else if (sliderId === 'green') {
      green = Number(newValue);
    } else if (sliderId === 'blue') {
      blue = Number(newValue);
    }

    var hslResult = rgbToHsl(red, green, blue);
    hue = hslResult.hue;
    saturation = hslResult.saturation;
    lightness = hslResult.lightness;
  } else {
    if (sliderId === 'hue') {
      hue = Number(newValue);
    } else if (sliderId === 'saturation') {
      saturation = Number(newValue);
    } else if (sliderId === 'lightness') {
      lightness = Number(newValue);
    }

    var rgbResult = hslToRgb(hue, saturation, lightness);
    red = rgbResult.red;
    green = rgbResult.green;
    blue = rgbResult.blue;
  }

  updateUI();
}

var modeButtons = document.querySelectorAll('.mode-tabs button');

for (var m = 0; m < modeButtons.length; m++) {
  modeButtons[m].addEventListener('click', function() {
    for (var n = 0; n < modeButtons.length; n++) {
      modeButtons[n].classList.remove('active');
    }

    this.classList.add('active');
    currentMode = this.dataset.mode;
    buildSliders();
  });
}

hexInput.addEventListener('input', function() {
  var typedValue = hexInput.value;

  if (typedValue.length !== 7) {
    return;
  }

  if (typedValue[0] !== '#') {
    return;
  }

  var isValid = true;

  for (var i = 1; i < 7; i++) {
    var character = typedValue[i];
    var isDigit = (character >= '0' && character <= '9');
    var isLowerHex = (character >= 'a' && character <= 'f');
    var isUpperHex = (character >= 'A' && character <= 'F');

    if (isDigit === false && isLowerHex === false && isUpperHex === false) {
      isValid = false;
      break;
    }
  }

  if (isValid === false) {
    return;
  }

  var rgbFromHex = hexToRgb(typedValue);
  red = rgbFromHex.red;
  green = rgbFromHex.green;
  blue = rgbFromHex.blue;

  var hslFromRgb = rgbToHsl(red, green, blue);
  hue = hslFromRgb.hue;
  saturation = hslFromRgb.saturation;
  lightness = hslFromRgb.lightness;

  updateUI();
});

hexInput.addEventListener('focus', function() {
  hexInput.select();
});

copyButton.addEventListener('click', function() {
  var tempTextArea = document.createElement('textarea');
  tempTextArea.value = hexLabel.textContent;

  document.body.appendChild(tempTextArea);
  tempTextArea.select();
  document.execCommand('copy');
  document.body.removeChild(tempTextArea);

  copyButton.textContent = 'Copied!';
  copyButton.classList.add('copied');

  setTimeout(function() {
    copyButton.textContent = 'Copy';
    copyButton.classList.remove('copied');
  }, 1500);
});

function createSwatch(hexColor) {
  var swatch = document.createElement('div');
  swatch.className = 'swatch';
  swatch.style.background = hexColor;

  swatch.addEventListener('click', function() {
    var rgbFromPreset = hexToRgb(hexColor);
    red = rgbFromPreset.red;
    green = rgbFromPreset.green;
    blue = rgbFromPreset.blue;

    var hslFromPreset = rgbToHsl(red, green, blue);
    hue = hslFromPreset.hue;
    saturation = hslFromPreset.saturation;
    lightness = hslFromPreset.lightness;

    updateUI();
  });

  paletteContainer.appendChild(swatch);
}

for (var p = 0; p < presetColors.length; p++) {
  createSwatch(presetColors[p]);
}

updateUI();
