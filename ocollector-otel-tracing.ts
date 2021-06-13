import { NodeTracerProvider } from "@opentelemetry/node";
import {
  SimpleSpanProcessor,
  ConsoleSpanExporter,
} from "@opentelemetry/tracing";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
//// core otel library
// import { ExpressInstrumentation } from "@opentelemetry/instrumentation-express";
//// aspectio
import { ExpressInstrumentation } from 'opentelemetry-instrumentation-express';
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { CollectorTraceExporter } from "@opentelemetry/exporter-collector";
import { Resource } from '@opentelemetry/resources';
import { ResourceAttributes } from '@opentelemetry/semantic-conventions'
import * as opentelemetry from "@opentelemetry/api";
import { IdGenerator, RandomIdGenerator } from "@opentelemetry/core";
import { DatadogPropagator } from "./custom-datadog/datadog-propagator";
export const id = require('dd-trace/packages/dd-trace/src/id');

//TODO:  WHATS THE DIFFERENCE BETWEEN NodeTracerProvider vs BasicTracerprovider

const provider: NodeTracerProvider = new NodeTracerProvider({
  resource: new Resource({
    [ResourceAttributes.SERVICE_NAME]: "ocollector-otel-tracing-r",
    [ResourceAttributes.DEPLOYMENT_ENVIRONMENT]: "local-sean",
  })
});

// https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/f1e8331be111a4a8bf65670dfaff359714edef85/exporter/datadogexporter/translate_traces.go#L457
const { Uint64BE } = require("int64-buffer");
// is this safe to do what if it came from datadog
export function decodeId(x: string | undefined): string | undefined {
  const ddId = x && id(x.length > 16 ? x.substr(16): x, 'hex').toString(10)
  // console.log('dd:', ddId)
  // console.log('something:', id(ddId, 10).toString('hex').padStart(32, '0'));
  // console.log('backagain:', id(id(ddId, 10).toString('hex')).toString(10));
  return x ? new Uint64BE(x.length > 16 ? x.substr(16): x, 16).toString() : undefined;
}

// TODO: datadog propagator?
// can set propagator here
provider.addSpanProcessor(
  new SimpleSpanProcessor(
    new CollectorTraceExporter({

      hostname: "ocollector-otel-tracing-h", // TODO: is this correct https://github.com/open-telemetry/opentelemetry-js/blob/a3b77387012a5f53c193efdefcbf5f6272876e4d/packages/opentelemetry-exporter-collector/src/types.ts#L343

    })
  )
);
// provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
provider.register({
  // very important for compatibility across other Datadog agent dependent services
  propagator: new DatadogPropagator()
});

registerInstrumentations({
  instrumentations: [new ExpressInstrumentation(), new HttpInstrumentation()],
});
export const tracer = opentelemetry.trace.getTracer("what-is-this-tracer");
