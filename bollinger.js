function Bollinger() {

    // description and sub-description for the visualisation in the menu bar
    this.name = 'Tesla Price';
    this.subname = 'Bollinger bands';

    // each visualisation must have a unique ID with no special characters.
    this.id = 'TSLA-stock-price';

    // title to display above the plot.
    this.title = 'Tesla Stock Price (5 years / 1,259 trading days)';

    // Names for each axis.
    this.xAxisLabel = 'Number of Trading Days'; // x axis name
    this.yAxisLabel = 'U.S. dollars ($)'; // y axis name

    let marginSize = 50;

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
        let self = this;
        this.data = loadTable(
            './data/bollinger/TSLA.csv', 'csv', 'header',
            // Callback function to set the value this.loaded to true.
            function(table) {
                self.loaded = true;
            });
    }; // end preload

    this.setup = function() {
        // set min and max dates
        this.startDate = this.data.getNum(0, 'days'); // day 0 of closing price data; used to map X axis
        this.endDate = this.data.getNum(this.data.getRowCount() - 1, 'days'); // day 1259 of closing price data; used to map X axis

        this.startDay = this.data.getString(0, 'date2'); // Excel date (DD-MM-YY) for sub-Xlabel starting series date
        this.midDay = this.data.getString(Math.floor(this.data.getRowCount() / 2), 'date2'); // Excel date (DD-MM-YY) for sub-Xlabel
        this.endDay = this.data.getString(this.data.getRowCount() - 1, 'date2'); // Excel date (DD-MM-YY) for sub-Xlabel ending series date

        // find min and max stock price for mapping to aix height.
        this.minPrice = 0; // zero stock price
        this.maxPrice = max(this.data.getColumn('close')) * 1.25; // max closing stock price times 125% for the upper Bollinger band

        // count the number of frames drawn since the visualisation started to animate the plot
        this.frameCount = 0;

        this.allPricing = []; // array for all pricing data, to be used in simple moving average calculation
        for (let i = 0; i < this.data.getRowCount(); i++) {
            this.allPricing.push(this.data.getNum(i, 'close')); // get closing prices from 'close' column
        }

        this.select1 = createSelect(); // create dropdown menu in DOM
        this.select1.position(this.layout.leftMargin * 6, height - 65); // place dropdown at x, y on canvas
        this.select1.style('font-size', '20px');
        this.select1.style('color', 'blueviolet');
        this.select1.style('background-color', 'lavender');
        this.select1.style('text-align', 'center');
        let smaValue1 = [1, 20, 50, 100, 200] // values for the dropdown menu for simple moving average (SMA)
        for (let i = 0; i < smaValue1.length; i++) {
            this.select1.option(smaValue1[i]); // each dropdown value
        }

        this.select3 = createSelect(); // create dropdown menu in DOM
        this.select3.position(this.layout.rightMargin * 1.22, height - 65); // place dropdown at x, y on canvas
        this.select3.style('font-size', '20px');
        this.select3.style('color', 'blueviolet');
        this.select3.style('background-color', 'lavender');
        this.select3.style('text-align', 'center');
        let sdValue = [2, 3, 4] // values for the dropdown menu for standard deviation values
        for (let i = 0; i < sdValue.length; i++) {
            this.select3.option(sdValue[i]); // each dropdown value
        }

    }; // end setup

    this.destroy = function() {
        this.select1.remove(); // remove dropdown menu
        //this.select2.remove(); // remove dropdown menu
        this.select3.remove(); // remove dropdown menu
    };

    this.draw = function() {
        if (!this.loaded) {
            console.log('Data not yet loaded');
            return;
        }
        // colour-code legend for lines drawn
        push();
        textAlign(LEFT);
        textSize(20);
        fill(192);
        rect(150, 100, 10, 10);
        text("Daily closing price", 180, 105)
        fill(139, 0, 139);
        rect(150, 130, 10, 10);
        text("Simple Moving Average price", 180, 135)
        fill(34, 139, 34);
        rect(150, 160, 10, 10);
        text("Upper Bollinger band", 180, 165)
        fill(178, 34, 34);
        rect(150, 190, 10, 10);
        text("Lower Bollinger band", 180, 195)
        pop();

        this.drawTitle(); // draw the title above the plot

        // draw all y-axis labels; helper function
        drawYAxisTickLabels(this.minPrice,
            this.maxPrice,
            this.layout,
            this.mapPriceToHeight.bind(this),
            0);

        drawAxis(this.layout); // draw x and y axis; helper function

        drawAxisLabels(this.xAxisLabel, // draw x and y axis labels; from helper function
            this.yAxisLabel,
            this.layout);

        drawXAxisSubLabels(this.startDay, this.midDay, this.endDay, this.layout); // draw x and y axis labels; helper function

        drawDropDownTitle("Simple Moving Average (days)", this.layout); // left drop down
        drawDropDownTitle3("Bollinger bands (standard deviations)", this.layout); // right drop down

        // Plot all stock prices between startDate and endDate using the width of the canvas minus margins.
        let smaPrevious; // simple moving average
        let sdPrevious; // standard deviation
        let previous; // daily price
        let numDays = this.endDate - this.startDate; // for X axis values
        let sma = int(this.select1.value()); // from SMA dropdown menu
        this.smaPricing = this.simpleMovingAverage(this.allPricing, sma); // dimplr moving average value
        this.sdPricing = this.smaSD(this.allPricing, sma); // standard deviation value of simple moving average

        // Count the number of days plotted each frame to create animation effect.
        let dayCount = 0;

        // Loop over all rows and draw a line from the previous value to the current.
        for (let i = 0; i < this.data.getRowCount(); i++) {

            // Create an object to store daily for the current day
            let current = {
                // Convert strings to numbers.
                'day': this.data.getNum(i, 'days'),
                'price': this.data.getNum(i, 'close')
            };

            // raw closing price data
            if (previous != null) {
                // draw line segment connecting previous day to current day closing stock price.
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

        for (let i = 0; i < this.data.getRowCount() - sma; i++) {

            let sma = int(this.select1.value()); // from SMA dropdown menu
            let sd = int(this.select3.value()); // drom standard deviation dropdown menu

            let smaCurrent = { // simple moving average values
                // Convert strings to numbers.
                'day': this.data.getNum(i + sma, 'days'),
                'price': this.smaPricing[i],
            };

            let sdCurrent = { // standard deviation values
                // Convert strings to numbers.
                'sdPrice': this.sdPricing[i],
            };

            if (smaPrevious != null) { // simple moving average
                // draw line segment connecting previous day to current day simple moving average value
                push();
                stroke(139, 0, 139);
                strokeWeight(4);
                line(this.mapDayToWidth(smaPrevious.day),
                    this.mapPriceToHeight(smaPrevious.price),
                    this.mapDayToWidth(smaCurrent.day),
                    this.mapPriceToHeight(smaCurrent.price));
                pop();

                // draw line segment connecting previous day to current day SMA plus standard deviation
                push();
                stroke(34, 139, 34);
                strokeWeight(2);
                //setLineDash([10, 10]);
                line(this.mapDayToWidth(smaPrevious.day),
                    this.mapPriceToHeight(smaPrevious.price + (sdPrevious.sdPrice * sd)),
                    this.mapDayToWidth(smaCurrent.day),
                    this.mapPriceToHeight(smaCurrent.price + (sdCurrent.sdPrice * sd)));
                pop();

                // draw line segment connecting previous day to current day SMA minus standard deviation
                push();
                stroke(178, 34, 34);
                strokeWeight(2);
                //setLineDash([10, 10]);
                line(this.mapDayToWidth(smaPrevious.day),
                    this.mapPriceToHeight(smaPrevious.price - (sdPrevious.sdPrice * sd)),
                    this.mapDayToWidth(smaCurrent.day),
                    this.mapPriceToHeight(smaCurrent.price - (sdCurrent.sdPrice * sd)));
                pop();

                // number of x-axis labels to skip so that only numXTickLabels are drawn.
                let xLabelSkip = ceil(numDays / this.layout.numXTickLabels);

                // draw the tick label marking the start of the previous year.
                if (dayCount % xLabelSkip == 0) {
                    drawXAxisTickLabel(smaPrevious.day, this.layout,
                        this.mapDayToWidth.bind(this));
                }

                // when six or fewer years are displayed also draw the final year x tick label.
                if ((numDays <= 6 &&
                        dayCount === numDays - 1)) {
                    drawXAxisTickLabel(smaCurrent.day, this.layout,
                        this.mapDayToWidth.bind(this));
                }
                dayCount++;
            }; // if iteration

            // Stop drawing this frame when the number of days drawn is equal to the frame count
            if (dayCount >= this.frameCount) {
                break;
            };

            // Assign current day to previous day so that it is available during the next iteration
            // of this loop to give us the start position of the next line segment.
            smaPrevious = smaCurrent; // simple moving average values
            sdPrevious = sdCurrent; // standard deviation values
        }; // for loop, rows

        // Count the number of frames since this visualisation started; used in creating the
        // animation effect and to stop the main p5 draw loop when all days have been drawn.
        this.frameCount++;

    }; // end draw

    this.simpleMovingAverage = function(data, window) { // calculate moving average of 'dropdown' value
        let result = [];
        if (data.lenth < window) {
            return result;
        }
        let sum = 0;
        for (let i = 0; i < window; i++) { // build initial array of length 'dropdown' value; i.e. array of 20
            sum += data[i];
        }
        result.push(sum / window);
        let steps = data.length - window - 1; // 5 years of data, less lenght of 'dropdown' value
        for (let i = 0; i < steps; i++) {
            sum -= data[i]; // remove one data point from array of 'dropdown' values
            sum += data[i + window]; // add one data point to array of 'dropdown' values
            result.push(sum / window); // push changes to array
        }
        return result;
    }

    this.smaSD = function(data, window) { // standard deviation of simple moving average 'dropdown' value (window)
        let resultSD = []; // standard deviation values to draw
        let smaWindow = []; // size of the simple moving average array, based on 'dropdown' value selected
        if (data.lenth < window) {
            return resultSD;
        }
        for (let i = 0; i < window; i++) {
            smaWindow.push(data[i]);
        }
        let mean = smaWindow.reduce((smaWindow, curr) => { return smaWindow + curr }, 0) / window; // create average
        smaSquare = smaWindow.map((k) => { return (k - mean) ** 2 }) // sqaure of each (value minus average)
        let sum = smaSquare.reduce((smaWindow, curr) => smaWindow + curr, 0); // sum the updated array

        resultSD.push(Math.sqrt(sum / window)); // build initial value of square root of sum / window (SMA length)
        let steps = data.length - window - 1; // array length of size of window
        for (let i = 0; i < steps; i++) {
            smaWindow.shift(); // remove one data point
            smaWindow.push(data[i + window]); // add one data point
            let mean = smaWindow.reduce((smaWindow, curr) => { return smaWindow + curr }, 0) / window; // create average
            smaSquare = smaWindow.map((k) => { return (k - mean) ** 2 }) // sqaure of each (value minus average)
            let sum = smaSquare.reduce((smaWindow, curr) => smaWindow + curr, 0); // sum the updated array
            resultSD.push(Math.sqrt(sum / window)); //square root of sum / window (SMA length)
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