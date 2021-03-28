import express from "express";
import { models } from "../models";

export class ActionsController {
  public path = "/api/actions";
  public router = express.Router();

  constructor() {
    this.intializeRoutes();
  }

  public intializeRoutes() {
    this.router.post(this.path + "/:id/vote", this.vote);
  }

  vote = async (
    req: express.Request,
    res: express.Response
  ) => {
    models.Action.findOne({
      where: {
        id: req.params.id
      },
    }).then( async action => {
      if (action) {
        if (req.body.value == 1) {
          await action!.increment("counterUpVotes");
          res.sendStatus(200);
        } else {
          await action!.increment("counterDownVotes");
          res.sendStatus(200);
        }
      } else {
        res.sendStatus(404);
      }
    }).catch( error => {
      console.error(error);
      res.send(error);
    })
  }

  addAction = async (
    req: express.Request,
    res: express.Response
  ) => {
    models.Action.create(
      req.body
    ).then( action => {
      res.send(action);
    }).catch( error => {
      console.error(error);
      res.send(error);
    })
  }

  addComment = async (
    req: express.Request,
    res: express.Response
  ) => {
    models.Comment.create(
      req.body
    ).then( project => {
      res.send(project);
    }).catch( error => {
      console.error(error)
      res.send(error);
    })
  }
}
