function UKFoodConsumption() {

    // Name for the visualisation to appear in the menu bar.
    this.name = 'UK Food Consumption';

    // Each visualisation must have a unique ID with no special
    // characters.
    this.id = 'uk-food-consumption';

    // layout object to store all common plot layout parameters and methods.
    this.layout = {
        // Locations of margin positions. Left and bottom have double margin size due to axis and tick labels.
        leftMargin: 130,
        rightMargin: width,
        topMargin: 30,
        bottomMargin: height,
        pad: 5,

        plotWidth: function() {
            return this.rightMargin - this.leftMargin;
        },

        // Boolean to enable/disable background grid.
        grid: true,

        // Number of axis tick labels to draw so that they are not drawn on top of one another.
        numXTickLabels: 10,
        numYTickLabels: 8,
    };

    this.bubbles = [];
    let maxAmt;
    this.years = [];
    this.yearButtons = [];

    this.preload = function() {
        var self = this;
        this.data = loadTable(
            './data/food/foodData.csv', 'csv', 'header',
            // Callback function to set the value this.loaded to true.
            function(table) {
                self.loaded = true;
            });
    };

    this.setup = function() {

        this.rows = this.data.getRows();

        this.numColumns = this.data.getColumnCount();

        // for (var i = 5; i < this.numColumns; i++) {
        //     var y = this.data.columns[i];
        //     this.years.push(y);
        //     this.buttons = createButton(y, y);
        //     this.buttons.parent('years')
        //     this.buttons.mousePressed(function() {
        //         this.changeYear(this.elt.value);
        //     })
        //     this.yearButtons.push(this.buttons);
        // }

        maxAmt = 0;

        for (var i = 0; i < this.rows.length; i++) {
            if (this.rows[i].get(0) != "") {
                var b = new Bubble(this.rows[i].get(0));

                for (var j = 5; j < this.numColumns; j++) {
                    if (this.rows[i].get(j) != "") {
                        var n = this.rows[i].getNum(j);
                        if (n > maxAmt) {
                            maxAmt = n; //keep a tally of the highest value
                        }
                        b.data.push(n);
                    } else {
                        b.data.push(0);
                    }
                }
                this.bubbles.push(b);
            }
        }

        for (var i = 0; i < this.bubbles.length; i++) {
            this.bubbles[i].setData(0);
        }
    }

    this.changeYear = function(year) {
        var y = years.indexOf(year);
        for (var i = 0; i < this.bubbles.length; i++) {
            this.bubbles[i].setData(y);
        }
    }

    this.destroy = function() {
        this.bubbles = [];
    };

    this.draw = function() {

        translate(width / 2, height / 2);
        for (var i = 0; i < this.bubbles.length; i++) {
            this.bubbles[i].update(this.bubbles);
            this.bubbles[i].draw();
        }
    }

    function Bubble(_name) {
        this.size = 20;
        this.target_size = 20;
        this.pos = createVector(0, 0);
        this.direction = createVector(0, 0);
        this.name = _name; // private property
        this.color = color(random(50, 255), random(50, 255), random(50, 255));
        this.data = [];

        this.draw = function() {
            push();
            textAlign(CENTER);
            noStroke();
            fill(this.color);
            ellipse(this.pos.x, this.pos.y, this.size);
            fill(0);
            textSize(12);
            textAlign(CENTER, CENTER);
            textWrap(WORD);
            text(this.name, this.pos.x - 50, this.pos.y, 100);
            pop();
        }

        this.update = function(_bubbles) {
            this.direction.set(0, 0);

            for (var i = 0; i < _bubbles.length; i++) {
                if (_bubbles[i].name != this.name) {
                    var v = p5.Vector.sub(this.pos, _bubbles[i].pos);
                    var d = v.mag(); // magnitude of vector

                    if (d < this.size / 2 + _bubbles[i].size / 2) {
                        if (d > 30) {
                            this.direction.add(v) * 2
                        } else {
                            this.direction.add(p5.Vector.random2D());
                        }
                    }
                }
            }

            this.direction.normalize(); // make a unit vector
            this.direction.mult(4); // multiple direction vectors by 4
            this.pos.add(this.direction); // position add the result of the direction multiple

            if (this.size < this.target_size) { // size of ellipse
                this.size += 1;
            } else if (this.size > this.target_size) {
                this.size -= 1;
            }
        }

        this.setData = function(i) {
            this.target_size = map(this.data[i], 0, maxAmt, 50, 200); // size of ellipse
        }
    }
}