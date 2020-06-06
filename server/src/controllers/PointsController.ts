import { Request, Response } from "express";
import knex from "../database/connection";

class PointsController {
  async create(req: Request, res: Response) {
    const {
      name,
      email,
      whatsapp,
      uf,
      city,
      latitude,
      longitude,
      items,
    } = req.body;

    const trx = await knex.transaction();

    const point = {
      name,
      email,
      whatsapp,
      uf,
      city,
      latitude,
      longitude,
      image: req.file.filename,
    };

    const [point_id] = await trx("points").insert(point);

    const pointItems = items
      .split(",")
      .map((item: string) => Number(item.trim()))
      .map((item_id: number) => {
        return {
          item_id,
          point_id,
        };
      });

    await trx("point_items").insert(pointItems);

    await trx.commit();

    return res.json({ id: point_id, ...point });
  }

  show = async (req: Request, res: Response) => {
    const { id } = req.params;
    const point = await knex("points").where("id", id).first();
    if (!point) {
      return res.status(400).json({ message: "point not found" });
    }

    const items = await knex("items")
      .join("point_items", "items.id", "=", "point_items.item_id")
      .where("point_items.point_id", id)
      .select("items.title");
    console.log(this);
    return res.json({ point: this.toModel(point), items });
  };

  index = async (req: Request, res: Response) => {
    const { city, uf, items } = req.query;
    const parsedItems = String(items)
      .split(",")
      .map((item) => Number(item.trim()));

    const points = await knex("points")
      .join("point_items", "points.id", "=", "point_items.point_id")
      .whereIn("point_items.item_id", parsedItems)
      .where("city", String(city))
      .where("uf", String(uf))
      .distinct()
      .select("points.*");

    const model = points.map((point) => {
      return this.toModel(point);
    });
    return res.json(model);
  };

  toModel(point: any): any {
    return {
      ...point,
      image_url: "http://192.168.15.16:3333/uploads/" + point.image,
    };
  }
}

export default PointsController;
