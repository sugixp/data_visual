function InternetUsageByAge() {
  this.name = 'Internet Usage By Age';
  this.id = 'internet-usage-by-age';

  // Layout object
  this.layout = {
    leftMargin: 200,
    rightMargin: width - 100,
    topMargin: 50,
    bottomMargin: height - 50,
    grid: true,
    padding: 5,
  };

  // Pastel colors for each age group
  this.ageGroupColors = {
    "18-24": color(255, 105, 140),   
    "25-34": color(135, 206, 250),   
    "35-44": color(255, 223, 77),    
    "45-54": color(255, 160, 122),   
    "55-64": color(144, 238, 144),   
    "65+": color(221, 130, 255),     
  };

  this.loaded = false;

  // Preload the data.
  this.preload = function () {
    var self = this;
    this.data = loadTable(
      './data/internet-usage/internet_age_distr.csv', 'csv', 'header',
      function (table) {
        self.loaded = true;
      });
  };

  this.setup = function () {
    textSize(16);
  };

  this.draw = function () {
    if (!this.loaded) {
      console.log('Data not yet loaded');
      return;
    }

    // Add "Age Group" label at the top of the grid
    fill(0);
    noStroke();
    textAlign('center', 'top');
    textSize(16);
    text("Internet Usage By Age Group", (this.layout.leftMargin + 75), this.layout.topMargin - 40);  // Adjusted position

    // Add "%" label above the percentage
    textSize(16);
    text("%", this.layout.rightMargin - 300, this.layout.topMargin - 40);  // Adjusted position

    let lineHeight = (height - this.layout.topMargin) / this.data.getRowCount();

    for (let i = 0; i < this.data.getRowCount(); i++) {
      let lineY = this.layout.topMargin + i * lineHeight;

      let ageGroup = this.data.getString(i, 'AgeGroup');
      let usagePercentage = this.data.getNum(i, 'UsagePercentage');

      // Draw the Age Group label
      fill(0);
      noStroke();
      textAlign('left', 'top');
      text(ageGroup, this.layout.leftMargin , lineY);

      // Calculate the number of squares to draw (each block represents 1% usage)
      let totalBlocks = 100;
      let numBlocks = Math.round(usagePercentage);  // Number of blocks for this age group

      let blockSize = 20;  // Size of each block
      let startX = this.layout.leftMargin + 150;
      let startY = lineY;

      // Set the color for the current age group
      let color = this.ageGroupColors[ageGroup] || color(200); // Default to light gray if undefined

      // Draw the grid of blocks
      for (let j = 0; j < numBlocks; j++) {
        let row = Math.floor(j / 10);  // 10 blocks per row
        let col = j % 10;  // Remaining blocks in the row

        // Draw each square for this age group's percentage usage
        fill(color);
        // Set the stroke for the blocks
        stroke(200);
        strokeWeight(1);
        rect(startX + col * blockSize, startY + row * blockSize, blockSize, blockSize);
      }

      // Define the position for the new grid
      let gridStartX = this.layout.rightMargin - 150;
      let gridStartY = this.layout.topMargin + 150;
      let rows = 10;  // 10 rows in the grid
      let cols = 10;  // 10 columns in the grid

      // Create an array to hold all blocks and their corresponding colors
      let allBlocks = [];

      // Loop through the data and add colored blocks for each age group
      for (let i = 0; i < this.data.getRowCount(); i++) {
        let ageGroup = this.data.getString(i, 'AgeGroup');
        let usagePercentage = this.data.getNum(i, 'UsagePercentage');

        // Calculate the number of blocks to fill for this age group
        let numBlocks = Math.round((usagePercentage / 100) * totalBlocks);  // Number of blocks for this age group

        // Set the color for the current age group
        let groupColor = this.ageGroupColors[ageGroup] || color(200); // Default color if not defined

        // Add the colored blocks to the allBlocks array
        for (let j = 0; j < numBlocks; j++) {
          allBlocks.push(groupColor);
        }
      }

      // Fill the remaining blocks with light gray
      while (allBlocks.length < totalBlocks) {
        allBlocks.push(color(240));
      }

      // Draw the 10x10 grid with all blocks
      let currentBlock = 0;
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          // Set stroke and fill for the grid blocks
          stroke(200);
          strokeWeight(1);

          // Fill the blocks with the corresponding color
          fill(allBlocks[currentBlock]);

          // Draw each square in the grid
          rect(gridStartX + col * blockSize, gridStartY + row * blockSize, blockSize, blockSize);

          currentBlock++;  // Increment the current block counter
        }
      }

      // Label with the percentage
      fill(0);
      noStroke();
      textAlign('left', 'top');
      textSize(16);
      text(`${usagePercentage}%`, startX + 270, lineY);
    }
  };
}
