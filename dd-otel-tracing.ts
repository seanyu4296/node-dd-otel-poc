import { NodeTracerProvider } from "@opentelemetry/node";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { ExpressInstrumentation } from "@opentelemetry/instrumentation-express";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { SpanProcessor } from "@opentelemetry/tracing";
import { DatadogSpanProcessor, DatadogExporter, DatadogPropagator, DatadogProbabilitySampler } from "opentelemetry-exporter-datadog";

const provider: NodeTracerProvider = new NodeTracerProvider({});

//
const exporter = new DatadogExporter({
  serviceName: 'dd-otel-tracing-test'
})

// can set propagator here
provider.register();
// Version mismatch... https://github.com/DataDog/dd-opentelemetry-exporter-js/issues/7
// const x = new DatadogSpanProcessor(exporter)
// provider.addSpanProcessor(x);

registerInstrumentations({
  instrumentations: [
    new ExpressInstrumentation(),
    new HttpInstrumentation()
  ]
})