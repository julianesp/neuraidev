// qué datos voy a guardar
// this file will have all the data que quiero save inside of the database
// every campo está relacionado with mongodb

// trim: para quitar espacios inicio - fin

// especifica la fecha de creacion => timestamp: true

import { Schema, model, models } from "mongoose";

const taskSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "El título es requerido"],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "La descripción es requerida"],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default models.Tasks || model("Task", taskSchema);
