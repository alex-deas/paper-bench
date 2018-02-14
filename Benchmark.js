class Benchmark {
  constructor(Scene, runtime) {
    this.metrics = {
      marks: [],
      measures: [],
    };
    this.requestId = 1234;

    this.observer = new PerformanceObserver((metrics) => {
      const marks = metrics.getEntriesByType('mark');
      const measures = metrics.getEntriesByType('measure');

      marks.forEach(x => { this.metrics.marks.push(x) });
      measures.forEach(x => { this.metrics.measures.push(x) });
    });

    this.observer.observe({ entryTypes: ["mark", "measure"] });

    this.scene = new Scene(this.requestId);
    this.runtime = runtime;
    this.starttime = Date.now();
    // first mark before the initial render
    performance.mark('startmark');
    this.render(this.scene);
  }

  render(scene) {
    window.requestAnimationFrame(() => {
      performance.mark('endmark');
      performance.measure('benchmeasure', 'startmark', 'endmark');
      performance.clearMarks();
      performance.mark('startmark')
      this.scene.draw();
      if(Date.now() < this.starttime + (this.runtime * 1000)) {
        this.render(this.scene);
      } else {
        this.end();
      }
    });
  }

  rollupMetrics() {
    const { measures } = this.metrics
    return {
      avg: measures.map(x => x.duration)
                   .reduce((acc, x) => acc + x, 0) / measures.length
    };
  }

  end() {
    window.cancelAnimationFrame(this.requestId)
    const { avg } = this.rollupMetrics();
    const resultWrapper = document.getElementById("resultWrapper");

    const avgElem = document.createElement('div')

    avgElem.innerText = `Avg Measure: ${avg}`;

    resultWrapper.appendChild(avgElem);
  }
}
