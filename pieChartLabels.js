function PieChartLabels(x, y, diameter) {

    this.x = x;
    this.y = y;
    this.diameter = diameter;
    this.labelSpace = 40;

    this.draw = function(data, labels, colours, title) {
        // Test that data is not empty and that each input array is the same length.
        if (data.length == -0) {
            alert('Data has length zero!');
        } else if (![labels, colours].every((array) => {
                return array.length == data.length;
            })) {
            alert(`Data (length: ${data.length})
          Labels (length: ${labels.length})
          Colours (length: ${colours.length})
          Arrays must be the same length!`);
        }

        let start = 0; // start at 0
        let total = data.reduce((v, s) => v + s, 0);
        let anglesHover = data.map(v => v / total * 360); // calculated in degrees

        if (title) {
            noStroke();
            textAlign('center', 'center');
            fill(0, 0, 128);
            textSize(32);
            text(title, 300, this.y - this.diameter * 0.59);
        }
        push();
        angleMode(DEGREES); // circle calculations in degrees
        let mouseAngle = atan2(mouseY - this.x, mouseX - this.y);
        if (mouseAngle < 0) {
            mouseAngle += 360;
        }

        let mouseDist = dist(this.x, this.y, mouseX, mouseY);
        for (let i = 0; i < anglesHover.length; i++) {
            push();
            let hover = mouseDist < this.diameter &&
                mouseAngle >= start &&
                mouseAngle < start + anglesHover[i];
            fill(red(colours[i]), green(colours[i]), blue(colours[i]), hover ? 255 : 100);
            arc(this.x, this.y, // calculated in degrees
                this.diameter, this.diameter,
                start, start + anglesHover[i]);
            start += anglesHover[i];
            pop();
            if (labels) {
                this.makeLegendItem(labels[i], i, colours[i]); // call function below for each i
            }
        }
        pop();

    }; // end draw

    this.makeLegendItem = function(label, i, colour) {
        let x = this.x + 100 + this.diameter / 2;
        let y = this.y + (this.labelSpace * i) - this.diameter / 4;
        let boxWidth = this.labelSpace / 2;
        let boxHeight = this.labelSpace / 2;

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