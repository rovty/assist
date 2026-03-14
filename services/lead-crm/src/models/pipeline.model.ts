import mongoose, { Schema, type Document } from 'mongoose';

export interface IPipelineStage {
  stageId: string;
  name: string;
  order: number;
  color?: string;
}

export interface IPipeline extends Document {
  tenantId: string;
  name: string;
  description: string;
  stages: IPipelineStage[];
  isDefault: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const stageSchema = new Schema<IPipelineStage>(
  {
    stageId: { type: String, required: true },
    name: { type: String, required: true },
    order: { type: Number, required: true },
    color: { type: String },
  },
  { _id: false },
);

const pipelineSchema = new Schema<IPipeline>(
  {
    tenantId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    stages: [stageSchema],
    isDefault: { type: Boolean, default: false },
    createdBy: { type: String, required: true },
  },
  {
    timestamps: true,
    collection: 'pipelines',
  },
);

pipelineSchema.index({ tenantId: 1, isDefault: 1 });

export const Pipeline = mongoose.model<IPipeline>('Pipeline', pipelineSchema);
