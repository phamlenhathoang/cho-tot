import { StatusOrderTracking } from "@prisma/client";

export function mapGhnStatusToEnum(ghnStatus: string): StatusOrderTracking {
  const map: Record<string, StatusOrderTracking> = {
    ready_to_pick: StatusOrderTracking.READY_TO_PICK,
    picking: StatusOrderTracking.PICKING,
    picked: StatusOrderTracking.PICKED,
    storing: StatusOrderTracking.STORING,
    delivering: StatusOrderTracking.DELIVERING,
    delivered: StatusOrderTracking.DELIVERED,
    delivery_fail: StatusOrderTracking.DELIVERY_FAIL,
    waiting_to_return: StatusOrderTracking.WAITING_TO_RETURN,
    return: StatusOrderTracking.RETURN,
    returned: StatusOrderTracking.RETURNED,
  };

  const mapped = map[ghnStatus];
  if (!mapped) {
    throw new Error(`Không nhận diện được GHN status: ${ghnStatus}`);
  }
  return mapped;
}