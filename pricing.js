function StockPrice() {

    // Name for the visualisation to appear in the menu bar.
    this.name = 'Tesla stock price';

    // Each visualisation must have a unique ID with no special
    // characters.
    this.id = 'stock-price';

    // Title to display above the plot.
    this.title = 'Tesla stock price over 5 years';

    // Names for each axis.
    this.xAxisLabel = 'Number of days';
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
            './data/bollinger/TSLA2.csv', 'csv', 'header',
            // Callback function to set the value this.loaded to true.
            function(table) {
                self.loaded = true;
            });
    };

    this.setup = function() {
        // Font defaults.
        textSize(16);

        // Set min and max days
        this.startDay = this.data.getString(0, 'date2'); // Excel date
        this.endDay = this.data.getString(this.data.getRowCount() - 1, 'date2'); // Excel date
        // console.log(this.startDay);
        // console.log(this.endDay);
        this.startDate = new Date(this.startDay); // JavaScript date
        // this.dateStartSub = this.dateStart.toDateString().slice(4);
        // console.log(this.startDate);
        this.endDate = new Date(this.endDay); // JavaScript date
        // this.dateEndSub = this.dateEnd.toDateString().slice(4);
        // console.log(this.endDate);
        const difference = this.endDate.getTime() - this.startDate.getTime(); // difference in milliseconds
        console.log(difference); // difference in milliseconds
        console.log(Math.floor(this.endDate.getTime() / (1000 * 60 * 60 * 24))); // convert to days
        console.log(Math.floor(this.startDate.getTime() / (1000 * 60 * 60 * 24))); // convert to days
        daysDifference = difference / (1000 * 60 * 60 * 24);
        console.log(daysDifference); // difference in number of days

        // Find min and max stock price for mapping to canvas height.
        this.minPrice = 0; // zero stock price
        this.maxPrice = max(this.data.getColumn('close'));
    };

    this.destroy = function() {};

    this.draw = function() {
        if (!this.loaded) {
            console.log('Data not yet loaded');
            return;
        }

        this.drawTitle(); // draw the title above the plot

        // Draw all y-axis labels.
        drawYAxisTickLabels(this.minPrice,
            this.maxPrice,
            this.layout,
            this.mapPriceToHeight.bind(this),
            0);

        drawAxis(this.layout); // draw x and y axis

        drawAxisLabels(this.xAxisLabel, // draw x and y axis labels
            this.yAxisLabel,
            this.layout);

        // Plot all stock prices between startYear and endYear using the width of the canvas minus margins.
        var previous;
        // var numYears = (this.endDate.getTime() - this.startDate.getTime()) / (1000 * 60 * 60 * 24);
        // var numYears = this.data.getNum(this.data.getRowCount() - 1, 'days');
        var numYears = 1259;

        // Loop over all rows and draw a line from the previous value to the current.
        for (var i = 0; i < this.data.getRowCount(); i++) {

            // Create an object to store data for the current year.
            var current = {
                // Convert strings to numbers.
                'date': this.data.getNum(i, 'days'),
                'price': this.data.getNum(i, 'close')
            };
            //console.log(current.date);

            if (previous != null) {
                // Draw line segment connecting previous year to current year stock price.
                stroke(0);
                line(this.mapYearToWidth(previous.date),
                    this.mapPriceToHeight(previous.price),
                    this.mapYearToWidth(current.date),
                    this.mapPriceToHeight(current.price));

                // The number of x-axis labels to skip so that only numXTickLabels are drawn.
                var xLabelSkip = ceil(numYears / this.layout.numXTickLabels);

                // Draw the tick label marking the start of the previous year.
                if (i % xLabelSkip == 0) {
                    drawXAxisTickLabel(previous.date, this.layout,
                        this.mapYearToWidth.bind(this));
                }
            }
            // Assign current year to previous year so that it is available during the next iteration
            // of this loop to give us the start position of the next line segment.
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

    this.mapPriceToHeight = function(value) {
        return map(value,
            this.minPrice,
            this.maxPrice,
            this.layout.bottomMargin, // Smaller stock price at bottom.
            this.layout.topMargin); // Bigger stock price at top.
    };
}