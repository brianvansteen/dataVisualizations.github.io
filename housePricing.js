function HousePricing() {

    // description and sub-description for the visualisation in the menu bar
    this.name = 'House Pricing';
    this.subname = 'Linear Regression Analysis';

    // Each visualisation must have a unique ID with no special characters.
    this.id = 'house-pricing';

    // title to display above the plot.
    this.title = 'House Price Sales and Lot Size';

    // Names for each axis.
    this.xAxisLabel = 'House Lot Size (sqaure feet)';
    this.yAxisLabel = 'House Selling Price ($ 000)';

    // Property to represent whether data has been loaded.
    this.loaded = false;

    this.pad = 20;
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
        numXTickLabels: 7,
        numYTickLabels: 6,

    }; // end layout

    // preload the data, called automatically by the gallery when a visualisation is added
    this.preload = function() {
        let self = this;
        this.data = loadTable(
            './data/houses/housing.csv', 'csv', 'header',
            // Callback function to set the value this.loaded to true.
            function(table) {
                self.loaded = true;
            });
    };

    this.setup = function() {
        // data from the table object
        this.salesPrice = int(this.data.getColumn('amount')); // raw sales price
        this.propertySize = int(this.data.getColumn('size')); // size scaled to 100
        this.propertyRaw = int(this.data.getColumn('rawSize')); // raw property size

        this.baseArray = this.propertySize.length; // number of house price sales (399); assigned to base case array

        for (let i = 0; i < this.removeOutliers; i++) {
            let max = Math.max(...this.salesPrice);
            let maxIdx = this.salesPrice.indexOf(max);
            //console.log(max, maxIdx);
            this.salesPrice.splice(maxIdx, 1);
            this.propertySize.splice(maxIdx, 1);
        }

        // minimum and maximum property size for x axis
        this.minSize = min(this.data.getColumn('size')); // scaled size to 100
        this.maxSize = max(this.data.getColumn('size')); // scaled size to 100
        this.minRaw = min(this.data.getColumn('rawSize')); // raw size minimum value for x axis tick values only
        this.maxRaw = max(this.data.getColumn('rawSize')); // raw size maximum value for x axis tick values only

        // minimum and maximum sales prices for y axis
        this.minSale = min(this.data.getColumn('amount')); // sale price in thousands
        this.maxSale = max(this.data.getColumn('amount')); // sale price in thousands

        this.minSaleLabel = this.minSale / 1000; // sale price in hundreds
        this.maxSaleLabel = this.maxSale / 1000; // sale price in hundreds

        this.select2 = createSelect(); // create sub-dropdown menu in DOM
        this.select2.position(this.layout.rightMargin * 1.055, height - 30); // place dropdown at x, y on canvas
        this.select2.style('font-size', '12px');
        this.select2.style('color', 'blueviolet');
        this.select2.style('background-color', 'lavender');
        this.select2.style('text-align', 'center');
        let outliers = [0, 2, 3, 4] // value for the sub-dropdown menu
        for (let i = 0; i < outliers.length; i++) {
            this.select2.option(outliers[i]); // each dropdown value
        }

        this.select3 = createSelect(); // create dropdown menu in DOM
        this.select3.position(this.layout.rightMargin * 1, height - 65); // place dropdown at x, y on canvas
        this.select3.style('font-size', '14px');
        this.select3.style('color', 'blueviolet');
        this.select3.style('background-color', 'lavender');
        this.select3.style('text-align', 'center');
        let regressionResult = ["-", "r-squared"] // values for the dropdown menu
        for (let i = 0; i < regressionResult.length; i++) {
            this.select3.option(regressionResult[i]); // each dropdown value
        }

        // count the number of frames drawn since the visualisation started to animate the plot
        this.frameCount = 0;

        noLoop();

    }; // end setup

    this.destroy = function() {
        this.select2.remove();
        this.select3.remove();
    };

    this.draw = function() {
        if (!this.loaded) {
            console.log('Data not yet loaded');
            return;
        }
        this.drawTitle(); // draw the title above the plot

        // draw all y-axis tick values; helper function
        drawYAxisTickLabels(this.minSaleLabel,
            this.maxSaleLabel,
            this.layout,
            this.mapPriceToHeight.bind(this),
            0);

        // draw all x-axis tick values; helper function
        drawXAxisTickValues(this.minRaw,
            this.maxRaw,
            this.layout,
            this.mapRawToWidth.bind(this),
            0);

        drawAxis(this.layout); // draw x and y base axis; helper function

        drawAxisLabels(this.xAxisLabel, // draw x and y axis title labels; from helper function
            this.yAxisLabel,
            this.layout);

        drawDropDownTitle2("Outliers to Remove", this.layout); // right sub drop down
        drawDropDownTitle3("Goodness-of-Fit", this.layout); // right drop down

        let goodness = this.select3.value();
        let outliers = this.select2.value();

        for (i = 0; i < this.data.getRowCount(); i++) { // draw the points representing the sales price and property size
            push();
            noStroke();
            fill(0, 150, 0, map(this.salesPrice[i], this.minSale, this.maxSale, 40, 240))
            ellipse(
                map(this.propertySize[i], this.minSize, this.maxSize, this.layout.leftMargin + this.pad, this.layout.rightMargin),
                map(this.salesPrice[i], this.minSale, this.maxSale, this.layout.bottomMargin - this.pad, this.layout.topMargin + this.pad),
                10
            );
            pop();
        }

        // Plot all pay gaps between smallest size (x value) and largest size (x value) using the width of the canvas minus margins.
        let previous;

        // Count the number of days plotted each frame to create animation effect.
        let xAxisCount = 0;

        if (goodness === "r-squared" && outliers === '0') { // when drop down value selected, draw regression line and value

            this.slopeLine = this.linearRegressionSlope(this.salesPrice, this.propertySize); // calculate regression line slope
            this.intercept = this.linearRegressionIntercept(this.salesPrice, this.propertySize, this.slopeLine); // calculate regression line Y intercept
            this.r2 = this.linearRegressionR(this.salesPrice, this.propertySize); // calculate goodness-of-fit
            this.r2 = Math.round(this.r2 * 1000) / 10; // convert to percentage

            this.regressionLine = []; // generate y values of regression line
            for (i = 0; i < this.propertySize.length; i++) {
                this.regressionLine.push(this.intercept / 1000 + this.slopeLine / 1000 * i);
            }

            this.regressionX = [] // generate number of x values for regression line
            for (i = 0; i < this.propertySize.length; i++) {
                this.regressionX.push(i);
            }

            push();
            fill(139, 0, 139);
            textStyle(BOLD);
            textSize(20);
            text("Goodness-of-fit:", width * 0.75, 170)
            text("R-Squared = " + this.r2 + "%", width * 0.75, 200);
            pop();
            push();
            fill(0, 150, 0, 100);
            ellipse(320, this.layout.topMargin + this.pad, 100, 40); // ellipse to highlight outliers
            fill(0, 150, 0);
            textStyle(BOLD);
            textSize(22);
            text("Two outliers", 320, this.layout.topMargin + 60);
            pop();

            // Loop over all rows and draw a line from the previous value to the current
            for (let i = 0; i < this.propertyRaw.length; i++) {

                // Create an object to store data for the current year.
                let current = {
                    // Convert strings to numbers.
                    'size': this.regressionX[i], // x values
                    'price': this.regressionLine[i], // y values
                };

                if (previous != null) { // draw initial regression line
                    // Draw line segment connecting previous value to current value
                    push();
                    stroke(139, 0, 139);
                    strokeWeight(4);
                    setLineDash([4, 10]); // dashed line
                    line(this.mapSizeToWidth(previous.size),
                        this.mapPriceToHeight(previous.price),
                        this.mapSizeToWidth(current.size),
                        this.mapPriceToHeight(current.price));
                    pop();

                    xAxisCount++;

                }; // end if

                // Assign current year to previous year so that it is available during the next iteration of 
                // this loop to give us the start position of the next line segment.
                previous = current;
            }; // end for loop

            // Count the number of frames since this visualisation started; used in creating the
            // animation effect and to stop the main p5 draw loop when all days have been drawn.
            this.frameCount++;

        } // end if

        this.removeOutliers = this.select2.value(); // determine if outlier values are to be removed

        if (this.removeOutliers != 0) { // if outliers are to be removed

            this.salesPriceTemp = []; // temporary array for sales prices, depending on if outliers are removed
            this.propertySizeTemp = []; // temporary array for property sizes, depending on if outliers are removed

            push();
            fill(0, 0, 139)
            rect(width * 0.63, 140, 280, 90);
            fill(255);
            textStyle(BOLD);
            textSize(24);
            text("Goodness-of-fit:", width * 0.75, 170)
            text("R-Squared = " + this.r2 + "%", width * 0.75, 200);
            pop();

            fill(0, 150, 0);
            ellipse(320, this.layout.topMargin + this.pad, 100, 40); // highlight extreme outliers

            // when this.removeOutliers is != 0
            if (this.salesPrice.length > this.baseArray - this.removeOutliers) { // if number of sales prices greater than base array minus outliers to remove
                for (let i = 0; i < this.removeOutliers; i++) { // number of outliers to remove
                    let max = Math.max(...this.salesPrice); // identify max price
                    let maxIdx = this.salesPrice.indexOf(max); // identify index of max price
                    this.salesPriceTemp.push(this.salesPrice[maxIdx]); // push price to temp array, based on maxIdx
                    this.propertySizeTemp.push(this.propertySize[maxIdx]); // push property size to temp array, based on maxIdx
                    this.salesPrice.splice(maxIdx, 1); // remove price based on maxIdx from working array
                    this.propertySize.splice(maxIdx, 1); // remove property size based on maxIdx from working array
                }

                // calculated linear regression terms after outliers have been removed from above calculations
                this.slopeLine = this.linearRegressionSlope(this.salesPrice, this.propertySize); // calculate slope
                this.intercept = this.linearRegressionIntercept(this.salesPrice, this.propertySize, this.slopeLine); // calculate intercept
                this.r2 = this.linearRegressionR(this.salesPrice, this.propertySize);
                this.r2 = Math.round(this.r2 * 1000) / 10;

                this.regressionLine = []; // generate y values of regression line
                for (i = 0; i < this.propertySize.length; i++) {
                    this.regressionLine.push(this.intercept / 1000 + this.slopeLine / 1000 * i);
                }

                // Loop over all rows and draw a line from the previous value to the current
                for (let i = 0; i < this.propertyRaw.length; i++) {

                    // Create an object to store data for the current year.
                    let current = {
                        'size': this.regressionX[i], // x values
                        'price': this.regressionLine[i], // y values
                    };

                    if (previous != null) { // draw regression line
                        // Draw line segment connecting previous value to current value
                        push();
                        stroke(0, 0, 139);
                        strokeWeight(4);
                        setLineDash([1, 10]); // dashed line
                        line(this.mapSizeToWidth(previous.size),
                            this.mapPriceToHeight(previous.price),
                            this.mapSizeToWidth(current.size),
                            this.mapPriceToHeight(current.price));
                        pop();

                    }; // end if

                    // Assign current year to previous year so that it is available during the next iteration of 
                    // this loop to give us the start position of the next line segment.
                    previous = current;
                }; // end for loop

                redraw();

                for (let i = 0; i < this.removeOutliers; i++) {
                    this.salesPrice.push(this.salesPriceTemp[i]);
                    this.propertySize.push(this.propertySizeTemp[i]);
                }
            }
        } // end removeOutliers

    }; // end draw

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

    this.mapSizeToWidth = function(value) { // map property sizes to X axis
        return map(value,
            0,
            90,
            this.layout.leftMargin, // Draw left-to-right from margin.
            this.layout.rightMargin - this.pad * 2);
    };

    this.mapRawToWidth = function(value) { // raw property size values for X axis tick values
        return map(value,
            this.minRaw,
            this.maxRaw,
            this.layout.leftMargin, // Draw left-to-right from margin.
            this.layout.rightMargin);
    };


    this.mapPriceToHeight = function(value) {
        return map(value,
            this.minSaleLabel,
            this.maxSaleLabel,
            this.layout.bottomMargin - this.pad, // Smaller house price at bottom.
            this.layout.topMargin + this.pad); // Bigger hight price at top.
    };


    this.removeOutliers = function(value) {
        for (let i = 0; i < value; i++) {
            let max = Math.max(...this.salesPrice);
            let maxIdx = this.salesPrice.indexOf(max);
            this.salesPrice.splice(maxIdx, 1);
            this.propertySize.splice(maxIdx, 1);
        }
    }


    this.linearRegressionSlope = function(price, size) { // calculate linear regression slope
            let n = price.length;
            let sum_size = 0;
            let sum_price = 0;
            let sum_sp = 0;
            let sum_ss = 0;
            let sum_pp = 0;

            for (let i = 0; i < price.length; i++) {

                sum_size += size[i]; // total size
                sum_price += price[i]; // total price
                sum_sp += (size[i] * price[i]); // price times size, summed
                sum_ss += (size[i] * size[i]); // size squared, summed
                sum_pp += (price[i] * price[i]); // price squared, summed
            }

            slope = (n * sum_sp - sum_size * sum_price) / (n * sum_ss - sum_size * sum_size);

            return slope;
        } // end slope

    this.linearRegressionIntercept = function(price, size, slope) { // calculate linear regression Y intercept
            let n = price.length;
            let sum_size = 0;
            let sum_price = 0;

            for (let i = 0; i < price.length; i++) {

                sum_size += size[i]; // total size
                sum_price += price[i]; // total price

            }

            intercept = (sum_price - (slope * sum_size)) / n;

            return intercept;
        } // end intercept

    this.linearRegressionR = function(price, size) {
            let n = price.length;
            let sum_size = 0;
            let sum_price = 0;
            let sum_sp = 0;
            let sum_ss = 0;
            let sum_pp = 0;

            for (let i = 0; i < price.length; i++) {

                sum_size += size[i]; // total size
                sum_price += price[i]; // total price
                sum_sp += (size[i] * price[i]); // price times size, summed
                sum_ss += (size[i] * size[i]); // size squared, summed
                sum_pp += (price[i] * price[i]); // price squared, summed
            }

            r2 = Math.pow((n * sum_sp - sum_size * sum_price) /
                Math.sqrt((n * sum_ss - sum_size * sum_size) * (n * sum_pp - sum_price * sum_price)), 2);

            return r2;
        } // end R

} // end HousePricing