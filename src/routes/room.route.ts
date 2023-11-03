import { Context } from "koa";
import Router from "koa-router";
import roomController from "../controllers/room.controller";

const router = new Router();

router.post("/create-room", async (ctx: Context) => {
  await roomController.createRoom(ctx);
});

router.post("/create-room-reservation", async (ctx: Context) => {
  await roomController.createRoomReservation(ctx);
});

router.post("/create-meeting-reservation", async (ctx: Context) => {
  await roomController.createMeetingReservationWithNoRoom(ctx);
});

router.post("/check-room-availability", async (ctx: Context) => {
  await roomController.checkRoomAvailability(ctx);
});

router.post("/get-available-rooms", async (ctx: Context) => {
  await roomController.getAvailableRooms(ctx);
});

router.post("/get-closest-room-name", async (ctx: Context) => {
  await roomController.getClosestRoomName(ctx);
});
export default router.routes();
