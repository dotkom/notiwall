import { API_URL } from '../constants';

export const defaultApis = {
  affiliation: {
    interval: 10,
    url: `${API_URL}/affiliation/{{org.*}}`,
    org: {
      online: 'online',
      abakus: 'abakus',
      delta: 'delta',
    },
  },
  coffeePots: {
    interval: 60,
    url: `${API_URL}/coffee/online`,
  },
  tarbus: {
    interval: 10,
    url: 'https://atbapi.tar.io/api/v1/departures/{{stops.*.fromCity,toCity}}',
    stops: {
      glos: { fromCity: '16010265', toCity: '16011265' },
      samf: { fromCity: '16010476', toCity: '16011476' },
    },
  },
  bartebuss: {
    interval: 10,
    url: 'https://bartebuss.no/api/unified/{{stops.*.fromCity,toCity}}',
    stops: {
      glos: { fromCity: '16010265', toCity: '16011265' },
      samf: { fromCity: '16010476', toCity: '16011476' },
    },
  },
  enturbus: {
    interval: 10,
    method: 'POST',
    req: {
      headers: {
        'ET-Client-Name': 'Notifier-dev',
      },
    },
    url: `https://api.entur.org/journeyplanner/2.0/index/graphql>>${JSON.stringify({
      query: `{
        quay(id: "{{stops.*.fromCity,toCity}}") {
          id
          name
          estimatedCalls(startTime:"[[now]]" timeRange: 72100, numberOfDepartures: 5) {
            aimedArrivalTime
            aimedDepartureTime
            expectedArrivalTime
            expectedDepartureTime
            realtime
            forBoarding
            destinationDisplay {
              frontText
            }
            serviceJourney {
              line {
                publicCode
              }
            }
          }
        }
      }`
    })}`,
    stops: {
      glos: { fromCity: 'NSR:Quay:75707', toCity: 'NSR:Quay:75708' },
      samf: { fromCity: 'NSR:Quay:73103', toCity: 'NSR:Quay:73101' },
    },
  },
};
