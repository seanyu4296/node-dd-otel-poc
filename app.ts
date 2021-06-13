import "./ocollector-otel-tracing";

import express from "express";
import { Router } from "express";
import { decodeId, tracer } from "./ocollector-otel-tracing";
import { context, trace } from "@opentelemetry/api";

const id = require("dd-trace/packages/dd-trace/src/id");
const PORT: string = process.env.PORT || "8080";

const app = express();


const router = Router();
const router2 = Router();
router2.get("/success", (req: any, res) => {
  res.send("router 2");
});

router.use("/router-2", router2);

router.get("/success", (req: any, res) => {
  res.send("router");
});

router.get("/fail", (req: any, res) => {});
app.use("/router/", router);
app.get("/success", (req: any, res) => {
  setTimeout(() => {
    const spanContext = trace.getSpan(context.active())?.spanContext();
    //    https://github.com/DataDog/dd-trace-js/blob/7a9c335563d86199c816c5a0c564125bea3996b2/packages/dd-trace/src/id.js#L24
    //    https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/f1e8331be111a4a8bf65670dfaff359714edef85/exporter/datadogexporter/translate_traces.go#L457
    //
    console.log("DATADOG: ", {
      trace_id: decodeId(spanContext?.traceId),
      span_id: decodeId(spanContext?.spanId)
    });
    console.log("SpanContext: ", spanContext);
    res.send("hi");
  }, 0);
});
app.get("/fail-500", (req: any, res) => {
  setTimeout(() => {
    res.status(500).send({
      message: "test message",
    });
  }, 0);
});
app.get("/fail-400", (req: any, res) => {
  setTimeout(() => {
    res.status(400).send({
      message: "test message",
    });
  }, 0);
  // axios
  //   .get(`http://localhost:${PORT}/middle-tier`)
  //   .then(() => axios.get(`http://localhost:${PORT}/middle-tier`))
  //   .then(result => {
  //     res.send(result.data);
  //   })
  //   .catch(err => {
  //     console.error(err);
  //     res.status(500).send();
  //   });
});
app.get("/throw", () => {
  new Promise((res, rej) => rej("promise throw"));
});

app.listen(parseInt(PORT, 10), () => {
  console.log(`Listening for requests on http://localhost:${PORT}`);
});
