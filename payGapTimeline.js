function PayGapTimeSeries() {

    // Name for the visualisation to appear in the menu bar.
    this.name = 'Pay gap: 1997 to 2017';

    // Each visualisation must have a unique ID with no special
    // characters.
    this.id = 'pay-gap-timeseries';

    // Title to display above the plot.
    this.title = 'Gender Pay Gap: Average difference between male and female pay.';

    // Names for each axis.
    this.xAxisLabel = 'Year';
    this.yAxisLabel = 'Pay Gap Percentage';

    let marginSize = 50;

    // Layout object to store all common plot layout parameters and
    // methods.
    this.layout = {
        marginSize: marginSize,

        // margin positions; left and bottom have double margin size due to axis and tick labels.
        leftMargin: marginSize * 2,
        rightMargin: width - marginSize,
        topMargin: marginSize,
        bottomMargin: height - marginSize * 3,
        pad: 5,

        plotWidth: function() {
            return this.rightMargin - this.leftMargin;
        },

        plotHeight: function() {
            return this.bottomMargin - this.topMargin;
        },

        // Boolean to enable/disable background grid.
        grid: true,

        // Number of axis tick labels to draw so that they are not drawn on
        // top of one another.
        numXTickLabels: 10,
        numYTickLabels: 8,
    };

    // Property to represent whether data has been loaded.
    this.loaded = false;

    // Preload the data. This function is called automatically by the
    // gallery when a visualisation is added.
    this.preload = function() {
        let self = this;
        this.data = loadTable(
            './data/payGap/all-employees-hourly-pay-by-gender-1997-2017.csv', 'csv', 'header',
            // Callback function to set the value
            // this.loaded to true.
            function(table) {
                self.loaded = true;
            });
    };

    this.setup = function() {
        // Font defaults.
        textSize(16);

        // Set min and max years: assumes data is sorted by date.
        this.startYear = this.data.getNum(0, 'year');
        this.endYear = this.data.getNum(this.data.getRowCount() - 1, 'year');

        // Find min and max pay gap for mapping to canvas height.
        this.minPayGap = min(this.data.getColumn('pay_gap')) * 0.98; // Pay equality (zero pay gap).
        this.maxPayGap = max(this.data.getColumn('pay_gap')) * 1.02;

        // count the number of frames drawn since the visualisation started to animate the plot
        this.frameCount = 0;
    };

    this.destroy = function() {};

    this.draw = function() {
        if (!this.loaded) {
            console.log('Data not yet loaded');
            return;
        }

        // Draw the title above the plot.
        this.drawTitle();

        // Draw all y-axis labels.
        drawYAxisTickLabels(this.minPayGap,
            this.maxPayGap,
            this.layout,
            this.mapPayGapToHeight.bind(this),
            0);

        // Draw y axis only
        drawAxis(this.layout);

        // Draw x and y axis labels.
        drawAxisLabels(this.xAxisLabel,
            this.yAxisLabel,
            this.layout);

        // Plot all pay gaps between startYear and endYear using the width of the canvas minus margins.
        let previous;
        let numYears = this.endYear - this.startYear;

        // Count the number of days plotted each frame to create animation effect.
        let yearCount = 0;

        // Loop over all rows and draw a line from the previous value to the current.
        for (let i = 0; i < this.data.getRowCount(); i++) {

            // Create an object to store data for the current year.
            let current = {
                // Convert strings to numbers.
                'year': this.data.getNum(i, 'year'),
                'percentage': this.data.getNum(i, 'pay_gap')
            };

            push();
            stroke(100);
            strokeWeight(2);
            setLineDash([4, 10]);
            line(this.mapYearToWidth(current.year), // draw vertical lines for each year
                this.layout.bottomMargin,
                this.mapYearToWidth(current.year),
                this.mapPayGapToHeight(current.percentage));
            pop();

            if (previous != null) {
                // Draw line segment connecting previous year to current year pay gap.
                push();
                stroke(139, 0, 139);
                strokeWeight(3);
                setLineDash([15, 10]);
                line(this.mapYearToWidth(previous.year),
                    this.mapPayGapToHeight(previous.percentage),
                    this.mapYearToWidth(current.year),
                    this.mapPayGapToHeight(current.percentage));
                pop();

                // The number of x-axis labels to skip so that only numXTickLabels are drawn.
                let xLabelSkip = ceil(numYears / this.layout.numXTickLabels);

                // Draw the tick label marking the start of the previous year.
                if (i % xLabelSkip == 0) {
                    drawXAxisTickYears(previous.year, this.layout,
                        this.mapYearToWidth.bind(this)); // draw the years, not the X tick lines
                }

                yearCount++;
            }; // if iteration

            // Stop drawing this frame when the number of years drawn is equal to the frame count
            if (yearCount >= this.frameCount) {
                break;
            };
            // Assign current year to previous year so that it is available during the next iteration of 
            // this loop to give us the start position of the next line segment.
            previous = current;
        }; // end for loop

        // Count the number of frames since this visualisation started; used in creating the
        // animation effect and to stop the main p5 draw loop when all days have been drawn.
        this.frameCount++;

    }; // end draw

    this.drawTitle = function() {
        fill(0);
        noStroke();
        textAlign('center', 'center');
        textSize(28);
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
            this.layout.bottomMargin, // Smaller pay gap at bottom.
            this.layout.topMargin); // Bigger pay gap at top.
    };
}