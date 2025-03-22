export interface DataSource {
  type: string;
  config: Record<string, any>;
}

export interface DataDestination {
  type: string;
  config: Record<string, any>;
}

export interface PipelineConfig {
  id: string;
  name: string;
  source: DataSource;
  destination: DataDestination;
  transformations?: Array<(data: any) => any>;
}
