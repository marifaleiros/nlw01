import { Request, Response } from "express";
import knex from "../database/connection";

class ItemsController {
  async index(req: Request, res: Response) {
    const items = await knex("items").select("*");

    const model = items.map((item) => {
      return {
        id: item.id,
        title: item.title,
        image_url: "http://192.168.15.16:3333/uploads/" + item.image,
      };
    });
    return res.json(model);
  }
}

export default ItemsController;
