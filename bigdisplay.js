function bigDisplay(number) {
  if (isNaN(number)) {
    return "NaN";
  }
  if (number < 1.0e+3) {
    return number.toFixed(2).replace(/[.,]00$/, "");
  }
  if (number < 1.0e+4) {
    return number.toFixed(2).replace(/[.,]00$/, "");
  }

  var suffix = "!";
  var exp = 1;
  if (number < 1.0e+6) {
    suffix = "K";
    exp = 1.0e+3;
  }
  else if (number < 1.0e+9) {
    suffix = "M";
    exp = 1.0e+6;
  }
  else if (number < 1.0e+12) {
    suffix = "B";
    exp = 1.0e+9;
  }
  else if (number < 1.0e+15) {
    suffix = "T";
    exp = 1.0e+12;
  }
  else if (number < 1.0e+18) {
    suffix = "q";
    exp = 1.0e+15;
  }
  else if (number < 1.0e+21) {
    suffix = "Q";
    exp = 1.0e+18;
  }
  else if (number < 1.0e+24) {
    suffix = "s";
    exp = 1.0e+21;
  }
  else if (number < 1.0e+27) {
    suffix = "S";
    exp = 1.0e+24;
  }
  else if (number < 1.0e+30) {
    suffix = "O";
    exp = 1.0e+27;
  }
  else if (number < 1.0e+33) {
    suffix = "N";
    exp = 1.0e+30;
  }
  else if (number < 1.0e+36) {
    suffix = "d";
    exp = 1.0e+33;
  }
  else if (number < 1.0e+39) {
    suffix = "U";
    exp = 1.0e+36;
  }
  else if (number < 1.0e+42) {
    suffix = "D";
    exp = 1.0e+39;
  }
  return (number / exp).toFixed(2) + " " + suffix;
}