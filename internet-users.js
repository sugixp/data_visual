function InternetUsers() {
  this.name = 'World Internet Usage';
  this.id = 'internet-users';

  this.layout = {
    leftMargin: 50,
    rightMargin: 50,
    topMargin: 50,
    bottomMargin: 50,
    padding: 10,
  };

  this.loaded = false;
  this.populousCountriesData = [];
  
  this.countryColors = {};
  this.bubblePositions = [];

  this.preload = function () {
    var self = this;
    this.data = loadTable(
      './data/internet_users/internet_users.csv',
      'csv',
      'header',
      function () {
        self.loaded = true;
        console.log('Internet users data loaded successfully.');
      }
    );

    this.populousCountriesData = loadTable(
      './data/internet_users/world_population.csv',
      'csv',
      'header',
      function () {
        console.log('World population data loaded successfully.');
      }
    );
  };

  this.setup = function () {
    textSize(16);
  };

  this.generatePastelColor = function (countryName) {
    if (!this.countryColors[countryName]) {
      let hash = 0;
      for (let i = 0; i < countryName.length; i++) {
        hash = (hash << 5) - hash + countryName.charCodeAt(i);
        hash = hash & hash;
      }
      let r = (hash & 0xFF0000) >> 16;
      let g = (hash & 0x00FF00) >> 8;
      let b = hash & 0x0000FF;

      r = Math.min(255, r + 100);
      g = Math.min(255, g + 100);
      b = Math.min(255, b + 100);

      let alpha = 150;

      this.countryColors[countryName] = color(r, g, b, alpha);
    }
    return this.countryColors[countryName];
  };

  // Create the bubbles' random positions and velocities
  this.initializeBubbles = function(validData) {
    for (let i = 0; i < validData.length; i++) {
      let { bubbleSize } = validData[i];
      let x, y, vx, vy;

      do {
        x = random(this.layout.leftMargin + bubbleSize, width - this.layout.rightMargin - bubbleSize);
        y = random(this.layout.topMargin + bubbleSize, height - this.layout.bottomMargin - bubbleSize);
      } while (this.checkOverlap(x, y, bubbleSize));

      // Set random velocities for movement
      vx = random(-0.3, 0.3);
      vy = random(-0.3, 0.3);

      this.bubblePositions.push({
        x, y, size: bubbleSize, vx, vy, index: i
      });
    }
  };

  // Check if two bubbles overlap
  this.checkOverlap = function (x, y, size) {
    for (let i = 0; i < this.bubblePositions.length; i++) {
      let { x: existingX, y: existingY, size: existingSize } = this.bubblePositions[i];
      let d = dist(x, y, existingX, existingY);
      let minDistance = (size / 2) + (existingSize / 2) + 5; // Add 5px buffer to prevent overlap
      if (d < minDistance) {
        return true; // Overlapping, need to generate a new position
      }
    }
    return false; // No overlap
  };

  // Handle bubble collisions
  this.handleBubbleCollisions = function () {
    for (let i = 0; i < this.bubblePositions.length; i++) {
      for (let j = i + 1; j < this.bubblePositions.length; j++) {
        let bubble1 = this.bubblePositions[i];
        let bubble2 = this.bubblePositions[j];

        let d = dist(bubble1.x, bubble1.y, bubble2.x, bubble2.y);
        let minDistance = (bubble1.size / 2) + (bubble2.size / 2);

        if (d < minDistance) {
          // Reverse velocities to simulate bouncing off each other
          let tempVx = bubble1.vx;
          let tempVy = bubble1.vy;
          bubble1.vx = bubble2.vx;
          bubble1.vy = bubble2.vy;
          bubble2.vx = tempVx;
          bubble2.vy = tempVy;

          // Push the bubbles apart to ensure they don't overlap
          let overlap = minDistance - d;
          let angle = atan2(bubble2.y - bubble1.y, bubble2.x - bubble1.x);

          // Move each bubble away from the other to fix overlap
          let pushX = cos(angle) * overlap / 2;
          let pushY = sin(angle) * overlap / 2;

          // Update bubble positions to avoid overlap
          bubble1.x -= pushX;
          bubble1.y -= pushY;
          bubble2.x += pushX;
          bubble2.y += pushY;
        }
      }
    }
  };

  this.draw = function () {
    if (!this.loaded) {
      console.log('Data not yet loaded');
      return;
    }

    fill(0);
    textAlign('center', 'top');
    textSize(20);
    text("Top 25 Most Populous Countries by Internet Usage Percentage", width / 2, this.layout.topMargin - 30);

    let top25PopulousCountries = [];

    for (let i = 0; i < this.populousCountriesData.getRowCount(); i++) {
      let rank = this.populousCountriesData.getString(i, 'Rank');
      let country = this.populousCountriesData.getString(i, 'Country/Territory');

      if (rank <= 25) {
        top25PopulousCountries.push({ rank: rank, country: country });
      }
    }

    top25PopulousCountries.sort((a, b) => a.rank - b.rank);

    let locations = this.data.getColumn('Location');
    let rates = this.data.getColumn('Rate (WB)').map(Number);

    let validData = [];
    for (let i = 0; i < locations.length; i++) {
      if (!isNaN(rates[i]) && top25PopulousCountries.some(country => country.country === locations[i])) {
        validData.push({ location: locations[i], rate: rates[i] });
      }
    }

    validData.sort((a, b) => {
      let rankA = top25PopulousCountries.find(country => country.country === a.location).rank;
      let rankB = top25PopulousCountries.find(country => country.country === b.location).rank;
      return rankA - rankB;
    });

    let minRate = Math.min(...validData.map(d => d.rate));
    let maxRate = Math.max(...validData.map(d => d.rate));
    let minBubbleSize = 20;
    let maxBubbleSize = 100;

    validData.forEach(d => {
      d.bubbleSize = map(d.rate, minRate, maxRate, minBubbleSize, maxBubbleSize);
    });

    // Initialize bubble positions and velocities only once
    if (this.bubblePositions.length === 0) {
      this.initializeBubbles(validData);
    }

    // Update bubble positions and handle collisions
    this.handleBubbleCollisions();

    // Update bubble positions
    for (let i = 0; i < this.bubblePositions.length; i++) {
      let { x, y, size, vx, vy, index } = this.bubblePositions[i];
      let { location, rate } = validData[index];

      // Update position based on velocity
      x += vx;
      y += vy;

      // Bounce off edges of the canvas
      if (x - size / 2 < this.layout.leftMargin || x + size / 2 > width - this.layout.rightMargin) {
        vx *= -1; // Reverse X velocity
      }
      if (y - size / 2 < this.layout.topMargin || y + size / 2 > height - this.layout.bottomMargin) {
        vy *= -1; // Reverse Y velocity
      }

      // Update the position
      this.bubblePositions[i] = { x, y, size, vx, vy, index };

      let colorValue = this.generatePastelColor(location);

      fill(colorValue);
      stroke(50, 100, 200);
      strokeWeight(1);
      ellipse(x, y, size, size);

      fill(0);
      noStroke();
      textSize(12);
      textAlign(CENTER, CENTER);
      text(location, x, y);

      textSize(10);
      text(`${rate}%`, x, y + size / 2 + 10);
    }
  };
}
