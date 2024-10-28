import { Ship } from "@/types";

export default () =>
  [
    {
      position: { x: 1, y: 5 },
      direction: true,
      type: "huge",
      length: 4,
    },
    {
      position: { x: 8, y: 6 },
      direction: true,
      type: "large",
      length: 3,
    },
    {
      position: { x: 6, y: 3 },
      direction: true,
      type: "large",
      length: 3,
    },
    {
      position: { x: 7, y: 0 },
      direction: true,
      type: "medium",
      length: 2,
    },
    {
      position: { x: 1, y: 0 },
      direction: true,
      type: "medium",
      length: 2,
    },
    {
      position: { x: 3, y: 5 },
      direction: false,
      type: "medium",
      length: 2,
    },
    {
      position: { x: 3, y: 2 },
      direction: false,
      type: "small",
      length: 1,
    },
    {
      position: { x: 8, y: 4 },
      direction: false,
      type: "small",
      length: 1,
    },
    {
      position: { x: 5, y: 8 },
      direction: false,
      type: "small",
      length: 1,
    },
    {
      position: { x: 9, y: 2 },
      direction: false,
      type: "small",
      length: 1,
    },
  ] satisfies Ship[];
