function Bollinger() {

    // name for the visualisation to appear in the menu bar.
    this.name = 'Tesla stock price';

    // each visualisation must have a unique ID with no special characters.
    this.id = 'TSLA-stock-price';

    // title to display above the plot.
    this.title = 'Tesla stock price (5 years / 1,259 trading days)';

    // Names for each axis.
    this.xAxisLabel = 'Number of trading days';
    this.yAxisLabel = 'U.S. dollars';

    var marginSize = 50;

    // layout object to store all common plot layout parameters and methods.
    this.layout = {
        marginSize: marginSize,

        // Locations of margin positions. Left and bottom have double margin size due to axis and tick labels.
        leftMargin: marginSize * 2,
        rightMargin: width - marginSize,
        topMargin: marginSize * 1.5,
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
        numXTickLabels: 28,
        numYTickLabels: 8,

    }; // end layout

    // Property to represent whether data has been loaded.
    this.loaded = false;

    // Preload the data. This function is called automatically by the gallery when a visualisation is added.
    this.preload = function() {
        var self = this;
        this.data = loadTable(
            './data/bollinger/TSLA.csv', 'csv', 'header',
            // Callback function to set the value this.loaded to true.
            function(table) {
                self.loaded = true;
            });
    }; // end preload

    this.setup = function() {
        // Font defaults.
        textSize(14);

        // set min and max dates
        this.startDate = this.data.getNum(0, 'days');
        this.endDate = this.data.getNum(this.data.getRowCount() - 1, 'days');

        this.startDay = this.data.getString(0, 'date2'); // Excel date for sub-Xlabel
        this.midDay = this.data.getString(Math.floor(this.data.getRowCount() / 2), 'date2'); // Excel date for sub-Xlabel
        this.endDay = this.data.getString(this.data.getRowCount() - 1, 'date2'); // Excel date for sub-Xlabel

        // find min and max stock price for mapping to canvas height.
        this.minPrice = 0; // zero stock price
        this.maxPrice = max(this.data.getColumn('close')) * 1.25; // max price times 125% for the upper Bollinger band

        // count the number of frames drawn since the visualisation started to animate the plot
        this.frameCount = 0;

        this.allPricing = [];
        for (var i = 0; i < this.data.getRowCount(); i++) {
            this.allPricing.push(this.data.getNum(i, 'close'));
        }

        this.select1 = createSelect(); // create dropdown menu in DOM
        this.select1.position(this.layout.leftMargin * 6, height - 30); // place dropdown at x, y on canvas
        this.select1.style('font-size', '18px');
        this.select1.style('color', 'blueviolet');
        this.select1.style('background-color', 'lavender');
        this.select1.style('text-align', 'center');
        let smaValue1 = [1, 20, 50, 100, 200]
        for (let i = 0; i < smaValue1.length; i++) {
            this.select1.option(smaValue1[i]); // each dropdown value
        }

        this.select2 = createSelect(); // create dropdown menu in DOM
        this.select2.position(this.layout.rightMargin * 1.25, height - 65); // place dropdown at x, y on canvas
        this.select2.style('font-size', '18px');
        this.select2.style('color', 'blueviolet');
        this.select2.style('background-color', 'lavender');
        this.select2.style('text-align', 'center');
        let smaValue2 = [20, 50, 100, 200]
        for (let i = 0; i < smaValue2.length; i++) {
            this.select2.option(smaValue2[i]); // each dropdown value
        }

        this.select3 = createSelect(); // create dropdown menu in DOM
        this.select3.position(this.layout.rightMargin * 1.25, height - 30); // place dropdown at x, y on canvas
        this.select3.style('font-size', '18px');
        this.select3.style('color', 'blueviolet');
        this.select3.style('background-color', 'lavender');
        this.select3.style('text-align', 'center');
        let sdValue = [2, 3, 4]
        for (let i = 0; i < sdValue.length; i++) {
            this.select3.option(sdValue[i]); // each dropdown value
        }
    }; // end setup


    this.destroy = function() {
        this.select1.remove(); // remove dropdown menu
        this.select2.remove(); // remove dropdown menu
        this.select3.remove(); // remove dropdown menu
    };

    this.draw = function() {
        if (!this.loaded) {
            console.log('Data not yet loaded');
            return;
        }

        this.drawTitle(); // draw the title above the plot

        // draw all y-axis labels; helper function
        drawYAxisTickLabels(this.minPrice,
            this.maxPrice,
            this.layout,
            this.mapPriceToHeight.bind(this),
            0);

        drawAxis(this.layout); // draw x and y axis; helper function

        drawAxisLabels(this.xAxisLabel, // draw x and y axis labels; helper function
            this.yAxisLabel,
            this.layout);

        drawAxisSubLabels(this.startDay, this.midDay, this.endDay, this.layout); // draw x and y axis labels; helper function

        drawDropDownTitle("Simple Moving Average (days)", this.layout);
        drawDropDownTitle2("Simple Moving Average default (days)", this.layout);
        drawDropDownTitle3("Bollinger bands (standard deviations)", this.layout);

        // Plot all stock prices between startDate and endDate using the width of the canvas minus margins.
        let smaPrevious;
        let sdUpPrevious;
        //let sdDownPrevious
        let previous;
        let numDays = this.endDate - this.startDate;
        let sma = int(this.select1.value()); // from SMA dropdown menu
        this.smaPricing = this.simpleMovingAverage(this.allPricing, sma);
        //let sd = int(this.select3.value()); // from standard deviation dropdown menu
        this.sdPricing = this.smaSD(this.allPricing, sma);
        this.sdSlice = this.sdPricing.slice(800, 1100);
        //console.log(this.sdSlice);

        // Count the number of days plotted each frame to create animation effect.
        let dayCount = 0;

        // Loop over all rows and draw a line from the previous value to the current.
        for (var i = 0; i < this.data.getRowCount(); i++) {

            // Create an object to store daily for the current day
            let current = {
                // Convert strings to numbers.
                'day': this.data.getNum(i, 'days'),
                'price': this.data.getNum(i, 'close')
            };

            if (previous != null) {
                // Draw line segment connecting previous year to current year stock price.
                push();
                stroke(192, 192, 192);
                strokeWeight(1);
                line(this.mapDayToWidth(previous.day),
                    this.mapPriceToHeight(previous.price),
                    this.mapDayToWidth(current.day),
                    this.mapPriceToHeight(current.price));
                pop();
            }
            previous = current;
        }

        for (var i = 0; i < this.data.getRowCount() - sma; i++) {

            let sma = int(this.select1.value()); // from SMA dropdown menu
            let sd = int(this.select3.value()); // drom standard deviation dropdown menu

            let smaCurrent = {
                // Convert strings to numbers.
                'day': this.data.getNum(i + sma, 'days'),
                'price': this.smaPricing[i],
            };

            let sdCurrent = {
                // Convert strings to numbers.
                'sdPrice': this.sdPricing[i],
            };

            if (smaPrevious != null) {
                // Draw line segment connecting previous day to current day stock price.
                push();
                stroke(139, 0, 139);
                strokeWeight(4);
                line(this.mapDayToWidth(smaPrevious.day),
                    this.mapPriceToHeight(smaPrevious.price),
                    this.mapDayToWidth(smaCurrent.day),
                    this.mapPriceToHeight(smaCurrent.price));
                pop();

                // Draw line segment connecting previous year to current year stock price.
                push();
                stroke(34, 139, 34);
                strokeWeight(2);
                //setLineDash([10, 10]);
                line(this.mapDayToWidth(smaPrevious.day),
                    this.mapPriceToHeight(smaPrevious.price + (sdUpPrevious.sdPrice * sd)),
                    this.mapDayToWidth(smaCurrent.day),
                    this.mapPriceToHeight(smaCurrent.price + (sdCurrent.sdPrice * sd)));
                pop();

                push();
                stroke(178, 34, 34);
                strokeWeight(2);
                //setLineDash([10, 10]);
                line(this.mapDayToWidth(smaPrevious.day),
                    this.mapPriceToHeight(smaPrevious.price - (sdUpPrevious.sdPrice * sd)),
                    this.mapDayToWidth(smaCurrent.day),
                    this.mapPriceToHeight(smaCurrent.price - (sdCurrent.sdPrice * sd)));
                pop();

                // The number of x-axis labels to skip so that only numXTickLabels are drawn.
                let xLabelSkip = ceil(numDays / this.layout.numXTickLabels);

                // Draw the tick label marking the start of the previous year.
                if (dayCount % xLabelSkip == 0) {
                    drawXAxisTickLabel(smaPrevious.day, this.layout,
                        this.mapDayToWidth.bind(this));
                }

                // When six or fewer years are displayed also draw the final year x tick label.
                if ((numDays <= 6 &&
                        dayCount == numDays - 1)) {
                    drawXAxisTickLabel(smaCurrent.day, this.layout,
                        this.mapDayToWidth.bind(this));
                }
                dayCount++;
            } // if iteration

            // Stop drawing this frame when the number of days drawn is equal to the frame count
            if (dayCount >= this.frameCount) {
                break;
            }

            // Assign current day to previous day so that it is available during the next iteration
            // of this loop to give us the start position of the next line segment.
            smaPrevious = smaCurrent;
            sdUpPrevious = sdCurrent;
        }; // for loop, rows

        // Count the number of frames since this visualisation started; used in creating the
        // animation effect and to stop the main p5 draw loop when all days have been drawn.
        this.frameCount++;

    }; // end draw

    this.simpleMovingAverage = function(data, window) { // moving average of 'window' values
        let result = [];
        if (data.lenth < window) {
            return result;
        }
        let sum = 0;
        for (var i = 0; i < window; i++) { // build initial array of length 'window'
            sum += data[i];
        }
        result.push(sum / window);
        let steps = data.length - window - 1; // array length less size of window
        for (var i = 0; i < steps; i++) {
            sum -= data[i]; // remove one data point
            sum += data[i + window]; // add one data point
            result.push(sum / window); // push changes to array
        }
        return result;
    }

    this.smaSD = function(data, window) { // standard deviation of simple moving average
        let resultSD = [];
        let smaWindow = [];
        if (data.lenth < window) {
            return resultSD;
        }
        for (var i = 0; i < window; i++) {
            smaWindow.push(data[i]);
        }
        let mean = smaWindow.reduce((smaWindow, curr) => { return smaWindow + curr }, 0) / window; // create average
        smaSquare = smaWindow.map((k) => { return (k - mean) ** 2 }) // sqaure of each (value minus average)
        let sum = smaSquare.reduce((smaWindow, curr) => smaWindow + curr, 0); // sum the updated array
        resultSD.push(Math.sqrt(sum / window)); // build initial array of length 'window'
        let steps = data.length - window - 1; // array length of size of window
        for (var i = 0; i < steps; i++) {
            smaWindow.shift(); // remove one data point
            smaWindow.push(data[i + window]); // add one data point
            let mean = smaWindow.reduce((smaWindow, curr) => { return smaWindow + curr }, 0) / window; // create average
            smaSquare = smaWindow.map((k) => { return (k - mean) ** 2 }) // sqaure of each (value minus average)
            let sum = smaSquare.reduce((smaWindow, curr) => smaWindow + curr, 0); // sum the updated array
            resultSD.push(Math.sqrt(sum / window));
        }
        return resultSD;
    }


    this.drawTitle = function() {
        push();
        fill(0, 100, 0);
        noStroke();
        textAlign('center', 'center');
        textSize(28);
        text(this.title,
            (this.layout.plotWidth() / 2) + this.layout.leftMargin,
            this.layout.topMargin - (this.layout.marginSize * 0.75));
        pop();
    };

    this.mapDayToWidth = function(value) {
        return map(value,
            this.startDate,
            this.endDate,
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