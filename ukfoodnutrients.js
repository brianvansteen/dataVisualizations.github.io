function UKFoodNutrients() {

    // description and sub-description for the visualisation in the menu bar
    this.name = 'UK Nutrients';
    this.subname = '(annual consumption)';

    // Each visualisation must have a unique ID with no special characters.
    this.id = 'uk-food-nutrients';

    // Title to display above the plot.
    this.title = 'UK Food Nutrient Consumption';

    // Names for each axis.
    this.xAxisLabel = 'Year';
    this.yAxisLabel = 'Percent';

    this.colours = [];

    let marginSize = 50;

    // Layout object to store all common plot layout parameters and methods.
    this.layout = {
        marginSize: marginSize,

        // margin positions; left and bottom have double margin size due to axis and tick labels
        leftMargin: marginSize * 2,
        rightMargin: width - marginSize,
        topMargin: marginSize * 2,
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

        // Number of axis tick labels to draw so that they are not drawn on top of one another.
        numXTickLabels: 16,
        numYTickLabels: 6,
    };

    // Property to represent whether data has been loaded.
    this.loaded = false;

    // preload the data; called automatically by the gallery when a visualisation is added
    this.preload = function() {
        let self = this;
        this.data = loadTable(
            './data/food/nutrientsList.csv', 'csv', 'header',
            // Callback function to set the value this.loaded to true.
            function(table) {
                self.loaded = true;
            });
    };

    this.setup = function() {
        // Font defaults.
        textSize(14);

        // Set min and max years: assumes data is sorted by date.
        this.startYear = Number(this.data.columns[1]);
        this.endYear = Number(this.data.columns[this.data.columns.length - 3]);

        for (let i = 0; i < this.data.getRowCount(); i++) {
            this.colours.push(color(random(0, 200), random(0, 150), random(0, 200)));
        }

        // Find min and max percentage for mapping to canvas height.
        this.minPercentage = 0;
        this.maxPercentage = 600;

        // Create sliders to control minimum percentages to use on the Y axis
        this.minSlider = createSlider(this.minPercentage, // minimum slider value, 0
            this.minPercentage + 75, // maximum value, i.e. 75
            this.minPercentage, // default value
            1);
        this.minSlider.position(600, 70);

        // Create sliders to control maximum percentages to use on the Y axis
        this.maxSlider = createSlider(this.minPercentage + 250, // minimum slider value, i.e. 250
            this.maxPercentage, // maximum value, 600
            this.maxPercentage,
            1);
        this.maxSlider.position(1200, 70);
    };

    this.destroy = function() {
        this.minSlider.remove();
        this.maxSlider.remove();
    };

    this.draw = function() {
        if (!this.loaded) {
            console.log('Data not yet loaded');
            return;
        }
        // Prevent slider ranges overlapping.
        if (this.minSlider.value() >= this.maxSlider.value()) {
            this.minSlider.value(this.maxSlider.value() - 1);
        }
        this.minPercentage = int(this.minSlider.value());
        this.maxPercentage = int(this.maxSlider.value());
        this.maximumPercent = int(this.maxSlider.value());

        this.drawTitle(); // draw the title above the plot

        // draw all y-axis labels; helper function
        drawYAxisTickLabels(int(this.minPercentage),
            int(this.maxPercentage),
            this.layout,
            this.mapPercentToHeight.bind(this),
            0);

        drawAxis(this.layout); // draw x and y axis; helper function

        drawAxisLabels(this.xAxisLabel, // draw x and y axis labels; helper function
            this.yAxisLabel,
            this.layout);

        drawSliderTitle1("Increase minimum percentage (y axis)", this.layout);
        drawSliderTitle2("Decrease maximum percentage (y axis)", this.layout);

        // Plot all pay gaps between startYear and endYear using the width of the canvas minus margins.
        let numYears = this.endYear - this.startYear;

        // Loop over all rows and draw a line from the previous value to the current
        for (let i = 0; i < this.data.getRowCount(); i++) { // items in each row
            let row = this.data.getRow(i);
            let previous = null; // reset to null for each row
            let label = row.getString(0); // items in first column, A

            for (let j = 1; j <= numYears; j++) { // each item for each year; starting column B
                let current = { // Create an object to store data for the current year
                    'year': this.startYear + j - 1,
                    'percentage': row.getNum(j),
                };

                if (previous != null) { // previous starts at null
                    // only when values are below the top margin
                    if (this.mapPercentToHeight(previous.percentage) > this.layout.topMargin &&
                        this.mapPercentToHeight(current.percentage) > this.layout.topMargin) {

                        // draw line segment connecting previous year to current year values
                        stroke(this.colours[i]);
                        push();
                        strokeWeight(2);
                        line(this.mapYearToWidth(previous.year), // x
                            this.mapPercentToHeight(previous.percentage), // y
                            this.mapYearToWidth(current.year), // x
                            this.mapPercentToHeight(current.percentage)); // y
                        pop();
                        // The number of x-axis labels to skip so that only numXTickLabels are drawn.
                        let xLabelSkip = ceil(numYears / this.layout.numXTickLabels);

                        // Draw the tick label marking the start of the previous year.
                        if (j % xLabelSkip == 0) {
                            drawXAxisTickLabel(previous.year + 1, this.layout,
                                this.mapYearToWidth.bind(this));
                        }
                    }
                } else { // previous === null; draw the labels first
                    if (this.mapPercentToHeight(current.percentage) > this.layout.topMargin) { // if below top margin
                        noStroke();
                        fill(this.colours[i]);
                        push();
                        textStyle(BOLD);
                        textSize(16);
                        text(label, (150 + 25 * i), this.mapPercentToHeight(current.percentage)); // draw text labels first
                        pop();
                    }
                }

                // Assign current year to previous year so that it is available during the next
                // iteration of this loop to give us the start position of the next line segment.
                previous = current;
            }
        }
    };

    this.drawTitle = function() {
        fill(0);
        noStroke();
        textAlign('center', 'center');
        push();
        textSize(28);
        text(this.title,
            (this.layout.plotWidth() / 2) + this.layout.leftMargin,
            this.layout.topMargin - (this.layout.marginSize * 1.25));
        pop();
    };

    this.mapYearToWidth = function(value) { // value = previous.year or current.year
        return map(value,
            this.startYear,
            this.endYear,
            this.layout.leftMargin, // 100; draw left-to-right from margin
            this.layout.rightMargin); // width
    };

    this.mapPercentToHeight = function(value) { // map percentages to margins
        return map(value, // value = previous.percentage or current.percentage
            this.minPercentage, // 50%
            this.maxPercentage, // 600%
            this.layout.bottomMargin, // 700
            this.layout.topMargin); // 50
    };
}