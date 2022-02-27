function HousePricing() {

    // Name for the visualisation to appear in the menu bar.
    this.name = 'House Pricing';
    this.subname = 'One neighbourhood, 8 years';

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
            // Callback function to set the value
            // this.loaded to true.
            function(table) {
                self.loaded = true;
            });
    };

    this.setup = function() {
        // data from the table object
        this.salesPrice = int(this.data.getColumn('amount')); // raw sales price
        this.propertySize = int(this.data.getColumn('size')); // size scaled to 100
        this.propertyRaw = int(this.data.getColumn('rawSize')); // raw property size

        console.log(this.propertySize);

        this.scaledSalesPrice = [];
        for (let i = 0; i < this.salesPrice.length; i++) { // scale sales price to thousands
            this.scaledSalesPrice.push(this.salesPrice[i] / 1000);
        }

        // minimum and maximum property size for x axis
        this.minSize = min(this.data.getColumn('size')); // scaled size to 100
        this.maxSize = max(this.data.getColumn('size')); // scaled size to 100
        this.minRaw = min(this.data.getColumn('rawSize')); // raw size minimum value
        this.maxRaw = max(this.data.getColumn('rawSize')); // raw size maximum value
        console.log(this.minSize, this.maxSize);

        // minimum and maximum sales prices for y axis
        this.minSale = min(this.data.getColumn('amount')); // sale price in thousands
        this.maxSale = max(this.data.getColumn('amount')); // sale price in thousands

        this.minSaleLabel = this.minSale / 1000;
        this.maxSaleLabel = this.maxSale / 1000;

        this.slopeLine = this.linearRegressionSlope(this.scaledSalesPrice, this.propertySize);
        console.log(this.slopeLine);
        this.intercept = this.linearRegressionIntercept(this.scaledSalesPrice, this.propertySize, this.slopeLine);
        console.log(this.intercept);
        this.r2 = this.linearRegressionR(this.scaledSalesPrice, this.propertySize);
        console.log(this.r2);

        this.regressionLine = [];
        for (i = 0; i < this.propertySize.length; i++) {
            this.regressionLine.push(this.intercept + this.slopeLine * i);
        }
        this.regressionX = []
        for (i = 0; i < this.propertySize.length; i++) {
            this.regressionX.push(i);
        }

        console.log(this.regressionX);

        // count the number of frames drawn since the visualisation started to animate the plot
        //this.frameCount = 0;

    }; // end setup

    this.destroy = function() {};

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

        for (i = 0; i < this.data.getRowCount(); i++) {
            push();
            noStroke();
            fill(0, 150, 0, map(this.salesPrice[i], this.minSale, this.maxSale, 40, 240))
            ellipse(
                map(this.salesPrice[i], this.minSale, this.maxSale, this.layout.leftMargin + this.pad, this.layout.rightMargin),
                map(this.propertySize[i], this.minSize, this.maxSize, this.layout.bottomMargin - this.pad, this.layout.topMargin),
                8
            );
            pop();
        }

        // Plot all pay gaps between smallest size (x value) and largest size (x value)
        // using the width of the canvas minus margins.
        let previous;
        // let sizeRange = this.maxSize - this.minSize;
        // console.log(this.maxSize, this.minSize, sizeRange);

        // Count the number of regression line values plotted each frame to create animation effect.
        //let regressionCount = 0;

        // Loop over all rows and draw a line from the previous value to the current.
        for (let i = 0; i < this.propertyRaw.length; i++) {

            // Create an object to store data for the current year.
            let current = {
                // Convert strings to numbers.
                'size': this.regressionX[i],
                'price': this.regressionLine[i],
            };

            if (previous != null) {
                // Draw line segment connecting previous value to current value
                //console.log(current.size, current.price);
                push();
                stroke(139, 0, 139);
                strokeWeight(3);
                line(this.mapSizeToWidth(previous.size),
                    this.mapPriceToHeight(previous.price),
                    this.mapSizeToWidth(current.size),
                    this.mapPriceToHeight(current.price));
                pop();

            }; // if iteration

            // Assign current year to previous year so that it is available during the next iteration of 
            // this loop to give us the start position of the next line segment.
            previous = current;
        }; // end for loop

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

    this.mapSizeToWidth = function(value) {
        return map(value,
            0,
            100,
            this.layout.leftMargin, // Draw left-to-right from margin.
            this.layout.rightMargin);
    };

    this.mapRawToWidth = function(value) {
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

    this.linearRegressionSlope = function(price, size) {
            let n = price.length;
            let sum_size = 0;
            let sum_price = 0;
            let sum_sp = 0;
            let sum_ss = 0;
            let sum_pp = 0;

            for (let i = 0; i < price.length; i++) {

                sum_size += size[i];
                sum_price += price[i];
                sum_sp += (size[i] * price[i]);
                sum_ss += (size[i] * size[i]);
                sum_pp += (price[i] * price[i]);
            }

            slope = (n * sum_sp - sum_size * sum_price) / (n * sum_ss - sum_size * sum_size);
            // lr['intercept'] = (sum_y - lr.slope * sum_x)/n;
            // lr['r2'] = Math.pow((n*sum_xy - sum_x*sum_y)/Math.sqrt((n*sum_xx-sum_x*sum_x)*(n*sum_yy-sum_y*sum_y)),2);

            return slope;
        } // end slope

    this.linearRegressionIntercept = function(price, size, slope) {
            let n = price.length;
            let sum_size = 0;
            let sum_price = 0;
            let sum_sp = 0;
            let sum_ss = 0;
            let sum_pp = 0;

            for (let i = 0; i < price.length; i++) {

                sum_size += size[i];
                sum_price += price[i];
                sum_sp += (size[i] * price[i]);
                sum_ss += (size[i] * size[i]);
                sum_pp += (price[i] * price[i]);
            }

            intercept = (sum_price - (slope * sum_size)) / n;
            // lr['r2'] = Math.pow((n*sum_xy - sum_x*sum_y)/Math.sqrt((n*sum_xx-sum_x*sum_x)*(n*sum_yy-sum_y*sum_y)),2);

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

                sum_size += size[i];
                sum_price += price[i];
                sum_sp += (size[i] * price[i]);
                sum_ss += (size[i] * size[i]);
                sum_pp += (price[i] * price[i]);
            }

            r2 = Math.pow((n * sum_sp - sum_size * sum_price) /
                Math.sqrt((n * sum_ss - sum_size * sum_size) * (n * sum_pp - sum_price * sum_price)), 2);

            return r2;
        } // end R

} // end HousePricing