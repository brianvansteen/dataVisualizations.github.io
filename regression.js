function Regression() {

    // Name for the visualisation to appear in the menu bar.
    this.name = 'House selling prices';

    // Each visualisation must have a unique ID with no special
    // characters.
    this.id = 'house-prices';

    // Title to display above the plot.
    this.title = 'Sales price data';

    // Names for each axis.
    this.xAxisLabel = 'Year';
    this.yAxisLabel = '$';

    var marginSize = 35;

    // Layout object to store all common plot layout parameters and methods.
    this.layout = {
        marginSize: marginSize,

        // Locations of margin positions. Left and bottom have double margin size due to axis and tick labels.
        leftMargin: marginSize * 2,
        rightMargin: width - marginSize,
        topMargin: marginSize,
        bottomMargin: height - marginSize * 2,
        pad: 5,

        plotWidth: function() {
            return this.rightMargin - this.leftMargin;
        },

        plotHeight: function() {
            return this.bottomMargin - this.topMargin;
        },

        // Boolean to enable/disable background grid.
        grid: true,

        // Number of axis tick labels to draw so that they are not drawn on top of one another.
        numXTickLabels: 10,
        numYTickLabels: 8,
    };

    // Property to represent whether data has been loaded.
    this.loaded = false;

    // Preload the data. This function is called automatically by the gallery when a visualisation is added.
    this.preload = function() {
        var self = this;
        this.data = loadTable(
            './data/houses/housing.csv', 'csv', 'header',
            // Callback function to set the value this.loaded to true.
            function(table) {
                self.loaded = true;
            });
    };

    this.setup = function() {
        // Font defaults.
        textSize(16);

        // Set min and max years: assumes data is sorted by distance.
        this.startYear = this.data.getNum(0, 'distance');
        this.endYear = this.data.getNum(this.data.getRowCount() - 1, 'distance');

        // Find min and max stock price for mapping to canvas height.
        this.minPayGap = 0; // Pay equality (zero stock price).
        this.maxPayGap = max(this.data.getColumn('price'));
    };

    this.destroy = function() {};

    this.draw = function() {
        if (!this.loaded) {
            console.log('Data not yet loaded');
            return;
        }

        this.drawTitle(); // draw the title above the plot

        // Draw all y-axis labels.
        drawYAxisTickLabels(this.minPayGap,
            this.maxPayGap,
            this.layout,
            this.mapPayGapToHeight.bind(this),
            0);

        drawAxis(this.layout); // draw x and y axis

        drawAxisLabels(this.xAxisLabel, // draw x and y axis labels
            this.yAxisLabel,
            this.layout);

        // Plot all stock prices between startYear and endYear using the width of the canvas minus margins.
        var previous;
        var numYears = this.endYear - this.startYear;

        // Loop over all rows and draw a line from the previous value to the current.
        for (var i = 0; i < this.data.getRowCount(); i++) {

            // Create an object to store data for the current year.
            var current = {
                // Convert strings to numbers.
                'year': this.data.getNum(i, 'distance'),
                'payGap': this.data.getNum(i, 'price')
            };

            if (previous != null) {
                // Draw line segment connecting previous year to current year stock price.
                stroke(0);
                line(this.mapYearToWidth(previous.year),
                    this.mapPayGapToHeight(previous.payGap),
                    this.mapYearToWidth(current.year),
                    this.mapPayGapToHeight(current.payGap));

                // The number of x-axis labels to skip so that only numXTickLabels are drawn.
                var xLabelSkip = ceil(numYears / this.layout.numXTickLabels);

                // Draw the tick label marking the start of the previous year.
                if (i % xLabelSkip == 0) {
                    drawXAxisTickLabel(previous.year, this.layout,
                        this.mapYearToWidth.bind(this));
                }
            }

            // Assign current year to previous year so that it is available
            // during the next iteration of this loop to give us the start
            // position of the next line segment.
            previous = current;
        }
    };

    this.drawTitle = function() {
        fill(0);
        noStroke();
        textAlign('center', 'center');

        text(this.title,
            (this.layout.plotWidth() / 2) + this.layout.leftMargin,
            this.layout.topMargin - (this.layout.marginSize / 2));
    };

    this.mapYearToWidth = function(value) {
        return map(value,
            this.startYear,
            this.endYear,
            this.layout.leftMargin, // Draw left-to-right from margin.
            this.layout.rightMargin);
    };

    this.mapPayGapToHeight = function(value) {
        return map(value,
            this.minPayGap,
            this.maxPayGap,
            this.layout.bottomMargin, // Smaller stock price at bottom.
            this.layout.topMargin); // Bigger stock price at top.
    };
}