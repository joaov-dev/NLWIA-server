import { FastifyInstance } from "fastify";
import { fastifyMultipart } from "@fastify/multipart";
import path from "node:path";
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import pipeline from "node:stream";
import { prisma } from "../lib/prisma";
import { promisify } from "node:util";

const pump = promisify(pipeline)

export async function uploadVideoRoute(app: FastifyInstance) {
  app.register(fastifyMultipart, {
    limits: {
      fileSize: 1048576 * 25, //25mb
    },
  });

  app.post("/videos", async (req, res) => {
    const data = await req.file();

    if (!data) {
      return res.status(400).send({
        error: "Missing file!",
      });
    }

    const extension = path.extname(data.filename);

    if (extension !== ".mp3") {
      return res.status(400).send({
        error: "Invalid input type, please upload a .mp3 file instead",
      });
    }

		const fileBaseName = path.basename(data.filename, extension);
		const fileUploadName = `${fileBaseName}${randomUUID()}${extension}`;
		const uploadDestination = path.resolve(__dirname, "../../tmp", fileUploadName);

		await pump(data.file, fs.createWriteStream(uploadDestination))

    return res.send()
  });
}