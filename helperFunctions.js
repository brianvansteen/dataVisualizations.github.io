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


function drawDropDownTitle(label, layout) { // title for drop down menu, left side
    fill(65, 105, 225);
    push();
    textSize(16);
    textStyle(BOLD);
    textAlign(LEFT);
    text(label,
        layout.leftMargin * 0.5,
        layout.bottomMargin + (layout.marginSize * 2.5));
    pop();
}


function drawDropDownTitle2(label, layout) { // title for main drop down menu, right side
    fill(65, 105, 225);
    push();
    textSize(14);
    textStyle(ITALIC);
    textAlign(RIGHT);
    text(label,
        layout.rightMargin * 0.97,
        layout.bottomMargin + (layout.marginSize * 1.75));
    pop();
}


function drawDropDownTitle3(label, layout) { // title for secondary drop down menu, right side
    fill(65, 105, 225);
    push();
    textSize(16);
    textStyle(BOLD);
    textAlign(RIGHT);
    text(label,
        layout.rightMargin * 0.97,
        layout.bottomMargin + (layout.marginSize * 2.5));
    pop();
}


function drawSliderTitle1(label, layout) { // title for slider menu, left side
    fill(65, 105, 225);
    push();
    textSize(16);
    textStyle(BOLD);
    textAlign(RIGHT);
    text(label,
        layout.leftMargin * 3,
        layout.topMargin - (layout.marginSize * 0.55));
    pop();
}


function drawSliderTitle2(label, layout) { // title for slider menu, right side
    fill(65, 105, 225);
    push();
    textSize(16);
    textStyle(BOLD);
    textAlign(RIGHT);
    text(label,
        layout.rightMargin - (layout.marginSize * 5.5),
        layout.topMargin - (layout.marginSize * 0.55));
    pop();
}


function drawAxis(layout, colour = 0) { // main X and Y axis
    stroke(25, 25, 112);
    push();
    strokeWeight(4);

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


function drawAxisLabels(xLabel, yLabel, layout) { // titles for X and Y axis
    noStroke();
    textAlign('center', 'center');

    // Draw x-axis label
    push();
    fill(25, 25, 112);
    textSize(24);
    text(xLabel,
        (layout.plotWidth() / 2) + layout.leftMargin,
        layout.bottomMargin + (layout.marginSize * 2));
    pop();

    // Draw y-axis label
    push();
    angleMode(RADIANS); // ensure rotation
    translate(layout.leftMargin - (layout.marginSize * 1.3),
        layout.bottomMargin / 2);
    rotate(-PI / 2);
    fill(25, 25, 112);
    textSize(24);
    text(yLabel, 0, 0);
    pop();
}


function drawXAxisSubLabels(xLabelStart, xLabelMid, xLabelEnd, layout) { // additional X axis labels
    fill(0, 0, 100);
    noStroke();
    textAlign('center', 'center');

    // Draw x-axis label for Bollinger chart
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

function drawYAxisTickLabels(min, max, layout, // mapFunction must be passed with .bind(this)
    mapFunction, decimalPlaces) { // y axis tick values and grid lines
    var yRange = max - min;
    var yTickStep = yRange / layout.numYTickLabels;
    fill(0);
    noStroke();
    textAlign('right', 'center');

    // Draw all axis tick labels and grid lines.
    for (i = 0; i <= layout.numYTickLabels; i++) {
        var value = min + (i * yTickStep);
        var y = mapFunction(value);

        // Add Y axis tick label values
        push();
        fill(25, 25, 112);
        textSize(14)
        text(value.toFixed(decimalPlaces),
            layout.leftMargin - layout.pad,
            y);
        pop();
        if (layout.grid) { // add Y axis grid lines
            push();
            stroke(200);
            strokeWeight(0.5);
            line(layout.leftMargin, y, layout.rightMargin, y);
            pop();
        }
    }
}

function drawXAxisTickValues(min, max, layout, // mapFunction must be passed with .bind(this)
    mapFunction, decimalPlaces) { // x axis tick values for scatter graph
    var xRange = max - min;
    var xTickStep = xRange / layout.numXTickLabels;
    fill(0);
    noStroke();
    textAlign('right', 'center');

    // Draw all axis tick labels and grid lines.
    for (i = 0; i <= layout.numXTickLabels; i++) {
        var value = min + (i * xTickStep);
        var x = mapFunction(value);

        // Add Y axis tick label values
        push();
        fill(25, 25, 112);
        textSize(14)
        text(value.toFixed(decimalPlaces),
            x + 20,
            layout.bottomMargin + 30);
        pop();
        push();
        stroke(25, 25, 112);
        strokeWeight(3);
        line(x, layout.bottomMargin, x, layout.bottomMargin + 20);
        pop();
    }
}


function drawXAxisTickLabel(value, layout, mapFunction) { // mapFunction must be passed with .bind(this)
    var x = mapFunction(value); // x axis tick values and grid lines
    push();
    fill(25, 25, 112);
    noStroke();
    textSize(14);
    textAlign('center', 'center');
    text(value, // add x axis tick label values
        x,
        layout.bottomMargin + layout.marginSize / 2);
    pop();
    if (layout.grid) { // add x axis grid lines
        push();
        stroke(200);
        strokeWeight(0.5);
        line(x,
            layout.topMargin,
            x,
            layout.bottomMargin);
        pop();
    }
}


// draw x axis values, but not vertical lines for graph that draws dashed lines from line chart to x axis
function drawXAxisTickYears(value, layout, mapFunction) { // mapFunction must be passed with .bind(this)
    var x = mapFunction(value);
    push();
    fill(25, 25, 112);
    noStroke();
    textSize(14);
    textAlign('center', 'center');
    text(value, // add x axis tick label values
        x,
        layout.bottomMargin + layout.marginSize / 2);
    pop();
}