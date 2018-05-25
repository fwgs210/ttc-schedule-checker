import React, { Component } from 'react';
import Loader from './Loader.js';
import axios from 'axios';

class App extends Component {

  state = {
    routes: null,
    routeNumber: null,
    directions: null,
    allStops: null,
    stops: null,
    arriveTime: null
  }

  componentDidMount() {
    this.getRoutes()
  }

  getRoutes = () => {
    axios.get('http://webservices.nextbus.com/service/publicJSONFeed?command=routeList&a=ttc').then(res => {
      this.setState({
        routes: res.data.route
      })
    })
    .catch(err => {
      console.log(err.message)
    })
  }

  getDirections = (e) => {
    this.setState({
      routeNumber: e.target.value
    })
    axios.get(`http://webservices.nextbus.com/service/publicJSONFeed?command=routeConfig&a=ttc&r=${e.target.value}`).then(res => {
      this.setState({
        directions: res.data.route.direction,
        allStops: res.data.route.stop,
        stops: null,
        arriveTime: null
      })
    })
    .catch(err => {
      console.log(err.message)
    })
  }

  getStops = (e) => {
    const stopsForThisDirection = this.state.directions.filter(each => {
      return each.tag === e.target.value
    })
    const stopsTags = stopsForThisDirection[0].stop.map(each => {
      return each.tag
    })
    const stops = this.state.allStops.filter(each => {
      return stopsTags.indexOf(each.tag) > -1
    })
    this.setState({
      stops: stops
    })
  }

  getArriveTime = (e) => {
    axios.get(`http://webservices.nextbus.com/service/publicJSONFeed?command=predictions&a=ttc&r=${this.state.routeNumber}&s=${e.target.value}`).then(res => {
      if (res.data.predictions.direction) {
        this.setState({
          arriveTime: res.data.predictions.direction.prediction
        })
      } else {
        this.setState({
          arriveTime: 'no bus'
        })
      }

    })
    .catch(err => {
      console.log(err.message)
    })
  }

  render() {
    return (
      <section className="ttc-BG">
          <article className="block">
            <div className="ttc-header">
              <aside className="logo"><img src="https://www.ttc.ca/images/ttc-main-logo.gif" /></aside>
              <aside className="header-content">your next trip</aside>
            </div>
            <div>
                { !this.state.routes ? (
                  <Loader />
                )
                : (
                  <aside>
                    <h4>Route</h4>
                    <select onChange={this.getDirections} className="select-options">
                      <option disabled selected>Please choose the route</option>
                      {this.state.routes.map(each => {
                          return (
                            <option value={each.tag}>{each.title}</option>
                          )
                        })
                      }
                    </select>
                  </aside>
                )}
            </div>
            <div>
                { !this.state.directions ? (
                  // show nothing
                  <div></div>
                )
                : (
                  <aside>
                    <h4>Direction</h4>
                    <select onChange={this.getStops} className="select-options">
                      <option disabled selected>Please choose the direction</option>
                      {this.state.directions.map(each => {
                          return (
                            <option value={each.tag}>{each.title}</option>
                          )
                        })
                      }
                    </select>
                  </aside>
                )}
            </div>
            <div>
                { !this.state.stops ? (
                  // show nothing
                  <div></div>
                )
                : (
                  <aside>
                    <h4>Stop</h4>
                    <select onChange={this.getArriveTime} className="select-options">
                      <option disabled selected>Please choose the stop</option>
                      {this.state.stops.map(each => {
                          return (
                            <option value={each.tag}>{each.title}</option>
                          )
                        })
                      }
                    </select>
                  </aside>
                )}
            </div>
            <div>
                { !this.state.arriveTime ? (
                  // show nothing
                  <div></div>
                ) : this.state.arriveTime === 'no bus' ? (
                  <summary className="arrive-block">
                    Sorry, this route is closed now.
                  </summary>
                ) : (
                  <summary className="arrive-block">
                    {this.state.arriveTime.map(each => {
                        if (this.state.arriveTime.indexOf(each) === 0) {
                          return (
                            <aside>
                              <p>Next bus arrives in</p>
                              <h2>{each.minutes} min</h2>
                            </aside>
                          )
                        } else {
                          return (
                            <aside>
                              <p className="small-text">Another bus arrives in <strong>{each.minutes} min</strong></p>
                            </aside>
                          )
                        }
                      })
                    }
                  </summary>
                )}
            </div>
          </article>
      </section>
    );
  }
}

export default App;
