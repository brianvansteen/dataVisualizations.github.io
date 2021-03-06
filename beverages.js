function Beverages() {

    // description and sub-description for the visualisation in the menu bar
    this.name = 'Beverage Consumption';
    this.subname = 'One-day survey';

    // Each visualisation must have a unique ID with no special characters.
    this.id = 'beverage-consumption';

    this.title = 'Beverage Consumption Amounts';

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

        plotWidth: function() { // use for drawing title
            return this.rightMargin - this.leftMargin;
        },

        // plotHeight: function() {
        //     return this.bottomMargin - this.topMargin;
        // },

        // Boolean to enable/disable background grid.
        grid: true,

        // Number of axis tick labels to draw so that they are not drawn on top of one another.
        numXTickLabels: 28,
        numYTickLabels: 8,

    }; // end layout

    this.bubbles = []; // array for bubbles showing data
    let maxAmt; // max size of each bubble
    this.times = []; // array for survey result consumption times

    this.preload = function() { // load the data for the data visualization
        var self = this;
        this.data = loadTable(
            './data/food/beveragesFinal.csv', 'csv', 'header',
            // Callback function to set the value this.loaded to true.
            function(table) {
                self.loaded = true;
            });
    };

    this.setup = function() {

        this.rows = this.data.getRows(); // data object with values for each individual beverage
        this.numColumns = this.data.getColumnCount(); // 6 columns
        maxAmt = 0;

        for (var i = 0; i < this.rows.length; i++) {
            var b = new Bubble(this.rows[i].get(0)); // bubble for each beverage
            for (var j = 1; j < this.numColumns; j++) {
                var n = this.rows[i].getNum(j); // survey response numbers for each beverage row, but column
                if (n > maxAmt) { // survey response value
                    maxAmt = n; //keep a tally of the highest value
                }
                b.data.push(n); // push value to data array, line 135
            }
            this.bubbles.push(b); // push to bubbles array
        }

        for (var i = 0; i < this.bubbles.length; i++) {
            this.bubbles[i].setData(0);
        }

        this.select1 = createSelect(); // create dropdown menu in DOM
        this.select1.position(this.layout.rightMargin * 1, height - 770); // place dropdown at x, y on canvas
        this.select1.style('font-size', '28px');
        this.select1.style('color', 'blueviolet');
        this.select1.style('background-color', 'lavender');
        this.select1.style('text-align', 'center');
        let times = ['Morning', 'Afternoon', 'Evening', 'Night', 'Totals']; // values for the dropdown menu
        for (let i = 0; i < times.length; i++) {
            this.select1.option(times[i]); // each dropdown value
        }

    }; // end setup

    this.changeTime = function(time) {
        for (var i = 0; i < this.bubbles.length; i++) {
            this.bubbles[i].setData(time); // use response values based on time of day selector
        }
    };

    this.destroy = function() {
        this.bubbles = []; // remove bubbles when selecting different extension
        this.select1.remove(); // remove dropdown menu when selecting different extension
    };

    this.draw = function() {
            push();

            this.drawTitle(); // draw the title above the plot

            translate(width / 2, height / 2);
            for (var i = 0; i < this.bubbles.length; i++) {
                this.bubbles[i].update(this.bubbles); // call this.update first
                this.bubbles[i].draw(); // call this.draw after update
            }
            let timeOfDay = ['Totals', 'Morning', 'Afternoon', 'Evening', 'Night'];
            this.changeTime(timeOfDay.indexOf(this.select1.value())); // assign numerical index value based on selector value
            pop();
        } // end draw

    this.drawTitle = function() {
        push();
        fill(0, 100, 0);
        noStroke();
        textAlign('center', 'center');
        textSize(34);
        text(this.title,
            (this.layout.plotWidth() / 6) + this.layout.leftMargin,
            this.layout.topMargin - (this.layout.marginSize * 0.75));
        pop();
    };

    function Bubble(_name) {
        this.size = 20;
        this.target_size = 20;
        this.pos = createVector(0, 0);
        this.direction = createVector(0, 0);
        this.name = _name; // private property
        this.color = color(random(50, 200), random(50, 200), random(50, 200));
        this.data = []; // beverage response values; pushed from line 69

        this.draw = function() {
            push();
            textAlign(CENTER);
            noStroke();
            fill(this.color);
            ellipse(this.pos.x, this.pos.y, this.size);
            fill(0);
            textSize(18);
            textAlign(CENTER, CENTER);
            textWrap(WORD);
            text(this.name, this.pos.x - 25, this.pos.y - 7, 50);
            pop();
        }

        this.update = function(_bubbles) {
                this.direction.set(0, 0);

                for (var i = 0; i < _bubbles.length; i++) {
                    if (_bubbles[i].name != this.name) {
                        var v = p5.Vector.sub(this.pos, _bubbles[i].pos); // vector subtraction this.pos minus bubble
                        var d = v.mag(); // calculates length / magnitude of vector from line above

                        if (d < this.size / 1.9 + _bubbles[i].size / 1.9) { // if vector length d is less than two radii...
                            if (d > 10) {
                                this.direction.add(v) * 2; // add vector values to move bubbles away from each oterh
                            } else {
                                this.direction.add(p5.Vector.random2D());
                            }
                        }
                    }
                }

                this.direction.normalize(); // make a unit vector
                this.direction.mult(10); // multiple direction vectors by 4
                // this.pos.add(this.direction); // position add the result of the direction multiple

                // keep bubbles away from top of graph while not close to left of graph
                if (this.pos.x > -500 && this.pos.y < -200) { // while > -500 x, and if < -200 y; move left and down
                    this.pos.add(-70, 70, 0); // ADD x, y, z values to add to vector position > move left and down

                    // keep bubbles away from top of graph and away from left of graph
                } else if (this.pos.x < -500 && this.pos.y < -200) { // if < -500 x, and if < -200 y; move right and down
                    this.pos.add(70, 70, 0); // ADD x, y, z values to add to vector position > move right and down


                    // keep bubbles away from top of graph while not close to right of graph
                } else if (this.pos.x < 500 && this.pos.y < -200) { // while < 500 x, and if < -200 y; move right and down
                    this.pos.add(70, 70, 0); // ADD x, y, z values to add to vector position > move right and down

                    // keep bubbles away from top of graph and away from right of graph
                } else if (this.pos.x > 500 && this.pos.y < -200) { // if > 500 x, and if < -200 y; move left and down
                    this.pos.add(-70, 70, 0); // ADD x, y, z values to add to vector position > move right and down


                    // keep away from bottom of graph while not close to left of graph
                } else if (this.pos.x > -500 && this.pos.y > 200) { // while > -500 x, and if > 200 y; move left and up
                    this.pos.sub(70, 70, 0); // SUB x, y, z values to add to vector position > move left and up

                    // keep bubbles away from bottom of graph and away from left of graph
                } else if (this.pos.x < -500 && this.pos.y > 200) { // if < -500 x, and if > 200 y; move right and up
                    this.pos.sub(-70, 70, 0); // SUB x, y, z values to add to vector position > move right and up


                    // keep bubbles away from bottom of graph while not close to right of graph
                } else if (this.pos.x < 500 && this.pos.y > 200) { // while < 500 x, and if > 200 y; move right and up
                    this.pos.sub(-70, 70, 0) // SUB x, y, z values to add to vector position > move right and up

                    // keep bubbles away from bottom of graph and away from right of graph
                } else if (this.pos.x > 500 && this.pos.y > 200) { // if < 500 x, and if > 200 y; move left and up
                    this.pos.sub(70, 70, 0) // SUB x, y, z values to add to vector position > move left and up 

                } else {
                    this.pos.add(this.direction);
                }

                if (this.size < this.target_size) { // size of ellipse
                    this.size += 1;
                } else if (this.size > this.target_size) {
                    this.size -= 1;
                }
            } // end update

        this.setData = function(i) {
            this.target_size = map(this.data[i], 0, maxAmt, 80, 360); // final size of ellipse
        }

    } // end bubble

} // end Bubble constructor