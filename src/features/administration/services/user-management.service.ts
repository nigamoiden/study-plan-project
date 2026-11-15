import { getUserManagementData } from "./admin.service";

export function getUsers() {
  return getUserManagementData();
}
