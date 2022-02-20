function PieChart(x, y, diameter) {

    this.x = x;
    this.y = y;
    this.diameter = diameter;
    this.labelSpace = 40;

    this.get_radians = function(data) { // called from draw below
        var total = sum(data);
        var radians = [];
        for (let i = 0; i < data.length; i++) {
            radians.push((data[i] / total) * TAU); // convert result to radians
        }
        return radians;
    };

    this.draw = function(data, labels, colours, title) {

        // Test that data is not empty and that each input array is the same length.
        if (data.length == 0) {
            alert('Data has length zero!');
        } else if (![labels, colours].every((array) => {
                return array.length == data.length;
            })) {
            alert(`Data (length: ${data.length})
          Labels (length: ${labels.length})
          Colours (length: ${colours.length})
          Arrays must be the same length!`);
        }

        push();
        angleMode(RADIANS);

        var angles = this.get_radians(data); // call function above to get radians
        var lastAngle = 0; // start at 0
        var colour;

        for (var i = 0; i < data.length; i++) {
            if (colours) {
                colour = colours[i]; // colour assigned from colours from education values
            } else {
                colour = map(i, 0, data.length, 0, 255);
            }
            push();
            fill(colour); // colour from colours above
            stroke(50); // circumfrance line
            strokeWeight(4); // circumfrance line

            arc(this.x, this.y,
                this.diameter, this.diameter, // width, height
                lastAngle, lastAngle + angles[i] + 0.001); // start, stop (hack for 0!)
            pop();

            if (labels) {
                this.makeLegendItem(labels[i], i, colour); // call function below for each i
            }

            lastAngle += angles[i]; // for each pie added
        }
        pop();

        if (title) {
            noStroke();
            textAlign('center', 'center');
            fill(0, 0, 128);
            textSize(32);
            text(title, 300, this.y - this.diameter * 0.59);
        }
    }; // end draw

    this.makeLegendItem = function(label, i, colour) {
        var x = this.x + 100 + this.diameter / 2;
        var y = this.y + (this.labelSpace * i) - this.diameter / 4;
        var boxWidth = this.labelSpace / 2;
        var boxHeight = this.labelSpace / 2;

        fill(colour);
        rect(x, y, boxWidth, boxHeight);

        fill('black');
        noStroke();
        textAlign(LEFT, CENTER);
        textSize(18);
        textWrap(WORD);
        text(label, x + boxWidth + 10, y + boxWidth / 2);
    }; // end legend items

} // end PieChart