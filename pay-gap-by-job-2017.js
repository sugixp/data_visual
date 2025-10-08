function PayGapByJob2017() {
  this.name = 'Pay gap by job: 2017';
  this.id = 'pay-gap-by-job-2017';
  
  this.loaded = false;
  this.pad = 60;
  this.dotSizeMin = 15;
  this.dotSizeMax = 40;
  this.hoveredJob = null;
  this.colors = [];

  this.preload = function() {
    var self = this;
    this.data = loadTable(
      './data/pay-gap/occupation-hourly-pay-by-gender-2017.csv', 'csv', 'header',
      function(table) { 
        self.loaded = true;
        self.generateColors();
      }
    );
  };

  this.setup = function() {};
  this.destroy = function() {};

  this.generateColors = function() {
    this.colors = Array.from({ length: this.data.getRowCount() }, () => 
      color(random(150, 255), random(150, 255), random(150, 255)));
  };

  this.draw = function() {
    if (!this.loaded) {
      console.log('Data not yet loaded');
      return;
    }

    this.addAxes();
    this.addLabels();
    this.addHoverInstruction();

    var jobs = this.data.getColumn('job_subtype');
    var propFemale = stringsToNumbers(this.data.getColumn('proportion_female'));
    var payGap = stringsToNumbers(this.data.getColumn('pay_gap'));
    var numJobs = stringsToNumbers(this.data.getColumn('num_jobs'));

    var numJobsMin = min(numJobs);
    var numJobsMax = max(numJobs);

    this.hoveredJob = null;

    for (let i = 0; i < this.data.getRowCount(); i++) {
      let x = map(propFemale[i], 0, 100, this.pad, width - this.pad);
      let y = map(payGap[i], -20, 20, height - this.pad, this.pad);
      let size = map(numJobs[i], numJobsMin, numJobsMax, this.dotSizeMin, this.dotSizeMax);

      fill(this.colors[i]);
      stroke(0);
      strokeWeight(1);
      ellipse(x, y, size);
      
      if (dist(mouseX, mouseY, x, y) < size / 2) {
        this.hoveredJob = { 
          job: jobs[i], 
          x, 
          y, 
          propFemale: propFemale[i].toFixed(2), 
          payGap: payGap[i].toFixed(2), 
          numJobs: numJobs[i] 
        };
      }
    }
    
    this.showTooltip();
  };

  this.addAxes = function() {
    stroke(200);
    line(width / 2, this.pad, width / 2, height - this.pad);
    line(this.pad, height / 2, width - this.pad, height / 2);
  };

  this.addLabels = function() {
    fill(0);
    noStroke();
    textSize(14);
    textAlign(CENTER, CENTER);
    text('Proportion of Women in Role (%)', width / 2, height - this.pad / 2);
    textAlign(CENTER, CENTER);
    text('Pay Gap (%)', this.pad / 2 + 20 , height / 2);
  };

  this.addHoverInstruction = function() {
    fill(0);
    noStroke();
    textSize(14);
    textAlign(LEFT , TOP );
    text('Hover over the bubbles to display the %.', this.pad, height - this.pad / 2);
  };

  this.showTooltip = function() {
    if (this.hoveredJob) {
      fill(50);
      noStroke();
      rect(this.hoveredJob.x + 10, this.hoveredJob.y - 30, 160, 50, 5);
      fill(255);
      textSize(12);
      textAlign(LEFT, TOP);
      text(`${this.hoveredJob.job}\nWomen: ${this.hoveredJob.propFemale}%\nPay Gap: ${this.hoveredJob.payGap}%\nJobs: ${this.hoveredJob.numJobs}`, this.hoveredJob.x + 15, this.hoveredJob.y - 25);
    }
  };
}
