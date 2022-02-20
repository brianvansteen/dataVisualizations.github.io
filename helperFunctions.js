// --------------------------------------------------------------------
// Data processing helper functions.
// --------------------------------------------------------------------
function sum(data) {
    var total = 0;

    // Ensure that data contains numbers and not strings.
    data = stringsToNumbers(data);

    for (let i = 0; i < data.length; i++) {
        total = total + data[i];
    }

    return total;
}

function mean(data) {
    var total = sum(data);
    return total / data.length;
}

function sliceRowNumbers(row, start = 0, end) {
    var rowData = [];

    if (!end) {
        // Parse all values until the end of the row.
        end = row.arr.length;
    }

    for (i = start; i < end; i++) {
        rowData.push(row.getNum(i));
    }

    return rowData;
}

function stringsToNumbers(array) {
    return array.map(Number);
}

function setLineDash(list) {
    drawingContext.setLineDash(list);
}

// --------------------------------------------------------------------
// Plotting helper functions
// --------------------------------------------------------------------


function drawDropDownTitle(label, layout) {
    fill(138, 43, 226);
    push();
    textSize(16);
    textStyle(BOLD);
    textAlign(LEFT);
    text(label,
        layout.leftMargin * 0.5,
        layout.bottomMargin + (layout.marginSize * 2.5));
    pop();
}


function drawDropDownTitle2(label, layout) {
    fill(138, 43, 226);
    push();
    textSize(16);
    textStyle(BOLD);
    textAlign(RIGHT);
    text(label,
        layout.rightMargin * 0.97,
        layout.bottomMargin + (layout.marginSize * 1.75));
    pop();
}


function drawDropDownTitle3(label, layout) {
    fill(138, 43, 226);
    push();
    textSize(16);
    textStyle(BOLD);
    textAlign(RIGHT);
    text(label,
        layout.rightMargin * 0.97,
        layout.bottomMargin + (layout.marginSize * 2.5));
    pop();
}


function drawSliderTitle1(label, layout) {
    fill(138, 43, 226);
    push();
    textSize(16);
    textStyle(BOLD);
    textAlign(RIGHT);
    text(label,
        layout.leftMargin * 2.5,
        layout.topMargin - (layout.marginSize * 0.55));
    pop();
}


function drawSliderTitle2(label, layout) {
    fill(138, 43, 226);
    push();
    textSize(16);
    textStyle(BOLD);
    textAlign(RIGHT);
    text(label,
        layout.rightMargin - (layout.marginSize * 5.5),
        layout.topMargin - (layout.marginSize * 0.55));
    pop();
}


function drawAxis(layout, colour = 0) {
    stroke(0);
    push();
    strokeWeight(3);

    // x-axis
    line(layout.leftMargin,
        layout.bottomMargin,
        layout.rightMargin,
        layout.bottomMargin);

    // y-axis
    line(layout.leftMargin,
        layout.topMargin,
        layout.leftMargin,
        layout.bottomMargin);
    pop();
}


function drawAxisLabels(xLabel, yLabel, layout) {
    fill(0, 0, 100);
    noStroke();
    textAlign('center', 'center');

    // Draw x-axis label
    push();
    textSize(22);
    text(xLabel,
        (layout.plotWidth() / 2) + layout.leftMargin,
        layout.bottomMargin + (layout.marginSize * 1.5));
    pop();

    // Draw y-axis label
    push();
    translate(layout.leftMargin - (layout.marginSize * 1.5),
        layout.bottomMargin / 2);
    rotate(-PI / 2);
    textSize(22);
    text(yLabel, 0, 0);
    pop();
}


function drawAxisSubLabels(xLabelStart, xLabelMid, xLabelEnd, layout) {
    fill(0, 0, 100);
    noStroke();
    textAlign('center', 'center');

    // Draw x-axis label
    push();
    textSize(14);
    textStyle(ITALIC);
    text(xLabelStart,
        layout.leftMargin,
        layout.bottomMargin + (layout.marginSize * 0.9));
    text(xLabelMid,
        (layout.plotWidth() / 2) + layout.leftMargin,
        layout.bottomMargin + (layout.marginSize * 0.9));
    text(xLabelEnd,
        layout.rightMargin,
        layout.bottomMargin + (layout.marginSize * 0.9));
    pop();
}

function drawYAxisTickLabels(min, max, layout,
    mapFunction, decimalPlaces) { // mapFunction must be passed with .bind(this)
    var range = max - min;
    var yTickStep = range / layout.numYTickLabels;
    fill(0);
    noStroke();
    textAlign('right', 'center');

    // Draw all axis tick labels and grid lines.
    for (i = 0; i <= layout.numYTickLabels; i++) {
        var value = min + (i * yTickStep);
        var y = mapFunction(value);

        // Add tick label.
        push();
        fill(0);
        textSize(12)
        text(value.toFixed(decimalPlaces),
            layout.leftMargin - layout.pad,
            y);
        pop();
        if (layout.grid) { // add Y axis grid line
            stroke(200);
            line(layout.leftMargin, y, layout.rightMargin, y);
        }
    }
}


function drawXAxisTickLabel(value, layout, mapFunction) { // mapFunction must be passed with .bind(this)
    var x = mapFunction(value);
    push();
    fill(0);
    noStroke();
    textSize(12);
    textAlign('center', 'center');
    text(value, // add tick label
        x,
        layout.bottomMargin + layout.marginSize / 2);
    pop();
    if (layout.grid) { // add X axis grid line
        stroke(200);
        line(x,
            layout.topMargin,
            x,
            layout.bottomMargin);
    }
}