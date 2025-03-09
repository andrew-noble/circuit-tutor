export default {
  components: [
    {
      id: "R1",
      type: "resistor",
      name: "R1",
      pins: ["a", "b"],
    },
    {
      id: "R2",
      type: "resistor",
      name: "R2",
      pins: ["a", "b"],
    },
    {
      id: "V1",
      type: "voltage_source",
      name: "V1",
      pins: ["+", "-"],
    },
  ],
  nets: [
    {
      id: "N1",
      name: "Net 1",
      connections: [
        {
          component: "V1",
          pin: "+",
        },
        {
          component: "R1",
          pin: "a",
        },
        {
          component: "R2",
          pin: "a",
        },
      ],
    },
    {
      id: "N2",
      name: "Net 2",
      connections: [
        {
          component: "R1",
          pin: "b",
        },
        {
          component: "R2",
          pin: "b",
        },
        {
          component: "V1",
          pin: "-",
        },
      ],
    },
  ],
  labels: [],
};
