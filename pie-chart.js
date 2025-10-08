function PieChart(x, y, diameter) {

    this.x = x;
    this.y = y;
    this.diameter = diameter;
    this.labelSpace = 30;

    this.get_radians = function (data) {
        var total = sum(data);
        var radians = [];

        for (let i = 0; i < data.length; i++) {
            radians.push((data[i] / total) * TWO_PI);
        }

        return radians;
    };

    //method to handle all edge cases
    this.isMouseInArc = function (mx, my, startAngle, endAngle) {
        let angle = atan2(my - this.y, mx - this.x); // Angle from center to mouse
        if (angle < 0) {
            angle += TWO_PI; // Normalize to 0 - 2*PI
        }
        return angle >= startAngle && angle <= endAngle; // Check if angle is within the arc
    };

    this.draw = function (data, labels, colours, title) {
        if (data.length == 0) {
            alert('Data has length zero!');
        } else if (![labels, colours].every((array) => array.length == data.length)) {
            alert(`Arrays must be the same length!`);
        }

        let angles = this.get_radians(data);
        let lastAngle = 0;
        let hovered = false;

        // Draw donut segments
        for (let i = 0; i < data.length; i++) {
            fill(colours[i]);
            stroke(0);
            strokeWeight(1);

            arc(
                this.x,
                this.y,
                this.diameter,
                this.diameter,
                lastAngle,
                lastAngle + angles[i] + 0.001
            );

            lastAngle += angles[i];
        }

        // Draw donut hole
        fill(211, 211, 211);
        noStroke();
        ellipse(this.x, this.y, this.diameter * 0.7);

        // Hover mouse and display data
        lastAngle = 0;
        for (let i = 0; i < data.length; i++) {
            const startAngle = lastAngle;
            const endAngle = lastAngle + angles[i];
            const distanceFromCenter = dist(mouseX, mouseY, this.x, this.y);

            if (
                distanceFromCenter < this.diameter / 2 &&
                distanceFromCenter > this.diameter * 0.25 &&
                this.isMouseInArc(mouseX, mouseY, startAngle, endAngle)
            ) {
                // Display data in the center
                fill(0);
                noStroke();
                textAlign(CENTER, CENTER); // Ensure text is aligned to the center
                textSize(30);
                text(`${labels[i]}: ${data[i].toFixed(1)}` + "%", this.x, this.y);
                hovered = true;
            }
            lastAngle += angles[i];
        }

            if (!hovered) {
                fill(0);
                noStroke();
                textAlign(CENTER, CENTER);
                textSize(15);
                text("Hover the mouse over a color to see the %", this.x, this.y);
        }

        // Draw the legend
        this.makeLegendItem(data, labels, colours);


        // Draw title
        if (title) {
            noStroke();
            textAlign(CENTER, CENTER);
            textSize(24);
            text(title, this.x, this.y - this.diameter * 0.6);
        }
    };


    this.makeLegendItem = function (data, labels, colours) {
        const total = sum(data);

        for (let i = 0; i < data.length; i++) {
            const percentage = ((data[i] / total) * 100).toFixed(1) + "%";
            const x = this.x + 50 + this.diameter / 2;
            const y = this.y + this.labelSpace * i - this.diameter / 3;
            const boxWidth = this.labelSpace / 2;
            const boxHeight = this.labelSpace / 2;

            // Draw colored box
            fill(colours[i]);
            rect(x, y, boxWidth, boxHeight);

            // Draw label and percentage
            fill('black');
            noStroke();
            textAlign('left', 'center');
            textSize(12);
            text(`${labels[i]}: ${percentage}`, x + boxWidth + 10, y + boxWidth / 2);
        }
    };

}
