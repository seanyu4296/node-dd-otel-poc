import "./ocollector-otel-tracing";

import express from "express";
import { Router } from "express";
import { decodeId, tracer } from "./ocollector-otel-tracing";
import { context, trace } from "@opentelemetry/api";

const PORT: string = process.env.PORT || "8080";

const app = express();

// Nested Routes
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

// Normal routes
app.get("/success", (req: any, res) => {
  const spanContext = trace.getSpan(context.active())?.spanContext();
  console.log("DATADOG: ", {
    trace_id: decodeId(spanContext?.traceId),
    span_id: decodeId(spanContext?.spanId),
  });
  console.log("SpanContext: ", spanContext);
  res.send("hi");
});
app.get("/fail-500", (req: any, res) => {
  res.status(500).send({
    message: "test message",
  });
});
app.get("/fail-400", (req: any, res) => {
  res.status(400).send({
    message: "test message",
  });

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
