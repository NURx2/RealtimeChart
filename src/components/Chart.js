import ApexCharts from 'apexcharts'
import ReactApexChart from 'react-apexcharts'
import React from 'react'
import './Chart.css'


import falling_asleep_heart from '../data/falling_asleep_heart'
import awake_heart from '../data/awake_heart'
import dangerous_zone from '../data/dangerous_zone_heart'

var lastDate = 0;
var data = []
var TICKINTERVAL = 86400
let XAXISRANGE = 7776000
const SPEED = 200

let maxHeartRate = 0

const curMeasurments = dangerous_zone
const DANGEROUS_GAP = 15

let x = 0

function sendRequest() {
  fetch("http://ab060bc6.ngrok.io/remote_smart_demo", {
    mode: "no-cors"
  }).then(
    data => console.log(data)
  );

}

function getDataInterval(count) {
  for (let i = 0; i < count; ++i) {
    let y = curMeasurments[x]

    data.push({
      x, y
    })
    ++x
    maxHeartRate = Math.max(maxHeartRate, y)
    if (x >= curMeasurments.length) {
      console.log("no more")
      break;
    }
  }
}

getDataInterval(20)

function getMyNewSeries() {
  for (let i = 0; i < data.length - 200; ++i) {
    data[i].x = x - 100 // newDate - XAXISRANGE - TICKINTERVAL
    data[i].y = 0
  }
  let y = curMeasurments[x]
  data.push({
    x, y
  })
  ++x
  maxHeartRate = Math.max(maxHeartRate, y)
  console.log(x, y)
}

// function getDayWiseTimeSeries(baseval, count, yrange) {
//     var i = 0;
//     while (i < count) {
//         var x = baseval;
//         var y = Math.floor(Math.random() * (yrange.max - yrange.min + 1)) + yrange.min;

//         data.push({
//             x, y
//         });
//         lastDate = baseval
//         baseval += TICKINTERVAL;
//         i++;
//     }
// }

// getDayWiseTimeSeries(new Date('11 Feb 2017 GMT').getTime(), 10, {
//     min: 10,
//     max: 90
// })

// function getNewSeries(baseval, yrange) {
//     var newDate = baseval + TICKINTERVAL;
//     lastDate = newDate

//     for(var i = 0; i < data.length - 100; i++) {
//         // IMPORTANT
//         // we reset the x and y of the data which is out of drawing area
//         // to prevent memory leaks
//         data[i].x = newDate - XAXISRANGE - TICKINTERVAL
//         data[i].y = 0
//     }
    
//     data.push({
//         x: newDate,
//         y: Math.floor(Math.random() * (yrange.max - yrange.min + 1)) + yrange.min
//     })
    
// }

export default class LineChart extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isAwakeMode: false,
      options: {
        chart: {
            id: '001',
            animations: {
              enabled: true,
              easing: 'linear',
              dynamicAnimation: {
                speed: SPEED
              }
            },
            toolbar: {
              show: false
            },
            zoom: {
              enabled: false
            }
          },
          dataLabels: {
            enabled: false
          },
          stroke: {
            curve: 'smooth',
            colors: ['#8cc63f'],
            lineCap: 'round'
          },
          grid: {
            show: false
          },
          markers: {
            size: 0
          },
          xaxis: {
            range: 40,
            labels: {
              show: false
            },
            axisBorder: {
              show: true
            }
          },
          yaxis: {
            max: 90,
            min: 60,
            labels: {
              show: false
            },
            axisBorder: {
              show: true
            }
          },
          legend: {
            show: false
          }
      },
      series: [{
        data: data.slice()
      }],
    }
  }

  componentDidMount() {
    this.intervals()
  }

  intervals () {
    var theInterval = window.setInterval(() => {
      getMyNewSeries()
      x >= curMeasurments.length && clearInterval(theInterval)
      if (maxHeartRate - curMeasurments[x] > DANGEROUS_GAP && this.state.isAwakeMode === false) {
        this.setState({isAwakeMode: true})
        sendRequest()
      }
      ApexCharts.exec('001', 'updateSeries', [{
        data: data
      }])
    }, SPEED)
  }

  render() {
    console.log(curMeasurments.length)
    console.log(data[data.length - 1])
    return (
        x < curMeasurments.length && (
          this.state.isAwakeMode ?
          <div className='hero'>
            <ReactApexChart options={this.state.options} series={this.state.series} type="line" height="350" />
          </div> :
          <div className="chart">
            <ReactApexChart options={this.state.options} series={this.state.series} type="line" height="350" />
          </div>
        )
    );
  }

}
