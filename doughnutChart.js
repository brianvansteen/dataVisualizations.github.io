function DoughnutChart(x, y, diameter) {

    this.x = x;
    this.y = y;
    this.diameter = diameter;
    this.labelSpace = 40;

    this.get_radians = function(data) { // called from draw below
        var total = sum(data);
        var radians = [];
        for (let i = 0; i < data.length; i++) {
            // radians.push((data[i] / total) * TWO_PI); // convert result to radians
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
        var total = sum(data);
        var angleStart = 0; // start at 0
        var colour;

        let mouseDist = dist(this.x, this.y, mouseX, mouseY);
        let mouseAngle = createVector(1, 0).angleBetween(createVector(mouseX - this.x, mouseY - this.y));
        if (mouseAngle < 0) {
            mouseAngle += TWO_PI;
        }

        for (var i = 0; i < data.length; i++) {
            if (colours) {
                colour = colours[i];
            } else {
                colour = map(i, 0, data.length, 0, 255);
            }
            push();
            fill(colour);
            stroke(50);
            strokeWeight(4);

            ellipseMode(RADIUS);
            let angleStop = angles[i];
            arc(this.x, this.y,
                this.diameter / 2, this.diameter / 2, // width, height
                angleStart, angleStart + angleStop); // angle to start and stop, in radians
            angleStart += angleStop; // for each angle added
            pop();

            if (labels) {
                this.makeLegendItem(labels[i], i, colour); // call function below for each i
            }
        }

        if (title) {
            noStroke();
            textAlign('center', 'center');
            fill(0, 0, 128);
            textSize(30);
            text(title, width / 2, this.y - this.diameter * 0.58);
        }

        // knock a hole out of the middle
        fill(250, 250, 210);
        stroke(50);
        strokeWeight(4);
        ellipse(this.x, this.y,
            this.diameter * 0.45, this.diameter * 0.45);

        let startAngle = 0

        for (var j = 0; j < data.length; j++) {
            let stopAngle = data[j] * TWO_PI;
            if (mouseDist > this.diameter * 0.225 &&
                mouseDist < this.diameter * 0.5) { // check if mouse hovering over doughnut

                if (mouseAngle > startAngle && mouseAngle < startAngle + stopAngle) {
                    // check if mouse is hovering over current doughnut slice
                    push();
                    fill(colours[j]);
                    noStroke();
                    textSize(40)
                    text(int(data[j] * 100) + "%", this.x, this.y);
                    pop();
                }
            }
            startAngle += stopAngle;
        }

        pop();
    }; // end draw

    this.makeLegendItem = function(label, i, colour) {
        var x = this.x + 80 + this.diameter / 2;
        var y = this.y + (this.labelSpace * i) - this.diameter / 4;
        var boxWidth = this.labelSpace / 2;
        var boxHeight = this.labelSpace / 2;

        noStroke();
        fill(colour);
        rect(x, y, boxWidth, boxHeight);

        fill(0);
        textAlign(LEFT, CENTER);
        textSize(18);
        textWrap(WORD);
        text(label, x + boxWidth + 10, y + boxWidth / 2);
    }; // end legend items

} // end DoughnutChart