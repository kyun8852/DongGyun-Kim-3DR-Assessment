// 이 부분을 별도 파일 testData.js로 분리할 수 있습니다
export const apiTestData = {
  events: {
    valid: {
      name: "Charity Auction",
      date: "31/10/2024",
      capacity: 100,
      costPerTicket: 5,
    },
    invalidCapacity: {
      name: "Invalid Capacity Event",
      date: "31/10/2024",
      capacity: -10,
      costPerTicket: 5,
    },
    floatCapacity: {
      name: "Float Capacity Event",
      date: "31/10/2024",
      capacity: 10.5,
      costPerTicket: 5,
    },
    invalidCost: {
      name: "Invalid Cost Event",
      date: "31/10/2024",
      capacity: 100,
      costPerTicket: -5,
    },
    stringCost: {
      name: "String Cost Event",
      date: "31/10/2024",
      capacity: 100,
      costPerTicket: "not-a-number",
    },
    freeEvent: {
      name: "Free Event",
      date: "15/11/2024",
      capacity: 200,
      costPerTicket: 0,
    },
    firstEvent: {
      name: "First Event",
      date: "31/10/2024",
      capacity: 100,
      costPerTicket: 5,
    },
    secondEvent: {
      name: "Second Event",
      date: "31/10/2024",
      capacity: 200,
      costPerTicket: 10,
    },
    invalidDate: {
      name: "Invalid Date",
      date: "not-a-date",
      capacity: 50,
      costPerTicket: 10,
    },
    incomplete: {
      name: "Incomplete Event",
      capacity: 100,
      costPerTicket: 5,
    },
    concert: {
      name: "Concert",
      date: "15/11/2024",
      capacity: 50,
      costPerTicket: 10,
    },
    smallEvent: {
      name: "Small Event",
      date: "20/11/2024",
      capacity: 10,
      costPerTicket: 20,
    },
  },
  tickets: {
    standard: {
      nTickets: 5,
    },
    exceedCapacity: {
      nTickets: 15,
    },
  },
  pastEvent: {
    name: "Past Event",
    capacity: 100,
    costPerTicket: 15,
    ticketsSold: 80,
  },
  pastTicket: {
    nTickets: 80,
    totalCost: 1200,
  },
  currentEvent: {
    name: "Current Event",
    capacity: 200,
    costPerTicket: 10,
    ticketsSold: 100,
  },
  currentTicket: {
    nTickets: 100,
    totalCost: 1000,
  },
};
