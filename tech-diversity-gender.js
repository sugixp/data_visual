function TechDiversityGender() {

  // Name for the visualisation to appear in the menu bar.
  this.name = 'Tech Diversity: Gender';

  // Each visualisation must have a unique ID with no special
  // characters.
  this.id = 'tech-diversity-gender';

  // Layout object to store all common plot layout parameters and
  // methods.
  this.layout = {
    // Locations of margin positions. Left and bottom have double margin
    // size due to axis and tick labels.
    leftMargin: 130,
    rightMargin: width - 200,
    topMargin: 30,
    bottomMargin: height,
    pad: 5,

    plotWidth: function () {
      return this.rightMargin - this.leftMargin;
    },

    // Boolean to enable/disable background grid.
    grid: true,

    // Number of axis tick labels to draw so that they are not drawn on
    // top of one another.
    numXTickLabels: 10,
    numYTickLabels: 8,
  };

  // Middle of the plot: for 50% line.
  this.midX = (this.layout.plotWidth() / 2) + this.layout.leftMargin;

  // Default visualisation colours.
  this.femaleColour = color(255, 120, 130);
  this.maleColour = color(173, 216, 255);

  // Property to represent whether data has been loaded.
  this.loaded = false;

  // Preload the data. This function is called automatically by the
  // gallery when a visualisation is added.
  this.preload = function () {
    var self = this;
    this.data = loadTable(
      './data/tech-diversity/gender-2018.csv', 'csv', 'header',
      // Callback function to set the value
      // this.loaded to true.
      function (table) {
        self.loaded = true;
      });

  };

  this.setup = function () {
    // Font defaults.
    textSize(16);
  };

  this.destroy = function () {
  };

  this.draw = function () {
    if (!this.loaded) {
      console.log('Data not yet loaded');
      return;
    }

    // Draw Female/Male labels at the top of the plot.
    this.drawCategoryLabels();

    var lineHeight = (height - this.layout.topMargin) / this.data.getRowCount();

    for (var i = 0; i < this.data.getRowCount(); i++) {

      // Calculate the y position for each company.
      var lineY = (lineHeight * i) + this.layout.topMargin;

      // Create an object that stores data from the current row.
      var company = {
        'name': this.data.getString(i, 'company'),
        'female': this.data.getNum(i, 'female'),
        'male': this.data.getNum(i, 'male'),
      };

      // Draw the company name in the left margin.
      fill(0);
      noStroke();
      textAlign('right', 'top');
      text(company.name,
        this.layout.leftMargin - this.layout.pad,
        lineY);

      // Draw female employees rectangle.
      fill(this.femaleColour);
      var femaleWidth = this.mapPercentToWidth(company.female);
      rect(this.layout.leftMargin,
        lineY,
        femaleWidth,
        lineHeight - this.layout.pad);

      // Draw male employees rectangle.
      fill(this.maleColour);
      var maleWidth = this.mapPercentToWidth(company.male);
      rect(this.layout.leftMargin + femaleWidth,
        lineY,
        maleWidth,
        lineHeight - this.layout.pad);

      // Calculate x position for the right-side labels with added padding
      var labelX = this.layout.leftMargin + femaleWidth + maleWidth + 20; // Added padding (20)

      // Check if the labelX is too far right and adjust accordingly
      if (labelX > this.layout.rightMargin + 100) {  // If labelX exceeds a margin threshold
        labelX = this.layout.rightMargin + 100;    // Move label back to fit within the bounds
      }

      // Draw the Female percentage on the right side of the chart
      fill(0);
      textAlign('left', 'top');
      textSize(12);
      text(`Female: ${company.female.toFixed(1)}%`,
        labelX,
        lineY);

      // Draw the Male percentage on the right side of the chart
      text(`Male: ${company.male.toFixed(1)}%`,
        labelX + 90, // Add horizontal space between Female and Male percentages
        lineY);
    }

    // Draw 50% line
    stroke(150);
    strokeWeight(1);
    line(this.midX,
      this.layout.topMargin,
      this.midX,
      this.layout.bottomMargin);
  };



  this.drawCategoryLabels = function () {
    fill(0);
    noStroke();
    textAlign('left', 'top');
    text('Female',
      this.layout.leftMargin,
      this.layout.pad);
    textAlign('center', 'top');
    text('50%',
      this.midX,
      this.layout.pad);
    textAlign('right', 'top');
    text('Male',
      this.layout.rightMargin,
      this.layout.pad);
  };

  this.mapPercentToWidth = function (percent) {
    return map(percent,
      0,
      100,
      0,
      this.layout.plotWidth());
  };
}
