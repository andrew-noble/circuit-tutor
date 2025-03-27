import { Padding, Dimensions } from "./ScaleManager";
import { ComponentConfig } from "./ComponentRenderer";

export const rendererConfig = {
  padding: { top: 40, right: 40, bottom: 40, left: 150 } as Padding,
  dimensions: { width: 1160, height: 600 } as Dimensions,
  component: {
    componentSize: 80,
    symbolMap: {
      resistor: "#resistor",
      voltage_source: "#voltage-source",
      diode: "#diode",
      inductor: "#inductor",
      capacitor: "#capacitor",
    },
  } as ComponentConfig,
};
