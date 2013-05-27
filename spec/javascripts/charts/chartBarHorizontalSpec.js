describe("chartBarHorizontal", function() {

  beforeEach(function() {
  });

  describe("data()", function() {
    var chart;

    beforeEach(function() {
      chart = chartBarHorizontal()
    });

    it("should return an empty array when called on a new chart", function() {
      expect(chart.data()).toEqual([]);
    });

    it("should set the data on the chart when called with an argument", function() {
      var testData = [{
        key: "Test data",
        color: "#6699cc",
        values: [
          { label: "value1", color: "#ff00ff", value: 5 },
          { label: "value2", color: "#ffff00", value: 8 }
        ]
      }];
      chart.data(testData)
      expect(chart.data()).toEqual(testData);
    });
  });
});
